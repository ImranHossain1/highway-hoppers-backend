import {
  BookingStatus,
  Bus_Schedule,
  Bus_Schedule_Status,
  Bus_Sit,
  Prisma,
} from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import {
  busScheduleRelationalFields,
  busScheduleRelationalFieldsMapper,
  busScheduleSearchableFields,
} from './bus_schedule.constants';
import {
  Bus_Schedule_Partial,
  IBusScheduleFilterRequest,
  IBusScheduleUpdate,
} from './bus_schedule.interface';
import { BusScheduleUtils } from './bus_schedule.utils';

const insertIntoDB = async (data: Bus_Schedule): Promise<Bus_Schedule> => {
  const existingStart = new Date(`${data.startDate}T${data.startTime}:00`);
  const existingEnd = new Date(`${data.endDate}T${data.endTime}:00`);

  if (existingEnd <= existingStart) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Date and Time');
  }

  await BusScheduleUtils.checkBusAvailable(data);
  await BusScheduleUtils.checkDriverAvailable(data);
  const bus_scheduleResult = await prisma.$transaction(
    async prismaTransactionClient => {
      const result = await prismaTransactionClient.bus_Schedule.create({
        data,
      });
      await prismaTransactionClient.signle_Trip_Income.create({
        data: {
          busScheduleId: result.id,
        },
      });
      return result;
    }
  );

  return bus_scheduleResult;
};
const getAllFromDB = async (
  filters: IBusScheduleFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Bus_Schedule[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: busScheduleSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (busScheduleRelationalFields.includes(key)) {
          return {
            [busScheduleRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.Bus_ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.bus_Schedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      bus: true,
      driver: {
        include: {
          user: true,
        },
      },
    },
  });
  const total = await prisma.bus_Schedule.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const getByIdFromDB = async (id: string): Promise<Bus_Schedule | null> => {
  const result = await prisma.bus_Schedule.findUnique({
    where: {
      id,
    },
    include: {
      bus: true,
      driver: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Journey Not Found');
  }

  return result;
};
const getAvailableSits = async (id: string): Promise<Bus_Sit[] | null> => {
  const result = await prisma.bus_Schedule.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Journey Not Found');
  }
  if (result.status === Bus_Schedule_Status.Arrived) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Journey is Already Finished');
  }

  const getBookedSits = await prisma.booking.findMany({
    where: {
      busScheduleId: id,
    },
  });

  // Extract the booked bus_SitIds from the bookings
  const bookedBusSitIds = getBookedSits.map(booking => booking.bus_SitId);

  // Retrieve all seats associated with the bus
  const allBusSits = await prisma.bus_Sit.findMany({
    where: {
      busId: result.busId,
    },
  });

  // Filter out seats that are not booked
  const availableSeats = allBusSits.filter(busSit => {
    return !bookedBusSitIds.includes(busSit.id);
  });

  return availableSeats;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Bus_Schedule>,
  time: Bus_Schedule_Partial
): Promise<Bus_Schedule> => {
  const existingStart = new Date(`${time.startDate}T${time.startTime}:00`);
  const existingEnd = new Date(`${time.endDate}T${time.endTime}:00`);

  if (existingEnd <= existingStart) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Date and Time');
  }
  if (
    time.startDate &&
    time.startTime &&
    time.endDate &&
    time.endTime &&
    time.dayOfWeek &&
    time.busId
  ) {
    await BusScheduleUtils.checkBusAvailableUpdate(time, id);
  }
  if (
    time.startDate &&
    time.startTime &&
    time.endDate &&
    time.endTime &&
    time.dayOfWeek &&
    time.driverId
  ) {
    await BusScheduleUtils.checkDriverAvailableUpdate(time, id);
  }
  const result = await prisma.bus_Schedule.update({
    where: {
      id,
    },
    data: payload,
    include: {
      bus: true,
      driver: true,
    },
  });

  return result;
};
const updateScheduleStatus = async (
  id: string,
  payload: IBusScheduleUpdate
): Promise<{
  message: string;
}> => {
  const isScheduleAvailable = await prisma.bus_Schedule.findUnique({
    where: {
      id,
      status: Bus_Schedule_Status.Arrived,
    },
  });
  if (isScheduleAvailable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bus is already Arrived');
  }
  if (payload.status === Bus_Schedule_Status.Ongoing) {
    await prisma.bus_Schedule.update({
      where: {
        id,
      },
      data: payload,
    });
    return {
      message: 'Journey Started',
    };
  } else {
    await prisma.$transaction(async transactionClient => {
      const result = await transactionClient.bus_Schedule.update({
        where: {
          id,
        },
        data: {
          status: payload.status,
        },
      });
      await transactionClient.booking.deleteMany({
        where: {
          busScheduleId: result.id,
          bookingStatus: BookingStatus.Pending,
        },
      });
      await transactionClient.booking.updateMany({
        where: {
          busScheduleId: result.id,
        },
        data: {
          bookingStatus: BookingStatus.Completed,
        },
      });
    });
    return {
      message: 'Journey Completed!',
    };
  }
};

const deleteByIdFromDB = async (id: string): Promise<Bus_Schedule> => {
  const result = await prisma.bus_Schedule.delete({
    where: {
      id,
    },
    include: {
      bus: true,
      driver: true,
    },
  });
  return result;
};

export const BusScheduleService = {
  insertIntoDB,
  getByIdFromDB,
  getAllFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  updateScheduleStatus,
  getAvailableSits,
};

import { Bus, BusSitNumber, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { busSearchableFields } from './bus.constants';
import { IBusFilterRequest } from './bus.interface';

const insertIntoDB = async (data: Bus): Promise<Bus> => {
  const isBusNumberExists = await prisma.bus.findFirst({
    where: {
      busNumber: data.busNumber,
    },
  });
  if (isBusNumberExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This bus is already exists');
  }
  if (data.totalSit && data.totalSit > 40) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Sit Numbers');
  }
  const availableSeatNumbers = Object.values(BusSitNumber);
  const newBus = await prisma.$transaction(async transactionClient => {
    const createBus = await transactionClient.bus.create({
      data,
    });
    // Calculate the number of seats to create based on the 'totalSit' field
    const numberOfSeatsToCreate = data.totalSit || 40;

    // Get the available seat numbers from BusSitNumber enum

    for (let i = 0; i < numberOfSeatsToCreate; i++) {
      await transactionClient.bus_Sit.create({
        data: {
          sitNumber: availableSeatNumbers[i],
          busId: createBus.id, // Link the seat to the newly created bus
        },
      });
    }
    return createBus;
  });
  return newBus;
};

const getAllFromDB = async (
  filters: IBusFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Bus[]>> => {
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: busSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.BusWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.bus.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.bus.count();
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const getByIdFromDB = async (id: string): Promise<Bus | null> => {
  const result = await prisma.bus.findUnique({
    where: {
      id,
    },
  });
  return result;
};
const updateOneInDB = async (
  id: string,
  payload: Partial<Bus>
): Promise<Bus> => {
  const { totalSit } = payload;

  if (totalSit && totalSit !== undefined) {
    if (totalSit > 40) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Sit Numbers');
    }

    const bus = await prisma.bus.findUnique({
      where: { id },
      include: { bus_Sits: true },
    });

    if (!bus) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Bus not found');
    }

    const numberOfSeatsToCreate = totalSit || 40;
    const availableSeatNumbers = Object.values(BusSitNumber);
    const seatsToDelete = bus.bus_Sits.slice(numberOfSeatsToCreate);

    const updatedBus = await prisma.$transaction(async transactionClient => {
      // Update the bus record except for 'totalSit'
      const result = await transactionClient.bus.update({
        where: { id },
        data: payload,
      });

      // Delete extra seats if needed
      for (const seat of seatsToDelete) {
        await transactionClient.bus_Sit.delete({
          where: { id: seat.id },
        });
      }

      // Create new seats if needed
      for (let i = bus.bus_Sits.length; i < numberOfSeatsToCreate; i++) {
        await transactionClient.bus_Sit.create({
          data: {
            sitNumber: availableSeatNumbers[i],
            busId: id,
          },
        });
      }

      return result;
    });

    return updatedBus;
  } else {
    // If 'totalSit' is not being updated, simply update the bus record
    const result = await prisma.bus.update({
      where: { id },
      data: payload,
    });
    return result;
  }
};
/* const deleteByIdFromDB = async (id: string): Promise<Bus> => {
  const bus = await prisma.bus.findUnique({
    where: { id },
    include: { bus_Sits: true },
  });

  if (!bus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  const deleteBus = await prisma.$transaction(async transactionClient => {
    // Delete associated bus_sits
    await asyncForEach(bus.bus_Sits, async (bus_Sit: Bus_Sit) => {
      const sitId = bus_Sit.id;
      await transactionClient.bus_Sit.delete({
        where: { id: sitId },
      });
    });

    // Delete the bus
    const result = await transactionClient.bus.delete({
      where: {
        id,
      },
    });

    return result;
  });

  return deleteBus;
};
 */
export const BusService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  // deleteByIdFromDB,
};

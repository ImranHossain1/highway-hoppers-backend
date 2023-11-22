import {
  Booking,
  BookingStatus,
  Bus_Schedule_Status,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import {
  IGenericResponse,
  IGenericResponseBooking,
} from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { asyncForEach } from '../../../shared/utils';
import { BookingSearchableFields } from './booking.constants';
import {
  IBookingCreateData,
  IBookingInterfaceRequest,
  IBus_sits,
} from './booking.interface';
const insertIntoDB = async (data: IBookingCreateData, authUserId: string) => {
  const isScheduleAvailable = await prisma.bus_Schedule.findUnique({
    where: {
      id: data.busScheduleId,
      status: Bus_Schedule_Status.Arrived,
    },
  });
  const isAuthUser = await prisma.user.findUnique({
    where: {
      email: authUserId,
    },
  });

  if (!isAuthUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Exists');
  }
  if (isScheduleAvailable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Journey is already completed');
  }

  if (data.sits && data.sits.length > 0) {
    const isBookingAvailable = await prisma.bus_Schedule.findFirst({
      where: {
        id: data.busScheduleId,
      },
    });
    const busData = await prisma.bus.findFirst({
      where: {
        id: isBookingAvailable?.busId,
      },
    });
    if (
      isBookingAvailable?.bookedSit &&
      busData?.totalSit &&
      isBookingAvailable?.bookedSit >= busData?.totalSit
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No Sits Available');
    }

    await asyncForEach(data.sits, async (bus_Sit: IBus_sits) => {
      const isSitAvailable = await prisma.booking.findFirst({
        where: {
          busScheduleId: data.busScheduleId,
          bus_SitId: bus_Sit.bus_SitId,
        },
      });
      if (!isSitAvailable === false) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'This sit is Already Booked'
        );
      }
    });
  }

  const bookingResult = await prisma.$transaction(
    async prismaTransactionClient => {
      await asyncForEach(data.sits, async (bus_Sit: IBus_sits) => {
        const result = await prismaTransactionClient.booking.create({
          data: {
            userId: isAuthUser.id, // Associate the booking with the authenticated user
            busScheduleId: data.busScheduleId,
            bus_SitId: bus_Sit.bus_SitId,
          },
        });
        console.log(result);
        const busScheduleId = data.busScheduleId;
        await prismaTransactionClient.bus_Schedule.update({
          where: {
            id: busScheduleId,
          },
          data: {
            PendingSit: {
              increment: 1,
            },
          },
        });
        return result;
      });
    }
  );
  return bookingResult;
};
const completePendingBooking = async (authUserId: string) => {
  const isAuthUser = await prisma.user.findFirst({
    where: {
      email: authUserId,
    },
  });
  if (!isAuthUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Exists');
  }
  const pendingBooking = await prisma.booking.findMany({
    where: {
      userId: isAuthUser.id,
      paymentStatus: PaymentStatus.Pending,
    },
  });

  if (pendingBooking.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You don't have any pending booking"
    );
  }
  const bookingResult = await prisma.$transaction(
    async prismaTransactionClient => {
      if (pendingBooking && pendingBooking.length > 0) {
        await asyncForEach(pendingBooking, async (pendingBooking: Booking) => {
          const result = await prismaTransactionClient.booking.update({
            where: {
              id: pendingBooking.id,
              userId: isAuthUser.id,
            },
            data: {
              bookingStatus: BookingStatus.Booked,
              paymentStatus: PaymentStatus.Completed,
            },
            include: {
              bus_Schedule: true,
            },
          });

          if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction Failed');
          }
          // const busFare = result?.bus_Schedule?.busFare ?? 0;

          /* await prismaTransactionClient.bus_Schedule.findUnique({
            where: {
              id: result.busScheduleId,
            },
          }); */

          /* if (busSchedule) {
            const currentEarnings =
              busSchedule.signle_Trip_Income?.earnings || 0;
            const newEarnings = currentEarnings + busFare;

            await prismaTransactionClient.bus_Schedule.update({
              where: {
                id: result.busScheduleId,
              },
              data: {
                PendingSit: {
                  decrement: 1,
                },
                bookedSit: {
                  increment: 1,
                },
                signle_Trip_Income: {
                  update: {
                    earnings: newEarnings,
                  },
                },
              },
            });
          } */
        });
      }
    }
  );
  return bookingResult;
};
const cancelAllPendingBooking = async (authUserId: string) => {
  /* const isAuthUser = await prisma.user.findUnique({
    where: {
      email: authUserId,
    },
  });

  if (!isAuthUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Exists');
  } */
  const pendingBookings = await prisma.booking.findMany({
    where: {
      userId: authUserId,
      bookingStatus: BookingStatus.Pending,
    },
  });
  console.log(pendingBookings);
  if (pendingBookings.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You don't have any pending booking"
    );
  }
  const bookingResult = await prisma.$transaction(
    async prismaTransactionClient => {
      await asyncForEach(pendingBookings, async (pendingBooking: Booking) => {
        console.log(pendingBooking);
        const result = await prismaTransactionClient.booking.delete({
          where: {
            id: pendingBooking.id,
            userId: authUserId,
          },
        });

        await prismaTransactionClient.bus_Schedule.update({
          where: {
            id: pendingBooking.busScheduleId,
          },
          data: {
            PendingSit: {
              decrement: 1,
            },
          },
        });
        return result;
      });
    }
  );
  return bookingResult;
};
const cancelSinglePendingBooking = async (id: string) => {
  const pendingBooking = await prisma.booking.findFirst({
    where: {
      id,
      bookingStatus: BookingStatus.Pending,
    },
  });
  if (!pendingBooking) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You don't have any pending booking"
    );
  }
  const bookingResult = await prisma.$transaction(
    async prismaTransactionClient => {
      const result = await prismaTransactionClient.booking.delete({
        where: {
          id,
        },
      });

      await prismaTransactionClient.bus_Schedule.update({
        where: {
          id: pendingBooking.busScheduleId,
        },
        data: {
          PendingSit: {
            decrement: 1,
          },
        },
      });
      return result;
    }
  );

  return bookingResult;
};

const getUserPendingBooking = async (
  id: string
): Promise<IGenericResponseBooking<Booking[]>> => {
  const isAuthUser = await prisma.user.findFirst({
    where: {
      email: id,
    },
  });
  if (!isAuthUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Exists');
  }
  const result = await prisma.booking.findMany({
    where: {
      userId: isAuthUser.id,
      bookingStatus: BookingStatus.Pending,
    },
    include: {
      bus_Schedule: true,
      Bus_Sit: true,
    },
  });
  if (!result.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You don't have any pending bookings available."
    );
  }
  return {
    data: result,
  };
};

const getUserConfirmedBooking = async (
  id: string
): Promise<IGenericResponseBooking<Booking[]>> => {
  const isUser = await prisma.user.findFirst({
    where: {
      email: id,
    },
  });
  if (!isUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not found');
  }
  const result = await prisma.booking.findMany({
    where: {
      userId: isUser.id,
      bookingStatus: BookingStatus.Booked,
    },
    include: {
      bus_Schedule: true,
      Bus_Sit: true,
    },
  });

  if (!result.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You haven'y confirm any bookings yet."
    );
  }
  return {
    data: result,
  };
};
const getUserCompletedBooking = async (
  id: string
): Promise<IGenericResponseBooking<Booking[]>> => {
  const isUser = await prisma.user.findFirst({
    where: {
      email: id,
    },
  });
  if (!isUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not found');
  }
  const result = await prisma.booking.findMany({
    where: {
      userId: isUser.id,
      bookingStatus: BookingStatus.Completed,
    },
    include: {
      bus_Schedule: true,
      Bus_Sit: true,
    },
  });

  if (!result.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You do not have any completed Journey.'
    );
  }
  return {
    data: result,
  };
};

const getAllFromDB = async (
  filters: IBookingInterfaceRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Booking[]>> => {
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: BookingSearchableFields.map(field => ({
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
  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.booking.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      bus_Schedule: true,
      Bus_Sit: true,
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.booking.count();
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const BookingService = {
  insertIntoDB,
  completePendingBooking,
  cancelAllPendingBooking,
  cancelSinglePendingBooking,
  getAllFromDB,
  getUserConfirmedBooking,
  getUserPendingBooking,
  getUserCompletedBooking,
};

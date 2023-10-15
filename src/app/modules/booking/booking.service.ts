import { Booking, BookingStatus, PaymentStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';
import { asyncForEach } from '../../../shared/utils';
import { IBookingCreateData, IBus_sits } from './booking.interface';
const insertIntoDB = async (data: IBookingCreateData, authUserId: string) => {
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
          bus_Schedule: {
            id: data.busScheduleId,
            bus: {
              bus_Sits: {
                some: {
                  id: bus_Sit.bus_SitId,
                },
              },
            },
          },
        },
      });
      if (isSitAvailable) {
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
            userId: authUserId, // Associate the booking with the authenticated user
            busScheduleId: data.busScheduleId,
            bus_SitId: bus_Sit.bus_SitId,
          },
        });
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
  const pendingBooking = await prisma.booking.findMany({
    where: {
      userId: authUserId,
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
              userId: authUserId,
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
          const busFare = result?.bus_Schedule?.busFare ?? 0;

          const busSchedule =
            await prismaTransactionClient.bus_Schedule.findUnique({
              where: {
                id: result.busScheduleId,
              },
              include: {
                signle_Trip_Income: true,
              },
            });

          if (busSchedule) {
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
          }
        });
      }
    }
  );
  return bookingResult;
};

export const BookingService = {
  insertIntoDB,
  completePendingBooking,
};

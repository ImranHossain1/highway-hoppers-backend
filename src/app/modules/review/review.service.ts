import { BookingStatus, Review } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (
  data: Review,
  userId: string,
  bookingId: string
): Promise<{
  message: string;
}> => {
  const isBookingCompleted = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: userId,
    },
    include: {
      review: true,
    },
  });

  if (!isBookingCompleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Journey is not found');
  }
  if (isBookingCompleted?.bookingStatus !== BookingStatus.Completed) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Your Journey is not Completed yet'
    );
  }
  if (isBookingCompleted.review) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review already completed');
  }
  await prisma.$transaction(async transactionClient => {
    const result = await transactionClient.review.create({
      data: {
        userId: userId,
        bookingId: bookingId,
        review: data.review,
        rating: data.rating,
      },
      include: {
        booking: {
          include: {
            bus_Schedule: true,
          },
        },
      },
    });
    const driverData = await transactionClient.driver.findUnique({
      where: {
        id: result.booking.bus_Schedule.driverId,
      },
    });

    if (driverData) {
      let totalReviewer = 0;
      let driverTotalRating = 0;
      let driverRating = 0;
      if (driverData.totalReviewer === 0) {
        totalReviewer = 1;
        driverTotalRating = result.rating;
        driverRating = driverTotalRating;
      } else {
        totalReviewer = driverData?.totalReviewer + 1;
        driverTotalRating = driverData?.totalRatings + result.rating;
        driverRating = parseFloat(
          (driverTotalRating / totalReviewer).toFixed(2)
        );
      }
      await transactionClient.driver.update({
        where: {
          id: result.booking.bus_Schedule.driverId,
        },
        data: {
          rating: driverRating,
          totalRatings: driverTotalRating,
          totalReviewer: totalReviewer,
        },
      });
    }
  });
  return {
    message: 'Thank you for your review',
  };
};

const getByIdFromDB = async (id: string): Promise<Review | null> => {
  const result = await prisma.review.findUnique({
    where: {
      id,
    },
    include: {
      booking: {
        include: {
          bus_Schedule: {
            include: {
              driver: true,
            },
          },
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review is not found');
  }
  return result;
};
const getAllReviewFromDB = async (): Promise<Review[]> => {
  const result = await prisma.review.findMany({
    include: {
      booking: {
        include: {
          bus_Schedule: {
            include: {
              driver: true,
            },
          },
        },
      },
      user: true,
    },
  });
  if (result.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Review found');
  }
  return result;
};
const updateOneInDB = async (
  id: string,
  userId: string,
  payload: Partial<Review>
): Promise<{
  message: string;
}> => {
  const isReviewExists = await prisma.review.findFirst({
    where: {
      id: id,
      userId: userId,
    },
    include: {
      booking: {
        include: {
          bus_Schedule: true,
        },
      },
    },
  });

  if (!isReviewExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review is not found');
  }

  await prisma.$transaction(async transactionClient => {
    if (payload.rating) {
      const driverData = await transactionClient.driver.findUnique({
        where: {
          id: isReviewExists.booking.bus_Schedule.driverId,
        },
      });

      if (driverData) {
        let driverTotalRating =
          driverData?.totalRatings - isReviewExists.rating;
        driverTotalRating = driverTotalRating + payload.rating;
        const driverRating = parseFloat(
          (driverTotalRating / driverData?.totalReviewer).toFixed(2)
        );
        await transactionClient.driver.update({
          where: {
            id: isReviewExists.booking.bus_Schedule.driverId,
          },
          data: {
            rating: driverRating,
            totalRatings: driverTotalRating,
          },
        });
      }
    }
    await prisma.review.update({
      where: {
        id,
        userId: userId,
      },
      data: payload,
      include: {
        booking: {
          include: {
            bus_Schedule: true,
          },
        },
      },
    });
  });
  return {
    message: 'Review update Successfully',
  };
};
const deleteByIdFromDB = async (
  id: string,
  userId: string
): Promise<{
  message: string;
}> => {
  const isReviewExists = await prisma.review.findFirst({
    where: {
      id: id,
      userId: userId,
    },
    include: {
      booking: {
        include: {
          bus_Schedule: true,
        },
      },
    },
  });

  if (!isReviewExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review is not found');
  }

  await prisma.$transaction(async transactionClient => {
    const driverData = await transactionClient.driver.findUnique({
      where: {
        id: isReviewExists.booking.bus_Schedule.driverId,
      },
    });

    if (driverData) {
      const driverTotalRating =
        driverData?.totalRatings - isReviewExists.rating;
      const totalReviewer = driverData?.totalReviewer - 1;
      const driverRating = parseFloat(
        (driverTotalRating / totalReviewer).toFixed(2)
      );
      await transactionClient.driver.update({
        where: {
          id: isReviewExists.booking.bus_Schedule.driverId,
        },
        data: {
          rating: driverRating,
          totalRatings: driverTotalRating,
          totalReviewer: totalReviewer,
        },
      });
    }

    await prisma.review.delete({
      where: {
        id,
        userId: userId,
      },
      include: {
        booking: {
          include: {
            bus_Schedule: true,
          },
        },
      },
    });
  });
  return {
    message: 'Review Deleted Successfully',
  };
};

export const ReviewService = {
  insertIntoDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getAllReviewFromDB,
};

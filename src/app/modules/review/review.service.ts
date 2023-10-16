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
          bus_Schedule: true,
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
          bus_Schedule: true,
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
): Promise<Review> => {
  const isReviewExists = await prisma.review.findUnique({
    where: {
      id,
      userId: userId,
    },
    include: {
      booking: true,
    },
  });
  if (!isReviewExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review is not found');
  }

  const result = await prisma.review.update({
    where: {
      id,
      userId: userId,
    },
    data: payload,
    include: {
      booking: true,
    },
  });
  return result;
};

const deleteByIdFromDB = async (
  id: string,
  userId: string
): Promise<Review> => {
  const isReviewExists = await prisma.review.findUnique({
    where: {
      id,
      userId: userId,
    },
    include: {
      booking: true,
    },
  });
  if (!isReviewExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review is not found');
  }

  const result = await prisma.review.delete({
    where: {
      id,
      userId: userId,
    },
    include: {
      booking: true,
    },
  });
  return result;
};
export const ReviewService = {
  insertIntoDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getAllReviewFromDB,
};

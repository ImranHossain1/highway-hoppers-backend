import { Driver } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (data: Driver, userId: string): Promise<Driver> => {
  const isDriverExists = await prisma.driver.findUnique({
    where: {
      userId: userId,
    },
  });

  if (isDriverExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver is Already Exists');
  }

  const result = await prisma.driver.create({
    data: {
      userId: userId,
      salary: data.salary,
      totalReviewer: 0,
      totalRatings: 0,
      rating: 0,
    },
    include: {
      user: true,
    },
  });
  return result;
};
const getDriverFromDb = async (userId: string): Promise<Driver | null> => {
  const result = await prisma.driver.findUnique({
    where: {
      userId: userId,
    },
    include: {
      user: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  userId: string,
  payload: Partial<Driver>
): Promise<Driver> => {
  const isDriverExists = await prisma.driver.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!isDriverExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver is not Exists');
  }
  const result = await prisma.driver.update({
    where: {
      userId: userId,
    },
    data: payload,
    include: {
      user: true,
    },
  });
  return result;
};

export const DriverService = {
  insertIntoDB,
  updateOneInDB,
  getDriverFromDb,
};

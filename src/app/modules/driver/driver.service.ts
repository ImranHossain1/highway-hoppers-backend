import { Driver, Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (
  data: User,
  salary: number
): Promise<User | null> => {
  const isUserExists = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (isUserExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Already Exists.');
  }
  data.password = bcrypt.hashSync(data.password, 12);
  data.role = Role.DRIVER;
  data.isAllFieldGiven = true;
  const newDriver = await prisma.$transaction(async transactionClient => {
    const createUser = await transactionClient.user.create({ data });
    await transactionClient.driver.create({
      data: {
        userId: createUser.id,
        salary: salary,
        totalReviewer: 0,
        totalRatings: 0,
        rating: 0,
      },
      include: {
        user: true,
      },
    });
    return createUser;
  });
  return newDriver;
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
const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Driver[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  const result = await prisma.driver.findMany({
    include: {
      user: true,
    },
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

  const total = await prisma.driver.count();
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const DriverService = {
  insertIntoDB,
  updateOneInDB,
  getDriverFromDb,
  getAllFromDB,
};

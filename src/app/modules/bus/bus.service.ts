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
  const result = await prisma.bus.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Bus> => {
  const result = await prisma.bus.delete({
    where: {
      id,
    },
  });
  return result;
};

export const BusService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};

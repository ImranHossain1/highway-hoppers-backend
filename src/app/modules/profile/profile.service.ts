import { User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';
import { IMyProfile } from './profile.interface';

const getUserProfile = async (userId: string): Promise<IMyProfile | null> => {
  const result = await prisma.user.findUnique({
    where: {
      email: userId,
    },
    include: {
      driver: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not Found');
  }

  return result;
};
const updateUserProfile = async (
  userId: string,
  payload: Partial<User>
): Promise<IMyProfile | null> => {
  const result = await prisma.user.update({
    where: {
      email: userId,
    },
    data: payload,
  });
  return result;
};

export const UserProfileService = {
  getUserProfile,
  updateUserProfile,
};

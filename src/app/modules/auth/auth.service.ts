import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';

import { User } from '@prisma/client';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { prisma } from '../../../shared/prisma';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
} from './auth.interface';

const createUser = async (data: User): Promise<User | null> => {
  data.password = bcrypt.hashSync(data.password, 12);
  data.isAllFieldGiven = true;
  const result = await prisma.user.create({ data });

  return result;
};

const loginUser = async (user: ILoginUser): Promise<ILoginUserResponse> => {
  const result = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userExist = await bcrypt.compare(user.password, result.password);

  if (!userExist) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // create access token and refresh token
  const { id: userId, role } = result;

  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};
const socialLogin = async (user: User): Promise<ILoginUserResponse> => {
  const result = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // create access token and refresh token
  const { id: userId, role } = result;

  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};

const changePassword = async (
  userId: string,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Compare the oldPassword with the user's stored hashed password
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!passwordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
  }

  // If the old password matches, you can now hash and save the new password
  const hashedNewPassword = bcrypt.hashSync(newPassword, 12);

  // Update the user's password in the database
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedNewPassword,
    },
  });
};

export const AuthService = {
  createUser,
  socialLogin,
  loginUser,
  changePassword,
};

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
  IRefreshTokenResponse,
} from './auth.interface';

const createUser = async (data: User): Promise<User | null> => {
  const isUserExists = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (isUserExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Already Exists.');
  }
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
  const { email, role } = result;

  const accessToken = jwtHelpers.createToken(
    { email, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { email, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};

/* const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
    //
  } catch (err) {
    // err
    throw new ApiError(httpStatus.FORBIDDEN, 'invalid refresh token');
  }
  //checking deleted user's refresh token
  const { email } = verifiedToken;

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }
  //generate new token
  const newAccessToken = jwtHelpers.createToken(
    {
      userId: isUserExist.email,
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
}; */
const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  if (!token) {
    throw new Error('Token is required');
  }
  const decodedToken = jwtHelpers.decodeToken(token);
  //generate new token
  const { email, role } = decodedToken;
  if (!email || !role) {
    throw new Error('Invalid token');
  }

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUserExist) {
    throw new Error('User does not exist');
  }
  const payloadData = {
    email: email,
    role: role,
  };

  const newAccessToken = jwtHelpers.createToken(
    payloadData,
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
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
  refreshToken,
  loginUser,
  changePassword,
};

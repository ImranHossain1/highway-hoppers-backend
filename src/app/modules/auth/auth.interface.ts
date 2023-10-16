import { Gender, Role } from '@prisma/client';

export type ILoginUser = {
  email: string;
  password: string;
};

export type IUser = {
  name: string;
  email: string;
  password: string;
  DOB: string;
  gender: Gender;
  role: Role;
  contactNo: string;
  address: string;
  profileImg: string;
  salary?: number;
};
export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};

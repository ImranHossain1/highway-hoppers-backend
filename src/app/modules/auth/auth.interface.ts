export type ILoginUser = {
  email: string;
  password: string;
};

export type IUser = {
  id: string;
  role: string;
  password: string;
  email: string;
  DOB: string;
  gender: string;
  contactNo: string;
  address: string;
  profileImg: string;
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

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserProfileService } from './profile.service';

const getUsersProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?.userId;
  const result = await UserProfileService.getUserProfile(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved in successfully!',
    data: result,
  });
});
const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?.userId;
  const result = await UserProfileService.updateUserProfile(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

export const UserProfileController = {
  getUsersProfile,
  updateOneInDB,
};

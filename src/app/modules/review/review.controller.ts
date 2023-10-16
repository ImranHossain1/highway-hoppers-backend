import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewService } from './review.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookingId = req.params.id;
  const result = await ReviewService.insertIntoDB(
    req.body,
    user.userId,
    bookingId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Thank You for your valuable review.',
    data: result,
  });
});
const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your Review Fetched successfully',
    data: result,
  });
});
const getAllReviewFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviewFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Review Fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const result = await ReviewService.updateOneInDB(id, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your Review Updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const result = await ReviewService.deleteByIdFromDB(id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review delete successfully',
    data: result,
  });
});

export const BusController = {
  insertIntoDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getAllReviewFromDB,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingService } from './booking.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await BookingService.insertIntoDB(req.body, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking is Pending',
    data: result,
  });
});
const completePendingBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result = await BookingService.completePendingBooking(user.userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Booking Completed',
      data: result,
    });
  }
);

export const BookingController = {
  insertIntoDB,
  completePendingBooking,
};

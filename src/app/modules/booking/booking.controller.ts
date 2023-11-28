import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { BookingFilterableFields } from './booking.constants';
import { BookingService } from './booking.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await BookingService.insertIntoDB(req.body, user.email);

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

    const result = await BookingService.completePendingBooking(user.email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Booking Completed',
      data: result,
    });
  }
);
const cancelAllPendingBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await BookingService.cancelAllPendingBooking(user.userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Booking Cancelled',
      data: result,
    });
  }
);
const cancelSinglePendingBooking = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await BookingService.cancelSinglePendingBooking(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Booking Cancelled',
      data: result,
    });
  }
);
const getUserPendingBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await BookingService.getUserPendingBooking(user.email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Your Booking fetched successfully',
      data: result,
    });
  }
);

const getAllFromDb = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, BookingFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await BookingService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Booking Retrieved!',
    meta: result.meta,
    data: result.data,
  });
});
const getAllPendingBookings = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await BookingService.getAllPendingBookings(options);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All Booking Retrieved!',
      meta: result.meta,
      data: result.data,
    });
  }
);
const getUserConfirmedBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result = await BookingService.getUserConfirmedBooking(user.email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All Booking Retrieved!',
      data: result.data,
    });
  }
);
const getUserCompletedBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result = await BookingService.getUserCompletedBooking(user.email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All Booking Retrieved!',
      data: result.data,
    });
  }
);

export const BookingController = {
  insertIntoDB,
  completePendingBooking,
  cancelAllPendingBooking,
  cancelSinglePendingBooking,
  getUserPendingBooking,
  getAllFromDb,
  getUserConfirmedBooking,
  getUserCompletedBooking,
  getAllPendingBookings,
};

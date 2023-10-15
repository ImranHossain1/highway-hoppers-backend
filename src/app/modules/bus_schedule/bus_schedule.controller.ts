import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

import pick from '../../../shared/pick';
import { busScheduleFilterableFields } from './bus_schedule.constants';
import { BusScheduleService } from './bus_schedule.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await BusScheduleService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus Schedule created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, busScheduleFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await BusScheduleService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourseSections fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BusScheduleService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus Schedule fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { startDate, startTime, endDate, endTime, dayOfWeek, busId, driverId } =
    req.body;
  const time = {
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
    dayOfWeek: dayOfWeek,
    busId: busId,
    driverId: driverId,
  };
  const result = await BusScheduleService.updateOneInDB(id, req.body, time);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus Schedule updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BusScheduleService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus Schedule deleted successfully',
    data: result,
  });
});
export const BusController = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};

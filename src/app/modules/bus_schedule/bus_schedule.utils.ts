import { Bus_Schedule } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';
import { hasTimeConflict } from '../../../shared/utils';
import { Bus_Schedule_Partial } from './bus_schedule.interface';

const checkBusAvailable = async (data: Bus_Schedule) => {
  const alreadyAvailableOntThatTime = await prisma.bus_Schedule.findMany({
    where: {
      dayOfWeek: data.dayOfWeek,
      startDate: data.startDate,
      bus: {
        id: data.busId,
      },
    },
  });
  const existingSlots = alreadyAvailableOntThatTime.map(schedule => ({
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    dayOfWeek: schedule.dayOfWeek,
    status: schedule.status || 'Upcoming',
  }));

  const newSlot = {
    startTime: data.startTime,
    endTime: data.endTime,
    startDate: data.startDate,
    endDate: data.endDate,
    dayOfWeek: data.dayOfWeek,
  };

  if (hasTimeConflict(existingSlots, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Bus is already booked');
  }
};
const checkDriverAvailable = async (data: Bus_Schedule) => {
  const alreadyAvailableOntThatTime = await prisma.bus_Schedule.findMany({
    where: {
      dayOfWeek: data.dayOfWeek,
      startDate: data.startDate,
      driver: {
        id: data.driverId,
      },
    },
  });
  const existingSlots = alreadyAvailableOntThatTime.map(schedule => ({
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    dayOfWeek: schedule.dayOfWeek,
    status: schedule.status || 'Upcoming',
  }));

  const newSlot = {
    startTime: data.startTime,
    endTime: data.endTime,
    startDate: data.startDate,
    endDate: data.endDate,
    dayOfWeek: data.dayOfWeek,
  };

  if (hasTimeConflict(existingSlots, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Driver is already booked');
  }
};
const checkBusAvailableUpdate = async (
  data: Bus_Schedule_Partial,
  idToUpdate: string
) => {
  const alreadyAvailableOntThatTime = await prisma.bus_Schedule.findMany({
    where: {
      dayOfWeek: data.dayOfWeek,
      startDate: data.startDate,
      bus: {
        id: data.busId,
      },
      NOT: {
        id: idToUpdate, // Exclude the schedule you want to update
      },
    },
  });
  const existingSlots = alreadyAvailableOntThatTime.map(schedule => ({
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    dayOfWeek: schedule.dayOfWeek,
    status: schedule.status || 'Upcoming',
  }));

  const newSlot = {
    startTime: data.startTime,
    endTime: data.endTime,
    startDate: data.startDate,
    endDate: data.endDate,
    dayOfWeek: data.dayOfWeek,
  };

  if (hasTimeConflict(existingSlots, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Bus is already booked');
  }
};
const checkDriverAvailableUpdate = async (
  data: Bus_Schedule_Partial,
  idToUpdate: string
) => {
  const alreadyAvailableOntThatTime = await prisma.bus_Schedule.findMany({
    where: {
      dayOfWeek: data.dayOfWeek,
      startDate: data.startDate,
      driver: {
        id: data.driverId,
      },
      NOT: {
        id: idToUpdate, // Exclude the schedule you want to update
      },
    },
  });
  const existingSlots = alreadyAvailableOntThatTime.map(schedule => ({
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    dayOfWeek: schedule.dayOfWeek,
    status: schedule.status || 'Upcoming',
  }));

  const newSlot = {
    startTime: data.startTime,
    endTime: data.endTime,
    startDate: data.startDate,
    endDate: data.endDate,
    dayOfWeek: data.dayOfWeek,
  };

  if (hasTimeConflict(existingSlots, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Driver is already booked');
  }
};

export const BusScheduleUtils = {
  checkBusAvailable,
  checkBusAvailableUpdate,
  checkDriverAvailable,
  checkDriverAvailableUpdate,
};

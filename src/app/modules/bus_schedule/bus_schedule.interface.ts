import { Bus_Schedule_Status, WeekDays } from '@prisma/client';

export type IBusScheduleFilterRequest = {
  searchTerm?: string | undefined;
};
export type Bus_Schedule_Partial = {
  busId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  dayOfWeek: WeekDays;
};

export type IBusScheduleUpdate = {
  status: Bus_Schedule_Status;
};

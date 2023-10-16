export const busScheduleFilterableFields: string[] = [
  'searchTerm',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'dayOfWeek',
  'busId',
  'driverId',
  'startingPoint',
  'endPoint',
  'busFare',
  'status',
];
export const busScheduleSearchableFields = [
  'startDate',
  'endDate',
  'startingPoint',
  'endPoint',
  'status',
];

export const busScheduleRelationalFields = ['busId', 'driverId'];
export const busScheduleRelationalFieldsMapper: {
  [key: string]: string;
} = {
  busId: 'bus',
  driverId: 'user',
};
export const daysInWeek = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];
export const busSchedulestatus = ['Ongoing', 'Arrived'];

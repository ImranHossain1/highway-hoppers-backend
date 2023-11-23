export const BookingSearchableFields = [
  'bookingStatus',
  'busScheduleId',
  'userId',
  'id',
];

export const BookingFilterableFields = ['searchTerm'];

export const bookingRelationalFields: string[] = ['userId', 'busScheduleId'];
export const bookingRelationalFieldsMapper: { [key: string]: string } = {
  userId: 'user',
  busScheduleId: 'bus_Schedule',
};

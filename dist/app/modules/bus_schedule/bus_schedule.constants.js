"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.busSchedulestatus = exports.daysInWeek = exports.busScheduleRelationalFieldsMapper = exports.busScheduleRelationalFields = exports.busScheduleSearchableFields = exports.busScheduleFilterableFields = void 0;
exports.busScheduleFilterableFields = [
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
exports.busScheduleSearchableFields = [
    'startDate',
    'endDate',
    'startingPoint',
    'endPoint',
    'status',
];
exports.busScheduleRelationalFields = ['busId', 'driverId'];
exports.busScheduleRelationalFieldsMapper = {
    busId: 'bus',
    driverId: 'user',
};
exports.daysInWeek = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
];
exports.busSchedulestatus = ['Upcoming', 'Ongoing', 'Arrived'];

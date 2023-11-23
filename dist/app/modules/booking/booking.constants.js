"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRelationalFieldsMapper = exports.bookingRelationalFields = exports.BookingFilterableFields = exports.BookingSearchableFields = void 0;
exports.BookingSearchableFields = [
    'bookingStatus',
    'busScheduleId',
    'userId',
    'id',
];
exports.BookingFilterableFields = ['searchTerm'];
exports.bookingRelationalFields = ['userId', 'busScheduleId'];
exports.bookingRelationalFieldsMapper = {
    userId: 'user',
    busScheduleId: 'bus_Schedule',
};

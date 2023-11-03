"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusScheduleUtils = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = require("../../../shared/prisma");
const utils_1 = require("../../../shared/utils");
const checkBusAvailable = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const alreadyAvailableOntThatTime = yield prisma_1.prisma.bus_Schedule.findMany({
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
    if ((0, utils_1.hasTimeConflict)(existingSlots, newSlot)) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, 'Bus is already booked');
    }
});
const checkDriverAvailable = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const alreadyAvailableOntThatTime = yield prisma_1.prisma.bus_Schedule.findMany({
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
    if ((0, utils_1.hasTimeConflict)(existingSlots, newSlot)) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, 'Driver is already booked');
    }
});
const checkBusAvailableUpdate = (data, idToUpdate) => __awaiter(void 0, void 0, void 0, function* () {
    const alreadyAvailableOntThatTime = yield prisma_1.prisma.bus_Schedule.findMany({
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
    if ((0, utils_1.hasTimeConflict)(existingSlots, newSlot)) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, 'Bus is already booked');
    }
});
const checkDriverAvailableUpdate = (data, idToUpdate) => __awaiter(void 0, void 0, void 0, function* () {
    const alreadyAvailableOntThatTime = yield prisma_1.prisma.bus_Schedule.findMany({
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
    if ((0, utils_1.hasTimeConflict)(existingSlots, newSlot)) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, 'Driver is already booked');
    }
});
exports.BusScheduleUtils = {
    checkBusAvailable,
    checkBusAvailableUpdate,
    checkDriverAvailable,
    checkDriverAvailableUpdate,
};

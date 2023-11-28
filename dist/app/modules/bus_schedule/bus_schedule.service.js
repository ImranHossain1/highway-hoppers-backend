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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusScheduleService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = require("../../../shared/prisma");
const bus_schedule_constants_1 = require("./bus_schedule.constants");
const bus_schedule_utils_1 = require("./bus_schedule.utils");
const insertIntoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingStart = new Date(`${data.startDate}T${data.startTime}:00`);
    const existingEnd = new Date(`${data.endDate}T${data.endTime}:00`);
    if (existingEnd <= existingStart) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid Date and Time');
    }
    yield bus_schedule_utils_1.BusScheduleUtils.checkBusAvailable(data);
    yield bus_schedule_utils_1.BusScheduleUtils.checkDriverAvailable(data);
    const bus_scheduleResult = yield prisma_1.prisma.$transaction((prismaTransactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield prismaTransactionClient.bus_Schedule.create({
            data,
        });
        yield prismaTransactionClient.signle_Trip_Income.create({
            data: {
                busScheduleId: result.id,
            },
        });
        return result;
    }));
    return bus_scheduleResult;
});
const getAllFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: bus_schedule_constants_1.busScheduleSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                if (bus_schedule_constants_1.busScheduleRelationalFields.includes(key)) {
                    return {
                        [bus_schedule_constants_1.busScheduleRelationalFieldsMapper[key]]: {
                            id: filterData[key],
                        },
                    };
                }
                else {
                    return {
                        [key]: {
                            equals: filterData[key],
                        },
                    };
                }
            }),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.prisma.bus_Schedule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
            bus: true,
            driver: {
                include: {
                    user: true,
                },
            },
        },
    });
    const total = yield prisma_1.prisma.bus_Schedule.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.bus_Schedule.findUnique({
        where: {
            id,
        },
        include: {
            bus: true,
            driver: {
                include: {
                    user: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey Not Found');
    }
    return result;
});
const getByDriverId = (id, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: bus_schedule_constants_1.busScheduleSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                if (bus_schedule_constants_1.busScheduleRelationalFields.includes(key)) {
                    return {
                        [bus_schedule_constants_1.busScheduleRelationalFieldsMapper[key]]: {
                            id: filterData[key],
                        },
                    };
                }
                else {
                    return {
                        [key]: {
                            equals: filterData[key],
                        },
                    };
                }
            }),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: id,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Found');
    }
    whereConditions.driver = {
        userId: user.id,
    };
    const result = yield prisma_1.prisma.bus_Schedule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
            bus: true,
            driver: {
                include: {
                    user: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey Not Found');
    }
    const total = yield prisma_1.prisma.bus_Schedule.count({
        where: {
            driver: {
                userId: user.id,
            },
        },
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getAvailableSits = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.bus_Schedule.findUnique({
        where: {
            id,
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey Not Found');
    }
    if (result.status === client_1.Bus_Schedule_Status.Arrived) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey is Already Finished');
    }
    const getBookedSits = yield prisma_1.prisma.booking.findMany({
        where: {
            busScheduleId: id,
        },
    });
    // Extract the booked bus_SitIds from the bookings
    const bookedBusSitIds = getBookedSits.map(booking => booking.bus_SitId);
    // Retrieve all seats associated with the bus
    const allBusSits = yield prisma_1.prisma.bus_Sit.findMany({
        where: {
            busId: result.busId,
        },
    });
    // Filter out seats that are not booked
    const availableSeats = allBusSits.filter(busSit => {
        return !bookedBusSitIds.includes(busSit.id);
    });
    return availableSeats;
});
const updateOneInDB = (id, payload, time) => __awaiter(void 0, void 0, void 0, function* () {
    const existingStart = new Date(`${time.startDate}T${time.startTime}:00`);
    const existingEnd = new Date(`${time.endDate}T${time.endTime}:00`);
    if (existingEnd <= existingStart) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid Date and Time');
    }
    if (time.startDate &&
        time.startTime &&
        time.endDate &&
        time.endTime &&
        time.dayOfWeek &&
        time.busId) {
        yield bus_schedule_utils_1.BusScheduleUtils.checkBusAvailableUpdate(time, id);
    }
    if (time.startDate &&
        time.startTime &&
        time.endDate &&
        time.endTime &&
        time.dayOfWeek &&
        time.driverId) {
        yield bus_schedule_utils_1.BusScheduleUtils.checkDriverAvailableUpdate(time, id);
    }
    const result = yield prisma_1.prisma.bus_Schedule.update({
        where: {
            id,
        },
        data: payload,
        include: {
            bus: true,
            driver: true,
        },
    });
    return result;
});
const updateScheduleStatus = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isScheduleAvailable = yield prisma_1.prisma.bus_Schedule.findUnique({
        where: {
            id,
            status: client_1.Bus_Schedule_Status.Arrived,
        },
    });
    if (isScheduleAvailable) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Bus is already Arrived');
    }
    if (payload.status === client_1.Bus_Schedule_Status.Ongoing) {
        yield prisma_1.prisma.bus_Schedule.update({
            where: {
                id,
            },
            data: payload,
        });
        return {
            message: 'Journey Started',
        };
    }
    else {
        yield prisma_1.prisma.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield transactionClient.bus_Schedule.update({
                where: {
                    id,
                },
                data: {
                    status: payload.status,
                },
            });
            yield transactionClient.booking.deleteMany({
                where: {
                    busScheduleId: result.id,
                    bookingStatus: client_1.BookingStatus.Pending,
                },
            });
            yield transactionClient.booking.updateMany({
                where: {
                    busScheduleId: result.id,
                },
                data: {
                    bookingStatus: client_1.BookingStatus.Completed,
                },
            });
        }));
        return {
            message: 'Journey Completed!',
        };
    }
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.bus_Schedule.delete({
        where: {
            id,
        },
        include: {
            bus: true,
            driver: true,
        },
    });
    return result;
});
exports.BusScheduleService = {
    insertIntoDB,
    getByIdFromDB,
    getAllFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    updateScheduleStatus,
    getAvailableSits,
    getByDriverId,
};

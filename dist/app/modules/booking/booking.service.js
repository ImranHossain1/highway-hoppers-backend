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
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = require("../../../shared/prisma");
const utils_1 = require("../../../shared/utils");
const booking_constants_1 = require("./booking.constants");
const insertIntoDB = (data, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const isScheduleAvailable = yield prisma_1.prisma.bus_Schedule.findUnique({
        where: {
            id: data.busScheduleId,
            status: client_1.Bus_Schedule_Status.Arrived,
        },
    });
    if (isScheduleAvailable) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey is already completed');
    }
    if (data.sits && data.sits.length > 0) {
        const isBookingAvailable = yield prisma_1.prisma.bus_Schedule.findFirst({
            where: {
                id: data.busScheduleId,
            },
        });
        const busData = yield prisma_1.prisma.bus.findFirst({
            where: {
                id: isBookingAvailable === null || isBookingAvailable === void 0 ? void 0 : isBookingAvailable.busId,
            },
        });
        if ((isBookingAvailable === null || isBookingAvailable === void 0 ? void 0 : isBookingAvailable.bookedSit) &&
            (busData === null || busData === void 0 ? void 0 : busData.totalSit) &&
            (isBookingAvailable === null || isBookingAvailable === void 0 ? void 0 : isBookingAvailable.bookedSit) >= (busData === null || busData === void 0 ? void 0 : busData.totalSit)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'No Sits Available');
        }
        yield (0, utils_1.asyncForEach)(data.sits, (bus_Sit) => __awaiter(void 0, void 0, void 0, function* () {
            const isSitAvailable = yield prisma_1.prisma.booking.findFirst({
                where: {
                    busScheduleId: data.busScheduleId,
                    bus_SitId: bus_Sit.bus_SitId,
                },
            });
            if (!isSitAvailable === false) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'This sit is Already Booked');
            }
        }));
    }
    const bookingResult = yield prisma_1.prisma.$transaction((prismaTransactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, utils_1.asyncForEach)(data.sits, (bus_Sit) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield prismaTransactionClient.booking.create({
                data: {
                    userId: authUserId,
                    busScheduleId: data.busScheduleId,
                    bus_SitId: bus_Sit.bus_SitId,
                },
            });
            const busScheduleId = data.busScheduleId;
            yield prismaTransactionClient.bus_Schedule.update({
                where: {
                    id: busScheduleId,
                },
                data: {
                    PendingSit: {
                        increment: 1,
                    },
                },
            });
            return result;
        }));
    }));
    return bookingResult;
});
const completePendingBooking = (authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const pendingBooking = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: authUserId,
            paymentStatus: client_1.PaymentStatus.Pending,
        },
    });
    if (pendingBooking.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You don't have any pending booking");
    }
    const bookingResult = yield prisma_1.prisma.$transaction((prismaTransactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        if (pendingBooking && pendingBooking.length > 0) {
            yield (0, utils_1.asyncForEach)(pendingBooking, (pendingBooking) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c;
                const result = yield prismaTransactionClient.booking.update({
                    where: {
                        id: pendingBooking.id,
                        userId: authUserId,
                    },
                    data: {
                        bookingStatus: client_1.BookingStatus.Booked,
                        paymentStatus: client_1.PaymentStatus.Completed,
                    },
                    include: {
                        bus_Schedule: true,
                    },
                });
                if (!result) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Transaction Failed');
                }
                const busFare = (_b = (_a = result === null || result === void 0 ? void 0 : result.bus_Schedule) === null || _a === void 0 ? void 0 : _a.busFare) !== null && _b !== void 0 ? _b : 0;
                const busSchedule = yield prismaTransactionClient.bus_Schedule.findUnique({
                    where: {
                        id: result.busScheduleId,
                    },
                    include: {
                        signle_Trip_Income: true,
                    },
                });
                if (busSchedule) {
                    const currentEarnings = ((_c = busSchedule.signle_Trip_Income) === null || _c === void 0 ? void 0 : _c.earnings) || 0;
                    const newEarnings = currentEarnings + busFare;
                    yield prismaTransactionClient.bus_Schedule.update({
                        where: {
                            id: result.busScheduleId,
                        },
                        data: {
                            PendingSit: {
                                decrement: 1,
                            },
                            bookedSit: {
                                increment: 1,
                            },
                            signle_Trip_Income: {
                                update: {
                                    earnings: newEarnings,
                                },
                            },
                        },
                    });
                }
            }));
        }
    }));
    return bookingResult;
});
const cancelAllPendingBooking = (authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const pendingBookings = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: authUserId,
            bookingStatus: client_1.BookingStatus.Pending,
        },
    });
    console.log(pendingBookings);
    if (pendingBookings.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You don't have any pending booking");
    }
    const bookingResult = yield prisma_1.prisma.$transaction((prismaTransactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, utils_1.asyncForEach)(pendingBookings, (pendingBooking) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(pendingBooking);
            const result = yield prismaTransactionClient.booking.delete({
                where: {
                    id: pendingBooking.id,
                    userId: authUserId,
                },
            });
            yield prismaTransactionClient.bus_Schedule.update({
                where: {
                    id: pendingBooking.busScheduleId,
                },
                data: {
                    PendingSit: {
                        decrement: 1,
                    },
                },
            });
            return result;
        }));
    }));
    return bookingResult;
});
const cancelSinglePendingBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const pendingBooking = yield prisma_1.prisma.booking.findFirst({
        where: {
            id,
            bookingStatus: client_1.BookingStatus.Pending,
        },
    });
    if (!pendingBooking) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You don't have any pending booking");
    }
    const bookingResult = yield prisma_1.prisma.$transaction((prismaTransactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield prismaTransactionClient.booking.delete({
            where: {
                id,
            },
        });
        yield prismaTransactionClient.bus_Schedule.update({
            where: {
                id: pendingBooking.busScheduleId,
            },
            data: {
                PendingSit: {
                    decrement: 1,
                },
            },
        });
        return result;
    }));
    return bookingResult;
});
const getAllPendingBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: id,
            bookingStatus: client_1.BookingStatus.Pending,
        },
        include: {
            bus_Schedule: true,
            Bus_Sit: true,
        },
    });
    if (!result.length) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You don't have any pending bookings available.");
    }
    return {
        data: result,
    };
});
const getAllFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: booking_constants_1.BookingSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0
        ? {
            AND: andConditions,
        }
        : {};
    const { page, limit, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const result = yield prisma_1.prisma.booking.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : {
                createdAt: 'desc',
            },
    });
    const total = yield prisma_1.prisma.booking.count();
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
/* const getAllUsersBookingFromDB = async (
  filters: IBookingInterfaceRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Booking[]>> => {
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: BookingSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.booking.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.booking.count();
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
}; */
exports.BookingService = {
    insertIntoDB,
    completePendingBooking,
    cancelAllPendingBooking,
    cancelSinglePendingBooking,
    getAllPendingBooking,
    getAllFromDB,
};

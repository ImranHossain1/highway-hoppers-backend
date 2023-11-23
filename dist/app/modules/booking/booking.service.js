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
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = require("../../../shared/prisma");
const utils_1 = require("../../../shared/utils");
const insertIntoDB = (data, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const isScheduleAvailable = yield prisma_1.prisma.bus_Schedule.findUnique({
        where: {
            id: data.busScheduleId,
            status: client_1.Bus_Schedule_Status.Arrived,
        },
    });
    const isAuthUser = yield prisma_1.prisma.user.findUnique({
        where: {
            email: authUserId,
        },
    });
    if (!isAuthUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Exists');
    }
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
                    userId: isAuthUser.id,
                    busScheduleId: data.busScheduleId,
                    bus_SitId: bus_Sit.bus_SitId,
                },
            });
            console.log(result);
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
    const isAuthUser = yield prisma_1.prisma.user.findFirst({
        where: {
            email: authUserId,
        },
    });
    if (!isAuthUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Exists');
    }
    const pendingBooking = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: isAuthUser.id,
            paymentStatus: client_1.PaymentStatus.Pending,
        },
    });
    if (pendingBooking.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You don't have any pending booking");
    }
    const bookingResult = yield prisma_1.prisma.$transaction((prismaTransactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        if (pendingBooking && pendingBooking.length > 0) {
            yield (0, utils_1.asyncForEach)(pendingBooking, (pendingBooking) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield prismaTransactionClient.booking.update({
                    where: {
                        id: pendingBooking.id,
                        userId: isAuthUser.id,
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
                // const busFare = result?.bus_Schedule?.busFare ?? 0;
                /* await prismaTransactionClient.bus_Schedule.findUnique({
                  where: {
                    id: result.busScheduleId,
                  },
                }); */
                /* if (busSchedule) {
                  const currentEarnings =
                    busSchedule.signle_Trip_Income?.earnings || 0;
                  const newEarnings = currentEarnings + busFare;
      
                  await prismaTransactionClient.bus_Schedule.update({
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
                } */
            }));
        }
    }));
    return bookingResult;
});
const cancelAllPendingBooking = (authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    /* const isAuthUser = await prisma.user.findUnique({
      where: {
        email: authUserId,
      },
    });
  
    if (!isAuthUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Exists');
    } */
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
const getUserPendingBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isAuthUser = yield prisma_1.prisma.user.findFirst({
        where: {
            email: id,
        },
    });
    if (!isAuthUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Exists');
    }
    const result = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: isAuthUser.id,
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
const getUserConfirmedBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isUser = yield prisma_1.prisma.user.findFirst({
        where: {
            email: id,
        },
    });
    if (!isUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not found');
    }
    const result = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: isUser.id,
            bookingStatus: client_1.BookingStatus.Booked,
        },
        include: {
            bus_Schedule: true,
            Bus_Sit: true,
        },
    });
    if (!result.length) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You haven'y confirm any bookings yet.");
    }
    return {
        data: result,
    };
});
const getUserCompletedBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isUser = yield prisma_1.prisma.user.findFirst({
        where: {
            email: id,
        },
    });
    if (!isUser) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not found');
    }
    const result = yield prisma_1.prisma.booking.findMany({
        where: {
            userId: isUser.id,
            bookingStatus: client_1.BookingStatus.Completed,
        },
        include: {
            bus_Schedule: true,
            Bus_Sit: true,
        },
    });
    if (!result.length) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You do not have any completed Journey.');
    }
    return {
        data: result,
    };
});
const getAllFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const result = yield prisma_1.prisma.booking.findMany({
        skip,
        take: limit,
        include: {
            user: true,
            bus_Schedule: {
                include: {
                    driver: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
            Bus_Sit: {
                include: {
                    bus: true,
                },
            },
        },
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
const getAllPendingBookings = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const result = yield prisma_1.prisma.booking.findMany({
        where: {
            bookingStatus: client_1.BookingStatus.Pending,
        },
        skip,
        take: limit,
        include: {
            user: true,
            bus_Schedule: {
                include: {
                    driver: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
            Bus_Sit: {
                include: {
                    bus: true,
                },
            },
        },
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
exports.BookingService = {
    insertIntoDB,
    completePendingBooking,
    cancelAllPendingBooking,
    cancelSinglePendingBooking,
    getAllFromDB,
    getUserConfirmedBooking,
    getUserPendingBooking,
    getUserCompletedBooking,
    getAllPendingBookings,
};

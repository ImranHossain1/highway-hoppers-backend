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
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = require("../../../shared/prisma");
const review_constants_1 = require("./review.constants");
const insertIntoDB = (data, userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: userId,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Found');
    }
    const isBookingCompleted = yield prisma_1.prisma.booking.findFirst({
        where: {
            id: bookingId,
            userId: user.id,
        },
        include: {
            review: true,
        },
    });
    if (!isBookingCompleted) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey is not found');
    }
    if ((isBookingCompleted === null || isBookingCompleted === void 0 ? void 0 : isBookingCompleted.bookingStatus) !== client_1.BookingStatus.Completed) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your Journey is not Completed yet');
    }
    if (isBookingCompleted.review !== null) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Review already completed');
    }
    yield prisma_1.prisma.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield transactionClient.review.create({
            data: {
                userId: user.id,
                bookingId: bookingId,
                review: data.review,
                rating: data.rating,
            },
            include: {
                booking: {
                    include: {
                        bus_Schedule: true,
                    },
                },
            },
        });
        const driverData = yield transactionClient.driver.findUnique({
            where: {
                id: result.booking.bus_Schedule.driverId,
            },
        });
        if (driverData) {
            let totalReviewer = 0;
            let driverTotalRating = 0;
            let driverRating = 0;
            if (driverData.totalReviewer === 0) {
                totalReviewer = 1;
                driverTotalRating = result.rating;
                driverRating = driverTotalRating;
            }
            else {
                totalReviewer = (driverData === null || driverData === void 0 ? void 0 : driverData.totalReviewer) + 1;
                driverTotalRating = (driverData === null || driverData === void 0 ? void 0 : driverData.totalRatings) + result.rating;
                driverRating = parseFloat((driverTotalRating / totalReviewer).toFixed(2));
            }
            yield transactionClient.driver.update({
                where: {
                    id: result.booking.bus_Schedule.driverId,
                },
                data: {
                    rating: driverRating,
                    totalRatings: driverTotalRating,
                    totalReviewer: totalReviewer,
                },
            });
        }
    }));
    return {
        message: 'Thank you for your review',
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.review.findUnique({
        where: {
            id,
        },
        include: {
            booking: {
                include: {
                    bus_Schedule: {
                        include: {
                            driver: true,
                        },
                    },
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Review is not found');
    }
    return result;
});
const getAllReviewFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: review_constants_1.reviewSearchableFields.map(field => ({
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
            booking: {
                include: {
                    bus_Schedule: {
                        include: {
                            driver: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            },
            user: true,
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey Not Found');
    }
    const total = yield prisma_1.prisma.review.count({});
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getAllReviewForSingleDriverFromDB = (id, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: review_constants_1.reviewSearchableFields.map(field => ({
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: id,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Found');
    }
    whereConditions.booking = {
        bus_Schedule: {
            driver: {
                userId: user.id,
            },
        },
    };
    const result = yield prisma_1.prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
            booking: {
                include: {
                    bus_Schedule: {
                        include: {
                            driver: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            },
            user: true,
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Journey Not Found');
    }
    const total = yield prisma_1.prisma.review.count({});
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const updateOneInDB = (id, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: userId,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Found');
    }
    const isReviewExists = yield prisma_1.prisma.review.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
        include: {
            booking: {
                include: {
                    bus_Schedule: true,
                },
            },
        },
    });
    if (!isReviewExists) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Review is not found');
    }
    yield prisma_1.prisma.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        if (payload.rating) {
            const driverData = yield transactionClient.driver.findUnique({
                where: {
                    id: isReviewExists.booking.bus_Schedule.driverId,
                },
            });
            if (driverData) {
                let driverTotalRating = (driverData === null || driverData === void 0 ? void 0 : driverData.totalRatings) - isReviewExists.rating;
                driverTotalRating = driverTotalRating + payload.rating;
                const driverRating = parseFloat((driverTotalRating / (driverData === null || driverData === void 0 ? void 0 : driverData.totalReviewer)).toFixed(2));
                yield transactionClient.driver.update({
                    where: {
                        id: isReviewExists.booking.bus_Schedule.driverId,
                    },
                    data: {
                        rating: driverRating,
                        totalRatings: driverTotalRating,
                    },
                });
            }
        }
        yield prisma_1.prisma.review.update({
            where: {
                id,
                userId: user.id,
            },
            data: payload,
            include: {
                booking: {
                    include: {
                        bus_Schedule: true,
                    },
                },
            },
        });
    }));
    return {
        message: 'Review update Successfully',
    };
});
const deleteByIdFromDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: userId,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User Not Found');
    }
    const isReviewExists = yield prisma_1.prisma.review.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
        include: {
            booking: {
                include: {
                    bus_Schedule: true,
                },
            },
        },
    });
    if (!isReviewExists) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Review is not found');
    }
    yield prisma_1.prisma.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const driverData = yield transactionClient.driver.findUnique({
            where: {
                id: isReviewExists.booking.bus_Schedule.driverId,
            },
        });
        if (driverData) {
            const driverTotalRating = (driverData === null || driverData === void 0 ? void 0 : driverData.totalRatings) - isReviewExists.rating;
            const totalReviewer = (driverData === null || driverData === void 0 ? void 0 : driverData.totalReviewer) - 1;
            const driverRating = parseFloat((driverTotalRating / totalReviewer).toFixed(2));
            yield transactionClient.driver.update({
                where: {
                    id: isReviewExists.booking.bus_Schedule.driverId,
                },
                data: {
                    rating: driverRating,
                    totalRatings: driverTotalRating,
                    totalReviewer: totalReviewer,
                },
            });
        }
        yield prisma_1.prisma.review.delete({
            where: {
                id,
                userId: user.id,
            },
            include: {
                booking: {
                    include: {
                        bus_Schedule: true,
                    },
                },
            },
        });
    }));
    return {
        message: 'Review Deleted Successfully',
    };
});
exports.ReviewService = {
    insertIntoDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    getAllReviewFromDB,
    getAllReviewForSingleDriverFromDB,
};

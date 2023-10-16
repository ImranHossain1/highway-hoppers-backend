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
exports.DriverService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = require("../../../shared/prisma");
const insertIntoDB = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isDriverExists = yield prisma_1.prisma.driver.findUnique({
        where: {
            userId: userId,
        },
    });
    if (isDriverExists) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Driver is Already Exists');
    }
    const result = yield prisma_1.prisma.driver.create({
        data: {
            userId: userId,
            salary: data.salary,
            totalReviewer: 0,
            totalRatings: 0,
            rating: 0,
        },
        include: {
            user: true,
        },
    });
    return result;
});
const getDriverFromDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.driver.findUnique({
        where: {
            userId: userId,
        },
        include: {
            user: true,
        },
    });
    return result;
});
const updateOneInDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isDriverExists = yield prisma_1.prisma.driver.findUnique({
        where: {
            userId: userId,
        },
    });
    if (!isDriverExists) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Driver is not Exists');
    }
    const result = yield prisma_1.prisma.driver.update({
        where: {
            userId: userId,
        },
        data: payload,
        include: {
            user: true,
        },
    });
    return result;
});
exports.DriverService = {
    insertIntoDB,
    updateOneInDB,
    getDriverFromDb,
};

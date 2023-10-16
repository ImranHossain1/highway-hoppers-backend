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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const prisma_1 = require("../../../shared/prisma");
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    data.password = bcryptjs_1.default.hashSync(data.password, 12);
    data.isAllFieldGiven = true;
    const result = yield prisma_1.prisma.user.create({ data });
    return result;
});
const loginUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.user.findUnique({
        where: {
            email: user.email,
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const userExist = yield bcryptjs_1.default.compare(user.password, result.password);
    if (!userExist) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid credentials');
    }
    // create access token and refresh token
    const { id: userId, role } = result;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ userId, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ userId, role }, config_1.default.jwt.secret, config_1.default.jwt.refresh_expires_in);
    return { accessToken, refreshToken };
});
const socialLogin = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.user.findUnique({
        where: {
            email: user.email,
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // create access token and refresh token
    const { id: userId, role } = result;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ userId, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ userId, role }, config_1.default.jwt.secret, config_1.default.jwt.refresh_expires_in);
    return { accessToken, refreshToken };
});
const changePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = payload;
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    // Compare the oldPassword with the user's stored hashed password
    const passwordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!passwordMatch) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Incorrect old password');
    }
    // If the old password matches, you can now hash and save the new password
    const hashedNewPassword = bcryptjs_1.default.hashSync(newPassword, 12);
    // Update the user's password in the database
    yield prisma_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashedNewPassword,
        },
    });
});
exports.AuthService = {
    createUser,
    socialLogin,
    loginUser,
    changePassword,
};

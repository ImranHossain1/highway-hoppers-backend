"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const auth_constant_1 = require("./auth.constant");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            required_error: 'Email is required',
        }),
        name: zod_1.z.string({
            required_error: 'Name is required',
        }),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
        DOB: zod_1.z.string({
            required_error: 'Date of Birth is required',
        }),
        gender: zod_1.z.enum([...auth_constant_1.gender], {
            required_error: 'Gender is required',
        }),
        role: zod_1.z.string().optional(),
        contactNo: zod_1.z.string({
            required_error: 'Phone number is required',
        }),
        address: zod_1.z.string({
            required_error: 'Address is required',
        }),
        profileImage: zod_1.z.string().optional(),
    }),
});
const loginZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            required_error: 'Email is required',
        }),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
    }),
});
const changePasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({
            required_error: 'Old password is required',
        }),
        newPassword: zod_1.z.string({
            required_error: 'New password is required',
        }),
    }),
});
exports.AuthValidation = {
    loginZodSchema,
    changePasswordZodSchema,
    createUserZodSchema,
};

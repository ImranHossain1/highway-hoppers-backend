"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverValidation = void 0;
const zod_1 = require("zod");
const auth_constant_1 = require("../auth/auth.constant");
/* const create = z.object({
  body: z.object({
    salary: z.number({
      required_error: 'Salary is required',
    }),
  }),
}); */
const createDriverZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        salary: zod_1.z.number({
            required_error: 'Salary is required',
        }),
        user: zod_1.z.object({
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
            gender: zod_1.z.enum([...auth_constant_1.gender]).optional(),
            contactNo: zod_1.z.string({
                required_error: 'Contact Number is required',
            }),
            address: zod_1.z.string({
                required_error: 'Address is required',
            }),
            profileImage: zod_1.z.string().optional(),
        }),
    }),
});
const update = zod_1.z.object({
    body: zod_1.z.object({
        salary: zod_1.z.number().optional(),
    }),
});
exports.DriverValidation = {
    update,
    createDriverZodSchema,
};

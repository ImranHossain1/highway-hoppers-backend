import { z } from 'zod';
import { gender } from './auth.constant';

const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }),
    name: z.string({
      required_error: 'Name is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
    DOB: z.string().optional(),
    gender: z.enum([...gender] as [string, ...string[]]).optional(),
    role: z.string().optional(),
    contactNo: z.string().optional(),
    address: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});
const loginZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),
    newPassword: z.string({
      required_error: 'New password is required',
    }),
  }),
});

export const AuthValidation = {
  loginZodSchema,
  changePasswordZodSchema,
  createUserZodSchema,
};

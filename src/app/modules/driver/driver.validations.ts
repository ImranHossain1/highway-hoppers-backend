import { z } from 'zod';
import { gender } from '../auth/auth.constant';

/* const create = z.object({
  body: z.object({
    salary: z.number({
      required_error: 'Salary is required',
    }),
  }),
}); */

const createDriverZodSchema = z.object({
  body: z.object({
    salary: z.number({
      required_error: 'Salary is required',
    }),
    user: z.object({
      email: z.string({
        required_error: 'Email is required',
      }),
      name: z.string({
        required_error: 'Name is required',
      }),
      password: z.string({
        required_error: 'Password is required',
      }),
      DOB: z.string({
        required_error: 'Date of Birth is required',
      }),
      gender: z.enum([...gender] as [string, ...string[]]).optional(),

      contactNo: z.string({
        required_error: 'Contact Number is required',
      }),
      address: z.string({
        required_error: 'Address is required',
      }),
      profileImage: z.string().optional(),
    }),
  }),
});
const update = z.object({
  body: z.object({
    salary: z.number().optional(),
  }),
});

export const DriverValidation = {
  update,
  createDriverZodSchema,
};

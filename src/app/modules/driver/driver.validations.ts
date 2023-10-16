import { z } from 'zod';

const create = z.object({
  body: z.object({
    salary: z.number({
      required_error: 'Salary is required',
    }),
  }),
});

const update = z.object({
  body: z.object({
    salary: z.number().optional(),
  }),
});

export const DriverValidation = {
  create,
  update,
};

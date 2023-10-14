import { z } from 'zod';

const create = z.object({
  body: z.object({
    busNumber: z.string({
      required_error: 'Bus Number is required',
    }),
  }),
});

const update = z.object({
  body: z.object({
    totalSit: z.number().optional(),
    busNumber: z.string().optional(),
  }),
});

export const BusValidation = {
  create,
  update,
};

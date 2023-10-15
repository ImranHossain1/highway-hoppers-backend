import { z } from 'zod';

const create = z.object({
  body: z.object({
    sits: z.array(
      z.object({
        bus_SitId: z.string({ required_error: 'Bus Sit Id is required' }),
      })
    ),
    busScheduleId: z.string({
      required_error: 'Bus Schedule Id is required',
    }),
  }),
});
export const BookingValidation = {
  create,
};

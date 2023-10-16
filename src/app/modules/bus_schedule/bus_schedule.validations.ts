import { z } from 'zod';
import { busSchedulestatus, daysInWeek } from './bus_schedule.constants';

const timeStringSchema = z.string().refine(
  time => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    // example: 09:45, 21:30
    return regex.test(time);
  },
  {
    message: "Invalid time format, expected 'HH:MM' in 24-hour format",
  }
);

const create = z.object({
  body: z.object({
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    startDate: z.string({
      required_error: 'Start Date is required',
    }),
    endDate: z.string({
      required_error: 'End Date is required',
    }),
    startingPoint: z.string({
      required_error: 'Start Time is required',
    }),
    endPoint: z.string({
      required_error: 'Start Time is required',
    }),
    dayOfWeek: z.enum([...daysInWeek] as [string, ...string[]], {
      required_error: 'Day of week is required',
    }),
    busFare: z.number({
      required_error: 'Travel Fare is required',
    }),
    busId: z.string({
      required_error: 'Start Time is required',
    }),
    driverId: z.string({
      required_error: 'Driver is required',
    }),
  }),
});
const update = z.object({
  body: z.object({
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
    startDate: z
      .string({
        required_error: 'Start Date is required',
      })
      .optional(),
    endDate: z
      .string({
        required_error: 'End Date is required',
      })
      .optional(),
    startingPoint: z
      .string({
        required_error: 'Start Time is required',
      })
      .optional(),
    endPoint: z
      .string({
        required_error: 'Start Time is required',
      })
      .optional(),
    dayOfWeek: z
      .enum([...daysInWeek] as [string, ...string[]], {
        required_error: 'Day of week is required',
      })
      .optional(),
    busFare: z
      .number({
        required_error: 'Travel Fare is required',
      })
      .optional(),
    busId: z
      .string({
        required_error: 'Start Time is required',
      })
      .optional(),
    driverId: z
      .string({
        required_error: 'Driver is required',
      })
      .optional(),
  }),
});
const updateStatus = z.object({
  body: z.object({
    status: z.enum([...busSchedulestatus] as [string, ...string[]], {
      required_error: 'Status is required',
    }),
  }),
});

export const BusValidation = {
  create,
  update,
  updateStatus,
};

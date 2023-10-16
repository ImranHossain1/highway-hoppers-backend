"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusValidation = void 0;
const zod_1 = require("zod");
const bus_schedule_constants_1 = require("./bus_schedule.constants");
const timeStringSchema = zod_1.z.string().refine(time => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    // example: 09:45, 21:30
    return regex.test(time);
}, {
    message: "Invalid time format, expected 'HH:MM' in 24-hour format",
});
const create = zod_1.z.object({
    body: zod_1.z.object({
        startTime: timeStringSchema,
        endTime: timeStringSchema,
        startDate: zod_1.z.string({
            required_error: 'Start Date is required',
        }),
        endDate: zod_1.z.string({
            required_error: 'End Date is required',
        }),
        startingPoint: zod_1.z.string({
            required_error: 'Start Time is required',
        }),
        endPoint: zod_1.z.string({
            required_error: 'Start Time is required',
        }),
        dayOfWeek: zod_1.z.enum([...bus_schedule_constants_1.daysInWeek], {
            required_error: 'Day of week is required',
        }),
        busFare: zod_1.z.number({
            required_error: 'Travel Fare is required',
        }),
        busId: zod_1.z.string({
            required_error: 'Start Time is required',
        }),
        driverId: zod_1.z.string({
            required_error: 'Driver is required',
        }),
    }),
});
const update = zod_1.z.object({
    body: zod_1.z.object({
        startTime: timeStringSchema.optional(),
        endTime: timeStringSchema.optional(),
        startDate: zod_1.z
            .string({
            required_error: 'Start Date is required',
        })
            .optional(),
        endDate: zod_1.z
            .string({
            required_error: 'End Date is required',
        })
            .optional(),
        startingPoint: zod_1.z
            .string({
            required_error: 'Start Time is required',
        })
            .optional(),
        endPoint: zod_1.z
            .string({
            required_error: 'Start Time is required',
        })
            .optional(),
        dayOfWeek: zod_1.z
            .enum([...bus_schedule_constants_1.daysInWeek], {
            required_error: 'Day of week is required',
        })
            .optional(),
        busFare: zod_1.z
            .number({
            required_error: 'Travel Fare is required',
        })
            .optional(),
        busId: zod_1.z
            .string({
            required_error: 'Start Time is required',
        })
            .optional(),
        driverId: zod_1.z
            .string({
            required_error: 'Driver is required',
        })
            .optional(),
    }),
});
const updateStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([...bus_schedule_constants_1.busSchedulestatus], {
            required_error: 'Status is required',
        }),
    }),
});
exports.BusValidation = {
    create,
    update,
    updateStatus,
};

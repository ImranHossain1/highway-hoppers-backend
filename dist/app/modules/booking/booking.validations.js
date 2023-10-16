"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidation = void 0;
const zod_1 = require("zod");
const create = zod_1.z.object({
    body: zod_1.z.object({
        sits: zod_1.z.array(zod_1.z.object({
            bus_SitId: zod_1.z.string({ required_error: 'Bus Sit Id is required' }),
        })),
        busScheduleId: zod_1.z.string({
            required_error: 'Bus Schedule Id is required',
        }),
    }),
});
exports.BookingValidation = {
    create,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverValidation = void 0;
const zod_1 = require("zod");
const create = zod_1.z.object({
    body: zod_1.z.object({
        salary: zod_1.z.number({
            required_error: 'Salary is required',
        }),
    }),
});
const update = zod_1.z.object({
    body: zod_1.z.object({
        salary: zod_1.z.number().optional(),
    }),
});
exports.DriverValidation = {
    create,
    update,
};

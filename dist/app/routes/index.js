"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/auth/auth.route");
const booking_routes_1 = require("../modules/booking/booking.routes");
const bus_routes_1 = require("../modules/bus/bus.routes");
const bus_schedule_routes_1 = require("../modules/bus_schedule/bus_schedule.routes");
const driver_routes_1 = require("../modules/driver/driver.routes");
const profile_route_1 = require("../modules/profile/profile.route");
const review_routes_1 = require("../modules/review/review.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    { path: '/auth', route: auth_route_1.AuthRoutes },
    { path: '/user', route: profile_route_1.UserProfileRoutes },
    { path: '/bus', route: bus_routes_1.BusRoutes },
    { path: '/bus-schedule', route: bus_schedule_routes_1.BusScheduleRoutes },
    { path: '/booking', route: booking_routes_1.BookingRoutes },
    { path: '/review', route: review_routes_1.ReviewRoutes },
    { path: '/driver', route: driver_routes_1.DriverRoutes },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;

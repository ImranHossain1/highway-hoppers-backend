"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const booking_controller_1 = require("./booking.controller");
const booking_validations_1 = require("./booking.validations");
const router = express_1.default.Router();
router.post('/create-booking', (0, validateRequest_1.default)(booking_validations_1.BookingValidation.create), (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), booking_controller_1.BookingController.insertIntoDB);
router.patch('/complete-booking', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), booking_controller_1.BookingController.completePendingBooking);
router.delete('/cancel-all-pending-booking', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), booking_controller_1.BookingController.cancelAllPendingBooking);
router.delete('/:id/cancel-single-pending-booking', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), booking_controller_1.BookingController.cancelSinglePendingBooking);
router.get('/get-user-Pending-Booking', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), booking_controller_1.BookingController.getUserPendingBooking);
router.get('/get-all-bookings', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), booking_controller_1.BookingController.getAllFromDb);
router.get('/get-all-pending-bookings', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), booking_controller_1.BookingController.getAllPendingBookings);
router.get('/get-user-bookings', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), booking_controller_1.BookingController.getUserConfirmedBooking);
router.get('/get-user-completed-bookings', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), booking_controller_1.BookingController.getUserCompletedBooking);
exports.BookingRoutes = router;

import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validations';

const router = express.Router();

router.post(
  '/create-booking',
  validateRequest(BookingValidation.create),
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  BookingController.insertIntoDB
);
router.patch(
  '/complete-booking',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  BookingController.completePendingBooking
);
router.delete(
  '/cancel-all-pending-booking',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  BookingController.cancelAllPendingBooking
);
router.delete(
  '/:id/cancel-single-pending-booking',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.TRAVELLER),
  BookingController.cancelSinglePendingBooking
);
router.get(
  '/get-user-Pending-Booking',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  BookingController.getUserPendingBooking
);
router.get(
  '/get-all-bookings',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BookingController.getAllFromDb
);
router.get(
  '/get-all-pending-bookings',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BookingController.getAllPendingBookings
);
router.get(
  '/get-user-bookings',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  BookingController.getUserConfirmedBooking
);
router.get(
  '/get-user-completed-bookings',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  BookingController.getUserCompletedBooking
);

export const BookingRoutes = router;

import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { BookingRoutes } from '../modules/booking/booking.routes';
import { BusRoutes } from '../modules/bus/bus.routes';
import { BusScheduleRoutes } from '../modules/bus_schedule/bus_schedule.routes';
import { DriverRoutes } from '../modules/driver/driver.routes';
import { UserProfileRoutes } from '../modules/profile/profile.route';
import { ReviewRoutes } from '../modules/review/review.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/user', route: UserProfileRoutes },
  { path: '/bus', route: BusRoutes },
  { path: '/bus-schedule', route: BusScheduleRoutes },
  { path: '/booking', route: BookingRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/driver', route: DriverRoutes },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;

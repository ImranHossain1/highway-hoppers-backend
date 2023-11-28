import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BusScheduleController } from './bus_schedule.controller';
import { BusValidation } from './bus_schedule.validations';

const router = express.Router();

router.post(
  '/',
  validateRequest(BusValidation.create),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusScheduleController.insertIntoDB
);
router.get(
  '/driverSchedule',
  auth(ENUM_USER_ROLE.DRIVER),
  BusScheduleController.getByDriverId
);
router.get('/:id/availableSits', BusScheduleController.getAvailableSits);
router.get('/:id', BusScheduleController.getByIdFromDB);

router.get('/', BusScheduleController.getAllFromDB);
router.patch(
  '/:id/update-schedule',
  validateRequest(BusValidation.update),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusScheduleController.updateOneInDB
);
router.patch(
  '/:id/update-status',
  validateRequest(BusValidation.updateStatus),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DRIVER),
  BusScheduleController.updateScheduleStatus
);
router.delete(
  '/:id/delete-schedule',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusScheduleController.deleteByIdFromDB
);

export const BusScheduleRoutes = router;

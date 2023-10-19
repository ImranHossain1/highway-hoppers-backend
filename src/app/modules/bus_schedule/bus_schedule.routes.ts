import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BusController } from './bus_schedule.controller';
import { BusValidation } from './bus_schedule.validations';

const router = express.Router();

router.post(
  '/',
  validateRequest(BusValidation.create),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusController.insertIntoDB
);
router.get('/availableSits/:id', BusController.getAvailableSits);
router.get('/:id', BusController.getByIdFromDB);
router.get('/', BusController.getAllFromDB);
router.patch(
  '/:id/update-schedule',
  validateRequest(BusValidation.update),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusController.updateOneInDB
);
router.patch(
  '/:id/update-status',
  validateRequest(BusValidation.updateStatus),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusController.updateScheduleStatus
);
router.delete(
  '/:id/delete-schedule',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  BusController.deleteByIdFromDB
);

export const BusScheduleRoutes = router;

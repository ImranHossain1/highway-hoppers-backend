import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DriverController } from './driver.controller';
import { DriverValidation } from './driver.validations';

const router = express.Router();

router.post(
  '/:id',
  validateRequest(DriverValidation.create),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  DriverController.insertIntoDB
);
router.patch(
  '/:id',
  validateRequest(DriverValidation.update),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  DriverController.updateOneInDB
);
router.get('/:id', DriverController.getByIdFromDB);

export const DriverRoutes = router;
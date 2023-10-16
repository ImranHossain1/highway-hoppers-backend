import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { BusController } from './review.controller';

const router = express.Router();

router.post(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.TRAVELLER,
    ENUM_USER_ROLE.DRIVER
  ),
  BusController.insertIntoDB
);
router.get('/:id', BusController.getByIdFromDB);
router.get('/', BusController.getAllReviewFromDB);
router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.TRAVELLER,
    ENUM_USER_ROLE.DRIVER
  ),
  BusController.updateOneInDB
);
router.delete(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.TRAVELLER,
    ENUM_USER_ROLE.DRIVER
  ),
  BusController.deleteByIdFromDB
);

export const ReviewRoutes = router;

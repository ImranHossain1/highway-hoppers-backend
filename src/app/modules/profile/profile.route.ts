import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { UserProfileController } from './profile.controller';

const router = express.Router();

router.get(
  '/my-profile',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  UserProfileController.getUsersProfile
);
router.get(
  '/:id/user-profile',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  UserProfileController.getSingleUserProfile
);
router.patch(
  '/update-profile',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  UserProfileController.updateOneInDB
);

export const UserProfileRoutes = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const profile_controller_1 = require("./profile.controller");
const router = express_1.default.Router();
router.get('/my-profile', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), profile_controller_1.UserProfileController.getUsersProfile);
router.get('/:id/user-profile', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), profile_controller_1.UserProfileController.getSingleUserProfile);
router.patch('/update-profile', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DRIVER, user_1.ENUM_USER_ROLE.TRAVELLER), profile_controller_1.UserProfileController.updateOneInDB);
exports.UserProfileRoutes = router;

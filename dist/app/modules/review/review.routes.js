"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const review_controller_1 = require("./review.controller");
const router = express_1.default.Router();
router.post('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.TRAVELLER, user_1.ENUM_USER_ROLE.DRIVER), review_controller_1.BusController.insertIntoDB);
router.get('/driverReview', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DRIVER), review_controller_1.BusController.getAllReviewForSingleDriverFromDB);
router.get('/:id', review_controller_1.BusController.getByIdFromDB);
router.get('/', review_controller_1.BusController.getAllReviewFromDB);
router.patch('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.TRAVELLER), review_controller_1.BusController.updateOneInDB);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.TRAVELLER, user_1.ENUM_USER_ROLE.DRIVER), review_controller_1.BusController.deleteByIdFromDB);
exports.ReviewRoutes = router;

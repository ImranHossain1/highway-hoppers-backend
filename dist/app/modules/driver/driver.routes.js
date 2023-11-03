"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const driver_controller_1 = require("./driver.controller");
const driver_validations_1 = require("./driver.validations");
const router = express_1.default.Router();
router.post('/:id', (0, validateRequest_1.default)(driver_validations_1.DriverValidation.create), (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), driver_controller_1.DriverController.insertIntoDB);
router.patch('/:id', (0, validateRequest_1.default)(driver_validations_1.DriverValidation.update), (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), driver_controller_1.DriverController.updateOneInDB);
router.get('/:id', driver_controller_1.DriverController.getByIdFromDB);
router.get('/', driver_controller_1.DriverController.getAllFromDB);
exports.DriverRoutes = router;

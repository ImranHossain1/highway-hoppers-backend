"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const bus_controller_1 = require("./bus.controller");
const bus_validations_1 = require("./bus.validations");
const router = express_1.default.Router();
router.post('/', (0, validateRequest_1.default)(bus_validations_1.BusValidation.create), (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), bus_controller_1.BusController.insertIntoDB);
router.get('/:id', bus_controller_1.BusController.getByIdFromDB);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), bus_controller_1.BusController.getAllFromDB);
router.patch('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN), bus_controller_1.BusController.updateOneInDB);
exports.BusRoutes = router;

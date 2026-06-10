"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tourController_1 = require("../controllers/tourController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', tourController_1.getAllTours);
router.get('/:id', tourController_1.getTourById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, tourController_1.createTour);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, tourController_1.updateTour);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, tourController_1.deleteTour);
exports.default = router;

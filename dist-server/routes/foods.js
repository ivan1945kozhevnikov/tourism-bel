"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodController_1 = require("../controllers/foodController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', foodController_1.getAllFoods);
router.get('/:id', foodController_1.getFoodById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, foodController_1.createFood);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, foodController_1.updateFood);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, foodController_1.deleteFood);
exports.default = router;

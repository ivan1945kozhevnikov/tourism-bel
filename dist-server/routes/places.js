"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const placeController_1 = require("../controllers/placeController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', placeController_1.getAllPlaces);
router.get('/:id', placeController_1.getPlaceById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, placeController_1.createPlace);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, placeController_1.updatePlace);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, placeController_1.deletePlace);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const traditionController_1 = require("../controllers/traditionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', traditionController_1.getAllTraditions);
router.get('/:id', traditionController_1.getTraditionById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, traditionController_1.createTradition);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, traditionController_1.updateTradition);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, traditionController_1.deleteTradition);
exports.default = router;

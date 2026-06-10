'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const bookingController_1 = require('../controllers/bookingController');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
router.get(
  '/my',
  auth_1.authenticateToken,
  bookingController_1.getUserBookings,
);
router.get(
  '/',
  auth_1.authenticateToken,
  auth_1.requireAdmin,
  bookingController_1.getAllBookings,
);
router.post('/', auth_1.authenticateToken, bookingController_1.createBooking);
router.put(
  '/:id/status',
  auth_1.authenticateToken,
  auth_1.requireAdmin,
  bookingController_1.updateBookingStatus,
);
router.delete(
  '/:id',
  auth_1.authenticateToken,
  bookingController_1.cancelBooking,
);
exports.default = router;

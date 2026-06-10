'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const reviewController_1 = require('../controllers/reviewController');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();

// Публичные маршруты (доступны всем)
router.get('/top', reviewController_1.getTopReviews);
router.post('/', reviewController_1.createReview);

// Защищенные маршруты (только для админа)
router.get(
  '/',
  auth_1.authenticateToken,
  auth_1.requireAdmin,
  reviewController_1.getAllReviews,
);
router.patch(
  '/:id/status',
  auth_1.authenticateToken,
  auth_1.requireAdmin,
  reviewController_1.updateReviewStatus,
);
router.delete(
  '/:id',
  auth_1.authenticateToken,
  auth_1.requireAdmin,
  reviewController_1.deleteReview,
);

exports.default = router;

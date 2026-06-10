import express from 'express';
import {
  getAllReviews,
  getTopReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты (доступны всем)
router.get('/top', getTopReviews);
router.post('/', createReview);

// Защищенные маршруты (только для админа)
router.get('/', authenticateToken, requireAdmin, getAllReviews);
router.patch(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  updateReviewStatus,
);
router.delete('/:id', authenticateToken, requireAdmin, deleteReview);

export default router;

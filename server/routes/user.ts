import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  getUserStats,
} from '../controllers/userController';

const router = Router();

// Все маршруты требуют авторизации и прав администратора
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/users/stats', authenticateToken, requireAdmin, getUserStats);
router.get('/users/:id', authenticateToken, requireAdmin, getUserById);
router.patch(
  '/users/:id/role',
  authenticateToken,
  requireAdmin,
  updateUserRole,
);
router.patch(
  '/users/:id/toggle-block',
  authenticateToken,
  requireAdmin,
  toggleUserBlock,
);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

export default router;

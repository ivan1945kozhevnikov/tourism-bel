import express from 'express';
import { 
  getAllFoods, 
  getFoodById, 
  createFood, 
  updateFood, 
  deleteFood 
} from '../controllers/foodController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllFoods);
router.get('/:id', getFoodById);
router.post('/', authenticateToken, requireAdmin, createFood);
router.put('/:id', authenticateToken, requireAdmin, updateFood);
router.delete('/:id', authenticateToken, requireAdmin, deleteFood);

export default router;

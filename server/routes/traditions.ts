import express from 'express';
import { 
  getAllTraditions, 
  getTraditionById, 
  createTradition, 
  updateTradition, 
  deleteTradition 
} from '../controllers/traditionController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllTraditions);
router.get('/:id', getTraditionById);
router.post('/', authenticateToken, requireAdmin, createTradition);
router.put('/:id', authenticateToken, requireAdmin, updateTradition);
router.delete('/:id', authenticateToken, requireAdmin, deleteTradition);

export default router;

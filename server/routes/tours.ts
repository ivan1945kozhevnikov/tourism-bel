import express from 'express';
import { 
  getAllTours, 
  getTourById, 
  createTour, 
  updateTour, 
  deleteTour 
} from '../controllers/tourController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllTours);
router.get('/:id', getTourById);
router.post('/', authenticateToken, requireAdmin, createTour);
router.put('/:id', authenticateToken, requireAdmin, updateTour);
router.delete('/:id', authenticateToken, requireAdmin, deleteTour);

export default router;

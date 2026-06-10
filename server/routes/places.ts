import express from 'express';
import { 
  getAllPlaces, 
  getPlaceById, 
  createPlace, 
  updatePlace, 
  deletePlace 
} from '../controllers/placeController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);
router.post('/', authenticateToken, requireAdmin, createPlace);
router.put('/:id', authenticateToken, requireAdmin, updatePlace);
router.delete('/:id', authenticateToken, requireAdmin, deletePlace);

export default router;

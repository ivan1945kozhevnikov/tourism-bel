import express from 'express';
import { 
  getUserBookings, 
  getAllBookings, 
  createBooking, 
  updateBookingStatus, 
  cancelBooking 
} from '../controllers/bookingController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/my', authenticateToken, getUserBookings);
router.get('/', authenticateToken, requireAdmin, getAllBookings);
router.post('/', authenticateToken, createBooking);
router.put('/:id/status', authenticateToken, requireAdmin, updateBookingStatus);
router.delete('/:id', authenticateToken, cancelBooking);

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.updateBookingStatus = exports.createBooking = exports.getAllBookings = exports.getUserBookings = void 0;
const db_1 = require("../database/db");
const getUserBookings = async (req, res) => {
    try {
        const result = await (0, db_1.query)(`SELECT b.*, t.title as tour_title, t.image_url as tour_image 
       FROM bookings b 
       JOIN tours t ON b.tour_id = t.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`, [req.user.id]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserBookings = getUserBookings;
const getAllBookings = async (req, res) => {
    try {
        const result = await (0, db_1.query)(`SELECT b.*, t.title as tour_title, u.email as user_email, 
              u.first_name as user_first_name, u.last_name as user_last_name
       FROM bookings b 
       JOIN tours t ON b.tour_id = t.id 
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllBookings = getAllBookings;
const createBooking = async (req, res) => {
    try {
        const { tourId, bookingDate, participants } = req.body;
        // Get tour price
        const tourResult = await (0, db_1.query)('SELECT price FROM tours WHERE id = $1', [tourId]);
        if (tourResult.rows.length === 0) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        const totalPrice = tourResult.rows[0].price * participants;
        const result = await (0, db_1.query)(`INSERT INTO bookings (user_id, tour_id, booking_date, participants, total_price) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.user.id, tourId, bookingDate, participants, totalPrice]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createBooking = createBooking;
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await (0, db_1.query)('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateBookingStatus = updateBookingStatus;
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if booking belongs to user
        const checkResult = await (0, db_1.query)('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (checkResult.rows.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const result = await (0, db_1.query)("UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking cancelled successfully' });
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.cancelBooking = cancelBooking;

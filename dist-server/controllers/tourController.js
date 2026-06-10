"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTour = exports.updateTour = exports.createTour = exports.getTourById = exports.getAllTours = void 0;
const db_1 = require("../database/db");
const getAllTours = async (req, res) => {
    try {
        const result = await (0, db_1.query)('SELECT * FROM tours WHERE is_active = true ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Get tours error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllTours = getAllTours;
const getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('SELECT * FROM tours WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get tour error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTourById = getTourById;
const createTour = async (req, res) => {
    try {
        const { title, description, duration, price, imageUrl, maxParticipants, availableDates } = req.body;
        const result = await (0, db_1.query)(`INSERT INTO tours (title, description, duration, price, image_url, max_participants, available_dates) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [title, description, duration, price, imageUrl, maxParticipants, availableDates]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Create tour error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createTour = createTour;
const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, duration, price, imageUrl, maxParticipants, availableDates, isActive } = req.body;
        const result = await (0, db_1.query)(`UPDATE tours 
       SET title = $1, description = $2, duration = $3, price = $4, image_url = $5, 
           max_participants = $6, available_dates = $7, is_active = $8
       WHERE id = $9 RETURNING *`, [title, description, duration, price, imageUrl, maxParticipants, availableDates, isActive, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Update tour error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateTour = updateTour;
const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('DELETE FROM tours WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json({ message: 'Tour deleted successfully' });
    }
    catch (error) {
        console.error('Delete tour error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteTour = deleteTour;

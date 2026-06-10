"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlace = exports.updatePlace = exports.createPlace = exports.getPlaceById = exports.getAllPlaces = void 0;
const db_1 = require("../database/db");
const getAllPlaces = async (req, res) => {
    try {
        const result = await (0, db_1.query)('SELECT * FROM places ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Get places error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllPlaces = getAllPlaces;
const getPlaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('SELECT * FROM places WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get place error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPlaceById = getPlaceById;
const createPlace = async (req, res) => {
    try {
        const { name, description, history, latitude, longitude, category, imageUrl, audioUrl } = req.body;
        const result = await (0, db_1.query)(`INSERT INTO places (name, description, history, latitude, longitude, category, image_url, audio_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [name, description, history, latitude, longitude, category, imageUrl, audioUrl]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Create place error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createPlace = createPlace;
const updatePlace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, history, latitude, longitude, category, imageUrl, audioUrl } = req.body;
        const result = await (0, db_1.query)(`UPDATE places 
       SET name = $1, description = $2, history = $3, latitude = $4, longitude = $5, 
           category = $6, image_url = $7, audio_url = $8
       WHERE id = $9 RETURNING *`, [name, description, history, latitude, longitude, category, imageUrl, audioUrl, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Update place error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updatePlace = updatePlace;
const deletePlace = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('DELETE FROM places WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.json({ message: 'Place deleted successfully' });
    }
    catch (error) {
        console.error('Delete place error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deletePlace = deletePlace;

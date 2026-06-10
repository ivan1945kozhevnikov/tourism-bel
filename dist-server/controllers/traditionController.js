"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTradition = exports.updateTradition = exports.createTradition = exports.getTraditionById = exports.getAllTraditions = void 0;
const db_1 = require("../database/db");
const getAllTraditions = async (req, res) => {
    try {
        const result = await (0, db_1.query)('SELECT * FROM traditions ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Get traditions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllTraditions = getAllTraditions;
const getTraditionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('SELECT * FROM traditions WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tradition not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get tradition error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTraditionById = getTraditionById;
const createTradition = async (req, res) => {
    try {
        const { title, description, category, imageUrl } = req.body;
        const result = await (0, db_1.query)('INSERT INTO traditions (title, description, category, image_url) VALUES ($1, $2, $3, $4) RETURNING *', [title, description, category, imageUrl]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Create tradition error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createTradition = createTradition;
const updateTradition = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, imageUrl } = req.body;
        const result = await (0, db_1.query)('UPDATE traditions SET title = $1, description = $2, category = $3, image_url = $4 WHERE id = $5 RETURNING *', [title, description, category, imageUrl, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tradition not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Update tradition error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateTradition = updateTradition;
const deleteTradition = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('DELETE FROM traditions WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tradition not found' });
        }
        res.json({ message: 'Tradition deleted successfully' });
    }
    catch (error) {
        console.error('Delete tradition error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteTradition = deleteTradition;

import { Request, Response } from 'express';
import { query } from '../database/db';

export const getAllTraditions = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM traditions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get traditions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTraditionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM traditions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tradition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get tradition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTradition = async (req: Request, res: Response) => {
  try {
    const { title, description, category, imageUrl } = req.body;
    
    const result = await query(
      'INSERT INTO traditions (title, description, category, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, category, imageUrl]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create tradition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTradition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, imageUrl } = req.body;
    
    const result = await query(
      'UPDATE traditions SET title = $1, description = $2, category = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [title, description, category, imageUrl, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tradition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tradition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTradition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM traditions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tradition not found' });
    }
    
    res.json({ message: 'Tradition deleted successfully' });
  } catch (error) {
    console.error('Delete tradition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import { query } from '../database/db';

export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM foods ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFoodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM foods WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const { name, description, ingredients, recipe, category, imageUrl } = req.body;
    
    const result = await query(
      'INSERT INTO foods (name, description, ingredients, recipe, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, ingredients, recipe, category, imageUrl]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, ingredients, recipe, category, imageUrl } = req.body;
    
    const result = await query(
      'UPDATE foods SET name = $1, description = $2, ingredients = $3, recipe = $4, category = $5, image_url = $6 WHERE id = $7 RETURNING *',
      [name, description, ingredients, recipe, category, imageUrl, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM foods WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

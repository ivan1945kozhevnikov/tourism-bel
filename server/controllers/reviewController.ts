import { Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../database/db';

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTopReviews = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 6;
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT TOP ${limit} * FROM reviews 
        WHERE is_approved = 1 AND is_featured = 1 
        ORDER BY rating DESC, created_at DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Get top reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  const { user_name, user_email, rating, text } = req.body;

  if (!user_name || !rating || !text) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('user_name', sql.NVarChar, user_name)
      .input('user_email', sql.NVarChar, user_email || null)
      .input('rating', sql.Int, rating)
      .input('text', sql.NVarChar, text).query(`
        INSERT INTO reviews (user_name, user_email, rating, text, created_at, is_approved, is_featured) 
        VALUES (@user_name, @user_email, @rating, @text, GETDATE(), 0, 0)
      `);
    res.status(201).json({ message: 'Отзыв отправлен на модерацию' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_approved, is_featured } = req.body;

  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('is_approved', sql.Bit, is_approved)
      .input('is_featured', sql.Bit, is_featured).query(`
        UPDATE reviews 
        SET is_approved = @is_approved, is_featured = @is_featured 
        WHERE id = @id
      `);
    res.json({ message: 'Статус обновлен' });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM reviews WHERE id = @id');
    res.json({ message: 'Отзыв удален' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

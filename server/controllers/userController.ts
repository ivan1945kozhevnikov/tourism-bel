import { Request, Response } from 'express';
import { query } from '../database/db';

// Получить всех пользователей (только для админа)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Не возвращаем пароли
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_blocked, created_at, updated_at FROM users ORDER BY created_at DESC',
    );

    console.log(`Found ${result.rows.length} users`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Получить пользователя по ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_blocked, created_at, updated_at FROM users WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Обновить роль пользователя
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Проверяем допустимые роли
    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Проверяем, существует ли пользователь
    const checkResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Нельзя изменить роль последнего администратора
    if (checkResult.rows[0].role === 'admin') {
      const adminCount = await query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin'",
      );
      if (parseInt(adminCount.rows[0].count) === 1 && role !== 'admin') {
        return res
          .status(400)
          .json({ message: 'Cannot change role of the last admin' });
      }
    }

    const result = await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, first_name, last_name, role, is_blocked, created_at, updated_at',
      [role, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Заблокировать/разблокировать пользователя
export const toggleUserBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, существует ли пользователь
    const checkResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Нельзя заблокировать администратора
    if (checkResult.rows[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an admin user' });
    }

    const currentBlocked = checkResult.rows[0].is_blocked || false;
    const newBlocked = !currentBlocked;

    const result = await query(
      'UPDATE users SET is_blocked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, first_name, last_name, role, is_blocked, created_at, updated_at',
      [newBlocked, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle user block error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Удалить пользователя
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, существует ли пользователь
    const checkResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Нельзя удалить администратора
    if (checkResult.rows[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin user' });
    }

    // Удаляем связанные данные
    await query('DELETE FROM bookings WHERE user_id = $1', [id]);
    await query('DELETE FROM reviews WHERE user_id = $1', [id]);
    await query('DELETE FROM feedback WHERE user_id = $1', [id]);

    // Удаляем пользователя
    await query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Получить статистику по пользователям
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalResult = await query('SELECT COUNT(*) FROM users');
    const adminResult = await query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin'",
    );
    const blockedResult = await query(
      'SELECT COUNT(*) FROM users WHERE is_blocked = true',
    );
    const newTodayResult = await query(
      'SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE',
    );

    res.json({
      total: parseInt(totalResult.rows[0].count),
      admins: parseInt(adminResult.rows[0].count),
      blocked: parseInt(blockedResult.rows[0].count),
      newToday: parseInt(newTodayResult.rows[0].count),
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

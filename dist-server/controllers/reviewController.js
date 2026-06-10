'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteReview =
  exports.updateReviewStatus =
  exports.createReview =
  exports.getTopReviews =
  exports.getAllReviews =
    void 0;
const db_1 = require('../database/db');

// Получить все отзывы (только для админа)
const getAllReviews = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const result = yield (0, db_1.query)(
        'SELECT * FROM reviews ORDER BY created_at DESC',
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get all reviews error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
exports.getAllReviews = getAllReviews;

// Получить топ отзывы для главной
const getTopReviews = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 6;
    try {
      const result = yield (0, db_1.query)(
        `SELECT * FROM reviews 
             WHERE is_approved = true AND is_featured = true 
             ORDER BY rating DESC, created_at DESC 
             LIMIT $1`,
        [limit],
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get top reviews error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
exports.getTopReviews = getTopReviews;

// Создать новый отзыв (публичный)
const createReview = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { user_name, user_email, rating, text } = req.body;

    if (!user_name || !rating || !text) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
    }

    try {
      const result = yield (0, db_1.query)(
        `INSERT INTO reviews (user_name, user_email, rating, text, created_at, is_approved, is_featured) 
             VALUES ($1, $2, $3, $4, NOW(), false, false) 
             RETURNING id, user_name, rating, text, created_at`,
        [user_name, user_email || null, rating, text],
      );
      res.status(201).json({
        message: 'Отзыв отправлен на модерацию',
        review: result.rows[0],
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
exports.createReview = createReview;

// Обновить статус отзыва (только админ)
const updateReviewStatus = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { is_approved, is_featured } = req.body;

    try {
      yield (0, db_1.query)(
        `UPDATE reviews 
             SET is_approved = $1, is_featured = $2 
             WHERE id = $3`,
        [is_approved, is_featured, id],
      );
      res.json({ message: 'Статус обновлен' });
    } catch (error) {
      console.error('Update review status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
exports.updateReviewStatus = updateReviewStatus;

// Удалить отзыв (только админ)
const deleteReview = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
      yield (0, db_1.query)('DELETE FROM reviews WHERE id = $1', [id]);
      res.json({ message: 'Отзыв удален' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
exports.deleteReview = deleteReview;

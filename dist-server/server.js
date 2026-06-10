'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const dotenv_1 = __importDefault(require('dotenv'));
const path_1 = __importDefault(require('path'));
const db_1 = require('./database/db');
// Import routes
const auth_1 = __importDefault(require('./routes/auth'));
const places_1 = __importDefault(require('./routes/places'));
const tours_1 = __importDefault(require('./routes/tours'));
const bookings_1 = __importDefault(require('./routes/bookings'));
const traditions_1 = __importDefault(require('./routes/traditions'));
const foods_1 = __importDefault(require('./routes/foods'));
const reviews_1 = __importDefault(require('./routes/reviews')); // ДОБАВИТЬ

dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));

// Static files
app.use(
  '/uploads',
  express_1.default.static(path_1.default.join(__dirname, '../public/uploads')),
);

// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/places', places_1.default);
app.use('/api/tours', tours_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/traditions', traditions_1.default);
app.use('/api/foods', foods_1.default);
app.use('/api/reviews', reviews_1.default); // ДОБАВИТЬ

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await (0, db_1.initDB)();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
exports.default = app;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ========== JSON FILE HELPERS ==========
const DATA_PATH = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true });
}

const readJSON = (filename) => {
  const filePath = path.join(DATA_PATH, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeJSON = (filename, data) => {
  const filePath = path.join(DATA_PATH, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const getNextId = (items) => {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
};

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/*', (req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ========== AUTH ROUTES ==========
app.post(
  '/api/auth/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;
      const users = readJSON('users.json');

      if (users.find((u) => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: getNextId(users),
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        is_blocked: 0,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
        updated_at: null,
      };

      users.push(newUser);
      writeJSON('users.json', users);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' },
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.post(
  '/api/auth/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const users = readJSON('users.json');
      const user = users.find((u) => u.email === email);

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (user.is_blocked === 1) {
        return res
          .status(403)
          .json({ message: 'Account is blocked. Contact administrator.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' },
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const users = readJSON('users.json');
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== USERS ROUTES ==========
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = readJSON('users.json');
    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      is_blocked: u.is_blocked || 0,
      created_at: u.created_at,
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch(
  '/api/users/:id/role',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const users = readJSON('users.json');
      const userIndex = users.findIndex((u) => u.id === parseInt(id));

      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      users[userIndex].role = role;
      users[userIndex].updated_at = new Date()
        .toISOString()
        .replace('T', ' ')
        .slice(0, 23);
      writeJSON('users.json', users);

      res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.patch(
  '/api/users/:id/toggle-block',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const users = readJSON('users.json');
      const userIndex = users.findIndex((u) => u.id === parseInt(id));

      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (users[userIndex].role === 'admin') {
        return res.status(400).json({ message: 'Cannot block an admin user' });
      }

      users[userIndex].is_blocked = users[userIndex].is_blocked === 1 ? 0 : 1;
      users[userIndex].updated_at = new Date()
        .toISOString()
        .replace('T', ' ')
        .slice(0, 23);
      writeJSON('users.json', users);

      res.json({
        success: true,
        is_blocked: users[userIndex].is_blocked === 1,
      });
    } catch (error) {
      console.error('Toggle user block error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.delete(
  '/api/users/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let users = readJSON('users.json');
      const userIndex = users.findIndex((u) => u.id === parseInt(id));

      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (users[userIndex].role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete an admin user' });
      }

      users = users.filter((u) => u.id !== parseInt(id));
      writeJSON('users.json', users);

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.get(
  '/api/users/stats',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const users = readJSON('users.json');
      const total = users.length;
      const admins = users.filter((u) => u.role === 'admin').length;
      const blocked = users.filter((u) => u.is_blocked === 1).length;
      const today = new Date().toISOString().split('T')[0];
      const newToday = users.filter(
        (u) => u.created_at?.split(' ')[0] === today,
      ).length;

      res.json({ total, admins, blocked, newToday });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== PLACES ROUTES ==========
app.get('/api/places', async (req, res) => {
  try {
    const places = readJSON('places.json');
    res.json(
      places.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    );
  } catch (error) {
    console.error('Get places error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/places/:id', async (req, res) => {
  try {
    const places = readJSON('places.json');
    const place = places.find((p) => p.id === parseInt(req.params.id));
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.json(place);
  } catch (error) {
    console.error('Get place error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/places', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      history,
      latitude,
      longitude,
      category,
      image_url,
      audio_url,
    } = req.body;
    const places = readJSON('places.json');
    const newPlace = {
      id: getNextId(places),
      name,
      description: description || null,
      history: history || null,
      latitude,
      longitude,
      category: category || null,
      image_url: image_url || null,
      audio_url: audio_url || null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
    };
    places.push(newPlace);
    writeJSON('places.json', places);
    res.status(201).json(newPlace);
  } catch (error) {
    console.error('Create place error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(
  '/api/places/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        history,
        latitude,
        longitude,
        category,
        image_url,
        audio_url,
      } = req.body;
      const places = readJSON('places.json');
      const index = places.findIndex((p) => p.id === parseInt(id));

      if (index === -1) {
        return res.status(404).json({ message: 'Place not found' });
      }

      places[index] = {
        ...places[index],
        name,
        description,
        history,
        latitude,
        longitude,
        category,
        image_url,
        audio_url,
      };
      writeJSON('places.json', places);
      res.json(places[index]);
    } catch (error) {
      console.error('Update place error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.delete(
  '/api/places/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let places = readJSON('places.json');
      const place = places.find((p) => p.id === parseInt(id));
      if (!place) {
        return res.status(404).json({ message: 'Place not found' });
      }
      places = places.filter((p) => p.id !== parseInt(id));
      writeJSON('places.json', places);
      res.json({ message: 'Place deleted successfully' });
    } catch (error) {
      console.error('Delete place error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== TOURS ROUTES ==========
app.get('/api/tours', async (req, res) => {
  try {
    const tours = readJSON('tours.json');
    res.json(
      tours.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    );
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    const tours = readJSON('tours.json');
    const tour = tours.find((t) => t.id === parseInt(req.params.id));
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tours', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      price,
      image_url,
      max_participants,
      available_dates,
      is_active,
      route_points,
      included,
      not_included,
      schedule,
    } = req.body;
    const tours = readJSON('tours.json');
    const newTour = {
      id: getNextId(tours),
      title,
      description: description || null,
      duration: duration || null,
      price: price || 0,
      image_url: image_url || null,
      max_participants: max_participants || 10,
      available_dates: available_dates || null,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
      route_points: route_points || null,
      included: included || null,
      not_included: not_included || null,
      schedule: schedule || null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
    };
    tours.push(newTour);
    writeJSON('tours.json', tours);
    res.status(201).json(newTour);
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tours/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      duration,
      price,
      image_url,
      max_participants,
      available_dates,
      is_active,
      route_points,
      included,
      not_included,
      schedule,
    } = req.body;
    const tours = readJSON('tours.json');
    const index = tours.findIndex((t) => t.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    tours[index] = {
      ...tours[index],
      title,
      description,
      duration,
      price,
      image_url,
      max_participants,
      available_dates,
      is_active,
      route_points,
      included,
      not_included,
      schedule,
    };
    writeJSON('tours.json', tours);
    res.json(tours[index]);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete(
  '/api/tours/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let tours = readJSON('tours.json');
      const tour = tours.find((t) => t.id === parseInt(id));
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      tours = tours.filter((t) => t.id !== parseInt(id));
      writeJSON('tours.json', tours);
      res.json({ message: 'Tour deleted successfully' });
    } catch (error) {
      console.error('Delete tour error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== TRADITIONS ROUTES ==========
app.get('/api/traditions', async (req, res) => {
  try {
    const traditions = readJSON('traditions.json');
    res.json(
      traditions.sort(
        (a, b) => (a.celebration_month || 99) - (b.celebration_month || 99),
      ),
    );
  } catch (error) {
    console.error('Get traditions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/traditions/:id', async (req, res) => {
  try {
    const traditions = readJSON('traditions.json');
    const tradition = traditions.find((t) => t.id === parseInt(req.params.id));
    if (!tradition) {
      return res.status(404).json({ message: 'Tradition not found' });
    }
    res.json(tradition);
  } catch (error) {
    console.error('Get tradition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post(
  '/api/traditions',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        image_url,
        celebration_date,
        celebration_month,
        celebration_day,
      } = req.body;
      const traditions = readJSON('traditions.json');
      const newTradition = {
        id: getNextId(traditions),
        title,
        description: description || null,
        category: category || null,
        image_url: image_url || null,
        celebration_date: celebration_date || null,
        celebration_month: celebration_month
          ? parseInt(celebration_month)
          : null,
        celebration_day: celebration_day ? parseInt(celebration_day) : null,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
      };
      traditions.push(newTradition);
      writeJSON('traditions.json', traditions);
      res.status(201).json(newTradition);
    } catch (error) {
      console.error('Create tradition error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.put(
  '/api/traditions/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        category,
        image_url,
        celebration_date,
        celebration_month,
        celebration_day,
      } = req.body;
      const traditions = readJSON('traditions.json');
      const index = traditions.findIndex((t) => t.id === parseInt(id));

      if (index === -1) {
        return res.status(404).json({ message: 'Tradition not found' });
      }

      traditions[index] = {
        ...traditions[index],
        title,
        description,
        category,
        image_url,
        celebration_date,
        celebration_month,
        celebration_day,
      };
      writeJSON('traditions.json', traditions);
      res.json(traditions[index]);
    } catch (error) {
      console.error('Update tradition error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.delete(
  '/api/traditions/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let traditions = readJSON('traditions.json');
      const tradition = traditions.find((t) => t.id === parseInt(id));
      if (!tradition) {
        return res.status(404).json({ message: 'Tradition not found' });
      }
      traditions = traditions.filter((t) => t.id !== parseInt(id));
      writeJSON('traditions.json', traditions);
      res.json({ message: 'Tradition deleted successfully' });
    } catch (error) {
      console.error('Delete tradition error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== FOODS ROUTES ==========
app.get('/api/foods', async (req, res) => {
  try {
    const foods = readJSON('foods.json');
    res.json(
      foods.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    );
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/foods/:id', async (req, res) => {
  try {
    const foods = readJSON('foods.json');
    const food = foods.find((f) => f.id === parseInt(req.params.id));
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/foods', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, ingredients, recipe, category, image_url } =
      req.body;
    const foods = readJSON('foods.json');
    const newFood = {
      id: getNextId(foods),
      name,
      description: description || null,
      ingredients: ingredients || null,
      recipe: recipe || null,
      category: category || null,
      image_url: image_url || null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
    };
    foods.push(newFood);
    writeJSON('foods.json', foods);
    res.status(201).json(newFood);
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/foods/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ingredients, recipe, category, image_url } =
      req.body;
    const foods = readJSON('foods.json');
    const index = foods.findIndex((f) => f.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Food not found' });
    }

    foods[index] = {
      ...foods[index],
      name,
      description,
      ingredients,
      recipe,
      category,
      image_url,
    };
    writeJSON('foods.json', foods);
    res.json(foods[index]);
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete(
  '/api/foods/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let foods = readJSON('foods.json');
      const food = foods.find((f) => f.id === parseInt(id));
      if (!food) {
        return res.status(404).json({ message: 'Food not found' });
      }
      foods = foods.filter((f) => f.id !== parseInt(id));
      writeJSON('foods.json', foods);
      res.json({ message: 'Food deleted successfully' });
    } catch (error) {
      console.error('Delete food error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== LEGENDS ROUTES ==========
app.get('/api/legends', async (req, res) => {
  try {
    const legends = readJSON('legends.json');
    res.json(
      legends.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    );
  } catch (error) {
    console.error('Get legends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/legends/:id', async (req, res) => {
  try {
    const legends = readJSON('legends.json');
    const legend = legends.find((l) => l.id === parseInt(req.params.id));
    if (!legend) {
      return res.status(404).json({ message: 'Legend not found' });
    }
    res.json(legend);
  } catch (error) {
    console.error('Get legend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/legends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, origin, category, image_url, latitude, longitude } =
      req.body;
    const legends = readJSON('legends.json');
    const newLegend = {
      id: getNextId(legends),
      title,
      content: content || null,
      origin: origin || null,
      category: category || null,
      image_url: image_url || null,
      latitude: latitude || null,
      longitude: longitude || null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
    };
    legends.push(newLegend);
    writeJSON('legends.json', legends);
    res.status(201).json(newLegend);
  } catch (error) {
    console.error('Create legend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(
  '/api/legends/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        origin,
        category,
        image_url,
        latitude,
        longitude,
      } = req.body;
      const legends = readJSON('legends.json');
      const index = legends.findIndex((l) => l.id === parseInt(id));

      if (index === -1) {
        return res.status(404).json({ message: 'Legend not found' });
      }

      legends[index] = {
        ...legends[index],
        title,
        content,
        origin,
        category,
        image_url,
        latitude,
        longitude,
      };
      writeJSON('legends.json', legends);
      res.json(legends[index]);
    } catch (error) {
      console.error('Update legend error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.delete(
  '/api/legends/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let legends = readJSON('legends.json');
      const legend = legends.find((l) => l.id === parseInt(id));
      if (!legend) {
        return res.status(404).json({ message: 'Legend not found' });
      }
      legends = legends.filter((l) => l.id !== parseInt(id));
      writeJSON('legends.json', legends);
      res.json({ message: 'Legend deleted successfully' });
    } catch (error) {
      console.error('Delete legend error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== BOOKINGS ROUTES ==========
app.get('/api/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = readJSON('bookings.json');
    const tours = readJSON('tours.json');
    const users = readJSON('users.json');

    const enrichedBookings = bookings.map((booking) => ({
      ...booking,
      tour_title: tours.find((t) => t.id === booking.tour_id)?.title,
      tour_image: tours.find((t) => t.id === booking.tour_id)?.image_url,
      user_email: users.find((u) => u.id === booking.user_id)?.email,
      first_name: users.find((u) => u.id === booking.user_id)?.first_name,
      last_name: users.find((u) => u.id === booking.user_id)?.last_name,
    }));
    res.json(
      enrichedBookings.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      ),
    );
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/my', authenticateToken, async (req, res) => {
  try {
    const bookings = readJSON('bookings.json');
    const tours = readJSON('tours.json');
    const myBookings = bookings
      .filter((b) => b.user_id === req.user.id)
      .map((booking) => ({
        ...booking,
        tour_title: tours.find((t) => t.id === booking.tour_id)?.title,
        tour_image: tours.find((t) => t.id === booking.tour_id)?.image_url,
      }));
    res.json(
      myBookings.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      ),
    );
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { tour_id, booking_date, participants, departure_location } =
      req.body;
    const tours = readJSON('tours.json');
    const tour = tours.find((t) => t.id === tour_id);

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const bookings = readJSON('bookings.json');
    const total_price = tour.price * (participants || 1);

    const newBooking = {
      id: getNextId(bookings),
      user_id: req.user.id,
      tour_id: tour_id,
      booking_date: booking_date,
      participants: participants || 1,
      total_price: total_price,
      status: 'pending',
      departure_location: departure_location || null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
    };

    bookings.push(newBooking);
    writeJSON('bookings.json', bookings);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(
  '/api/bookings/:id/status',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const bookings = readJSON('bookings.json');
      const index = bookings.findIndex((b) => b.id === parseInt(id));

      if (index === -1) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      bookings[index].status = status;
      writeJSON('bookings.json', bookings);
      res.json(bookings[index]);
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let bookings = readJSON('bookings.json');
    const bookingIndex = bookings.findIndex((b) => b.id === parseInt(id));

    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      bookings[bookingIndex].user_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bookings[bookingIndex].status = 'cancelled';
    writeJSON('bookings.json', bookings);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== REVIEWS ROUTES ==========
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = readJSON('reviews.json');
    res.json(
      reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    );
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/reviews/top', async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  try {
    const reviews = readJSON('reviews.json');
    const topReviews = reviews
      .filter((r) => r.is_approved === 1 || r.is_approved === '1')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    res.json(topReviews);
  } catch (error) {
    console.error('Get top reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { user_name, user_email, rating, text } = req.body;

  if (!user_name || !rating || !text) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    const reviews = readJSON('reviews.json');
    const newReview = {
      id: getNextId(reviews),
      user_name,
      user_email: user_email || null,
      rating: parseInt(rating),
      text,
      is_approved: 0,
      is_featured: 0,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
    };
    reviews.push(newReview);
    writeJSON('reviews.json', reviews);
    res.status(201).json({ message: 'Отзыв отправлен на модерацию' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch(
  '/api/reviews/:id/status',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_approved, is_featured } = req.body;
      const reviews = readJSON('reviews.json');
      const index = reviews.findIndex((r) => r.id === parseInt(id));

      if (index === -1) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (is_approved !== undefined)
        reviews[index].is_approved = is_approved ? 1 : 0;
      if (is_featured !== undefined)
        reviews[index].is_featured = is_featured ? 1 : 0;
      writeJSON('reviews.json', reviews);
      res.json({ message: 'Статус обновлен' });
    } catch (error) {
      console.error('Update review status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

app.delete(
  '/api/reviews/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      let reviews = readJSON('reviews.json');
      const review = reviews.find((r) => r.id === parseInt(id));
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      reviews = reviews.filter((r) => r.id !== parseInt(id));
      writeJSON('reviews.json', reviews);
      res.json({ message: 'Отзыв удален' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== FEEDBACK ROUTES ==========
app.get('/api/feedback', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedback = readJSON('feedback.json');
    res.json(
      feedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    );
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { user_name, user_email, subject, message } = req.body;
    const feedback = readJSON('feedback.json');
    const newFeedback = {
      id: getNextId(feedback),
      user_id: null,
      user_name: user_name || null,
      user_email: user_email || null,
      subject,
      message,
      status: 'new',
      admin_response: null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
      responded_at: null,
    };
    feedback.push(newFeedback);
    writeJSON('feedback.json', feedback);
    res.status(201).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put(
  '/api/feedback/:id/respond',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const feedback = readJSON('feedback.json');
      const index = feedback.findIndex((f) => f.id === parseInt(id));

      if (index === -1) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      feedback[index].status = 'responded';
      feedback[index].admin_response = response;
      feedback[index].responded_at = new Date()
        .toISOString()
        .replace('T', ' ')
        .slice(0, 23);
      writeJSON('feedback.json', feedback);
      res.json({ message: 'Response sent successfully' });
    } catch (error) {
      console.error('Respond to feedback error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ========== STATIC FILES ==========
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ========== START SERVER ==========
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`=================================`);
    console.log(`📁 Data files: ${DATA_PATH}`);
    console.log(`=================================`);
  });
};

startServer();

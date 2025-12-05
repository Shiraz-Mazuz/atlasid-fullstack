
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.slice(7); 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}


app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});


app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await db('users').where({ email }).first();
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({
        name,
        email,
        password_hash: hash,
        role: 'user',
      })
      .returning(['id', 'name', 'email', 'role']);

    res.status(201).json(user);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const users = await db('users')
    .select('id', 'name', 'email', 'role', 'created_at', 'updated_at');
  res.json(users);
});


app.get('/api/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const user = await db('users')
    .select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
    .where({ id })
    .first();

  if (!user) return res.status(404).json({ message: 'User not found' });

  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(user);
});


app.post('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const existing = await db('users').where({ email }).first();
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const hash = await bcrypt.hash(password, 10);

  const [user] = await db('users')
    .insert({
      name,
      email,
      password_hash: hash,
      role,
    })
    .returning(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);

  res.status(201).json(user);
});


app.put('/api/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const { name, email, password, role } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 10);
  }

  const [user] = await db('users')
    .where({ id })
    .update(updateData)
    .returning(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json(user);
});


app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const deleted = await db('users').where({ id }).del();
  if (!deleted) return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'User deleted' });
});


initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB init failed:', err);
    process.exit(1);
  });

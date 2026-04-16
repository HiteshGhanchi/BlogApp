require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Import DB/Redis (just to trigger connections for now)
const db = require('./config/db');
require('./config/redis');

// Initialize Database
const seed = require('./config/seed');
db.initDb().then(() => {
  seed();
});

// Routes
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); 
app.use(express.json()); 
app.use(cookieParser());

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Health Route
app.get('/api/health', async (req, res) => {
  const isDbUp = await db.checkConnection();
  if (!isDbUp) {
    return res.status(503).json({ 
      status: 'Maintenance', 
      message: 'Database is currently unreachable.' 
    });
  }
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

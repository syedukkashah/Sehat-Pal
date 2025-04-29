const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const medicalRoutes = require('./routes/medical');
const chatRoutes = require('./routes/chat');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Sehat-Pal-ibrahim directory
app.use(express.static('Sehat-Pal-ibrahim'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Sehat-Pal-ibrahim/home.html');
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.error('Failed to connect to database. Server not started.');
  }
}

startServer();
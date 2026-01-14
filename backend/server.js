const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./config/mongodb');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API routes will be added here
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Relifo Backend API is running',
    database: 'relifo_testnet',
    storage: 'GridFS',
    phase: 0
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log('\n🚀 Relifo Backend Server Started');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🗄️  Database: relifo_testnet`);
      console.log(`📁 Storage: GridFS (for PDFs)`);
      console.log('\n✅ Phase 0 setup complete - Ready for development!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

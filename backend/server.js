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

// API routes
const campaignsRouter = require('./routes/campaigns');
const merchantsRouter = require('./routes/merchants');
const beneficiariesRouter = require('./routes/beneficiaries');
const transactionsRouter = require('./routes/transactions');
const applicationsRouter = require('./routes/applications');
const donationsRouter = require('./routes/donations');
const adminRouter = require('./routes/admin');
const ngoRouter = require('./routes/ngo');
const beneficiaryRouter = require('./routes/beneficiary');
const merchantRouter = require('./routes/merchant');

app.use('/api/campaigns', campaignsRouter);
app.use('/api/merchants', merchantsRouter);
app.use('/api/beneficiaries', beneficiariesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ngo', ngoRouter);
app.use('/api/beneficiary', beneficiaryRouter);
app.use('/api/merchant', merchantRouter);

// API test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Relifo Backend API is running',
    database: 'relifo_testnet',
    storage: 'GridFS',
    phase: 0,
    endpoints: {
      campaigns: 'GET /api/campaigns',
      merchants: 'GET /api/merchants',
      beneficiaries: 'GET /api/beneficiaries',
      transactions: 'GET /api/transactions'
    }
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
    const { db, gridFSBucket } = await connectToDatabase();
    
    // Store db connection and GridFS bucket in app.locals for routes to access
    app.locals.db = db;
    app.locals.gridFSBucket = gridFSBucket;
    
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

const express = require('express');
const router = express.Router();

/**
 * GET /api/merchants
 * Fetch all merchants, optionally filtered by category
 */
router.get('/', async (req, res) => {
  try {
    const { category, verified, limit = 50, skip = 0 } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = {};
    if (category) filter.category = category;
    if (verified !== undefined) filter.verified = verified === 'true';
    
    const merchants = await db.collection('merchants')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    const total = await db.collection('merchants').countDocuments(filter);
    
    res.json({
      merchants,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Failed to fetch merchants' });
  }
});

/**
 * GET /api/merchants/category/:category
 * Get merchants by category
 * Note: This route MUST come before /:id to avoid conflicts
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { verified } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { category };
    if (verified !== undefined) filter.verified = verified === 'true';
    
    const merchants = await db.collection('merchants')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ merchants });
  } catch (error) {
    console.error('Error fetching merchants by category:', error);
    res.status(500).json({ error: 'Failed to fetch merchants' });
  }
});

/**
 * GET /api/merchants/:id
 * Fetch single merchant
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const merchant = await db.collection('merchants').findOne({ 
      _id: require('mongodb').ObjectId.isValid(id) ? new require('mongodb').ObjectId(id) : id 
    });
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    res.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({ error: 'Failed to fetch merchant' });
  }
});

/**
 * POST /api/merchants
 * Register new merchant
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, address, walletAddress, email, phone } = req.body;
    
    if (!name || !category || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const merchant = {
      name,
      category,
      address,
      walletAddress,
      email,
      phone,
      verified: false,
      totalOrders: 0,
      totalRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('merchants').insertOne(merchant);
    
    res.status(201).json({
      id: result.insertedId,
      ...merchant
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ error: 'Failed to create merchant' });
  }
});

module.exports = router;

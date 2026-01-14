const express = require('express');
const router = express.Router();

/**
 * GET /api/campaigns
 * Fetch all campaigns from MongoDB
 * Query params: category, status, search, ngo, limit, skip
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, search, ngo, limit = 20, skip = 0 } = req.query;
    
    // Get MongoDB database
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const campaignsCollection = db.collection('campaigns');
    
    // Build query filter
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    if (ngo) filter.ngoWallet = ngo;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch campaigns
    const campaigns = await campaignsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    // Get total count
    const total = await campaignsCollection.countDocuments(filter);
    
    res.json({
      campaigns,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/campaigns/:id
 * Fetch single campaign by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const campaign = await db.collection('campaigns').findOne({ 
      _id: require('mongodb').ObjectId.isValid(id) ? new require('mongodb').ObjectId(id) : id 
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

/**
 * POST /api/campaigns
 * Create new campaign (NGO only)
 * Body: { title, description, category, targetAmount, ngoId, location, endDate }
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, category, targetAmount, ngoId, location, endDate } = req.body;
    
    if (!title || !description || !category || !targetAmount || !ngoId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const campaign = {
      title,
      description,
      category,
      targetAmount: parseFloat(targetAmount),
      raisedAmount: 0,
      donorCount: 0,
      ngoId,
      location,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(endDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('campaigns').insertOne(campaign);
    
    res.status(201).json({
      id: result.insertedId,
      ...campaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

module.exports = router;

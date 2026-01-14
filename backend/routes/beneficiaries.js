const express = require('express');
const router = express.Router();

/**
 * GET /api/beneficiaries
 * Fetch all beneficiaries or beneficiary applications for an NGO
 */
router.get('/', async (req, res) => {
  try {
    const { status, verified, ngo, limit = 50, skip = 0 } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // If ngo query param is provided, return beneficiary applications for NGO's campaigns
    if (ngo) {
      // First get all campaigns for this NGO
      const campaigns = await db.collection('campaigns')
        .find({ ngoWallet: ngo })
        .project({ _id: 1 })
        .toArray();
      
      const campaignIds = campaigns.map(c => c._id.toString());
      
      // Get beneficiary applications for these campaigns
      const applications = await db.collection('beneficiary_applications')
        .find({ campaignId: { $in: campaignIds } })
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.json({ applications });
    }
    
    const filter = {};
    if (status) filter.status = status;
    if (verified !== undefined) filter.verified = verified === 'true';
    
    const beneficiaries = await db.collection('beneficiaries')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    const total = await db.collection('beneficiaries').countDocuments(filter);
    
    res.json({
      beneficiaries,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiaries' });
  }
});

/**
 * GET /api/beneficiaries/:walletAddress
 * Fetch single beneficiary
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const beneficiary = await db.collection('beneficiaries').findOne({ 
      walletAddress: walletAddress.toLowerCase()
    });
    
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }
    
    res.json(beneficiary);
  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiary' });
  }
});

/**
 * POST /api/beneficiaries
 * Register new beneficiary
 */
router.post('/', async (req, res) => {
  try {
    const { 
      walletAddress, 
      name, 
      email, 
      phone, 
      location, 
      documentIds,
      needDescription 
    } = req.body;
    
    if (!walletAddress || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const beneficiary = {
      walletAddress: walletAddress.toLowerCase(),
      name,
      email,
      phone,
      location,
      documentIds: documentIds || [],
      needDescription,
      status: 'pending', // pending, approved, rejected
      verified: false,
      allocatedAmount: 0,
      spentAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('beneficiaries').insertOne(beneficiary);
    
    res.status(201).json({
      id: result.insertedId,
      ...beneficiary
    });
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    res.status(500).json({ error: 'Failed to create beneficiary' });
  }
});

/**
 * POST /api/beneficiaries/apply
 * Submit beneficiary application to a campaign
 */
router.post('/apply', async (req, res) => {
  try {
    const { 
      walletAddress, 
      campaignId, 
      campaignName,
      description,
      documents,
      status = 'pending',
      submittedAt
    } = req.body;
    
    if (!walletAddress || !campaignId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const application = {
      walletAddress: walletAddress.toLowerCase(),
      campaignId,
      campaignName,
      description,
      documents: documents || '',
      status,
      allocatedAmount: 0,
      submittedAt: submittedAt || new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('beneficiary_applications').insertOne(application);
    
    res.status(201).json({
      id: result.insertedId,
      ...application
    });
  } catch (error) {
    console.error('Error submitting beneficiary application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

/**
 * GET /api/beneficiaries/applications/:walletAddress
 * Get all beneficiary applications for a wallet
 */
router.get('/applications/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const applications = await db.collection('beneficiary_applications')
      .find({ walletAddress: walletAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * GET /api/beneficiaries/campaign/:campaignId
 * Get all beneficiary applications for a campaign
 */
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const applications = await db.collection('beneficiary_applications')
      .find({ campaignId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;

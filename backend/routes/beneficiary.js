const express = require('express');
const router = express.Router();

/**
 * POST /api/beneficiary/applications
 * Create a beneficiary application
 */
router.post('/applications', async (req, res) => {
  try {
    const { walletAddress, campaignId, campaignName, description, documents } = req.body;
    
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
      documents,
      status: 'pending',
      allocatedAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('beneficiary_applications').insertOne(application);
    
    res.status(201).json({
      id: result.insertedId,
      ...application
    });
  } catch (error) {
    console.error('Error creating beneficiary application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

/**
 * GET /api/beneficiary/applications
 * Get beneficiary applications for a wallet
 */
router.get('/applications', async (req, res) => {
  try {
    const { wallet } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = {};
    if (wallet) filter.walletAddress = wallet.toLowerCase();
    
    const applications = await db.collection('beneficiary_applications')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching beneficiary applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * GET /api/beneficiary/wallet
 * Get wallet info for a beneficiary
 */
router.get('/wallet', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Get total allocated from approved applications
    const applications = await db.collection('beneficiary_applications')
      .find({ 
        walletAddress: address.toLowerCase(), 
        status: 'approved' 
      })
      .toArray();
    
    const totalAllocated = applications.reduce((sum, app) => sum + (app.allocatedAmount || 0), 0);
    
    // Get total spent from transactions
    const transactions = await db.collection('transactions')
      .find({ 
        senderAddress: address,
        type: 'spending'
      })
      .toArray();
    
    const totalSpent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    res.json({
      wallet: {
        address,
        totalAllocated,
        totalSpent,
        availableBalance: totalAllocated - totalSpent,
        applicationCount: applications.length
      }
    });
  } catch (error) {
    console.error('Error fetching beneficiary wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet info' });
  }
});

/**
 * GET /api/beneficiary/transactions
 * Get transactions for a beneficiary
 */
router.get('/transactions', async (req, res) => {
  try {
    const { address, type, limit = 50 } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { 
      $or: [
        { senderAddress: address },
        { recipientAddress: address }
      ]
    };
    if (type) filter.type = type;
    
    const transactions = await db.collection('transactions')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching beneficiary transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/beneficiary/spend
 * Process beneficiary spending
 */
router.post('/spend', async (req, res) => {
  try {
    const { walletAddress, merchantId, amount, category, items } = req.body;
    
    if (!walletAddress || !merchantId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Create transaction record
    const transaction = {
      type: 'spending',
      senderAddress: walletAddress,
      recipientAddress: merchantId,
      amount,
      category,
      items,
      status: 'pending',
      timestamp: new Date().toISOString(),
      createdAt: new Date()
    };
    
    const result = await db.collection('transactions').insertOne(transaction);
    
    res.status(201).json({
      id: result.insertedId,
      ...transaction
    });
  } catch (error) {
    console.error('Error processing spending:', error);
    res.status(500).json({ error: 'Failed to process spending' });
  }
});

/**
 * GET /api/beneficiary/category-limits
 * Get spending category limits for a beneficiary
 */
router.get('/category-limits', async (req, res) => {
  try {
    const { address } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Get beneficiary's category limits (default if not set)
    const beneficiary = await db.collection('beneficiaries')
      .findOne({ walletAddress: address?.toLowerCase() });
    
    const defaultLimits = {
      food: { limit: 500, spent: 0 },
      medical: { limit: 300, spent: 0 },
      education: { limit: 200, spent: 0 },
      shelter: { limit: 400, spent: 0 },
      other: { limit: 100, spent: 0 }
    };
    
    res.json({ 
      categoryLimits: beneficiary?.categoryLimits || defaultLimits 
    });
  } catch (error) {
    console.error('Error fetching category limits:', error);
    res.status(500).json({ error: 'Failed to fetch category limits' });
  }
});

/**
 * GET /api/beneficiary/spending-requests
 * Get pending spending requests
 */
router.get('/spending-requests', async (req, res) => {
  try {
    const { address } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { type: 'spending_request' };
    if (address) filter.walletAddress = address.toLowerCase();
    
    const requests = await db.collection('spending_requests')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching spending requests:', error);
    res.status(500).json({ error: 'Failed to fetch spending requests' });
  }
});

/**
 * POST /api/beneficiary/request-spending
 * Request spending approval
 */
router.post('/request-spending', async (req, res) => {
  try {
    const { walletAddress, amount, category, reason, merchantId } = req.body;
    
    if (!walletAddress || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const request = {
      type: 'spending_request',
      walletAddress: walletAddress.toLowerCase(),
      amount,
      category,
      reason,
      merchantId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('spending_requests').insertOne(request);
    
    res.status(201).json({
      id: result.insertedId,
      ...request
    });
  } catch (error) {
    console.error('Error creating spending request:', error);
    res.status(500).json({ error: 'Failed to create spending request' });
  }
});

/**
 * POST /api/beneficiary/moneygram-cashout
 * Process MoneyGram cashout request
 */
router.post('/moneygram-cashout', async (req, res) => {
  try {
    const { walletAddress, amount, recipientDetails } = req.body;
    
    if (!walletAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const cashout = {
      type: 'moneygram_cashout',
      walletAddress: walletAddress.toLowerCase(),
      amount,
      recipientDetails,
      status: 'pending',
      referenceCode: `MG${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('cashouts').insertOne(cashout);
    
    res.status(201).json({
      id: result.insertedId,
      referenceCode: cashout.referenceCode,
      ...cashout
    });
  } catch (error) {
    console.error('Error creating cashout request:', error);
    res.status(500).json({ error: 'Failed to create cashout request' });
  }
});

module.exports = router;

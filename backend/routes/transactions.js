const express = require('express');
const router = express.Router();

/**
 * GET /api/transactions
 * Fetch all transactions (donations, payments, allocations)
 */
router.get('/', async (req, res) => {
  try {
    const { type, walletAddress, campaignId, limit = 50, skip = 0 } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = {};
    if (type) filter.type = type; // 'donation', 'allocation', 'spending'
    if (walletAddress) filter.$or = [
      { senderAddress: walletAddress },
      { recipientAddress: walletAddress }
    ];
    if (campaignId) filter.campaignId = campaignId;
    
    const transactions = await db.collection('transactions')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    const total = await db.collection('transactions').countDocuments(filter);
    
    res.json({
      transactions,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/:txHash
 * Fetch single transaction by hash
 */
router.get('/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const transaction = await db.collection('transactions').findOne({ txHash });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * POST /api/transactions
 * Record new transaction (for logging purposes)
 */
router.post('/', async (req, res) => {
  try {
    const { 
      type, 
      txHash, 
      senderAddress, 
      recipientAddress,
      amount,
      campaignId,
      description,
      blockNumber,
      blockTime
    } = req.body;
    
    if (!type || !txHash || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const transaction = {
      type,
      txHash,
      senderAddress: senderAddress?.toLowerCase(),
      recipientAddress: recipientAddress?.toLowerCase(),
      amount: parseFloat(amount),
      campaignId,
      description,
      blockNumber,
      blockTime: new Date(blockTime || Date.now()),
      status: 'confirmed',
      timestamp: new Date(),
      createdAt: new Date()
    };
    
    const result = await db.collection('transactions').insertOne(transaction);
    
    res.status(201).json({
      id: result.insertedId,
      ...transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

/**
 * GET /api/transactions/wallet/:walletAddress
 * Get all transactions for a specific wallet
 */
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = {
      $or: [
        { senderAddress: walletAddress.toLowerCase() },
        { recipientAddress: walletAddress.toLowerCase() }
      ]
    };
    
    const transactions = await db.collection('transactions')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    const total = await db.collection('transactions').countDocuments(filter);
    
    res.json({
      transactions,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

/**
 * GET /api/donations
 * Fetch donations for a wallet
 */
router.get('/', async (req, res) => {
  try {
    const { wallet, campaignId, status, limit = 50, skip = 0 } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { type: 'donation' };
    if (wallet) filter.senderAddress = wallet;
    if (campaignId) filter.campaignId = campaignId;
    if (status) filter.status = status;
    
    const donations = await db.collection('donations')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    const total = await db.collection('donations').countDocuments(filter);
    
    res.json({
      donations,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

/**
 * GET /api/donations/:id
 * Fetch single donation
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const donation = await db.collection('donations').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    res.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

/**
 * POST /api/donations
 * Create new donation record
 */
router.post('/', async (req, res) => {
  try {
    const { 
      campaignId,
      campaignTitle,
      ngoName,
      senderAddress,
      amount,
      isAnonymous = false,
      message
    } = req.body;
    
    if (!campaignId || !senderAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const donation = {
      type: 'donation',
      campaignId,
      campaignTitle,
      ngoName,
      senderAddress,
      amount: parseFloat(amount),
      isAnonymous,
      message,
      status: 'pending',
      txHash: null,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('donations').insertOne(donation);
    
    res.status(201).json({
      id: result.insertedId,
      ...donation
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

/**
 * PATCH /api/donations/:id/confirm
 * Confirm donation after blockchain transaction
 */
router.patch('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash, status = 'completed' } = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('donations').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          txHash,
          status,
          confirmedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    // Update campaign raised amount
    const donation = await db.collection('donations').findOne({ _id: new ObjectId(id) });
    if (donation && status === 'completed') {
      await db.collection('campaigns').updateOne(
        { _id: new ObjectId(donation.campaignId) },
        { 
          $inc: { raisedAmount: donation.amount, donorCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    res.json({ 
      success: true,
      message: 'Donation confirmed',
      txHash
    });
  } catch (error) {
    console.error('Error confirming donation:', error);
    res.status(500).json({ error: 'Failed to confirm donation' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

/**
 * GET /api/merchant/orders
 * Get orders for a merchant
 */
router.get('/orders', async (req, res) => {
  try {
    const { address, status, limit = 50 } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { merchantAddress: address };
    if (status) filter.status = status;
    
    const orders = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching merchant orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/merchant/orders/:orderId
 * Get a specific order
 */
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const order = await db.collection('orders').findOne({ 
      _id: new ObjectId(orderId) 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * POST /api/merchant/complete-order
 * Complete an order
 */
router.post('/complete-order', async (req, res) => {
  try {
    const { orderId, fulfillmentDetails } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status: 'completed',
          fulfillmentDetails,
          completedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order completed' });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

/**
 * GET /api/merchant/payments
 * Get payment history for a merchant
 */
router.get('/payments', async (req, res) => {
  try {
    const { address, limit = 50 } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const payments = await db.collection('transactions')
      .find({ 
        recipientAddress: address,
        type: 'spending'
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching merchant payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * POST /api/merchant/register
 * Register a new merchant
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      walletAddress, 
      name, 
      email, 
      phone,
      businessName,
      businessType,
      category,
      location,
      description
    } = req.body;
    
    if (!walletAddress || !name || !businessName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const merchant = {
      walletAddress: walletAddress.toLowerCase(),
      name,
      email,
      phone,
      businessName,
      businessType,
      category,
      location,
      description,
      verified: false,
      status: 'pending',
      totalEarnings: 0,
      orderCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('merchants').insertOne(merchant);
    
    res.status(201).json({
      id: result.insertedId,
      ...merchant
    });
  } catch (error) {
    console.error('Error registering merchant:', error);
    res.status(500).json({ error: 'Failed to register merchant' });
  }
});

module.exports = router;

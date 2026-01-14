const express = require('express');
const router = express.Router();

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }
    
    // Get counts
    const [
      totalCampaigns,
      activeCampaigns,
      totalDonations,
      totalBeneficiaries,
      totalMerchants,
      pendingApplications
    ] = await Promise.all([
      db.collection('campaigns').countDocuments(),
      db.collection('campaigns').countDocuments({ status: 'active' }),
      db.collection('donations').countDocuments({ status: 'completed' }),
      db.collection('beneficiaries').countDocuments({ status: 'approved' }),
      db.collection('merchants').countDocuments({ verified: true }),
      db.collection('applications').countDocuments({ status: 'pending' })
    ]);
    
    // Get total amounts
    const donationStats = await db.collection('donations').aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const totalDonated = donationStats[0]?.total || 0;
    
    res.json({
      totalDonations: totalDonated,
      totalDonors: 0,
      totalCampaigns,
      activeCampaigns,
      totalNGOs: pendingApplications,
      verifiedNGOs: 0,
      totalBeneficiaries,
      approvedBeneficiaries: totalBeneficiaries,
      totalMerchants,
      activeMerchants: totalMerchants,
      totalTransactions: totalDonations,
      platformFees: 0,
      avgDonationAmount: totalDonations > 0 ? totalDonated / totalDonations : 0,
      donationTrend: [],
      topCampaigns: [],
      recentActivity: []
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/admin/ngos
 * Get NGO list for admin verification
 */
router.get('/ngos', async (req, res) => {
  try {
    const { status } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { role: 'ngo' };
    if (status && status !== 'all') filter.status = status;
    
    const ngos = await db.collection('applications')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ ngos });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({ error: 'Failed to fetch NGOs' });
  }
});

/**
 * PATCH /api/admin/ngos/:ngoId/verify
 * Verify an NGO
 */
router.patch('/ngos/:ngoId/verify', async (req, res) => {
  try {
    const { ngoId } = req.params;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(ngoId) },
      { 
        $set: { 
          status: 'approved',
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'NGO not found' });
    }
    
    res.json({ success: true, message: 'NGO verified successfully' });
  } catch (error) {
    console.error('Error verifying NGO:', error);
    res.status(500).json({ error: 'Failed to verify NGO' });
  }
});

/**
 * PATCH /api/admin/ngos/:ngoId/reject
 * Reject an NGO
 */
router.patch('/ngos/:ngoId/reject', async (req, res) => {
  try {
    const { ngoId } = req.params;
    const { reason } = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(ngoId) },
      { 
        $set: { 
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'NGO not found' });
    }
    
    res.json({ success: true, message: 'NGO rejected' });
  } catch (error) {
    console.error('Error rejecting NGO:', error);
    res.status(500).json({ error: 'Failed to reject NGO' });
  }
});

/**
 * GET /api/admin/merchants
 * Get merchants for admin management
 */
router.get('/merchants', async (req, res) => {
  try {
    const { status, verified, category } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = {};
    if (status) filter.status = status;
    if (verified !== undefined) filter.verified = verified === 'true';
    if (category) filter.category = category;
    
    const merchants = await db.collection('merchants')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ merchants });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Failed to fetch merchants' });
  }
});

/**
 * PATCH /api/admin/merchants/:merchantId/verify
 * Verify a merchant
 */
router.patch('/merchants/:merchantId/verify', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('merchants').updateOne(
      { _id: new ObjectId(merchantId) },
      { 
        $set: { 
          verified: true,
          status: 'approved',
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    res.json({ success: true, message: 'Merchant verified successfully' });
  } catch (error) {
    console.error('Error verifying merchant:', error);
    res.status(500).json({ error: 'Failed to verify merchant' });
  }
});

/**
 * PATCH /api/admin/merchants/:merchantId/suspend
 * Suspend a merchant
 */
router.patch('/merchants/:merchantId/suspend', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { reason } = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('merchants').updateOne(
      { _id: new ObjectId(merchantId) },
      { 
        $set: { 
          verified: false,
          status: 'suspended',
          suspensionReason: reason,
          suspendedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    res.json({ success: true, message: 'Merchant suspended' });
  } catch (error) {
    console.error('Error suspending merchant:', error);
    res.status(500).json({ error: 'Failed to suspend merchant' });
  }
});

/**
 * GET /api/admin/settings
 * Get admin settings
 */
router.get('/settings', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const settings = await db.collection('settings').findOne({ type: 'admin' }) || {
      maintenanceMode: false,
      allowNewRegistrations: true,
      defaultDonationFee: 0,
      minDonationAmount: 1,
      maxDonationAmount: 100000
    };
    
    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * POST /api/admin/settings
 * Update admin settings
 */
router.post('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    await db.collection('settings').updateOne(
      { type: 'admin' },
      { 
        $set: { 
          ...settings,
          type: 'admin',
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;

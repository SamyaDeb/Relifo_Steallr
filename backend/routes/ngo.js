const express = require('express');
const router = express.Router();

/**
 * POST /api/ngo/register
 * Register a new NGO
 */
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, name, email, phone, organization, description, documents } = req.body;
    
    if (!walletAddress || !name || !organization) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const application = {
      walletAddress: walletAddress.toLowerCase(),
      name,
      email,
      phone,
      organization,
      description,
      documents,
      role: 'ngo',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('applications').insertOne(application);
    
    res.status(201).json({
      id: result.insertedId,
      ...application
    });
  } catch (error) {
    console.error('Error registering NGO:', error);
    res.status(500).json({ error: 'Failed to register NGO' });
  }
});

/**
 * GET /api/ngo/applications
 * Get beneficiary applications for NGO's campaigns
 */
router.get('/applications', async (req, res) => {
  try {
    const { ngoWallet, campaignId, status } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = {};
    if (campaignId) filter.campaignId = campaignId;
    if (status) filter.status = status;
    
    // If ngoWallet is provided, get campaigns for this NGO first
    if (ngoWallet) {
      const campaigns = await db.collection('campaigns')
        .find({ ngoWallet })
        .project({ _id: 1 })
        .toArray();
      
      const campaignIds = campaigns.map(c => c._id.toString());
      filter.campaignId = { $in: campaignIds };
    }
    
    const applications = await db.collection('beneficiary_applications')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching NGO applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * PATCH /api/ngo/applications/:applicationId/approve
 * Approve a beneficiary application
 */
router.patch('/applications/:applicationId/approve', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { allocatedAmount } = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('beneficiary_applications').updateOne(
      { _id: new ObjectId(applicationId) },
      { 
        $set: { 
          status: 'approved',
          allocatedAmount: allocatedAmount || 0,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ success: true, message: 'Application approved' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

/**
 * PATCH /api/ngo/applications/:applicationId/reject
 * Reject a beneficiary application
 */
router.patch('/applications/:applicationId/reject', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('beneficiary_applications').updateOne(
      { _id: new ObjectId(applicationId) },
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
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

/**
 * GET /api/ngo/beneficiaries
 * Get approved beneficiaries for an NGO
 */
router.get('/beneficiaries', async (req, res) => {
  try {
    const { ngoWallet, status = 'approved' } = req.query;
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const filter = { status };
    
    // If ngoWallet is provided, filter by NGO's campaigns
    if (ngoWallet) {
      const campaigns = await db.collection('campaigns')
        .find({ ngoWallet })
        .project({ _id: 1 })
        .toArray();
      
      const campaignIds = campaigns.map(c => c._id.toString());
      filter.campaignId = { $in: campaignIds };
    }
    
    const beneficiaries = await db.collection('beneficiary_applications')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ beneficiaries });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiaries' });
  }
});

/**
 * PATCH /api/ngo/beneficiaries/:beneficiaryId/allocate
 * Allocate funds to a beneficiary
 */
router.patch('/beneficiaries/:beneficiaryId/allocate', async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const { amount, notes } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('beneficiary_applications').updateOne(
      { _id: new ObjectId(beneficiaryId) },
      { 
        $inc: { allocatedAmount: amount },
        $set: { 
          updatedAt: new Date()
        },
        $push: {
          allocationHistory: {
            amount,
            notes,
            allocatedAt: new Date().toISOString()
          }
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }
    
    res.json({ success: true, message: 'Funds allocated successfully' });
  } catch (error) {
    console.error('Error allocating funds:', error);
    res.status(500).json({ error: 'Failed to allocate funds' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// In-memory storage for applications (would be MongoDB in production)
let applications = [];

// Get all applications
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (db) {
      const dbApplications = await db.collection('applications').find({}).toArray();
      return res.json({ applications: dbApplications });
    }
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.json({ applications });
  }
});

// Get application by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const db = req.app.locals.db;
    
    if (db) {
      const application = await db.collection('applications').findOne({ walletAddress });
      if (application) {
        return res.json(application);
      }
    }
    
    // Check in-memory
    const app = applications.find(a => a.walletAddress === walletAddress);
    if (app) {
      return res.json(app);
    }
    
    res.status(404).json({ error: 'Application not found' });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Create new application
router.post('/', async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      id: req.body.walletAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = req.app.locals.db;
    if (db) {
      await db.collection('applications').insertOne(applicationData);
    }
    
    // Also store in memory
    applications.push(applicationData);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: applicationData,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Update application status (approve/reject)
router.patch('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { status, reason } = req.body;

    const db = req.app.locals.db;
    if (db) {
      const result = await db.collection('applications').updateOne(
        { walletAddress },
        {
          $set: {
            status,
            reason: reason || null,
            updatedAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
          },
        }
      );

      if (result.modifiedCount > 0) {
        const updated = await db.collection('applications').findOne({ walletAddress });
        return res.json({
          success: true,
          message: `Application ${status}`,
          application: updated,
        });
      }
    }

    // Update in-memory
    const index = applications.findIndex(a => a.walletAddress === walletAddress);
    if (index !== -1) {
      applications[index] = {
        ...applications[index],
        status,
        reason: reason || null,
        updatedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };
      return res.json({
        success: true,
        message: `Application ${status}`,
        application: applications[index],
      });
    }

    res.status(404).json({ error: 'Application not found' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
router.delete('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const db = req.app.locals.db;
    if (db) {
      await db.collection('applications').deleteOne({ walletAddress });
    }

    applications = applications.filter(a => a.walletAddress !== walletAddress);
    
    res.json({
      success: true,
      message: 'Application deleted',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;

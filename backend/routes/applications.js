const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../db/db');
const { eventBus } = require('../motia/workflows');
const insightService = require('../services/insightService');

// No need for EventEmitter - using Motia event bus instead

// GET all applications
router.get('/', (req, res) => {
  try {
    const applications = getAllApplications();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET comprehensive insights
router.get('/insights', (req, res) => {
  try {
    const insights = insightService.getComprehensiveInsights();
    res.json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// GET single application by ID
router.get('/:id', (req, res) => {
  try {
    const application = getApplicationById(parseInt(req.params.id));
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// POST create new application
router.post('/', async (req, res) => {
  try {
    // Map request body to database schema
    const applicationData = {
      company: req.body.company,
      role: req.body.position || req.body.role, // Support both position and role
      status: req.body.status || 'Applied',
      source: req.body.source || 'Direct',
      resume_version: req.body.resume_version || '1.0',
      applied_at: req.body.applied_at || new Date().toISOString()
    };

    const newApplication = createApplication(applicationData);

    // Emit application_created event using Motia event bus
    await eventBus.emitEvent('applicationCreated', newApplication);
    console.log(`Event emitted: applicationCreated for ${newApplication.company}`);

    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PATCH update application status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const oldApplication = getApplicationById(id);

    if (!oldApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = updateApplicationStatus(id, req.body.status);

    // Emit statusUpdated event using Motia event bus
    await eventBus.emitEvent('statusUpdated', {
      applicationId: updatedApplication.id,
      oldStatus: oldApplication.status,
      newStatus: req.body.status
    });
    console.log(`Event emitted: statusUpdated for application ${updatedApplication.id} from ${oldApplication.status} to ${req.body.status}`);

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// PUT update application
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existingApplication = getApplicationById(id);

    if (!existingApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Map request body to database schema
    const applicationData = {
      company: req.body.company || existingApplication.company,
      role: req.body.position || req.body.role || existingApplication.role,
      status: req.body.status || existingApplication.status,
      source: req.body.source || existingApplication.source,
      resume_version: req.body.resume_version || existingApplication.resume_version,
      applied_at: req.body.applied_at || existingApplication.applied_at
    };

    const updatedApplication = updateApplication(id, applicationData);
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE application
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existingApplication = getApplicationById(id);

    if (!existingApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const success = deleteApplication(id);

    if (success) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Application not found' });
    }
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
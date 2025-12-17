/**
 * Motia Workflow Functions
 * Simple async functions that handle application lifecycle events
 * No external dependencies, no class constructors
 */

const Database = require('better-sqlite3');
const path = require('path');
const emailService = require('../services/emailService');
const eventBus = require('./eventBus');

// Database connection for workflows
const dbPath = path.join(__dirname, '../db/applications.db');
const db = new Database(dbPath);

// Initialize event bus with workflows
eventBus.registerWorkflows({
  applicationCreated,
  statusUpdated,
  weeklySummary
});

console.log('✅ Motia workflows registered with event bus');

/**
 * Application Created Workflow
 * Triggered when a new job application is created
 * @param {Object} payload - Application data
 * @param {string} payload.company - Company name
 * @param {string} payload.role - Job role
 * @param {string} payload.status - Application status
 * @param {string} payload.source - Application source
 * @param {string} payload.resume_version - Resume version
 * @param {string} payload.applied_at - Application date
 * @returns {Promise<Object>} Workflow result
 */
async function applicationCreated(payload) {
  try {
    console.log('=== APPLICATION CREATED WORKFLOW ===');
    console.log(`📝 New application created at: ${new Date().toISOString()}`);
    console.log(`🏢 Company: ${payload.company}`);
    console.log(`👔 Role: ${payload.role}`);
    console.log(`📅 Applied: ${payload.applied_at}`);
    console.log(`🔖 Status: ${payload.status}`);
    console.log(`📄 Source: ${payload.source}`);
    console.log(`📄 Resume Version: ${payload.resume_version}`);
    console.log('===================================\n');

    return {
      workflow: 'applicationCreated',
      timestamp: new Date().toISOString(),
      applicationId: payload.id,
      success: true
    };
  } catch (error) {
    console.error('Error in applicationCreated workflow:', error);
    throw error;
  }
}

/**
 * Status Updated Workflow
 * Triggered when an application status changes
 * @param {Object} payload - Status update data
 * @param {number} payload.applicationId - Application ID
 * @param {string} payload.oldStatus - Previous status
 * @param {string} payload.newStatus - New status
 * @returns {Promise<Object>} Workflow result
 */
async function statusUpdated(payload) {
  try {
    console.log('=== STATUS UPDATED WORKFLOW ===');

    // Get application details from database
    const stmt = db.prepare('SELECT * FROM applications WHERE id = ?');
    const application = stmt.get(payload.applicationId);

    if (!application) {
      throw new Error(`Application with ID ${payload.applicationId} not found`);
    }

    const appliedDate = new Date(application.applied_at);
    const currentDate = new Date();
    const responseTimeDays = Math.floor((currentDate - appliedDate) / (1000 * 60 * 60 * 24));

    console.log(`🔄 Application ID: ${payload.applicationId}`);
    console.log(`🏢 Company: ${application.company}`);
    console.log(`👔 Role: ${application.role}`);
    console.log(`📅 Applied: ${application.applied_at}`);
    console.log(`⏱️  Response Time: ${responseTimeDays} days`);
    console.log(`🔖 Status Change: ${payload.oldStatus} → ${payload.newStatus}`);
    console.log('================================\n');

    return {
      workflow: 'statusUpdated',
      applicationId: payload.applicationId,
      oldStatus: payload.oldStatus,
      newStatus: payload.newStatus,
      responseTimeDays,
      company: application.company,
      role: application.role,
      success: true
    };
  } catch (error) {
    console.error('Error in statusUpdated workflow:', error);
    throw error;
  }
}

/**
 * Weekly Summary Workflow
 * Generates comprehensive statistics and insights
 * @param {Object} payload - Summary parameters
 * @param {string} [payload.toEmail] - Optional email recipient
 * @returns {Promise<Object>} Workflow result
 */
async function weeklySummary(payload) {
  try {
    console.log('=== WEEKLY SUMMARY WORKFLOW ===');
    console.log(`📊 Generating weekly summary at: ${new Date().toISOString()}`);

    // Generate comprehensive insights using the insight service
    const insightService = require('../services/insightService');
    const insights = insightService.getComprehensiveInsights();

    // Log the summary to console
    console.log('\n📋 Weekly Summary Report:');
    console.log(insights.comprehensiveSummary);
    console.log('===================================\n');

    // Send email if configured and recipient provided
    if (payload?.toEmail) {
      const emailResult = await emailService.sendWeeklySummaryEmail(payload.toEmail, insights);

      if (emailResult.success) {
        console.log(`📧 Weekly summary email sent successfully to ${payload.toEmail}`);
      } else if (emailResult.logged) {
        console.log('ℹ️ Email not configured, summary logged to console instead');
      } else {
        console.log(`⚠️ Failed to send email: ${emailResult.message}`);
      }

      return {
        workflow: 'weeklySummary',
        timestamp: new Date().toISOString(),
        insightsGenerated: true,
        emailSent: emailResult.success,
        emailResult: emailResult,
        success: true
      };
    }

    // If no email provided, just return the insights
    return {
      workflow: 'weeklySummary',
      timestamp: new Date().toISOString(),
      insights: insights,
      emailSent: false,
      message: 'Weekly summary generated (no email sent)',
      success: true
    };
  } catch (error) {
    console.error('Error in weeklySummary workflow:', error);
    throw error;
  }
}

// Export workflow functions for direct use if needed
module.exports = {
  applicationCreated,
  statusUpdated,
  weeklySummary,
  eventBus // Export event bus for external use
};
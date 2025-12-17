const nodemailer = require('nodemailer');
const insightService = require('./insightService');

// Email configuration - can be set via environment variables
const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  from: process.env.EMAIL_FROM || 'job-tracker@yourdomain.com'
};

/**
 * Check if email configuration is complete
 * @returns {boolean} True if email can be sent
 */
function isEmailConfigured() {
  return emailConfig.auth.user && emailConfig.auth.pass;
}

/**
 * Create nodemailer transporter
 * @returns {Object} Nodemailer transporter
 */
function createTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransporter({
    service: emailConfig.service,
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth
  });
}

/**
 * Send weekly summary email
 * @param {string} toEmail - Recipient email address
 * @param {Object} insights - Insights data
 * @returns {Promise<Object>} Result of email sending
 */
async function sendWeeklySummaryEmail(toEmail, insights) {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.log('📧 Email not configured. Logging weekly summary instead:');
      console.log(insights.comprehensiveSummary);
      return {
        success: false,
        message: 'Email not configured',
        logged: true
      };
    }

    // Create transporter
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Failed to create email transporter');
    }

    // Generate HTML email content
    const htmlContent = generateHtmlEmail(insights);

    // Send email
    const info = await transporter.sendMail({
      from: `"AI Job Tracker" <${emailConfig.from}>`,
      to: toEmail,
      subject: `📊 Your Weekly Job Application Summary - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
      text: insights.comprehensiveSummary.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    console.log(`📧 Weekly summary email sent to ${toEmail}`);
    console.log(`Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Weekly summary email sent successfully'
    };
  } catch (error) {
    console.error('Error sending weekly summary email:', error);
    return {
      success: false,
      message: 'Failed to send weekly summary email',
      error: error.message
    };
  }
}

/**
 * Generate HTML email content from insights
 * @param {Object} insights - Insights data
 * @returns {string} HTML email content
 */
function generateHtmlEmail(insights) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section-title { color: #4F46E5; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    .stats { background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; }
    .key-finding { background-color: #e0f7fa; padding: 10px; border-left: 4px solid #4F46E5; margin-bottom: 10px; }
    .recommendation { background-color: #fff3e0; padding: 10px; border-left: 4px solid #FF9800; margin-bottom: 10px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 AI Job Application Tracker</h1>
    <p>Your Weekly Summary - ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="content">
    <div class="section">
      <div class="section-title">🔍 Key Findings</div>
      ${insights.comprehensiveSummary.split('\n').map(line => {
        if (line.includes('**Key Findings**') || line.includes('**Recommendations**') || line.includes('**Detailed Analysis**')) {
          return `<div class="section-title">${line.replace(/\*\*/g, '')}</div>`;
        } else if (line.startsWith('✅') || line.startsWith('📄') || line.startsWith('⏱️')) {
          return `<div class="key-finding">${line}</div>`;
        } else if (line.startsWith('🚨') || line.startsWith('📝') || line.startsWith('⏰')) {
          return `<div class="recommendation">${line}</div>`;
        } else if (line.trim() === '') {
          return '<br>';
        } else {
          return `<p>${line}</p>`;
        }
      }).join('')}
    </div>

    <div class="section">
      <div class="section-title">📈 Statistics Overview</div>
      <div class="stats">
        <h3>Rejection Rates by Source</h3>
        <ul>
          ${insights.detailedInsights.rejectionRate.insights.map(insight =>
            `<li>${insight.source}: ${insight.rejectionRate} rejection rate (${insight.successRate} success)</li>`
          ).join('')}
        </ul>
      </div>

      <div class="stats">
        <h3>Resume Performance</h3>
        <ul>
          ${insights.detailedInsights.resumePerformance.versions.map(version =>
            `<li>Resume ${version.version}: ${version.successRate}% success</li>`
          ).join('')}
        </ul>
      </div>

      <div class="stats">
        <h3>Response Times</h3>
        <ul>
          ${Object.entries(insights.detailedInsights.responseTime.averages).map(([status, days]) =>
            `<li>${status}: ${days} days average</li>`
          ).join('')}
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated weekly summary from your AI Job Application Tracker.</p>
      <p>© ${new Date().getFullYear()} Job Tracker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate weekly summary and send email
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<Object>} Result of the operation
 */
async function sendWeeklySummary(toEmail) {
  try {
    // Generate comprehensive insights
    const insights = insightService.getComprehensiveInsights();

    // Send email or log if not configured
    return await sendWeeklySummaryEmail(toEmail, insights);
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return {
      success: false,
      message: 'Failed to generate weekly summary',
      error: error.message
    };
  }
}

/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
async function testEmailConfiguration() {
  try {
    if (!isEmailConfigured()) {
      return {
        success: false,
        message: 'Email not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.'
      };
    }

    const transporter = createTransporter();
    if (!transporter) {
      return {
        success: false,
        message: 'Failed to create email transporter'
      };
    }

    // Test connection
    await transporter.verify();
    return {
      success: true,
      message: 'Email configuration is valid and ready to use'
    };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return {
      success: false,
      message: 'Email configuration test failed',
      error: error.message
    };
  }
}

module.exports = {
  sendWeeklySummary,
  sendWeeklySummaryEmail,
  testEmailConfiguration,
  isEmailConfigured
};
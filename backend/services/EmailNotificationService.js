const nodemailer = require('nodemailer');

/**
 * Email Notification Service
 * Sends email alerts to caretakers about patient interventions
 */
class EmailNotificationService {
  constructor() {
    // Email configuration from environment variables
    this.caretakerEmail = process.env.CARETAKER_EMAIL || 'pranayrishi.nalem@gmail.com';
    this.fromEmail = process.env.EMAIL_FROM || 'memorymesh@notifications.com';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = process.env.SMTP_PORT || 587;
    this.smtpUser = process.env.SMTP_USER;
    this.smtpPass = process.env.SMTP_PASS;
    
    // Initialize email transporter if credentials are available
    if (this.smtpUser && this.smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: false, // true for 465, false for other ports
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass
        }
      });
      this.enabled = true;
      console.log('✅ Email Notification Service initialized');
      console.log(`   Caretaker: ${this.maskEmail(this.caretakerEmail)}`);
    } else {
      this.enabled = false;
      console.log('⚠️  Email Notification Service disabled - missing SMTP credentials');
      console.log('   Add SMTP_USER and SMTP_PASS to .env');
    }
    
    this.messageHistory = [];
  }

  /**
   * Send notification based on intervention level
   */
  async sendInterventionNotification(intervention, patientName = 'Margaret') {
    if (!this.enabled) {
      console.log('📧 Email disabled - would have sent:', this.formatSubject(intervention, patientName));
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const subject = this.formatSubject(intervention, patientName);
      const htmlBody = this.formatHtmlEmail(intervention, patientName);
      const textBody = this.formatTextEmail(intervention, patientName);
      
      const result = await this.transporter.sendMail({
        from: `"MemoryMesh Alert" <${this.fromEmail}>`,
        to: this.caretakerEmail,
        subject: subject,
        text: textBody,
        html: htmlBody
      });

      console.log(`✅ Email sent to caretaker: ${result.messageId}`);
      
      // Log to history
      this.messageHistory.push({
        timestamp: new Date().toISOString(),
        interventionId: intervention.id,
        level: intervention.level,
        messageId: result.messageId,
        status: 'sent'
      });

      return {
        success: true,
        messageId: result.messageId,
        status: 'sent'
      };
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format email subject line
   */
  formatSubject(intervention, patientName) {
    const level = intervention.level;
    const scenarios = intervention.scenarios || [];
    const scenarioType = scenarios[0]?.type || 'UNKNOWN';
    const scenarioDesc = this.getScenarioDescription(scenarioType);
    
    switch (level) {
      case 'emergency':
        return `🚨 URGENT: ${patientName} - ${scenarioDesc}`;
      case 'notify':
        return `⚠️ Alert: ${patientName} - ${scenarioDesc}`;
      case 'ai_only':
        return `✅ Update: ${patientName} - ${scenarioDesc}`;
      default:
        return `MemoryMesh Alert: ${patientName}`;
    }
  }

  /**
   * Format plain text email body
   */
  formatTextEmail(intervention, patientName) {
    const level = intervention.level;
    const scenarios = intervention.scenarios || [];
    const scenarioType = scenarios[0]?.type || 'UNKNOWN';
    const decision = intervention.decision || {};
    
    // Get scenario description
    const scenarioDesc = this.getScenarioDescription(scenarioType);
    
    // Format based on intervention level
    switch (level) {
      case 'emergency':
        return this.formatEmergencyMessage(patientName, scenarioDesc, decision);
      
      case 'notify':
        return this.formatNotifyMessage(patientName, scenarioDesc, decision);
      
      case 'ai_only':
        return this.formatAIOnlyMessage(patientName, scenarioDesc, decision);
      
      default:
        return `MemoryMesh Alert: ${patientName} - ${scenarioDesc}`;
    }
  }

  /**
   * Format HTML email body
   */
  formatHtmlEmail(intervention, patientName) {
    const level = intervention.level;
    const scenarios = intervention.scenarios || [];
    const scenarioType = scenarios[0]?.type || 'UNKNOWN';
    const decision = intervention.decision || {};
    const scenarioDesc = this.getScenarioDescription(scenarioType);
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    
    const colorMap = {
      emergency: '#dc2626',
      notify: '#f59e0b',
      ai_only: '#10b981'
    };
    const color = colorMap[level] || '#6b7280';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
    .alert-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${color}; border-radius: 4px; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🧠 MemoryMesh Alert</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${patientName} - ${scenarioDesc}</p>
    </div>
    <div class="content">
      ${this.getHtmlContent(level, patientName, scenarioDesc, decision)}
      <div class="alert-box">
        <p><strong>Time:</strong> ${time} on ${date}</p>
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Situation:</strong> ${scenarioDesc}</p>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated alert from MemoryMesh AI Care System</p>
      <p>Dashboard: <a href="http://localhost:3000">http://localhost:3000</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Get HTML content based on level
   */
  getHtmlContent(level, patientName, scenario, decision) {
    switch (level) {
      case 'emergency':
        return `
          <h2 style="color: #dc2626;">🚨 URGENT ACTION REQUIRED</h2>
          <p><strong>${patientName} needs immediate attention!</strong></p>
          <p>${decision.voice_message?.substring(0, 200) || 'Critical intervention in progress'}...</p>
          <a href="http://localhost:3000" class="button">View Dashboard</a>
          <p style="color: #dc2626; font-weight: bold;">⚠️ Please check on ${patientName} immediately.</p>`;
      
      case 'notify':
        return `
          <h2 style="color: #f59e0b;">⚠️ Notification</h2>
          <p>AI is handling the situation but wanted to keep you informed.</p>
          <p><strong>What AI did:</strong> ${this.summarizeActions(decision)}</p>
          <p>You may want to check in when convenient.</p>
          <a href="http://localhost:3000" class="button">View Dashboard</a>`;
      
      case 'ai_only':
        return `
          <h2 style="color: #10b981;">✅ AI Update</h2>
          <p><strong>AI has it covered! No action needed.</strong></p>
          <p><strong>What happened:</strong> ${this.summarizeActions(decision)}</p>
          <p>Status: Resolved independently</p>
          <a href="http://localhost:3000" class="button">View Dashboard</a>`;
      
      default:
        return `<p>Intervention occurred. Check dashboard for details.</p>`;
    }
  }

  /**
   * Format emergency-level message (text version)
   */
  formatEmergencyMessage(patientName, scenario, decision) {
    return `🚨 URGENT - MemoryMesh Alert

${patientName} needs immediate attention!

Situation: ${scenario}

AI Response: ${decision.voice_message?.substring(0, 100) || 'Intervention in progress'}...

⚠️ CARETAKER ACTION REQUIRED
Please check on ${patientName} immediately.

Time: ${new Date().toLocaleTimeString()}`;
  }

  /**
   * Format notify-level message
   */
  formatNotifyMessage(patientName, scenario, decision) {
    return `⚠️ MemoryMesh Alert

${patientName} - ${scenario}

AI is handling the situation but wanted to keep you informed.

What AI did: ${this.summarizeActions(decision)}

Status: Monitoring closely

You may want to check in when convenient.

Time: ${new Date().toLocaleTimeString()}`;
  }

  /**
   * Format AI-only message (optional, only sent if configured)
   */
  formatAIOnlyMessage(patientName, scenario, decision) {
    return `✅ MemoryMesh Update

${patientName} - ${scenario}

AI has it covered! No action needed.

What happened: ${this.summarizeActions(decision)}

Status: Resolved independently

Time: ${new Date().toLocaleTimeString()}`;
  }

  /**
   * Get human-readable scenario description
   */
  getScenarioDescription(scenarioType) {
    const descriptions = {
      'MEAL_CONFUSION': 'Confusion about recent meals',
      'STOVE_SAFETY': 'Stove safety concern detected',
      'WANDERING': 'Lost on main road - CRITICAL',
      'MEDICATION': 'Medication-related concern',
      'FALL': 'Fall detected',
      'AGITATION': 'Signs of agitation',
      'CONFUSION': 'General confusion'
    };
    
    return descriptions[scenarioType] || scenarioType.replace(/_/g, ' ').toLowerCase();
  }

  /**
   * Summarize AI actions taken
   */
  summarizeActions(decision) {
    if (!decision.actions || decision.actions.length === 0) {
      return 'Provided reassurance';
    }
    
    const actionSummaries = {
      'show meal evidence': 'Showed meal evidence',
      'show photos': 'Showed family photos',
      'play music': 'Played calming music',
      'turn off stove': 'Turned off stove',
      'redirect': 'Redirected to activity'
    };
    
    const actions = decision.actions.slice(0, 2).map(action => {
      const actionLower = action.toLowerCase();
      for (const [key, summary] of Object.entries(actionSummaries)) {
        if (actionLower.includes(key)) {
          return summary;
        }
      }
      return action;
    });
    
    return actions.join(', ');
  }

  /**
   * Mask email for privacy in logs
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***';
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2 ? user[0] + '***' + user[user.length - 1] : '***';
    return `${maskedUser}@${domain}`;
  }

  /**
   * Check if email should be sent based on intervention level
   */
  shouldSendEmail(interventionLevel) {
    // Always send for emergency and notify levels
    if (interventionLevel === 'emergency' || interventionLevel === 'notify') {
      return true;
    }
    
    // For AI-only, only send if explicitly configured
    return process.env.EMAIL_SEND_AI_ONLY === 'true';
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      caretakerEmail: this.enabled ? this.maskEmail(this.caretakerEmail) : null,
      emailsSent: this.messageHistory.length,
      lastEmail: this.messageHistory.length > 0 
        ? this.messageHistory[this.messageHistory.length - 1].timestamp 
        : null
    };
  }

  /**
   * Get message history
   */
  getHistory(limit = 20) {
    return this.messageHistory.slice(-limit);
  }

  /**
   * Send test email
   */
  async sendTestEmail() {
    if (!this.enabled) {
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"MemoryMesh Test" <${this.fromEmail}>`,
        to: this.caretakerEmail,
        subject: '✅ MemoryMesh Email Test',
        text: 'This is a test email from MemoryMesh. Email notifications are working correctly!\n\nYou will receive alerts when your loved one needs attention.',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ MemoryMesh Email Test</h1>
    </div>
    <div class="content">
      <p>This is a test email from MemoryMesh.</p>
      <p><strong>Email notifications are working correctly!</strong></p>
      <p>You will receive alerts when your loved one needs attention.</p>
      <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Dashboard: <a href="http://localhost:3000">http://localhost:3000</a></p>
    </div>
  </div>
</body>
</html>`
      });

      console.log(`✅ Test email sent: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailNotificationService;

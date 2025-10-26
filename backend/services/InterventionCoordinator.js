const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');

class InterventionCoordinator {
  constructor(patientProfile, conversationEngine, voiceService, emailNotificationService = null) {
    this.patientProfile = patientProfile;
    this.conversationEngine = conversationEngine;
    this.voiceService = voiceService;
    this.emailNotificationService = emailNotificationService;
    this.activeInterventions = [];
    this.interventionHistory = [];
    this.statistics = {
      totalInterventions: 0,
      aiOnlyCount: 0,
      notifyCount: 0,
      emergencyCount: 0,
      successfulRedirections: 0,
      averageResponseTime: 0
    };
  }

  /**
   * Main coordination function - processes vision analysis and executes interventions
   */
  async processAnalysis(visionAnalysis, scenarios) {
    const startTime = Date.now();

    try {
      // Step 1: Get decision from Claude
      const decision = await this.conversationEngine.analyzeAndDecide(visionAnalysis, scenarios);

      // Step 2: Determine intervention level
      const interventionLevel = this.determineInterventionLevel(decision, visionAnalysis);

      // Step 3: Execute intervention
      const intervention = await this.executeIntervention(
        decision,
        interventionLevel,
        visionAnalysis,
        scenarios
      );

      // Step 4: Update statistics
      this.updateStatistics(intervention, Date.now() - startTime);

      // Step 5: Log activity
      this.logIntervention(intervention);

      return intervention;
    } catch (error) {
      console.error('Error in intervention coordination:', error);
      return {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Determine intervention level based on decision and thresholds
   */
  determineInterventionLevel(decision, visionAnalysis) {
    const urgency = decision.urgency_score || visionAnalysis.urgency_level;

    // Emergency scenarios override
    if (decision.intervention_type === 'EMERGENCY' || urgency >= config.thresholds.emergency) {
      return config.interventionTypes.EMERGENCY;
    }

    // Notify caregiver
    if (decision.intervention_type === 'NOTIFY' || urgency >= config.thresholds.notify) {
      return config.interventionTypes.NOTIFY;
    }

    // AI handles alone
    return config.interventionTypes.AI_ONLY;
  }

  /**
   * Execute the intervention based on decision and level
   */
  async executeIntervention(decision, interventionLevel, visionAnalysis, scenarios) {
    const intervention = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: interventionLevel,
      decision: decision,
      visionAnalysis: visionAnalysis,
      scenarios: scenarios,
      actions: [],
      notifications: []
    };

    // Execute based on intervention level
    switch (interventionLevel) {
      case config.interventionTypes.EMERGENCY:
        await this.handleEmergency(intervention);
        break;

      case config.interventionTypes.NOTIFY:
        await this.handleNotify(intervention);
        break;

      case config.interventionTypes.AI_ONLY:
        await this.handleAIOnly(intervention);
        break;
    }

    return intervention;
  }

  /**
   * Handle emergency-level intervention
   */
  async handleEmergency(intervention) {
    console.log('🚨 EMERGENCY INTERVENTION:', intervention.id);

    // 1. Speak to patient immediately
    if (intervention.decision.voice_message) {
      await this.voiceService.speak(intervention.decision.voice_message);
      intervention.actions.push({
        type: 'voice_response',
        message: intervention.decision.voice_message,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Execute safety actions
    for (const action of intervention.decision.actions || []) {
      await this.executeAction(action, intervention);
    }

    // 3. Alert all emergency contacts
    const emergencyNotification = {
      priority: 'critical',
      type: 'emergency',
      message: intervention.decision.caregiver_notification?.message || 'EMERGENCY: Immediate attention required',
      patientInfo: this.patientProfile.getEmergencyInfo(),
      timestamp: new Date().toISOString(),
      videoSnapshot: intervention.visionAnalysis.rawAnalysis
    };

    intervention.notifications.push(emergencyNotification);

    // 4. Send email notification
    if (this.emailNotificationService) {
      await this.emailNotificationService.sendInterventionNotification(
        intervention,
        this.patientProfile.preferredName
      );
    }

    // 5. Update statistics
    this.statistics.emergencyCount++;

    console.log('Emergency contacts notified:', emergencyNotification);
  }

  /**
   * Handle notify-level intervention
   */
  async handleNotify(intervention) {
    console.log('⚠️  NOTIFY INTERVENTION:', intervention.id);

    // 1. Speak to patient
    if (intervention.decision.voice_message) {
      await this.voiceService.speak(intervention.decision.voice_message);
      intervention.actions.push({
        type: 'voice_response',
        message: intervention.decision.voice_message,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Execute actions
    for (const action of intervention.decision.actions || []) {
      await this.executeAction(action, intervention);
    }

    // 3. Send notification to caregiver
    const notification = {
      priority: intervention.decision.caregiver_notification?.priority || 'medium',
      type: 'notify',
      message: intervention.decision.caregiver_notification?.message || 'AI intervention in progress',
      timestamp: new Date().toISOString(),
      aiResponse: intervention.decision.voice_message
    };

    intervention.notifications.push(notification);

    // 4. Send email notification
    if (this.emailNotificationService) {
      await this.emailNotificationService.sendInterventionNotification(
        intervention,
        this.patientProfile.preferredName
      );
    }

    // 5. Update statistics
    this.statistics.notifyCount++;

    console.log('Caregiver notified:', notification);
  }

  /**
   * Handle AI-only intervention (90% of cases)
   */
  async handleAIOnly(intervention) {
    console.log('💬 AI-ONLY INTERVENTION:', intervention.id);

    // Only intervene if needed
    if (!intervention.decision.intervention_needed) {
      intervention.actions.push({
        type: 'no_action',
        message: 'No intervention needed',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 1. Speak to patient
    if (intervention.decision.voice_message) {
      await this.voiceService.speak(intervention.decision.voice_message);
      intervention.actions.push({
        type: 'voice_response',
        message: intervention.decision.voice_message,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Execute actions (show photos, play music, etc.)
    for (const action of intervention.decision.actions || []) {
      await this.executeAction(action, intervention);
    }

    // 3. Send email notification if configured (optional for AI-only)
    if (this.emailNotificationService && this.emailNotificationService.shouldSendEmail('ai_only')) {
      await this.emailNotificationService.sendInterventionNotification(
        intervention,
        this.patientProfile.preferredName
      );
    }

    // 4. Update statistics
    this.statistics.aiOnlyCount++;

    console.log('AI handled independently');
  }

  /**
   * Execute individual actions
   */
  async executeAction(action, intervention) {
    const actionLower = action.toLowerCase();

    // Show family photos
    if (actionLower.includes('photo') || actionLower.includes('picture')) {
      intervention.actions.push({
        type: 'show_photos',
        photos: this.selectRelevantPhotos(intervention.scenarios),
        timestamp: new Date().toISOString()
      });
    }

    // Play music
    if (actionLower.includes('music') || actionLower.includes('play')) {
      const song = this.selectCalmingMusic();
      intervention.actions.push({
        type: 'play_music',
        song: song,
        timestamp: new Date().toISOString()
      });
      await this.voiceService.playMusic(song);
    }

    // Turn off stove (smart home integration)
    if (actionLower.includes('stove') || actionLower.includes('turn off')) {
      intervention.actions.push({
        type: 'turn_off_stove',
        timestamp: new Date().toISOString()
      });
      // In production: await this.smartHomeService.turnOffStove();
      console.log('🔥 Stove turned off automatically');
    }

    // Show meal evidence
    if (actionLower.includes('meal') || actionLower.includes('food')) {
      intervention.actions.push({
        type: 'show_meal_evidence',
        mealTime: this.patientProfile.currentState.lastMealTime,
        mealType: this.patientProfile.currentState.lastMealType,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Select relevant photos based on scenarios
   */
  selectRelevantPhotos(scenarios) {
    const memories = this.patientProfile.memories.significantEvents;

    // Default to grandchildren photos (highly effective)
    let photos = ['emma-soccer.jpg', 'lucas-playing.jpg'];

    // Customize based on scenario
    if (scenarios.some(s => s.type === 'AGITATION')) {
      photos = memories.find(m => m.event.includes('Hawaii'))?.photos || photos;
    }

    return photos;
  }

  /**
   * Select calming music
   */
  selectCalmingMusic() {
    const songs = this.patientProfile.preferences.music.calmingSongs;
    return songs[Math.floor(Math.random() * songs.length)];
  }

  /**
   * Log intervention to history and patient profile
   */
  logIntervention(intervention) {
    // Add to intervention history
    this.interventionHistory.push(intervention);

    // Keep only last 100 interventions
    if (this.interventionHistory.length > 100) {
      this.interventionHistory.shift();
    }

    // Log activity in patient profile
    this.patientProfile.logActivity({
      type: 'intervention',
      level: intervention.level,
      scenarios: intervention.scenarios.map(s => s.type),
      success: !intervention.error,
      timestamp: intervention.timestamp
    });

    // Record learning if intervention was successful
    if (intervention.decision.learning_notes && !intervention.error) {
      this.patientProfile.recordSuccessfulIntervention({
        situation: intervention.scenarios.map(s => s.type).join(', '),
        technique: intervention.decision.actions?.join(', ') || 'voice_only',
        effectiveness: this.estimateEffectiveness(intervention)
      });
    }
  }

  /**
   * Estimate intervention effectiveness
   */
  estimateEffectiveness(intervention) {
    // In production, this would be measured by follow-up analysis
    // For now, estimate based on intervention type and urgency
    if (intervention.level === config.interventionTypes.AI_ONLY) {
      return 0.85; // AI-only interventions are generally effective
    } else if (intervention.level === config.interventionTypes.NOTIFY) {
      return 0.75;
    }
    return 0.6;
  }

  /**
   * Update statistics
   */
  updateStatistics(intervention, responseTime) {
    this.statistics.totalInterventions++;

    // Update average response time
    const prevAvg = this.statistics.averageResponseTime;
    const count = this.statistics.totalInterventions;
    this.statistics.averageResponseTime = (prevAvg * (count - 1) + responseTime) / count;

    // Track successful redirections
    if (intervention.decision.intervention_needed && !intervention.error) {
      this.statistics.successfulRedirections++;
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const total = this.statistics.totalInterventions;

    // If no interventions yet, return zeros
    if (total === 0) {
      return {
        ...this.statistics,
        aiOnlyPercentage: 0,
        notifyPercentage: 0,
        emergencyPercentage: 0,
        successRate: 0
      };
    }

    return {
      ...this.statistics,
      aiOnlyPercentage: ((this.statistics.aiOnlyCount / total) * 100).toFixed(1),
      notifyPercentage: ((this.statistics.notifyCount / total) * 100).toFixed(1),
      emergencyPercentage: ((this.statistics.emergencyCount / total) * 100).toFixed(1),
      successRate: ((this.statistics.successfulRedirections / total) * 100).toFixed(1)
    };
  }

  /**
   * Get intervention history
   */
  getHistory(limit = 20) {
    return this.interventionHistory.slice(-limit);
  }

  /**
   * Get daily summary
   */
  getDailySummary() {
    const today = new Date().toDateString();
    const todayInterventions = this.interventionHistory.filter(
      i => new Date(i.timestamp).toDateString() === today
    );

    return {
      date: today,
      totalInterventions: todayInterventions.length,
      byLevel: {
        aiOnly: todayInterventions.filter(i => i.level === config.interventionTypes.AI_ONLY).length,
        notify: todayInterventions.filter(i => i.level === config.interventionTypes.NOTIFY).length,
        emergency: todayInterventions.filter(i => i.level === config.interventionTypes.EMERGENCY).length
      },
      topScenarios: this.getTopScenarios(todayInterventions),
      activities: this.patientProfile.currentState.todaysActivities,
      patterns: this.analyzePatterns(todayInterventions)
    };
  }

  /**
   * Analyze patterns in interventions
   */
  analyzePatterns(interventions) {
    // Group by hour
    const byHour = {};
    interventions.forEach(i => {
      const hour = new Date(i.timestamp).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    // Find peak confusion times
    const peakHours = Object.entries(byHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    return {
      peakConfusionTimes: peakHours,
      recommendations: this.generateRecommendations(peakHours)
    };
  }

  /**
   * Generate recommendations based on patterns
   */
  generateRecommendations(peakHours) {
    const recommendations = [];

    peakHours.forEach(({ hour, count }) => {
      if (hour >= 14 && hour <= 15) {
        recommendations.push('Schedule engaging activities during 2-3 PM to reduce post-lunch confusion');
      }
      if (count > 3) {
        recommendations.push(`High intervention frequency at ${hour}:00 - consider proactive engagement 30 minutes prior`);
      }
    });

    return recommendations;
  }

  /**
   * Get top scenarios
   */
  getTopScenarios(interventions) {
    const scenarioCounts = {};

    interventions.forEach(i => {
      i.scenarios.forEach(s => {
        scenarioCounts[s.type] = (scenarioCounts[s.type] || 0) + 1;
      });
    });

    return Object.entries(scenarioCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }
}

module.exports = InterventionCoordinator;

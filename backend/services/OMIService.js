/**
 * OMI Dev Kit 2 Integration Service
 * Real-time conversation listening and transcription
 * Provides context for better Alzheimer's patient care
 */

const EventEmitter = require('events');

class OMIService extends EventEmitter {
  constructor() {
    super();
    this.enabled = process.env.OMI_ENABLED === 'true';
    this.webhookUrl = process.env.OMI_WEBHOOK_URL;
    this.conversationHistory = [];
    this.maxHistoryLength = 100;
    this.isListening = false;
    this.currentTranscript = '';

    // Context tracking
    this.patientContext = {
      recentTopics: [],
      emotionalState: null,
      confusionIndicators: [],
      mentionedPeople: [],
      mentionedPlaces: [],
      timeReferences: []
    };
  }

  /**
   * Start listening to OMI Dev Kit 2
   */
  async startListening() {
    if (!this.enabled) {
      console.log('ℹ️  OMI Dev Kit 2 not enabled. Set OMI_ENABLED=true in .env');
      return { success: false, reason: 'not_enabled' };
    }

    console.log('🎧 Starting OMI Dev Kit 2 listener...');
    this.isListening = true;

    // Emit listening started event
    this.emit('listening_started');

    return {
      success: true,
      listening: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Stop listening
   */
  async stopListening() {
    console.log('🔇 Stopping OMI Dev Kit 2 listener...');
    this.isListening = false;

    this.emit('listening_stopped');

    return {
      success: true,
      listening: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Process incoming transcript from OMI
   * Called via webhook when OMI transcribes speech
   */
  async processTranscript(transcriptData) {
    const { text, speaker, timestamp, confidence, segments } = transcriptData;

    console.log('📝 OMI Transcript:', text);

    // Add to conversation history
    const entry = {
      text,
      speaker: speaker || 'patient',
      timestamp: timestamp || new Date().toISOString(),
      confidence: confidence || 1.0,
      segments: segments || []
    };

    this.conversationHistory.push(entry);

    // Keep history manageable
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }

    // Update current transcript
    this.currentTranscript = text;

    // Analyze for context
    const analysis = this.analyzeTranscript(text);

    // Emit transcript event
    this.emit('transcript', {
      entry,
      analysis
    });

    return {
      success: true,
      analysis,
      entry
    };
  }

  /**
   * Analyze transcript for Alzheimer's-relevant context
   */
  analyzeTranscript(text) {
    const textLower = text.toLowerCase();
    const analysis = {
      confusionIndicators: [],
      emotionalIndicators: [],
      temporalReferences: [],
      peopleReferences: [],
      placeReferences: [],
      needsIndicators: [],
      concernLevel: 0
    };

    // Confusion indicators
    const confusionPhrases = [
      'where am i', 'who are you', 'what time is it', 'what day',
      'did i eat', 'have i taken', 'where is', 'i can\'t find',
      'i don\'t remember', 'i forgot', 'confused', 'lost'
    ];

    confusionPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        analysis.confusionIndicators.push(phrase);
        analysis.concernLevel += 0.2;
      }
    });

    // Emotional indicators
    const emotionalPhrases = {
      distressed: ['scared', 'worried', 'anxious', 'upset', 'frustrated'],
      calm: ['fine', 'good', 'okay', 'happy', 'peaceful'],
      agitated: ['angry', 'mad', 'irritated', 'annoyed']
    };

    Object.entries(emotionalPhrases).forEach(([emotion, phrases]) => {
      phrases.forEach(phrase => {
        if (textLower.includes(phrase)) {
          analysis.emotionalIndicators.push({ emotion, phrase });
          if (emotion === 'distressed' || emotion === 'agitated') {
            analysis.concernLevel += 0.3;
          }
        }
      });
    });

    // Temporal references
    const timeWords = ['yesterday', 'today', 'tomorrow', 'now', 'later', 'before', 'after', 'morning', 'afternoon', 'evening', 'night'];
    timeWords.forEach(word => {
      if (textLower.includes(word)) {
        analysis.temporalReferences.push(word);
      }
    });

    // People references (common names/relationships)
    const peopleWords = ['mom', 'dad', 'mother', 'father', 'husband', 'wife', 'son', 'daughter', 'grandma', 'grandpa', 'friend'];
    peopleWords.forEach(word => {
      if (textLower.includes(word)) {
        analysis.peopleReferences.push(word);
      }
    });

    // Needs/requests
    const needsPhrases = ['hungry', 'thirsty', 'tired', 'cold', 'hot', 'bathroom', 'help', 'need'];
    needsPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        analysis.needsIndicators.push(phrase);
        analysis.concernLevel += 0.1;
      }
    });

    // Update patient context
    this.updatePatientContext(analysis);

    // Cap concern level at 1.0
    analysis.concernLevel = Math.min(analysis.concernLevel, 1.0);

    return analysis;
  }

  /**
   * Update ongoing patient context based on conversation
   */
  updatePatientContext(analysis) {
    // Track recent topics
    if (analysis.confusionIndicators.length > 0) {
      this.patientContext.confusionIndicators.push(...analysis.confusionIndicators);
      // Keep last 20
      this.patientContext.confusionIndicators = this.patientContext.confusionIndicators.slice(-20);
    }

    // Update emotional state
    if (analysis.emotionalIndicators.length > 0) {
      const latestEmotion = analysis.emotionalIndicators[analysis.emotionalIndicators.length - 1];
      this.patientContext.emotionalState = latestEmotion.emotion;
    }

    // Track mentioned people
    if (analysis.peopleReferences.length > 0) {
      this.patientContext.mentionedPeople.push(...analysis.peopleReferences);
      this.patientContext.mentionedPeople = [...new Set(this.patientContext.mentionedPeople)].slice(-10);
    }

    // Track time references
    if (analysis.temporalReferences.length > 0) {
      this.patientContext.timeReferences.push(...analysis.temporalReferences);
      this.patientContext.timeReferences = this.patientContext.timeReferences.slice(-10);
    }
  }

  /**
   * Get enriched context for AI decision-making
   * This provides OMI-gathered context to enhance interventions
   */
  getEnrichedContext() {
    const recentConversation = this.conversationHistory.slice(-10);

    return {
      recentTranscripts: recentConversation.map(c => ({
        text: c.text,
        speaker: c.speaker,
        timestamp: c.timestamp
      })),
      currentTranscript: this.currentTranscript,
      patientContext: this.patientContext,
      conversationSummary: this.generateConversationSummary(),
      concernLevel: this.calculateOverallConcernLevel()
    };
  }

  /**
   * Generate summary of recent conversation
   */
  generateConversationSummary() {
    const recentCount = 10;
    const recent = this.conversationHistory.slice(-recentCount);

    if (recent.length === 0) {
      return 'No recent conversation';
    }

    const confusionCount = recent.filter(c =>
      this.analyzeTranscript(c.text).confusionIndicators.length > 0
    ).length;

    const emotionalStates = recent
      .map(c => this.analyzeTranscript(c.text).emotionalIndicators)
      .flat();

    return {
      messageCount: recent.length,
      confusionEpisodes: confusionCount,
      emotionalStates: emotionalStates,
      topics: this.patientContext.recentTopics.slice(-5)
    };
  }

  /**
   * Calculate overall concern level from conversation
   */
  calculateOverallConcernLevel() {
    if (this.conversationHistory.length === 0) {
      return 0;
    }

    const recentAnalyses = this.conversationHistory
      .slice(-5)
      .map(c => this.analyzeTranscript(c.text));

    const avgConcern = recentAnalyses.reduce((sum, a) => sum + a.concernLevel, 0) / recentAnalyses.length;

    return avgConcern;
  }

  /**
   * Get conversation history
   */
  getHistory(limit = 20) {
    return this.conversationHistory.slice(-limit);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    this.patientContext = {
      recentTopics: [],
      emotionalState: null,
      confusionIndicators: [],
      mentionedPeople: [],
      mentionedPlaces: [],
      timeReferences: []
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      listening: this.isListening,
      conversationCount: this.conversationHistory.length,
      currentTranscript: this.currentTranscript,
      emotionalState: this.patientContext.emotionalState,
      concernLevel: this.calculateOverallConcernLevel()
    };
  }

  /**
   * Simulate transcript (for testing without real OMI device)
   */
  async simulateTranscript(text, speaker = 'patient') {
    console.log('🎭 [SIMULATED OMI]:', text);

    return await this.processTranscript({
      text,
      speaker,
      timestamp: new Date().toISOString(),
      confidence: 1.0
    });
  }
}

module.exports = OMIService;

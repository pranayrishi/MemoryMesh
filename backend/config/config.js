require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

module.exports = {
  // API Keys
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  creaoApiUrl: process.env.CREAO_API_URL,
  fetchaiApiKey: process.env.FETCHAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,

  // Server Configuration
  port: process.env.PORT || 5000,
  wsPort: process.env.WS_PORT || 5001,

  // Vision Analysis Settings
  visionAnalysisInterval: parseInt(process.env.VISION_ANALYSIS_INTERVAL) || 3000,

  // Intervention Thresholds
  thresholds: {
    aiOnly: parseFloat(process.env.AI_ONLY_THRESHOLD) || 0.7,
    notify: parseFloat(process.env.NOTIFY_THRESHOLD) || 0.85,
    emergency: parseFloat(process.env.EMERGENCY_THRESHOLD) || 0.95
  },

  // Intervention Types
  interventionTypes: {
    AI_ONLY: 'ai_only',
    NOTIFY: 'notify',
    EMERGENCY: 'emergency'
  },

  // Activity Types
  activityTypes: {
    MEAL: 'meal',
    STOVE_USE: 'stove_use',
    MEDICATION: 'medication',
    WANDERING: 'wandering',
    FALL: 'fall',
    CONFUSION: 'confusion',
    AGITATION: 'agitation',
    SOCIAL: 'social',
    REST: 'rest'
  }
};

const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/config');

class ConversationEngine {
  constructor(patientProfile) {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey
    });
    this.patientProfile = patientProfile;
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
  }

  /**
   * Main decision-making function: analyzes situation and determines intervention
   */
  async analyzeAndDecide(visionAnalysis, scenarios) {
    const context = this.buildContextPrompt(visionAnalysis, scenarios);

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: context
          }
        ]
      });

      const decision = this.parseDecision(response.content[0].text);

      // Add to conversation history
      this.addToHistory({
        timestamp: new Date().toISOString(),
        visionAnalysis,
        scenarios,
        decision
      });

      return decision;
    } catch (error) {
      console.error('Error in Claude decision-making:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive context prompt for Claude
   */
  buildContextPrompt(visionAnalysis, scenarios) {
    const patientContext = this.patientProfile.getContextForAI();
    const recentHistory = this.conversationHistory.slice(-5);

    return `You are MemoryMesh, an AI cognitive co-pilot for Alzheimer's care. You help ${patientContext.preferredName}, a ${this.patientProfile.age}-year-old patient with ${this.patientProfile.cognitiveStage} stage Alzheimer's.

PATIENT PROFILE:
- Preferred Name: ${patientContext.preferredName}
- Family: ${JSON.stringify(patientContext.family, null, 2)}
- Favorite Activities: ${patientContext.memories.favoriteActivities.join(', ')}
- Favorite Music: ${patientContext.preferences.music.favoriteArtists.join(', ')}
- Communication Style: ${patientContext.preferences.communication.responseStyle}
- Effective Techniques: ${patientContext.preferences.communication.effectiveTechniques.join(', ')}

CURRENT SITUATION:
Location: ${visionAnalysis.location}
Activity: ${visionAnalysis.activity}
Emotional State: ${visionAnalysis.emotional_indicators}
Objects Detected: ${visionAnalysis.objects_detected.join(', ')}
Safety Concerns: ${visionAnalysis.safety_concerns.length > 0 ? visionAnalysis.safety_concerns.join(', ') : 'None'}
Context: ${visionAnalysis.context_notes}
Urgency Level: ${visionAnalysis.urgency_level}

DETECTED SCENARIOS:
${scenarios.length > 0 ? scenarios.map(s => `- ${s.type}: ${s.description} (confidence: ${s.confidence})`).join('\n') : 'No specific scenarios detected'}

RECENT ACTIVITIES TODAY:
${patientContext.recentActivities.length > 0 ?
  patientContext.recentActivities.map(a => `- ${a.timestamp}: ${a.type || a.activity}`).join('\n') :
  'No activities logged yet today'}

CURRENT STATE:
- Last Meal: ${patientContext.currentState.lastMealType || 'Unknown'} at ${patientContext.currentState.lastMealTime || 'Unknown time'}
- Last Medication: ${patientContext.currentState.lastMedicationTime || 'Not taken today'}
- Current Activity: ${patientContext.currentState.currentActivity || 'Unknown'}

RECENT INTERVENTION HISTORY:
${recentHistory.length > 0 ?
  recentHistory.map(h => `- ${h.timestamp}: ${h.decision?.intervention_type || 'N/A'} - ${h.decision?.voice_message?.substring(0, 100) || 'N/A'}...`).join('\n') :
  'No recent interventions'}

YOUR TASK:
Analyze this situation and decide on the appropriate intervention. Use therapeutic techniques like:
- Validation therapy (never correct, enter their reality)
- Reminiscence therapy (use cherished memories)
- Gentle redirection (shift attention to positive stimuli)
- Routine reinforcement (remind of familiar patterns)

Respond in JSON format:
{
  "intervention_needed": true/false,
  "intervention_type": "AI_ONLY" | "NOTIFY" | "EMERGENCY",
  "urgency_score": 0.0-1.0,
  "reasoning": "Brief explanation of your decision",
  "voice_message": "The exact words to speak through Google Home Mini (warm, conversational, empathetic)",
  "actions": ["list of actions to take, e.g., 'show family photos', 'play music', 'turn off stove'"],
  "caregiver_notification": {
    "needed": true/false,
    "priority": "low|medium|high|critical",
    "message": "Message for caregiver dashboard"
  },
  "learning_notes": "What to remember about this intervention for future reference"
}

Guidelines:
- AI_ONLY (0.0-0.7): Handle entirely through conversation, no caregiver alert
- NOTIFY (0.7-0.85): Gentle notification to caregiver while engaging patient
- EMERGENCY (0.85-1.0): Immediate alert, critical safety issue

Be warm, personal, and use ${patientContext.preferredName}'s specific memories and preferences.`;
  }

  /**
   * Parse Claude's decision response
   */
  parseDecision(responseText) {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback
      return {
        intervention_needed: false,
        intervention_type: 'AI_ONLY',
        urgency_score: 0.0,
        reasoning: 'No intervention needed',
        voice_message: null,
        actions: [],
        caregiver_notification: {
          needed: false,
          priority: 'low',
          message: ''
        },
        learning_notes: ''
      };
    } catch (error) {
      console.error('Error parsing decision:', error);
      return {
        intervention_needed: false,
        intervention_type: 'AI_ONLY',
        urgency_score: 0.0,
        reasoning: 'Error parsing decision',
        voice_message: null,
        actions: [],
        caregiver_notification: {
          needed: false,
          priority: 'low',
          message: 'Error in AI decision-making'
        },
        learning_notes: 'Error occurred',
        error: error.message,
        rawResponse: responseText
      };
    }
  }

  /**
   * Generate a personalized intervention for specific scenarios
   */
  async generatePersonalizedIntervention(scenarioType, additionalContext = {}) {
    const prompts = {
      MEAL_CONFUSION: this.getMealConfusionPrompt(additionalContext),
      STOVE_SAFETY: this.getStoveSafetyPrompt(additionalContext),
      WANDERING: this.getWanderingPrompt(additionalContext),
      FALL: this.getFallPrompt(additionalContext),
      AGITATION: this.getAgitationPrompt(additionalContext)
    };

    const prompt = prompts[scenarioType] || this.buildContextPrompt({
      location: 'unknown',
      activity: 'other',
      objects_detected: [],
      safety_concerns: [],
      emotional_indicators: 'neutral',
      context_notes: additionalContext.notes || 'General situation',
      urgency_level: 0.5
    }, []);

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return this.parseDecision(response.content[0].text);
    } catch (error) {
      console.error('Error generating intervention:', error);
      throw error;
    }
  }

  /**
   * Scenario-specific prompt builders
   */
  getMealConfusionPrompt(context) {
    const patientContext = this.patientProfile.getContextForAI();
    return `${patientContext.preferredName} is in the kitchen looking confused, repeatedly checking the refrigerator. They had ${context.lastMealType || 'lunch'} ${context.timeSinceMeal || '30 minutes'} ago, but may not remember.

Generate a warm, gentle intervention that:
1. Shows them proof of their recent meal (we have timestamped photos)
2. Validates their feelings without correcting them harshly
3. Redirects to a pleasant activity they enjoy

Use their love for ${patientContext.memories.favoriteActivities[0]} and their grandchildren.

Respond in the JSON format specified earlier.`;
  }

  getStoveSafetyPrompt(context) {
    const patientContext = this.patientProfile.getContextForAI();
    return `URGENT: ${patientContext.preferredName} is at the stove with ${context.safetyIssue || 'a burner on and no pot'}. This is a safety emergency.

Generate an immediate intervention that:
1. Engages them conversationally (don't alarm them)
2. Gently redirects away from the stove
3. We'll turn off the stove automatically via smart home
4. Suggests an alternative pleasant activity

Keep calm and warm in tone, but act quickly.

Respond in the JSON format specified earlier.`;
  }

  getWanderingPrompt(context) {
    const patientContext = this.patientProfile.getContextForAI();
    return `${patientContext.preferredName} has wandered outside and is now lost on a busy main road. They appear confused and disoriented, not recognizing their surroundings. This is a CRITICAL safety situation - they could walk into traffic or get further lost.

Generate a gentle intervention that:
1. Validates their desire without restricting them harshly
2. Uses reminiscence to ground them
3. Redirects to an engaging indoor activity
4. Reassures them they're safe and loved

Respond in the JSON format specified earlier.`;
  }

  getFallPrompt(context) {
    return `CRITICAL EMERGENCY: Patient appears to have fallen. Generate immediate emergency response.`;
  }

  getAgitationPrompt(context) {
    const patientContext = this.patientProfile.getContextForAI();
    return `${patientContext.preferredName} is showing signs of agitation or distress.

Generate a calming intervention that:
1. Uses their favorite music (${patientContext.preferences.music.calmingSongs.join(', ')})
2. Shows comforting family photos
3. Uses validation therapy
4. Creates a soothing environment

Respond in the JSON format specified earlier.`;
  }

  /**
   * Add to conversation history
   */
  addToHistory(entry) {
    this.conversationHistory.push(entry);
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get conversation history
   */
  getHistory(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = ConversationEngine;

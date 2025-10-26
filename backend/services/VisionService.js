const fetch = require('node-fetch');
const config = require('../config/config');

class VisionService {
  constructor() {
    this.apiUrl = config.creaoApiUrl;
    this.analysisInterval = config.visionAnalysisInterval;
    this.isAnalyzing = false;
    this.currentFrame = null;
  }

  /**
   * Analyze a video frame using Creao's vision API
   * @param {string} imageUrl - URL or base64 data URL of the image
   * @param {string} analysisPrompt - Custom prompt for analysis
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeFrame(imageUrl, analysisPrompt = null) {
    try {
      const prompt = analysisPrompt || this.getDefaultAnalysisPrompt();

      const requestBody = {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        stream: false
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Creao API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No analysis content in response');
      }

      // Parse the analysis response
      return this.parseAnalysis(analysisText);
    } catch (error) {
      console.error('Vision analysis error:', error);
      throw error;
    }
  }

  /**
   * Default analysis prompt for continuous monitoring
   */
  getDefaultAnalysisPrompt() {
    return `Analyze this image for an Alzheimer's patient monitoring system. Provide a JSON response with the following structure:
{
  "location": "kitchen|living_room|bedroom|bathroom|hallway|outdoor|unknown",
  "activity": "cooking|eating|sitting|standing|walking|lying_down|using_appliance|looking_confused|searching|other",
  "objects_detected": ["list of relevant objects like stove, refrigerator, door, etc."],
  "patient_visible": true|false,
  "patient_position": "description of where patient is in frame",
  "safety_concerns": ["any safety issues like stove on, door open, patient on floor, etc."],
  "emotional_indicators": "calm|confused|agitated|distressed|neutral",
  "context_notes": "brief description of what's happening",
  "urgency_level": 0.0-1.0 (0 = no concern, 1 = critical emergency)
}

Be specific and accurate. Focus on safety-relevant details.`;
  }

  /**
   * Parse the analysis text into structured data
   */
  parseAnalysis(analysisText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure urgency_level is a number
        if (typeof parsed.urgency_level === 'string') {
          parsed.urgency_level = parseFloat(parsed.urgency_level);
        }

        return {
          ...parsed,
          timestamp: new Date().toISOString(),
          rawAnalysis: analysisText
        };
      }

      // Fallback if JSON parsing fails
      return {
        location: 'unknown',
        activity: 'other',
        objects_detected: [],
        patient_visible: false,
        patient_position: 'unknown',
        safety_concerns: [],
        emotional_indicators: 'neutral',
        context_notes: analysisText,
        urgency_level: 0.0,
        timestamp: new Date().toISOString(),
        rawAnalysis: analysisText
      };
    } catch (error) {
      console.error('Error parsing vision analysis:', error);
      return {
        location: 'unknown',
        activity: 'other',
        objects_detected: [],
        patient_visible: false,
        patient_position: 'error parsing',
        safety_concerns: [],
        emotional_indicators: 'neutral',
        context_notes: analysisText,
        urgency_level: 0.0,
        timestamp: new Date().toISOString(),
        rawAnalysis: analysisText,
        error: error.message
      };
    }
  }

  /**
   * Detect specific scenarios for targeted intervention
   */
  detectScenario(analysis) {
    const scenarios = [];

    // Meal confusion scenario
    if (analysis.location === 'kitchen' &&
        (analysis.objects_detected.includes('refrigerator') ||
         analysis.activity === 'searching') &&
        analysis.emotional_indicators === 'confused') {
      scenarios.push({
        type: 'MEAL_CONFUSION',
        confidence: 0.8,
        description: 'Patient appears confused about meals in kitchen'
      });
    }

    // Stove safety scenario
    if (analysis.location === 'kitchen' &&
        analysis.objects_detected.includes('stove') &&
        analysis.safety_concerns.some(c => c.toLowerCase().includes('stove'))) {
      scenarios.push({
        type: 'STOVE_SAFETY',
        confidence: 0.95,
        description: 'Safety concern with stove detected'
      });
    }

    // Wandering scenario
    if (analysis.activity === 'walking' &&
        analysis.emotional_indicators === 'confused' &&
        analysis.objects_detected.includes('door')) {
      scenarios.push({
        type: 'WANDERING',
        confidence: 0.7,
        description: 'Patient may be attempting to leave'
      });
    }

    // Fall detection
    if (analysis.activity === 'lying_down' &&
        analysis.location !== 'bedroom' &&
        analysis.safety_concerns.some(c => c.toLowerCase().includes('floor'))) {
      scenarios.push({
        type: 'FALL',
        confidence: 0.9,
        description: 'Possible fall detected'
      });
    }

    // Agitation
    if (analysis.emotional_indicators === 'agitated' ||
        analysis.emotional_indicators === 'distressed') {
      scenarios.push({
        type: 'AGITATION',
        confidence: 0.75,
        description: 'Patient showing signs of distress'
      });
    }

    return scenarios;
  }

  /**
   * Start continuous monitoring (for production use)
   */
  startContinuousMonitoring(onAnalysis) {
    if (this.isAnalyzing) {
      console.warn('Continuous monitoring already running');
      return;
    }

    this.isAnalyzing = true;
    console.log(`Starting continuous monitoring (${this.analysisInterval}ms interval)`);

    // Note: In production, this would grab frames from an actual webcam
    // For now, this is a placeholder for the monitoring loop
    this.monitoringInterval = setInterval(async () => {
      if (this.currentFrame) {
        try {
          const analysis = await this.analyzeFrame(this.currentFrame);
          const scenarios = this.detectScenario(analysis);

          if (onAnalysis) {
            onAnalysis(analysis, scenarios);
          }
        } catch (error) {
          console.error('Error in continuous monitoring:', error);
        }
      }
    }, this.analysisInterval);
  }

  /**
   * Stop continuous monitoring
   */
  stopContinuousMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.isAnalyzing = false;
      console.log('Stopped continuous monitoring');
    }
  }

  /**
   * Update current frame for analysis
   */
  updateFrame(imageUrl) {
    this.currentFrame = imageUrl;
  }
}

module.exports = VisionService;

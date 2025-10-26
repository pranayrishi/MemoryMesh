const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Pose Analysis Service
 * Uses Gemini VLM to analyze pose keypoints and detect scenarios
 */
class PoseAnalysisService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
      this.enabled = true;
      console.log('✅ Pose Analysis Service initialized with Gemini VLM');
    } else {
      this.enabled = false;
      console.log('⚠️  Pose Analysis Service disabled - missing GEMINI_API_KEY');
    }
  }

  /**
   * Analyze pose keypoints to detect scenarios
   */
  async analyzePoseKeypoints(keypoints, videoFrame = null) {
    if (!this.enabled) {
      return this.getFallbackAnalysis(keypoints);
    }

    try {
      // Extract key pose features
      const poseFeatures = this.extractPoseFeatures(keypoints);
      
      // Analyze with Gemini if we have a video frame
      if (videoFrame) {
        return await this.analyzeWithGemini(poseFeatures, videoFrame);
      }
      
      // Otherwise use rule-based analysis
      return this.analyzeWithRules(poseFeatures);
    } catch (error) {
      console.error('Pose analysis error:', error.message);
      return this.getFallbackAnalysis(keypoints);
    }
  }

  /**
   * Extract meaningful features from pose keypoints
   */
  extractPoseFeatures(keypoints) {
    // MediaPipe Pose keypoint indices
    const NOSE = 0, LEFT_EYE = 1, RIGHT_EYE = 2;
    const LEFT_SHOULDER = 11, RIGHT_SHOULDER = 12;
    const LEFT_ELBOW = 13, RIGHT_ELBOW = 14;
    const LEFT_WRIST = 15, RIGHT_WRIST = 16;
    const LEFT_HIP = 23, RIGHT_HIP = 24;
    const LEFT_KNEE = 25, RIGHT_KNEE = 26;
    const LEFT_ANKLE = 27, RIGHT_ANKLE = 28;

    const features = {
      // Head position and tilt
      headTilt: this.calculateAngle(
        keypoints[LEFT_EYE],
        keypoints[RIGHT_EYE],
        { x: keypoints[RIGHT_EYE].x + 1, y: keypoints[RIGHT_EYE].y }
      ),
      headHeight: keypoints[NOSE]?.y || 0,
      
      // Body posture
      shoulderAngle: this.calculateAngle(
        keypoints[LEFT_SHOULDER],
        keypoints[RIGHT_SHOULDER],
        { x: keypoints[RIGHT_SHOULDER].x + 1, y: keypoints[RIGHT_SHOULDER].y }
      ),
      bodyTilt: this.calculateBodyTilt(keypoints[LEFT_SHOULDER], keypoints[LEFT_HIP]),
      
      // Arm positions
      leftArmAngle: this.calculateAngle(
        keypoints[LEFT_SHOULDER],
        keypoints[LEFT_ELBOW],
        keypoints[LEFT_WRIST]
      ),
      rightArmAngle: this.calculateAngle(
        keypoints[RIGHT_SHOULDER],
        keypoints[RIGHT_ELBOW],
        keypoints[RIGHT_WRIST]
      ),
      
      // Hand positions (relative to body)
      leftHandHeight: keypoints[LEFT_WRIST]?.y - keypoints[LEFT_SHOULDER]?.y || 0,
      rightHandHeight: keypoints[RIGHT_WRIST]?.y - keypoints[RIGHT_SHOULDER]?.y || 0,
      
      // Leg stability
      leftLegAngle: this.calculateAngle(
        keypoints[LEFT_HIP],
        keypoints[LEFT_KNEE],
        keypoints[LEFT_ANKLE]
      ),
      rightLegAngle: this.calculateAngle(
        keypoints[RIGHT_HIP],
        keypoints[RIGHT_KNEE],
        keypoints[RIGHT_ANKLE]
      ),
      
      // Overall stability
      centerOfMass: this.calculateCenterOfMass(keypoints),
      baseOfSupport: this.calculateBaseOfSupport(keypoints[LEFT_ANKLE], keypoints[RIGHT_ANKLE])
    };

    return features;
  }

  /**
   * Rule-based pose analysis
   */
  analyzeWithRules(features) {
    const scenarios = [];
    let confidence = 0;
    let primaryScenario = 'normal';

    // Check for fall risk (body tilting, unstable posture)
    if (Math.abs(features.bodyTilt) > 20 || Math.abs(features.shoulderAngle) > 15) {
      scenarios.push({
        type: 'FALL_RISK',
        confidence: 0.75,
        indicators: ['Body tilting', 'Unstable posture']
      });
      primaryScenario = 'fall_risk';
      confidence = 0.75;
    }

    // Check for confusion (hands near head, repetitive movements)
    if (features.leftHandHeight < -50 || features.rightHandHeight < -50) {
      scenarios.push({
        type: 'CONFUSION',
        confidence: 0.65,
        indicators: ['Hands near head', 'Possible distress gestures']
      });
      if (confidence < 0.65) {
        primaryScenario = 'confusion';
        confidence = 0.65;
      }
    }

    // Check for agitation (rapid arm movements, tense posture)
    if (Math.abs(features.leftArmAngle - 90) > 45 && Math.abs(features.rightArmAngle - 90) > 45) {
      scenarios.push({
        type: 'AGITATION',
        confidence: 0.60,
        indicators: ['Unusual arm positions', 'Tense posture']
      });
      if (confidence < 0.60) {
        primaryScenario = 'agitation';
        confidence = 0.60;
      }
    }

    // Check for wandering (standing, forward lean)
    if (features.bodyTilt > 10 && features.centerOfMass.y > 0.5) {
      scenarios.push({
        type: 'WANDERING',
        confidence: 0.55,
        indicators: ['Forward lean', 'Standing posture']
      });
      if (confidence < 0.55) {
        primaryScenario = 'wandering';
        confidence = 0.55;
      }
    }

    return {
      scenario: primaryScenario,
      confidence: confidence,
      scenarios: scenarios,
      poseFeatures: features,
      analysis: this.generateAnalysisText(primaryScenario, features)
    };
  }

  /**
   * Analyze with Gemini VLM (when video frame available)
   */
  async analyzeWithGemini(features, videoFrame) {
    try {
      const prompt = `Analyze this elderly person's pose and body language. 
      
Pose features detected:
- Head tilt: ${features.headTilt.toFixed(1)}°
- Body tilt: ${features.bodyTilt.toFixed(1)}°
- Left arm angle: ${features.leftArmAngle.toFixed(1)}°
- Right arm angle: ${features.rightArmAngle.toFixed(1)}°

Based on the image and pose data, identify if the person shows signs of:
1. Confusion (hands near head, uncertain gestures)
2. Agitation (tense posture, rapid movements)
3. Wandering (forward lean, purposeful stance)
4. Fall risk (body tilting, unstable posture)
5. Normal activity

Respond in JSON format:
{
  "scenario": "confusion|agitation|wandering|fall_risk|normal",
  "confidence": 0.0-1.0,
  "indicators": ["list", "of", "visual", "cues"],
  "recommendation": "brief recommendation"
}`;

      const result = await this.model.generateContent([prompt, videoFrame]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const analysis = JSON.parse(text);
      
      return {
        scenario: analysis.scenario,
        confidence: analysis.confidence,
        scenarios: [{
          type: analysis.scenario.toUpperCase(),
          confidence: analysis.confidence,
          indicators: analysis.indicators
        }],
        poseFeatures: features,
        analysis: analysis.recommendation,
        geminiAnalysis: true
      };
    } catch (error) {
      console.error('Gemini analysis failed:', error.message);
      return this.analyzeWithRules(features);
    }
  }

  /**
   * Calculate angle between three points
   */
  calculateAngle(p1, p2, p3) {
    if (!p1 || !p2 || !p3) return 0;
    
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                    Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    
    if (angle > 180) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  /**
   * Calculate body tilt angle
   */
  calculateBodyTilt(shoulder, hip) {
    if (!shoulder || !hip) return 0;
    
    const angle = Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) * 180 / Math.PI;
    return angle - 90; // 0 degrees = upright
  }

  /**
   * Calculate center of mass
   */
  calculateCenterOfMass(keypoints) {
    let sumX = 0, sumY = 0, count = 0;
    
    keypoints.forEach(kp => {
      if (kp && kp.x !== undefined && kp.y !== undefined) {
        sumX += kp.x;
        sumY += kp.y;
        count++;
      }
    });
    
    return {
      x: count > 0 ? sumX / count : 0,
      y: count > 0 ? sumY / count : 0
    };
  }

  /**
   * Calculate base of support (distance between feet)
   */
  calculateBaseOfSupport(leftAnkle, rightAnkle) {
    if (!leftAnkle || !rightAnkle) return 0;
    
    const dx = rightAnkle.x - leftAnkle.x;
    const dy = rightAnkle.y - leftAnkle.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Generate human-readable analysis text
   */
  generateAnalysisText(scenario, features) {
    const texts = {
      fall_risk: `Body showing signs of instability. Tilt angle: ${features.bodyTilt.toFixed(1)}°. Monitor closely for fall prevention.`,
      confusion: `Posture suggests possible confusion or distress. Hand positions indicate uncertainty.`,
      agitation: `Body language shows tension. Arm positions suggest agitation or discomfort.`,
      wandering: `Forward-leaning posture detected. May indicate intention to move or wander.`,
      normal: `Posture appears stable and normal. No immediate concerns detected.`
    };
    
    return texts[scenario] || 'Analyzing body posture and movements.';
  }

  /**
   * Fallback analysis when service is disabled
   */
  getFallbackAnalysis(keypoints) {
    return {
      scenario: 'normal',
      confidence: 0.5,
      scenarios: [],
      poseFeatures: {},
      analysis: 'Pose analysis service not configured. Install Gemini API key for advanced analysis.',
      fallback: true
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      model: this.enabled ? 'gemini-pro-vision' : null,
      features: [
        'Pose keypoint extraction',
        'Fall risk detection',
        'Confusion detection',
        'Agitation detection',
        'Wandering detection'
      ]
    };
  }
}

module.exports = PoseAnalysisService;

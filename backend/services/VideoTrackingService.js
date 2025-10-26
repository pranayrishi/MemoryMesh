const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

/**
 * Video Tracking Service
 * Uses Gemini 2.0 Flash for REAL AI-powered person detection and pose estimation
 */
class VideoTrackingService {
  constructor() {
    this.trackingCache = new Map(); // Cache tracking data per video
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    console.log('✅ Video Tracking Service initialized with Gemini 2.0 Flash');
  }

  /**
   * Detect person in video frame using REAL Gemini AI vision analysis
   * @param {string} frameDataUrl - Base64 encoded frame (data:image/jpeg;base64,...)
   * @param {string} videoId - Unique video identifier
   * @param {number} frameNumber - Frame number for caching
   * @returns {Promise<Object>} Bounding box coordinates and pose keypoints
   */
  async detectPersonInFrame(frameDataUrl, videoId, frameNumber) {
    try {
      console.log(`🎯 Detecting person in frame ${frameNumber} of video ${videoId}`);

      // Check cache first
      const cacheKey = `${videoId}_${frameNumber}`;
      if (this.trackingCache.has(cacheKey)) {
        console.log(`✅ Using cached result for frame ${frameNumber}`);
        return this.trackingCache.get(cacheKey);
      }

      console.log('🤖 Analyzing frame with Gemini AI vision...');

      // Extract base64 data from data URL
      const base64Data = frameDataUrl.replace(/^data:image\/\w+;base64,/, '');

      // Create the vision analysis prompt - SIMPLIFIED for better detection
      const prompt = `You are an expert computer vision system specialized in detecting elderly people (grandmothers) in images.

Your task: Analyze this image and detect ANY person, especially elderly women/grandmothers.

IMPORTANT: Be VERY GENEROUS with detection. If you see ANY human figure, human-like shape, or person in the image, mark person_detected as true.

Return ONLY a valid JSON response (no markdown, no code blocks) with this EXACT format:

{
  "person_detected": true or false,
  "bounding_box": {
    "x": percentage from left edge (0-100),
    "y": percentage from top edge (0-100),
    "width": percentage of image width (0-100),
    "height": percentage of image height (0-100)
  },
  "description": "brief description of the person and what they are doing",
  "confidence": 0.0-1.0
}

CRITICAL REQUIREMENTS:
1. The bounding box must TIGHTLY fit around the person's ENTIRE body (from head to feet, including arms)
2. Coordinates are percentages (0-100) of the image dimensions
3. If you see ANY human figure or person, set person_detected to true
4. Be generous with detection - err on the side of detecting a person rather than missing them
5. The bounding box should encompass the full person, not just parts
6. Return ONLY valid JSON, no markdown formatting or code blocks

Examples of what counts as person_detected=true:
- Any elderly woman or grandmother figure
- Any human figure standing, sitting, or moving
- Any person partially visible in the frame
- Any human-like shape or silhouette

Only return person_detected=false if there is absolutely NO human figure visible in the image.`;

      // Call Gemini with the image
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();

      console.log('📥 Raw Gemini response:', text.substring(0, 200) + '...');

      // Clean up response - remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Parse JSON response
      let detection;
      try {
        detection = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', parseError.message);
        console.error('Response text:', text);
        throw new Error(`Invalid JSON response from Gemini: ${parseError.message}`);
      }

      // Validate response structure
      if (!detection.hasOwnProperty('person_detected')) {
        throw new Error('Invalid response: missing person_detected field');
      }

      if (detection.person_detected) {
        if (!detection.bounding_box) {
          throw new Error('Invalid response: missing bounding_box');
        }

        // Ensure all required bounding box fields exist
        const bbox = detection.bounding_box;
        if (typeof bbox.x !== 'number' || typeof bbox.y !== 'number' ||
            typeof bbox.width !== 'number' || typeof bbox.height !== 'number') {
          throw new Error('Invalid bounding box coordinates');
        }

        console.log('✅ Person detected with AI!');
        console.log(`   Bounding box: x=${bbox.x.toFixed(1)}%, y=${bbox.y.toFixed(1)}%, w=${bbox.width.toFixed(1)}%, h=${bbox.height.toFixed(1)}%`);
        console.log(`   Confidence: ${(detection.confidence * 100).toFixed(1)}%`);
        console.log(`   Description: ${detection.description || 'N/A'}`);
      } else {
        console.log('❌ No person detected by AI in this frame');
      }

      // Cache the result
      this.trackingCache.set(cacheKey, detection);
      console.log(`💾 Cached AI result for frame ${frameNumber}`);

      // Limit cache size to prevent memory issues
      if (this.trackingCache.size > 100) {
        const firstKey = this.trackingCache.keys().next().value;
        this.trackingCache.delete(firstKey);
      }

      return detection;

    } catch (error) {
      console.error('❌ Gemini AI detection error:', error.message);
      console.error('Full error:', error);

      // Return fallback response with a default bounding box (assume person in center)
      // This ensures we always try to show something rather than failing completely
      console.log('⚠️  Using fallback detection - assuming person in center of frame');
      return {
        person_detected: true,
        bounding_box: {
          x: 25,  // 25% from left
          y: 10,  // 10% from top
          width: 50,  // 50% of width
          height: 80  // 80% of height
        },
        description: 'Fallback detection - person assumed in center',
        confidence: 0.5,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Process multiple frames for smooth tracking
   * @param {Array} frames - Array of frame data URLs
   * @param {string} videoId - Video identifier
   * @returns {Promise<Array>} Array of detection results
   */
  async trackPersonAcrossFrames(frames, videoId) {
    const results = [];

    for (let i = 0; i < frames.length; i++) {
      const detection = await this.detectPersonInFrame(frames[i], videoId, i);
      results.push({
        frameNumber: i,
        timestamp: (i / 30) * 1000, // Assuming 30fps
        ...detection
      });

      // Add delay to avoid rate limiting (Gemini has rate limits)
      if (i < frames.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Smooth tracking data using interpolation
   * Reduces jitter in bounding box movement
   */
  smoothTrackingData(trackingResults, windowSize = 3) {
    if (trackingResults.length < windowSize) return trackingResults;

    const smoothed = [];

    for (let i = 0; i < trackingResults.length; i++) {
      const result = trackingResults[i];

      if (!result.person_detected || !result.bounding_box) {
        smoothed.push(result);
        continue;
      }

      // Get surrounding frames for averaging
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(trackingResults.length, i + Math.ceil(windowSize / 2));
      const window = trackingResults.slice(start, end).filter(r => r.person_detected && r.bounding_box);

      if (window.length === 0) {
        smoothed.push(result);
        continue;
      }

      // Average the bounding box coordinates
      const avgBox = {
        x: window.reduce((sum, r) => sum + r.bounding_box.x, 0) / window.length,
        y: window.reduce((sum, r) => sum + r.bounding_box.y, 0) / window.length,
        width: window.reduce((sum, r) => sum + r.bounding_box.width, 0) / window.length,
        height: window.reduce((sum, r) => sum + r.bounding_box.height, 0) / window.length
      };

      smoothed.push({
        ...result,
        bounding_box: avgBox,
        smoothed: true
      });
    }

    return smoothed;
  }

  /**
   * Clear cache for a specific video
   */
  clearVideoCache(videoId) {
    const keysToDelete = [];
    for (const key of this.trackingCache.keys()) {
      if (key.startsWith(videoId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.trackingCache.delete(key));
    console.log(`🗑️  Cleared ${keysToDelete.length} cached frames for ${videoId}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedFrames: this.trackingCache.size,
      videos: new Set([...this.trackingCache.keys()].map(k => k.split('_')[0])).size
    };
  }
}

module.exports = VideoTrackingService;

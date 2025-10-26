/**
 * PersonaDetectionService
 * Integrates with Python CV persona detector to identify grandma/grandpa in video frames.
 * Provides a Node.js interface to the Python detection module.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PersonaDetectionService {
  constructor() {
    this.pythonScript = path.join(__dirname, '../../cv/persona_detector.py');
    this.detectionCache = new Map();
    this.lastDetection = null;
    
    // Check if Python script exists
    if (!fs.existsSync(this.pythonScript)) {
      console.log('⚠️  Persona detector script not found:', this.pythonScript);
    } else {
      console.log('✅ Persona detection service initialized');
    }
  }

  /**
   * Detect persona from video file using Python CV module
   */
  async detectPersonaFromVideo(videoPath) {
    // Check cache first
    if (this.detectionCache.has(videoPath)) {
      return this.detectionCache.get(videoPath);
    }

    // Try filename-based detection first (fast)
    const filenameResult = this.detectPersonaFromFilename(videoPath);
    if (filenameResult.confidence === 1.0) {
      this.detectionCache.set(videoPath, filenameResult);
      return filenameResult;
    }

    // Fallback to Python CV detection (slower but more accurate)
    try {
      const result = await this.runPythonDetection(videoPath);
      this.detectionCache.set(videoPath, result);
      return result;
    } catch (error) {
      console.error('Python detection failed:', error.message);
      // Return filename-based result as fallback
      return filenameResult;
    }
  }

  /**
   * Fast persona detection by parsing filename
   */
  detectPersonaFromFilename(videoPath) {
    const filename = path.basename(videoPath, '.mp4');
    
    if (filename.endsWith('_grandma')) {
      return {
        persona: 'grandma',
        confidence: 1.0,
        method: 'filename',
        videoPath: videoPath
      };
    } else if (filename.endsWith('_grandpa')) {
      return {
        persona: 'grandpa',
        confidence: 1.0,
        method: 'filename',
        videoPath: videoPath
      };
    }
    
    return {
      persona: 'unknown',
      confidence: 0.0,
      method: 'filename',
      videoPath: videoPath
    };
  }

  /**
   * Run Python CV detection script
   */
  runPythonDetection(videoPath) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [
        this.pythonScript,
        '--detect-video',
        videoPath
      ]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          result.method = 'cv';
          result.videoPath = videoPath;
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python: ${error.message}`));
      });
    });
  }

  /**
   * Update last detected persona (for real-time tracking)
   */
  updateLastDetection(persona, confidence, context = {}) {
    this.lastDetection = {
      persona: persona,
      confidence: confidence,
      timestamp: Date.now(),
      ...context
    };
  }

  /**
   * Get last detected persona
   */
  getLastDetection() {
    return this.lastDetection;
  }

  /**
   * Clear detection cache
   */
  clearCache() {
    this.detectionCache.clear();
  }

  /**
   * Get detection for scenario video
   * Combines video path lookup with detection
   */
  async detectPersonaForScenario(scenario, videoPath) {
    const detection = await this.detectPersonaFromVideo(videoPath);
    
    return {
      scenario: scenario,
      ...detection,
      detectedAt: Date.now()
    };
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      pythonScriptExists: fs.existsSync(this.pythonScript),
      cacheSize: this.detectionCache.size,
      lastDetection: this.lastDetection,
      ready: fs.existsSync(this.pythonScript)
    };
  }
}

module.exports = PersonaDetectionService;

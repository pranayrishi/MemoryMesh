/**
 * VideoPlaybackService
 * Manages playback of pre-generated persona videos for demo scenarios.
 * Replaces live webcam feed with cached AI-generated videos.
 */

const fs = require('fs');
const path = require('path');

class VideoPlaybackService {
  constructor() {
    this.videosDir = path.join(__dirname, '../../assets/videos');
    this.currentVideo = null;
    this.availableVideos = {};
    
    // Scan for available videos
    this.scanVideos();
  }

  /**
   * Scan the videos directory for available scenario+persona videos
   */
  scanVideos() {
    try {
      if (!fs.existsSync(this.videosDir)) {
        console.log('⚠️  Videos directory not found, creating:', this.videosDir);
        fs.mkdirSync(this.videosDir, { recursive: true });
        return;
      }

      const files = fs.readdirSync(this.videosDir);
      const videoFiles = files.filter(f => f.endsWith('.mp4'));

      videoFiles.forEach(filename => {
        // Parse filename: {scenario}_{persona}.mp4
        const match = filename.match(/^(.+)_(grandma|grandpa)\.mp4$/);
        if (match) {
          const scenario = match[1];
          const persona = match[2];
          
          if (!this.availableVideos[scenario]) {
            this.availableVideos[scenario] = {};
          }
          
          this.availableVideos[scenario][persona] = {
            filename: filename,
            path: path.join(this.videosDir, filename),
            scenario: scenario,
            persona: persona
          };
        }
      });

      const totalVideos = Object.values(this.availableVideos)
        .reduce((sum, personas) => sum + Object.keys(personas).length, 0);

      if (totalVideos > 0) {
        console.log(`✅ Found ${totalVideos} pre-generated persona videos`);
        console.log('   Scenarios:', Object.keys(this.availableVideos).join(', '));
      } else {
        console.log('⚠️  No pre-generated videos found');
        console.log('   Run: python video/generate_persona_videos.py');
      }
    } catch (error) {
      console.error('Error scanning videos:', error.message);
    }
  }

  /**
   * Get video for a specific scenario and persona
   */
  getVideo(scenario, persona) {
    const video = this.availableVideos[scenario]?.[persona];
    
    if (!video) {
      console.log(`⚠️  Video not found: ${scenario}_${persona}`);
      return null;
    }

    return video;
  }

  /**
   * Get video path for scenario+persona
   */
  getVideoPath(scenario, persona) {
    const video = this.getVideo(scenario, persona);
    return video ? video.path : null;
  }

  /**
   * Get video URL for serving to frontend
   */
  getVideoUrl(scenario, persona) {
    const video = this.getVideo(scenario, persona);
    if (!video) return null;

    // Return relative URL that will be served by Express static middleware
    return `/videos/${video.filename}`;
  }

  /**
   * Check if video exists for scenario+persona
   */
  hasVideo(scenario, persona) {
    return !!this.availableVideos[scenario]?.[persona];
  }

  /**
   * Get all available scenarios
   */
  getAvailableScenarios() {
    return Object.keys(this.availableVideos);
  }

  /**
   * Get available personas for a scenario
   */
  getAvailablePersonas(scenario) {
    return Object.keys(this.availableVideos[scenario] || {});
  }

  /**
   * Get video info for scenario
   */
  getVideoInfo(scenario, persona) {
    const video = this.getVideo(scenario, persona);
    if (!video) return null;

    try {
      const stats = fs.statSync(video.path);
      const metaPath = video.path + '.json';
      let metadata = {};

      if (fs.existsSync(metaPath)) {
        metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      }

      return {
        scenario: video.scenario,
        persona: video.persona,
        filename: video.filename,
        url: this.getVideoUrl(scenario, persona),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        metadata: metadata
      };
    } catch (error) {
      console.error('Error getting video info:', error.message);
      return null;
    }
  }

  /**
   * Get all videos info
   */
  getAllVideosInfo() {
    const info = {};

    Object.keys(this.availableVideos).forEach(scenario => {
      info[scenario] = {};
      Object.keys(this.availableVideos[scenario]).forEach(persona => {
        info[scenario][persona] = this.getVideoInfo(scenario, persona);
      });
    });

    return info;
  }

  /**
   * Select video for demo scenario
   * Returns video info with persona detection hint
   */
  selectVideoForScenario(scenario, preferredPersona = null) {
    if (!this.availableVideos[scenario]) {
      return {
        error: 'Scenario not found',
        scenario: scenario,
        available: this.getAvailableScenarios()
      };
    }

    // If preferred persona specified and available, use it
    if (preferredPersona && this.hasVideo(scenario, preferredPersona)) {
      return {
        success: true,
        scenario: scenario,
        persona: preferredPersona,
        videoUrl: this.getVideoUrl(scenario, preferredPersona),
        videoInfo: this.getVideoInfo(scenario, preferredPersona)
      };
    }

    // Otherwise, pick first available persona
    const availablePersonas = this.getAvailablePersonas(scenario);
    if (availablePersonas.length === 0) {
      return {
        error: 'No videos available for scenario',
        scenario: scenario
      };
    }

    const persona = availablePersonas[0];
    return {
      success: true,
      scenario: scenario,
      persona: persona,
      videoUrl: this.getVideoUrl(scenario, persona),
      videoInfo: this.getVideoInfo(scenario, persona)
    };
  }

  /**
   * Set current playing video
   */
  setCurrentVideo(scenario, persona) {
    const video = this.getVideo(scenario, persona);
    if (video) {
      this.currentVideo = {
        scenario: scenario,
        persona: persona,
        startTime: Date.now(),
        ...video
      };
      return true;
    }
    return false;
  }

  /**
   * Get current playing video
   */
  getCurrentVideo() {
    return this.currentVideo;
  }

  /**
   * Clear current video
   */
  clearCurrentVideo() {
    this.currentVideo = null;
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      videosDirectory: this.videosDir,
      totalVideos: Object.values(this.availableVideos)
        .reduce((sum, personas) => sum + Object.keys(personas).length, 0),
      scenarios: Object.keys(this.availableVideos),
      currentVideo: this.currentVideo ? {
        scenario: this.currentVideo.scenario,
        persona: this.currentVideo.persona,
        duration: Date.now() - this.currentVideo.startTime
      } : null
    };
  }
}

module.exports = VideoPlaybackService;

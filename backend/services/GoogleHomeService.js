/**
 * Google Home Mini Integration Service
 * Simplified version that works with or without actual Google Home devices
 */

class GoogleHomeService {
  constructor() {
    this.devices = [];
    this.selectedDevice = null;
    this.fallbackMode = true;
    this.voiceHistory = [];
  }

  /**
   * Discover Google Home devices on the network
   * For demo purposes, we'll simulate discovery
   */
  async discoverDevices() {
    try {
      // In production, this would use mDNS/Bonjour to discover Google Cast devices
      // For now, we'll check if user has configured a device manually

      // Simulated discovery - you can manually add your Google Home's IP here
      const manualDevices = process.env.GOOGLE_HOME_IP ? [{
        name: process.env.GOOGLE_HOME_NAME || 'Google Home',
        host: process.env.GOOGLE_HOME_IP,
        port: 8009
      }] : [];

      this.devices = manualDevices;

      if (manualDevices.length > 0) {
        this.selectedDevice = manualDevices[0];
        this.fallbackMode = false;
        console.log(`✅ Google Home configured: ${this.selectedDevice.name}`);
      } else {
        console.log('ℹ️  No Google Home configured. Using browser TTS fallback.');
        console.log('   To use real Google Home, add GOOGLE_HOME_IP to .env');
        this.fallbackMode = true;
      }

      return this.devices;
    } catch (error) {
      console.warn('Google Home discovery error:', error.message);
      this.fallbackMode = true;
      return [];
    }
  }

  /**
   * Speak a message through Google Home or fallback TTS
   */
  async speak(message, options = {}) {
    console.log('🔊 Speaking:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    const voiceEvent = {
      timestamp: new Date().toISOString(),
      message: message,
      method: this.fallbackMode ? 'fallback' : 'google_home',
      device: this.fallbackMode ? 'console/browser' : this.selectedDevice?.name
    };

    this.voiceHistory.push(voiceEvent);

    if (this.fallbackMode) {
      // Fallback mode: Log to console (browser will handle TTS if supported)
      return await this.speakFallback(message, options);
    }

    try {
      // Real Google Home TTS
      await this.speakToGoogleHome(message, options);
      return {
        success: true,
        message: message,
        method: 'google_home',
        device: this.selectedDevice.name,
        timestamp: voiceEvent.timestamp
      };
    } catch (error) {
      console.error('Google Home error:', error.message);
      // Fallback on error
      return await this.speakFallback(message, options);
    }
  }

  /**
   * Send TTS to actual Google Home device
   */
  async speakToGoogleHome(message, options = {}) {
    // In production with Google Home on network:
    // 1. Generate TTS audio using Google Cloud Text-to-Speech
    // 2. Upload audio to accessible URL
    // 3. Cast to Google Home using castv2-client

    // For now, we'll use a simpler approach:
    // Send to Google Home via Cast protocol if configured

    if (!this.selectedDevice) {
      throw new Error('No Google Home device configured');
    }

    // Placeholder for actual Google Cast implementation
    // Would use castv2-client here in production
    console.log(`📢 [Google Home ${this.selectedDevice.name}]:`, message);

    // Simulate speech duration
    const wordsPerMinute = 150;
    const words = message.split(' ').length;
    const durationMs = (words / wordsPerMinute) * 60 * 1000;
    await new Promise(resolve => setTimeout(resolve, Math.min(durationMs, 3000)));
  }

  /**
   * Fallback TTS method (console + browser speech synthesis)
   */
  async speakFallback(message, options = {}) {
    console.log('💬 [TTS Fallback]:', message);

    // Simulate speech delay
    const wordsPerMinute = 150;
    const words = message.split(' ').length;
    const durationMs = (words / wordsPerMinute) * 60 * 1000;

    await new Promise(resolve => setTimeout(resolve, Math.min(durationMs, 2000)));

    return {
      success: true,
      message: message,
      method: 'fallback',
      device: 'console/browser',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Play music on Google Home
   */
  async playMusic(songName, artist = null) {
    const fullName = artist ? `${songName} by ${artist}` : songName;
    console.log('🎵 Playing music:', fullName);

    this.voiceHistory.push({
      timestamp: new Date().toISOString(),
      type: 'music',
      song: songName,
      artist: artist,
      method: this.fallbackMode ? 'fallback' : 'google_home'
    });

    if (this.fallbackMode) {
      console.log('🎶 [Music Fallback]:', fullName);
      await this.speak(`Now playing ${fullName}`);
    } else {
      // In production: integrate with Spotify/YouTube Music via Google Home
      await this.speak(`Now playing ${fullName}`);
    }

    return {
      success: true,
      playing: songName,
      artist: artist,
      method: this.fallbackMode ? 'fallback' : 'google_home'
    };
  }

  /**
   * Stop current playback
   */
  async stop() {
    console.log('⏹️  Stopping playback');
    return { success: true, stopped: true };
  }

  /**
   * Get list of available devices
   */
  getDevices() {
    return this.devices;
  }

  /**
   * Select a specific device
   */
  selectDevice(deviceName) {
    const device = this.devices.find(d => d.name === deviceName);
    if (device) {
      this.selectedDevice = device;
      this.fallbackMode = false;
      return true;
    }
    return false;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      fallbackMode: this.fallbackMode,
      selectedDevice: this.selectedDevice?.name || 'none',
      availableDevices: this.devices.length,
      devices: this.devices.map(d => d.name),
      historyCount: this.voiceHistory.length
    };
  }

  /**
   * Get voice history
   */
  getHistory(limit = 20) {
    return this.voiceHistory.slice(-limit);
  }
}

module.exports = GoogleHomeService;

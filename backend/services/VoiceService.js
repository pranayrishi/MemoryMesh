/**
 * Voice Service for Google Home Mini integration
 * Handles text-to-speech and music playback
 */

class VoiceService {
  constructor() {
    this.isConnected = false;
    this.currentMessage = null;
    this.messageQueue = [];
    this.voiceHistory = [];
  }

  /**
   * Speak a message through Google Home Mini
   * @param {string} message - The message to speak
   * @param {Object} options - Voice options (speed, pitch, etc.)
   */
  async speak(message, options = {}) {
    console.log('🔊 Speaking:', message);

    const voiceEvent = {
      timestamp: new Date().toISOString(),
      message: message,
      options: options,
      status: 'pending'
    };

    try {
      // In production, this would integrate with Google Home API
      // For demo, we'll simulate the speech and log it
      await this.simulateSpeech(message, options);

      voiceEvent.status = 'completed';
      this.voiceHistory.push(voiceEvent);

      return {
        success: true,
        message: message,
        timestamp: voiceEvent.timestamp
      };
    } catch (error) {
      console.error('Error speaking:', error);
      voiceEvent.status = 'failed';
      voiceEvent.error = error.message;
      this.voiceHistory.push(voiceEvent);

      throw error;
    }
  }

  /**
   * Simulate speech for demo purposes
   */
  async simulateSpeech(message, options = {}) {
    // Calculate speech duration based on message length
    const wordsPerMinute = options.speed || 150;
    const words = message.split(' ').length;
    const durationMs = (words / wordsPerMinute) * 60 * 1000;

    this.currentMessage = {
      message,
      startTime: Date.now(),
      estimatedDuration: durationMs
    };

    // Simulate speech delay
    await new Promise(resolve => setTimeout(resolve, Math.min(durationMs, 3000)));

    this.currentMessage = null;
  }

  /**
   * Play music through Google Home Mini
   * @param {string} songName - Name of song to play
   * @param {string} artist - Artist name (optional)
   */
  async playMusic(songName, artist = null) {
    console.log('🎵 Playing music:', songName, artist ? `by ${artist}` : '');

    try {
      // In production, integrate with Google Home/Spotify/YouTube Music API
      const musicEvent = {
        timestamp: new Date().toISOString(),
        song: songName,
        artist: artist,
        status: 'playing'
      };

      this.voiceHistory.push(musicEvent);

      return {
        success: true,
        playing: songName,
        artist: artist
      };
    } catch (error) {
      console.error('Error playing music:', error);
      throw error;
    }
  }

  /**
   * Stop current playback
   */
  async stop() {
    console.log('⏹️  Stopping playback');
    this.currentMessage = null;

    return {
      success: true,
      stopped: true
    };
  }

  /**
   * Queue a message to speak after current message finishes
   */
  async queueMessage(message, options = {}) {
    this.messageQueue.push({ message, options });

    // If nothing is currently playing, start the queue
    if (!this.currentMessage) {
      await this.processQueue();
    }
  }

  /**
   * Process message queue
   */
  async processQueue() {
    while (this.messageQueue.length > 0) {
      const { message, options } = this.messageQueue.shift();
      await this.speak(message, options);
    }
  }

  /**
   * Get voice history
   */
  getHistory(limit = 20) {
    return this.voiceHistory.slice(-limit);
  }

  /**
   * Clear voice history
   */
  clearHistory() {
    this.voiceHistory = [];
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.currentMessage !== null;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isSpeaking: this.isSpeaking(),
      currentMessage: this.currentMessage,
      queueLength: this.messageQueue.length,
      historyCount: this.voiceHistory.length
    };
  }

  /**
   * Generate conversational greeting based on time of day
   */
  generateGreeting(patientName, timeOfDay = null) {
    const hour = timeOfDay || new Date().getHours();

    if (hour < 12) {
      return `Good morning, ${patientName}`;
    } else if (hour < 17) {
      return `Good afternoon, ${patientName}`;
    } else {
      return `Good evening, ${patientName}`;
    }
  }

  /**
   * Generate time orientation message
   */
  generateTimeOrientation(patientName) {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    let timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    let timeStr = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;

    return `${this.generateGreeting(patientName, hour)}, it's ${timeStr} on ${dayName}, ${monthName} ${date}`;
  }
}

module.exports = VoiceService;

/**
 * ElevenLabs Voice Synthesis Service
 * Provides natural, empathetic voice output using ElevenLabs AI
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class ElevenLabsService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel - warm female voice
    this.apiUrl = 'https://api.elevenlabs.io/v1';
    this.audioDir = path.join(__dirname, '../../audio-cache');

    // Create audio cache directory if it doesn't exist
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Synthesize speech using ElevenLabs
   * @param {string} text - Text to convert to speech
   * @param {Object} options - Voice options
   * @returns {Promise<Buffer>} Audio buffer
   */
  async synthesizeSpeech(text, options = {}) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('🎙️  Synthesizing speech with ElevenLabs:', text.substring(0, 50) + '...');

    try {
      const response = await fetch(
        `${this.apiUrl}/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: options.model_id || 'eleven_turbo_v2_5', // Use turbo model - faster and cheaper
            voice_settings: {
              stability: options.stability || 0.5,
              similarity_boost: options.similarity_boost || 0.75,
              style: options.style || 0.0,
              use_speaker_boost: options.use_speaker_boost || true
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
      }

      const audioBuffer = await response.buffer();
      console.log('✅ Speech synthesized successfully');

      return audioBuffer;
    } catch (error) {
      console.error('ElevenLabs synthesis error:', error);
      throw error;
    }
  }

  /**
   * Speak a message using ElevenLabs
   * Saves audio to file and returns path
   */
  async speak(message, options = {}) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `speech_${timestamp}.mp3`;
      const filepath = path.join(this.audioDir, filename);

      // Synthesize speech
      const audioBuffer = await this.synthesizeSpeech(message, options);

      // Save to file
      fs.writeFileSync(filepath, audioBuffer);

      console.log('💾 Audio saved:', filename);

      return {
        success: true,
        message: message,
        audioFile: filepath,
        audioUrl: `/audio/${filename}`,
        method: 'elevenlabs',
        voice: 'Rachel',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in speak:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Get voice settings for specific voice
   */
  async getVoiceSettings(voiceId = null) {
    const voice = voiceId || this.voiceId;

    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}/voices/${voice}/settings`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voice settings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice settings:', error);
      throw error;
    }
  }

  /**
   * Stream audio directly (for real-time playback)
   */
  async streamSpeech(text, options = {}) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(
      `${this.apiUrl}/text-to-speech/${this.voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: options.model_id || 'eleven_monolingual_v1',
          voice_settings: {
            stability: options.stability || 0.5,
            similarity_boost: options.similarity_boost || 0.75
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs stream error: ${response.status}`);
    }

    return response.body;
  }

  /**
   * Clean up old audio files
   */
  cleanupOldAudio(maxAgeMs = 3600000) { // Default: 1 hour
    try {
      const files = fs.readdirSync(this.audioDir);
      const now = Date.now();

      files.forEach(file => {
        const filepath = path.join(this.audioDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtimeMs;

        if (age > maxAgeMs) {
          fs.unlinkSync(filepath);
          console.log('🗑️  Deleted old audio:', file);
        }
      });
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  }
}

module.exports = ElevenLabsService;

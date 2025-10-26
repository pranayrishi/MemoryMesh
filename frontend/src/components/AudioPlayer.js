import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * AudioPlayer Component
 * Handles audio playback from ElevenLabs and browser TTS fallback
 */
function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const ttsTimeoutRef = useRef(null);
  const currentUtteranceRef = useRef(null);

  // Play audio from URL (ElevenLabs)
  const playAudioUrl = (audioUrl, message) => {
    console.log('🔊 Playing audio from URL:', audioUrl);
    setCurrentMessage(message);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(`http://localhost:5000${audioUrl}`);
    audio.volume = isMuted ? 0 : 1.0;
    
    audio.onplay = () => {
      console.log('▶️  Audio playback started');
    };

    audio.onended = () => {
      console.log('✅ Audio playback finished');
      setIsPlaying(false);
      setCurrentMessage('');
    };

    audio.onerror = (error) => {
      console.error('❌ Audio playback error:', error);
      setIsPlaying(false);
      setCurrentMessage('');
      // Fallback to TTS
      playTTS(message, {});
    };

    audioRef.current = audio;
    audio.play().catch(err => {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
      // Fallback to TTS
      playTTS(message, {});
    });
  };

  // Play using browser Text-to-Speech (fallback)
  const playTTS = (message, options = {}) => {
    if (!synthRef.current) {
      console.error('❌ Speech synthesis not supported');
      return;
    }

    console.log('🗣️  Playing with browser TTS:', message);
    console.log('🗣️  Message length:', message.length, 'characters');
    
    // Only cancel if actually speaking
    if (synthRef.current.speaking) {
      console.log('⏹️  Cancelling previous speech...');
      synthRef.current.cancel();
      // Wait a bit for cancel to complete
      setTimeout(() => {
        actuallySpeak(message, options);
      }, 150);
    } else {
      actuallySpeak(message, options);
    }
  };

  // Actual speak function (separated to avoid cancel interference)
  const actuallySpeak = (message, options = {}) => {
    console.log('📝 Creating utterance...');
    
    // Store reference to prevent garbage collection
    const utterance = new SpeechSynthesisUtterance(message);
    currentUtteranceRef.current = utterance;
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    console.log('🔊 TTS Settings:', {
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
      lang: utterance.lang
    });

    // Get voices
    const voices = synthRef.current.getVoices();
    console.log(`📋 Available voices: ${voices.length}`);
    
    if (voices.length > 0) {
      // Try to find Samantha specifically (macOS default)
      let selectedVoice = voices.find(v => v.name === 'Samantha');
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('victoria') ||
          voice.name.toLowerCase().includes('karen')
        );
      }

      if (!selectedVoice) {
        selectedVoice = voices[0];
      }

      utterance.voice = selectedVoice;
      console.log('🎙️  Using voice:', selectedVoice.name);
    }

    // Event handlers
    utterance.onstart = (event) => {
      console.log('▶️  TTS STARTED - AUDIO PLAYING NOW!');
      console.log('   Event:', event);
      setIsPlaying(true);
      setCurrentMessage(message);
    };

    utterance.onend = (event) => {
      console.log('✅ TTS finished normally');
      console.log('   Event:', event);
      setIsPlaying(false);
      setCurrentMessage('');
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('❌ TTS error:', event);
      console.error('   Error type:', event.error);
      console.error('   Char index:', event.charIndex);
      
      // Don't treat 'interrupted' as fatal if we're the ones interrupting
      if (event.error !== 'interrupted') {
        setIsPlaying(false);
        setCurrentMessage('');
      }
      currentUtteranceRef.current = null;
    };

    utterance.onpause = (event) => {
      console.log('⏸️  TTS paused');
    };

    utterance.onresume = (event) => {
      console.log('▶️  TTS resumed');
    };

    // Speak
    console.log('🔍 Before speak:', {
      speaking: synthRef.current.speaking,
      pending: synthRef.current.pending,
      paused: synthRef.current.paused
    });

    try {
      // Clear the queue first
      if (synthRef.current.pending) {
        console.log('⚠️  Clearing pending queue...');
      }
      
      synthRef.current.speak(utterance);
      console.log('✅ speak() called - utterance queued');
      
      // Monitor state
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        const state = {
          speaking: synthRef.current.speaking,
          pending: synthRef.current.pending,
          paused: synthRef.current.paused
        };
        console.log(`🔍 State check ${checkCount}:`, state);
        
        if (checkCount >= 5 || (!state.speaking && !state.pending)) {
          clearInterval(checkInterval);
        }
      }, 200);
      
    } catch (err) {
      console.error('❌ Failed to speak:', err);
      setIsPlaying(false);
      setCurrentMessage('');
    }
  };

  // Stop current playback
  const stopPlayback = () => {
    // Clear any pending TTS timeout
    if (ttsTimeoutRef.current) {
      clearTimeout(ttsTimeoutRef.current);
      ttsTimeoutRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentMessage('');
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : 1.0;
    }
  };

  // Expose playback functions globally for websocket handlers
  useEffect(() => {
    window.audioPlayer = {
      playAudioUrl,
      playTTS,
      stopPlayback,
      isPlaying
    };

    return () => {
      stopPlayback();
      delete window.audioPlayer;
    };
  }, [isPlaying, isMuted]);

  // Load voices when component mounts
  useEffect(() => {
    if (synthRef.current) {
      // Load voices
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        console.log(`🎙️  Loaded ${voices.length} TTS voices`);
        if (voices.length > 0) {
          console.log('Available voices:', voices.map(v => v.name).join(', '));
        }
      };

      // Voices might load asynchronously
      if (synthRef.current.getVoices().length > 0) {
        loadVoices();
      } else {
        synthRef.current.addEventListener('voiceschanged', loadVoices);
      }
    }
  }, []);

  // Test TTS function
  const testTTS = () => {
    console.log('🧪 Testing TTS with user interaction...');
    playTTS('Testing audio playback. If you can hear this, the audio system is working correctly.');
  };

  return (
    <>
      {/* Test Button - Always visible for debugging */}
      <button
        onClick={testTTS}
        className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50 text-sm font-medium"
        title="Test Audio Playback"
      >
        🔊 Test Audio
      </button>

      {/* Audio Playing Indicator */}
      {(isPlaying || currentMessage) && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-pulse z-50">
          <Volume2 className="w-5 h-5" />
          <div className="flex-1">
            <div className="text-sm font-medium">AI Speaking</div>
            <div className="text-xs opacity-90 max-w-xs truncate">
              {currentMessage}
            </div>
          </div>
          <button
            onClick={toggleMute}
            className="p-1 hover:bg-purple-700 rounded transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </>
  );
}

export default AudioPlayer;

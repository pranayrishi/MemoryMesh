import React, { useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

/**
 * SimpleTTS - Bulletproof Text-to-Speech Component
 * No interference, no cancellation, just works
 */
function SimpleTTS() {
  const utteranceRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastMessageRef = useRef('');
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Initialize once
    if (!isInitializedRef.current) {
      console.log('🎙️  SimpleTTS initialized');
      isInitializedRef.current = true;
      
      // Load voices
      const synth = window.speechSynthesis;
      const loadVoices = () => {
        const voices = synth.getVoices();
        console.log(`✅ Loaded ${voices.length} voices`);
      };
      
      if (synth.getVoices().length > 0) {
        loadVoices();
      } else {
        synth.addEventListener('voiceschanged', loadVoices);
      }
    }

    // Global function to speak with delay
    window.simpleTTSSpeak = (message, delaySeconds = 24) => {
      // Prevent duplicate messages
      if (message === lastMessageRef.current && isSpeakingRef.current) {
        console.log('⏭️  Skipping duplicate message');
        return;
      }
      
      lastMessageRef.current = message;
      
      console.log(`🔊 SimpleTTS will speak in ${delaySeconds}s:`, message.substring(0, 50) + '...');
      
      // Delay before speaking (to sync with video)
      setTimeout(() => {
        console.log('🎙️  Now speaking...');
        speakNow(message);
      }, delaySeconds * 1000);
    };

    // Actual speak function
    const speakNow = (message) => {
      if (isSpeakingRef.current) {
        console.log('⏭️  Already speaking, skipping');
        return;
      }
      
      isSpeakingRef.current = true;
      const synth = window.speechSynthesis;
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(message);
      utteranceRef.current = utterance;
      
      // Settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      // Select voice
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const voice = voices.find(v => v.name === 'Samantha') || voices[0];
        utterance.voice = voice;
        console.log('🎤 Voice:', voice.name);
      }
      
      // Events
      utterance.onstart = () => {
        console.log('▶️  SPEAKING NOW!');
      };
      
      utterance.onend = () => {
        console.log('✅ Speech finished');
        isSpeakingRef.current = false;
        lastMessageRef.current = ''; // Reset after speaking
      };
      
      utterance.onerror = (e) => {
        console.error('❌ Speech error:', e.error);
        isSpeakingRef.current = false;
      };
      
      // Speak
      synth.speak(utterance);
      console.log('✅ Utterance queued');
    };

    return () => {
      // Cleanup
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return null; // Hidden - ElevenLabs is working
}

export default SimpleTTS;

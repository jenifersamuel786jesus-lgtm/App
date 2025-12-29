import { useCallback, useEffect, useState } from 'react';

interface WhisperOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

interface UseWhisperReturn {
  whisper: (text: string, options?: WhisperOptions) => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  isSpeaking: boolean;
  stop: () => void;
}

/**
 * Custom hook for text-to-speech whisper functionality
 * Provides audio feedback throughout the application for Alzheimer's patients
 */
export function useWhisper(): UseWhisperReturn {
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('whisper_enabled');
    return saved !== null ? saved === 'true' : true; // Default: enabled
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastWhisper, setLastWhisper] = useState<{ text: string; time: number }>({ text: '', time: 0 });

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('whisper_enabled', String(isEnabled));
  }, [isEnabled]);

  // Monitor speech synthesis state
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const checkSpeaking = () => {
        setIsSpeaking(window.speechSynthesis.speaking);
      };
      
      const interval = setInterval(checkSpeaking, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const setIsEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const whisper = useCallback((text: string, options: WhisperOptions = {}) => {
    if (!isEnabled || !text.trim()) return;

    // Prevent duplicate whispers within 3 seconds
    const now = Date.now();
    if (lastWhisper.text === text && now - lastWhisper.time < 3000) {
      return;
    }

    setLastWhisper({ text, time: now });

    // Check if Web Speech API is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options with defaults for "whisper" effect
    utterance.rate = options.rate ?? 0.9;      // Slightly slower for clarity
    utterance.pitch = options.pitch ?? 1.0;    // Normal pitch
    utterance.volume = options.volume ?? 0.7;  // Softer volume for whisper
    utterance.lang = options.lang ?? 'en-US';  // English by default

    // Try to use a calm, friendly voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer female voices as they tend to be calmer
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (
          voice.name.includes('Female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Victoria')
        )
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  }, [isEnabled, lastWhisper]);

  return {
    whisper,
    isEnabled,
    setIsEnabled,
    isSpeaking,
    stop,
  };
}

/**
 * Utility function for one-off whispers without hook
 */
export function whisperOnce(text: string, options: WhisperOptions = {}): void {
  const enabled = localStorage.getItem('whisper_enabled') !== 'false';
  if (!enabled || !text.trim()) return;

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 0.7;
    utterance.lang = options.lang ?? 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }
}

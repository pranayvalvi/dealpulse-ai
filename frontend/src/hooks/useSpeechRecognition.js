import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognition.onend = () => {
      // If it stopped but we still want to record (e.g., browser paused it), restart it
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Error restarting recognition:", e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Run only once on mount

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setTranscript('');
    setIsRecording(true);
    isRecordingRef.current = true;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting recognition:", e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setIsRecording(false);
    isRecordingRef.current = false;
    recognitionRef.current.stop();
  }, []);

  return {
    transcript,
    setTranscript,
    isRecording,
    startRecording,
    stopRecording
  };
};

export default useSpeechRecognition;

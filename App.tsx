
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppStatus } from './types';
import { extractTextFromImage } from './services/geminiService';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
import Loader from './components/Loader';
import TextView from './components/TextView';
import AudioControls from './components/AudioControls';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [extractedText, setExtractedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const handleVoicesChanged = () => {
      if (!window.speechSynthesis) return;
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      setVoices(englishVoices);

      setSelectedVoice(currentSelected => {
        if (englishVoices.length > 0) {
            const isSelectedValid = currentSelected && englishVoices.some(v => v.voiceURI === currentSelected.voiceURI);
            if (!isSelectedValid) {
                return englishVoices.find(v => v.default) || englishVoices[0];
            }
        }
        return currentSelected;
      });
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); // Initial call in case voices are already loaded

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handleImageReady = useCallback(async (base64Image: string, mimeType: string) => {
    setStatus(AppStatus.PROCESSING);
    setError(null);
    try {
      const text = await extractTextFromImage(base64Image, mimeType);
      if (!text || text.trim().length === 0) {
        throw new Error("Could not extract any text from the document. Please try again with a clearer image.");
      }
      setExtractedText(text);
      setStatus(AppStatus.READY);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process document: ${errorMessage}`);
      setStatus(AppStatus.ERROR);
    }
  }, []);
  
  const handleStop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setStatus(AppStatus.READY);
    }
  }, []);
  
  const handleVoiceChange = useCallback((voiceURI: string) => {
      const voice = voices.find(v => v.voiceURI === voiceURI);
      if (voice) {
        setSelectedVoice(voice);
        if (status === AppStatus.PLAYING || status === AppStatus.PAUSED) {
            handleStop();
        }
      }
    }, [voices, status, handleStop]);

  const handlePlayback = useCallback(() => {
    if (!extractedText || !window.speechSynthesis || !selectedVoice) return;

    if (status === AppStatus.PAUSED) {
      window.speechSynthesis.resume();
      setStatus(AppStatus.PLAYING);
      return;
    }

    window.speechSynthesis.cancel();

    const newUtterance = new SpeechSynthesisUtterance(extractedText);
    newUtterance.voice = selectedVoice;
    utteranceRef.current = newUtterance;
    
    newUtterance.onstart = () => setStatus(AppStatus.PLAYING);
    newUtterance.onpause = () => setStatus(AppStatus.PAUSED);
    newUtterance.onresume = () => setStatus(AppStatus.PLAYING);
    newUtterance.onend = () => setStatus(AppStatus.READY);
    newUtterance.onerror = (event) => {
      console.error("Speech synthesis error", event);
      setError("An error occurred during speech playback.");
      setStatus(AppStatus.ERROR);
    };

    window.speechSynthesis.speak(newUtterance);
  }, [extractedText, status, selectedVoice]);

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus(AppStatus.PAUSED);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setExtractedText('');
    setStatus(AppStatus.IDLE);
    setError(null);
    utteranceRef.current = null;
  }, []);

  const renderContent = () => {
    switch (status) {
      case AppStatus.PROCESSING:
        return <Loader message="Analyzing your document..." />;
      case AppStatus.READY:
      case AppStatus.PLAYING:
      case AppStatus.PAUSED:
        return (
          <>
            <TextView text={extractedText} />
            <AudioControls
              status={status}
              onPlay={handlePlayback}
              onPause={handlePause}
              onStop={handleStop}
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceChange={handleVoiceChange}
            />
          </>
        );
      case AppStatus.ERROR:
        return <ErrorDisplay message={error || 'An unexpected error occurred.'} />;
      case AppStatus.IDLE:
      default:
        return <ImageInput onImageReady={handleImageReady} setStatus={setStatus} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <Header onReset={handleReset} showReset={status !== AppStatus.IDLE && status !== AppStatus.PROCESSING} />
        <main className="flex-grow flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 sm:p-10 mt-6 border border-slate-200">
          {renderContent()}
        </main>
        <footer className="text-center text-slate-500 mt-6 text-sm">
          <p>Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

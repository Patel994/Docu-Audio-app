
import React from 'react';
import { AppStatus } from '../types';
import { IconPlay, IconPause, IconStop } from './Icons';

interface AudioControlsProps {
  status: AppStatus;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voiceURI: string) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ status, onPlay, onPause, onStop, voices, selectedVoice, onVoiceChange }) => {
  const isPlaying = status === AppStatus.PLAYING;
  
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div className="w-full mt-6 pt-6 border-t border-slate-200 flex flex-col items-center">
        {voices.length > 0 && (
            <div className="w-full max-w-xs mb-6 text-left">
                <label htmlFor="voice-select" className="block text-sm font-medium text-slate-700 mb-1">
                    Select a Voice
                </label>
                <select
                    id="voice-select"
                    value={selectedVoice?.voiceURI || ''}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    aria-label="Select a voice for audio playback"
                >
                    {voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                            {voice.name}
                        </option>
                    ))}
                </select>
            </div>
        )}
        <p className="text-sm text-slate-500 mb-4">Playback Controls</p>
        <div className="flex items-center gap-4">
            <button
            onClick={onStop}
            className="p-4 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors disabled:opacity-50"
            disabled={status === AppStatus.READY}
            aria-label="Stop playback"
            >
                <IconStop className="w-6 h-6" />
            </button>
            <button
                onClick={handlePlayPause}
                className="p-5 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-transform active:scale-95 shadow-lg"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <IconPause className="w-8 h-8" /> : <IconPlay className="w-8 h-8" />}
            </button>
            <div className="w-14 h-14"></div>
        </div>
    </div>
  );
};

export default AudioControls;

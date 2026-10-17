import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Share2,
  ChevronUp,
  ChevronDown,
  Download
} from 'lucide-react';
import { DownloadedTrack } from '../types';

interface BottomPlayerProps {
  currentTrack: DownloadedTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  isShuffle: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onSetVolume: (vol: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isLooping,
  isShuffle,
  onTogglePlay,
  onSeek,
  onPlayNext,
  onPlayPrev,
  onToggleLoop,
  onToggleShuffle,
  onSetVolume,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleShare = async () => {
    try {
      if (currentTrack.audioBlob && navigator.canShare) {
        const file = new File([currentTrack.audioBlob], `${currentTrack.title}.mp3`, {
          type: 'audio/mpeg',
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: currentTrack.title,
            text: `Listening to "${currentTrack.title}" on SoundDrop`,
            files: [file],
          });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({
          title: currentTrack.title,
          text: `Music: ${currentTrack.title}`,
          url: currentTrack.originalUrl,
        });
      }
    } catch (e) {
      console.warn('Share cancelled:', e);
    }
  };

  const handleDownloadFile = () => {
    const downloadUrl = currentTrack.localAudioUrl || `/api/download/${currentTrack.id}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${currentTrack.title.replace(/[^a-zA-Z0-9-_ ]/g, '')}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Docked Mini Player Bar (Light Theme) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/90 backdrop-blur-xl shadow-xl safe-bottom">
        {/* Top Hairline Progress Bar */}
        <div
          className="w-full h-1 bg-slate-200 cursor-pointer relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPct = clickX / rect.width;
            onSeek(newPct * (duration || 1));
          }}
        >
          <div
            className="h-full bg-blue-600 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Left: Thumbnail & Title */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/icon.svg';
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {currentTrack.artist}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                <span className="text-blue-600 font-bold">{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Right: Touch Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onPlayPrev}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-900 transition active:scale-90"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="min-w-[44px] min-h-[44px] rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-600/30 transition active:scale-90"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onPlayNext}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-900 transition active:scale-90"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setIsExpanded(true)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-800 transition"
              title="Expand player"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Expanded Now Playing Drawer (Light Theme) */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-6 animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Now Playing Offline
              </span>
              <p className="text-xs text-slate-500 font-mono">{currentTrack.bitrate} MP3</p>
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Big Artwork & Wave Animation */}
          <div className="flex-1 flex flex-col items-center justify-center my-6 space-y-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/icon.svg';
                }}
              />
            </div>

            {/* Track Title & Artist */}
            <div className="text-center max-w-sm px-4">
              <h2 className="text-lg font-bold text-slate-900 truncate">{currentTrack.title}</h2>
              <p className="text-sm text-slate-500 truncate mt-1">{currentTrack.artist}</p>
            </div>

            {/* Simulated Audio Frequency Visualizer */}
            {isPlaying && (
              <div className="flex items-end justify-center gap-1.5 h-8">
                {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-600 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i % 4) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Scrubber Slider & Timing */}
          <div className="space-y-4 max-w-md mx-auto w-full">
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between px-4">
              <button
                onClick={onToggleShuffle}
                className={`p-2 rounded-xl transition ${
                  isShuffle ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={onPlayPrev}
                className="p-3 text-slate-700 hover:text-slate-900 transition active:scale-95"
                title="Previous"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition active:scale-90"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={onPlayNext}
                className="p-3 text-slate-700 hover:text-slate-900 transition active:scale-95"
                title="Next"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={onToggleLoop}
                className={`p-2 rounded-xl transition ${
                  isLooping ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
                }`}
                title="Loop track"
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume & Save */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSetVolume(volume === 0 ? 1 : 0)}
                  className="p-2 text-slate-500 hover:text-slate-800"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                  className="w-20 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Files</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

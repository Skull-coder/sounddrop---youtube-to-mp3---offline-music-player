import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Clipboard,
  X,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ListMusic
} from 'lucide-react';
import { AudioBitrate, VideoInfo, QueueItem } from '../types';
import { fetchVideoInfo } from '../services/api';
import { PlayStoreCircularProgress } from './PlayStoreCircularProgress';

interface ConverterSectionProps {
  queue: QueueItem[];
  onAddToQueue: (videoInfo: VideoInfo, bitrate: AudioBitrate) => void;
  onCancelQueueItem: (id: string) => void;
  onRetryQueueItem: (id: string) => void;
  onGoToLibrary: () => void;
}

export const ConverterSection: React.FC<ConverterSectionProps> = ({
  queue,
  onAddToQueue,
  onCancelQueueItem,
  onRetryQueueItem,
  onGoToLibrary,
}) => {
  const [url, setUrl] = useState('');
  const [bitrate, setBitrate] = useState<AudioBitrate>('192k');
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [justAddedTitle, setJustAddedTitle] = useState<string | null>(null);

  // Auto-fetch info when a valid YouTube URL is entered
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setVideoInfo(null);
      setInfoError(null);
      return;
    }

    const isYoutube =
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      /^[a-zA-Z0-9_-]{11}$/.test(trimmed);

    if (isYoutube) {
      const timer = setTimeout(() => {
        loadVideoInfo(trimmed);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [url]);

  const loadVideoInfo = async (targetUrl: string) => {
    setIsLoadingInfo(true);
    setInfoError(null);
    try {
      const info = await fetchVideoInfo(targetUrl);
      setVideoInfo(info);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not fetch video info.';
      setInfoError(message);
      setVideoInfo(null);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleClear = () => {
    setUrl('');
    setVideoInfo(null);
    setInfoError(null);
  };

  const handleQueueSong = () => {
    if (!videoInfo) return;

    onAddToQueue(videoInfo, bitrate);
    setJustAddedTitle(videoInfo.title);
    setTimeout(() => setJustAddedTitle(null), 3000);

    // Reset URL input so user can queue another song immediately
    setUrl('');
    setVideoInfo(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
      {/* Starting Input Card (shadcn / Android Light Theme) */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Paste YouTube Share Link
        </label>

        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <LinkIcon className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtu.be/... or youtube.com"
            className="w-full pl-10 pr-20 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-xs"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Preview */}
        {isLoadingInfo && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Fetching video details...</span>
          </div>
        )}

        {infoError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-700 p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{infoError}</span>
          </div>
        )}

        {videoInfo && !isLoadingInfo && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <img
              src={videoInfo.thumbnailUrl}
              alt={videoInfo.title}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/icon.svg';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate leading-snug">
                {videoInfo.title}
              </h3>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                {videoInfo.author}
              </p>
              <span className="inline-block text-[10px] text-blue-700 font-semibold font-mono mt-1">
                Authentic Audio Ready
              </span>
            </div>
          </div>
        )}

        {/* Audio Quality / Bitrate Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800">Audio Quality</span>
            <span className="text-[10px] text-slate-500 font-medium">Default: 192 kbps</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { rate: '128k' as const, label: '128k', desc: 'Fast & Light', isDefault: false },
              { rate: '192k' as const, label: '192k', desc: 'Default (Balanced)', isDefault: true },
              { rate: '320k' as const, label: '320k', desc: 'Studio HD', isDefault: false },
            ].map((opt) => (
              <button
                key={opt.rate}
                type="button"
                onClick={() => setBitrate(opt.rate)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                  bitrate === opt.rate
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {opt.isDefault && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-none">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add to Queue Action Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleQueueSong}
            disabled={!videoInfo || isLoadingInfo}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs ${
              !videoInfo || isLoadingInfo
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-[0.98]'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add to Download Queue</span>
          </button>
        </div>

        {justAddedTitle && (
          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-800 animate-in fade-in">
            ✓ Added &quot;{justAddedTitle}&quot; to download queue!
          </div>
        )}
      </div>

      {/* Currently Downloading Queue Section (Directly below Audio Quality) */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Currently Downloading ({queue.length})
            </h3>
            {queue.some((i) => i.status === 'downloading' || i.status === 'converting') && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Sequential Queue</span>
        </div>

        {/* Queue Items List */}
        {queue.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-600">No active downloads</p>
            <p className="text-[11px] text-slate-400">
              Paste YouTube links above and tap Add to Queue. You can queue multiple songs!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queue.map((item) => {
              const isDownloading = item.status === 'downloading';
              const isConverting = item.status === 'converting' || item.status === 'saving';
              const isWaiting = item.status === 'waiting';
              const isError = item.status === 'error';

              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-all"
                >
                  {/* Left: Thumbnail & Song Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/icon.svg';
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.artist}
                      </p>

                      {/* Download Status & Size indicator */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono mt-1">
                        {isDownloading && (
                          <span className="text-blue-700 font-bold">
                            {item.downloadedFormatted} / {item.totalFormatted}
                          </span>
                        )}
                        {isConverting && (
                          <span className="text-indigo-600 font-bold">
                            FFmpeg Encoding · {item.bitrate}
                          </span>
                        )}
                        {isWaiting && (
                          <span className="text-slate-400 font-medium">
                            Queued · In line ({item.bitrate})
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="text-emerald-600 font-bold">
                            100% · Moving to My Music
                          </span>
                        )}
                        {isError && (
                          <span className="text-rose-600 font-bold truncate">
                            {item.errorMessage || 'Failed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Google Play Store Circular Progress Indicator */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isError ? (
                      <button
                        onClick={() => onRetryQueueItem(item.id)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95"
                        title="Retry download"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <PlayStoreCircularProgress
                        percent={item.percent}
                        status={item.status}
                        onCancel={() => onCancelQueueItem(item.id)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful Android Tip Card */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-blue-900 text-xs">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-blue-950">Background Processing:</strong> Active downloads continue uninterrupted even if you switch tabs or leave this page. All completed tracks appear in <strong className="text-blue-950">My Music</strong>!
        </p>
      </div>
    </div>
  );
};

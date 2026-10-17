import React, { useState } from 'react';
import {
  Play,
  Pause,
  Share2,
  Trash2,
  Download,
  Search,
  Music,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { DownloadedTrack } from '../types';

interface LibrarySectionProps {
  tracks: DownloadedTrack[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: DownloadedTrack, playlist?: DownloadedTrack[]) => void;
  onTogglePlay: () => void;
  onDeleteTrack: (trackId: string) => void;
  onGoToConverter: () => void;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onDeleteTrack,
  onGoToConverter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTracks = tracks.filter((track) => {
    const q = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q)
    );
  });

  const handleShare = async (track: DownloadedTrack) => {
    try {
      if (track.audioBlob && navigator.canShare) {
        const file = new File([track.audioBlob], `${track.title}.mp3`, {
          type: 'audio/mpeg',
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: track.title,
            text: `Listen to "${track.title}" by ${track.artist}`,
            files: [file],
          });
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `Music: ${track.title} (${track.artist}) - SoundDrop`,
          url: track.originalUrl,
        });
      } else {
        await navigator.clipboard.writeText(track.originalUrl);
        alert('Song link copied to clipboard!');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('Share cancelled or failed:', err);
      }
    }
  };

  const handleSaveToDevice = (track: DownloadedTrack) => {
    const downloadUrl = track.localAudioUrl || `/api/download/${track.id}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${track.title.replace(/[^a-zA-Z0-9-_ ]/g, '')}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-3 pb-32">
      {/* Header & Search */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Downloaded Music</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-blue-700 font-mono font-bold">
              {tracks.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Stored offline on this device</p>
        </div>

        <button
          onClick={onGoToConverter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Song</span>
        </button>
      </div>

      {/* Search Input */}
      {tracks.length > 1 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your music..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition shadow-2xs"
          />
        </div>
      )}

      {/* Empty State */}
      {tracks.length === 0 && (
        <div className="p-8 text-center bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Music className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No downloaded music yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Paste YouTube share links in the Convert tab to download authentic MP3s and play offline anytime.
            </p>
          </div>
          <button
            onClick={onGoToConverter}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Convert YouTube Music Now</span>
          </button>
        </div>
      )}

      {/* Track List */}
      {filteredTracks.length > 0 && (
        <div className="space-y-2">
          {filteredTracks.map((track) => {
            const isThisTrackPlaying = currentTrackId === track.id && isPlaying;
            const isThisTrackSelected = currentTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isThisTrackSelected
                    ? 'bg-blue-50/60 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail with Play/Pause button */}
                  <div
                    onClick={() => {
                      if (isThisTrackSelected) {
                        onTogglePlay();
                      } else {
                        onPlayTrack(track, filteredTracks);
                      }
                    }}
                    className="relative w-13 h-13 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group"
                  >
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/icon.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition">
                      {isThisTrackPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (isThisTrackSelected) {
                        onTogglePlay();
                      } else {
                        onPlayTrack(track, filteredTracks);
                      }
                    }}
                  >
                    <h4
                      className={`text-xs font-bold truncate leading-snug ${
                        isThisTrackSelected ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {track.artist}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-mono">
                      <span className="text-blue-700 font-bold">{track.bitrate}</span>
                      <span>·</span>
                      <span>{track.fileSizeFormatted}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {track.durationFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Share, Save to phone, Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShare(track)}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition active:scale-90"
                      title="Share to WhatsApp, Telegram, or Apps"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSaveToDevice(track)}
                      className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition active:scale-90"
                      title="Save MP3 file to Device Downloads"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (deletingId === track.id) {
                          onDeleteTrack(track.id);
                          setDeletingId(null);
                        } else {
                          setDeletingId(track.id);
                          setTimeout(() => setDeletingId(null), 3000);
                        }
                      }}
                      className={`p-2 rounded-lg transition active:scale-90 ${
                        deletingId === track.id
                          ? 'bg-rose-100 text-rose-700 font-bold text-[10px]'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title={deletingId === track.id ? 'Tap again to delete' : 'Delete track'}
                    >
                      {deletingId === track.id ? (
                        <span>Confirm?</span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

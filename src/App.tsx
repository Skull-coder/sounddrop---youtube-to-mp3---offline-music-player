import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { SegmentedTabs } from './components/SegmentedTabs';
import { ConverterSection } from './components/ConverterSection';
import { LibrarySection } from './components/LibrarySection';
import { BottomPlayer } from './components/BottomPlayer';
import { InstallModal } from './components/InstallModal';
import { DownloadedTrack } from './types';
import { getDownloadedTracks, deleteTrack as storageDeleteTrack } from './services/storage';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useDownloadQueue } from './hooks/useDownloadQueue';

export default function App() {
  const [activeTab, setActiveTab] = useState<'convert' | 'library'>('convert');
  const [tracks, setTracks] = useState<DownloadedTrack[]>([]);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const player = useAudioPlayer();

  // Load saved tracks from IndexedDB on startup
  useEffect(() => {
    async function loadTracks() {
      try {
        const stored = await getDownloadedTracks();
        setTracks(stored);
        player.setPlaylist(stored);
      } catch (err) {
        console.error('Failed to load tracks from IndexedDB:', err);
      }
    }
    loadTracks();
  }, []);

  const handleTrackSaved = useCallback((newTrack: DownloadedTrack) => {
    setTracks((prev) => {
      const filtered = prev.filter((t) => t.id !== newTrack.id);
      const updated = [newTrack, ...filtered];
      player.setPlaylist(updated);
      return updated;
    });
  }, [player]);

  // Root-level Background Sequential Download Queue Manager
  const downloadQueue = useDownloadQueue(handleTrackSaved);

  const handleDeleteTrack = useCallback(async (trackId: string) => {
    try {
      await storageDeleteTrack(trackId);
      setTracks((prev) => {
        const updated = prev.filter((t) => t.id !== trackId);
        player.setPlaylist(updated);
        return updated;
      });
      if (player.currentTrack?.id === trackId) {
        player.playNext();
      }
    } catch (err) {
      console.error('Failed to delete track:', err);
    }
  }, [player]);

  const handlePlayTrack = useCallback((track: DownloadedTrack, playlist?: DownloadedTrack[]) => {
    player.playTrack(track, playlist || tracks);
  }, [player, tracks]);

  const activeQueueCount = downloadQueue.queue.filter(
    (item) => item.status === 'downloading' || item.status === 'converting' || item.status === 'waiting'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Top Bar */}
      <TopBar
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        trackCount={tracks.length}
        activeQueueCount={activeQueueCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col pb-28">
        {/* Switcher: Converter vs My Music */}
        <SegmentedTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          trackCount={tracks.length}
          activeQueueCount={activeQueueCount}
        />

        {/* Active Section */}
        {activeTab === 'convert' ? (
          <ConverterSection
            queue={downloadQueue.queue}
            onAddToQueue={downloadQueue.addToQueue}
            onCancelQueueItem={downloadQueue.cancelQueueItem}
            onRetryQueueItem={downloadQueue.retryQueueItem}
            onGoToLibrary={() => setActiveTab('library')}
          />
        ) : (
          <LibrarySection
            tracks={tracks}
            currentTrackId={player.currentTrack?.id || null}
            isPlaying={player.isPlaying}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={player.togglePlay}
            onDeleteTrack={handleDeleteTrack}
            onGoToConverter={() => setActiveTab('convert')}
          />
        )}
      </main>

      {/* Persistent Docked Audio Player */}
      <BottomPlayer
        currentTrack={player.currentTrack}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isLooping={player.isLooping}
        isShuffle={player.isShuffle}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onPlayNext={player.playNext}
        onPlayPrev={player.playPrev}
        onToggleLoop={player.toggleLoop}
        onToggleShuffle={player.toggleShuffle}
        onSetVolume={player.setVolume}
      />

      {/* Install App & Expo APK Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

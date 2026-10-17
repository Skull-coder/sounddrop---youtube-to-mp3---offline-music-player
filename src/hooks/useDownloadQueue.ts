import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { QueueItem, AudioBitrate, VideoInfo, DownloadedTrack } from '../types';
import { convertVideo, pollJobProgress, downloadAudioBlob } from '../services/api';
import { saveTrack } from '../services/storage';

const QUEUE_STORAGE_KEY = 'sounddrop_active_queue_v1';

export function useDownloadQueue(onTrackCompleted: (track: DownloadedTrack) => void) {
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QueueItem[];
        // Reset any interrupted active items back to 'waiting' so they resume
        return parsed.map((item) =>
          item.status === 'downloading' || item.status === 'converting' || item.status === 'saving'
            ? { ...item, status: 'waiting', percent: 0 }
            : item
        );
      }
    } catch (e) {
      console.warn('Failed to parse saved queue:', e);
    }
    return [];
  });

  const isProcessingRef = useRef(false);

  // Sync queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to persist queue to localStorage:', e);
    }
  }, [queue]);

  const addToQueue = useCallback((videoInfo: VideoInfo, bitrate: AudioBitrate) => {
    const newItem: QueueItem = {
      id: `${videoInfo.id}_${bitrate}_${Date.now()}`,
      videoId: videoInfo.id,
      url: videoInfo.originalUrl,
      title: videoInfo.title,
      artist: videoInfo.author,
      thumbnailUrl: videoInfo.thumbnailUrl,
      bitrate,
      status: 'waiting',
      percent: 0,
      downloadedBytes: 0,
      totalBytes: 4500000,
      downloadedFormatted: '0 B',
      totalFormatted: '4.5 MB',
      retryCount: 0,
      addedAt: Date.now(),
    };

    setQueue((prev) => [...prev, newItem]);
  }, []);

  const cancelQueueItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const retryQueueItem = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'waiting', percent: 0, errorMessage: undefined } : item
      )
    );
  }, []);

  // Background Sequential Worker Loop
  useEffect(() => {
    if (isProcessingRef.current) return;

    const nextItem = queue.find((item) => item.status === 'waiting');
    if (!nextItem) return;

    const activeItem = nextItem;
    isProcessingRef.current = true;
    const currentId = activeItem.id;

    // Set to downloading
    setQueue((prev) =>
      prev.map((item) =>
        item.id === currentId ? { ...item, status: 'downloading', percent: 5 } : item
      )
    );

    let progressInterval: NodeJS.Timeout | null = null;

    async function processCurrentItem() {
      try {
        // Start conversion
        const convertPromise = convertVideo(activeItem.url, activeItem.bitrate);

        // Simulated/Polled progress ticker
        let simulatedPct = 8;
        progressInterval = setInterval(() => {
          simulatedPct = Math.min(88, simulatedPct + Math.floor(Math.random() * 6) + 3);
          const simulatedDownloaded = Math.floor((simulatedPct / 100) * 4500000);
          setQueue((prev) =>
            prev.map((item) => {
              if (item.id === currentId && item.status === 'downloading') {
                return {
                  ...item,
                  percent: simulatedPct,
                  downloadedBytes: simulatedDownloaded,
                  downloadedFormatted: `${(simulatedDownloaded / (1024 * 1024)).toFixed(1)} MB`,
                  totalFormatted: '4.5 MB',
                };
              }
              return item;
            })
          );
        }, 1200);

        const res = await convertPromise;

        if (progressInterval) clearInterval(progressInterval);

        // Converting & Saving phase
        setQueue((prev) =>
          prev.map((item) =>
            item.id === currentId
              ? {
                  ...item,
                  status: 'saving',
                  percent: 92,
                  downloadedFormatted: res.fileSizeFormatted,
                  totalFormatted: res.fileSizeFormatted,
                }
              : item
          )
        );

        // Fetch audio blob and store in IndexedDB
        const audioBlob = await downloadAudioBlob(res.downloadUrl);
        const localAudioUrl = URL.createObjectURL(audioBlob);

        const completedTrack: DownloadedTrack = {
          id: res.trackId,
          videoId: activeItem.videoId,
          title: res.title || activeItem.title,
          artist: res.artist || activeItem.artist,
          thumbnailUrl: res.thumbnailUrl || activeItem.thumbnailUrl,
          bitrate: res.bitrate,
          fileSizeFormatted: res.fileSizeFormatted,
          durationFormatted: res.durationFormatted || '3:30',
          durationSeconds: res.durationSeconds || 210,
          downloadedAt: Date.now(),
          originalUrl: activeItem.url,
          audioBlob,
          localAudioUrl,
        };

        await saveTrack(completedTrack, audioBlob);
        onTrackCompleted(completedTrack);

        // Set to completed (100%)
        setQueue((prev) =>
          prev.map((item) =>
            item.id === currentId
              ? {
                  ...item,
                  status: 'completed',
                  percent: 100,
                  downloadedFormatted: res.fileSizeFormatted,
                  totalFormatted: res.fileSizeFormatted,
                }
              : item
          )
        );

        // Fire celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#10B981', '#F59E0B'],
        });

        // After a smooth 2.5s transition, remove from queue so user saw the 100% checkmark
        setTimeout(() => {
          setQueue((prev) => prev.filter((item) => item.id !== currentId));
        }, 2500);
      } catch (err: unknown) {
        if (progressInterval) clearInterval(progressInterval);
        const errorMsg = err instanceof Error ? err.message : 'Download failed';
        console.error('Queue processing error:', err);

        setQueue((prev) =>
          prev.map((item) =>
            item.id === currentId
              ? {
                  ...item,
                  status: 'error',
                  errorMessage: errorMsg,
                }
              : item
          )
        );
      } finally {
        if (progressInterval) clearInterval(progressInterval);
        isProcessingRef.current = false;
      }
    }

    processCurrentItem();
  }, [queue, onTrackCompleted]);

  return {
    queue,
    addToQueue,
    cancelQueueItem,
    retryQueueItem,
  };
}

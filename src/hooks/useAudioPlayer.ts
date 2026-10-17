import { useState, useEffect, useRef, useCallback } from 'react';
import { DownloadedTrack } from '../types';

export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<DownloadedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState<DownloadedTrack[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNext();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, [isLooping]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = useCallback((track: DownloadedTrack, newPlaylist?: DownloadedTrack[]) => {
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    }
    setCurrentTrack(track);

    if (audioRef.current) {
      const src = track.localAudioUrl || `/api/download/${track.id}`;
      audioRef.current.src = src;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Auto-play blocked or failed, waiting for user gesture:', err);
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    playTrack(playlist[nextIndex]);
  }, [currentTrack, playlist, isShuffle, playTrack]);

  const playPrev = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  }, [currentTrack, playlist, currentTime, seek, playTrack]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    isLooping,
    isShuffle,
    playlist,
    setPlaylist,
    playTrack,
    togglePlay,
    seek,
    playNext,
    playPrev,
    toggleLoop,
    toggleShuffle,
  };
}

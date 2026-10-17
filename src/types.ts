export type AudioBitrate = '128k' | '192k' | '320k';

export interface VideoInfo {
  id: string;
  title: string;
  author: string;
  authorUrl?: string;
  thumbnailUrl: string;
  duration?: string;
  durationSeconds?: number;
  provider: string;
  originalUrl: string;
}

export interface DownloadedTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  bitrate: AudioBitrate;
  fileSizeFormatted: string;
  durationFormatted: string;
  durationSeconds: number;
  downloadedAt: number;
  originalUrl: string;
  audioBlob?: Blob;
  localAudioUrl?: string;
}

export interface QueueItem {
  id: string;
  videoId: string;
  url: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  bitrate: AudioBitrate;
  status: 'waiting' | 'downloading' | 'converting' | 'saving' | 'completed' | 'error';
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  downloadedFormatted: string;
  totalFormatted: string;
  errorMessage?: string;
  retryCount: number;
  addedAt: number;
}

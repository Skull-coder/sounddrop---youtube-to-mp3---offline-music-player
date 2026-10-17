import { VideoInfo, AudioBitrate } from '../types';

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch video details. Check the YouTube URL.');
  }
  console.log(res);
  return res.json();
}

export interface ConvertResponse {
  success: boolean;
  jobId: string;
  trackId: string;
  downloadUrl: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  bitrate: AudioBitrate;
  durationFormatted: string;
  durationSeconds: number;
  fileSizeFormatted: string;
}

export async function convertVideo(url: string, bitrate: AudioBitrate): Promise<ConvertResponse> {
  const res = await fetch('/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, bitrate }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Conversion failed. Please try again.');
  }

  return res.json();
}

export interface JobProgressResponse {
  jobId: string;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  downloadedFormatted: string;
  totalFormatted: string;
  status: 'initializing' | 'downloading' | 'converting' | 'completed' | 'error';
  error?: string;
  downloadUrl?: string;
}

export async function pollJobProgress(jobId: string): Promise<JobProgressResponse> {
  const res = await fetch(`/api/progress/${jobId}`);
  if (!res.ok) {
    throw new Error('Failed to query progress');
  }
  return res.json();
}

export async function downloadAudioBlob(downloadUrl: string): Promise<Blob> {
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error('Failed to download audio file stream.');
  }
  return res.blob();
}

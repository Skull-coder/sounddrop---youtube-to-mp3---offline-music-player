import { get, set, del, keys } from 'idb-keyval';
import { DownloadedTrack } from '../types';

const TRACKS_METADATA_KEY = 'sounddrop_tracks_v1';

export async function getDownloadedTracks(): Promise<DownloadedTrack[]> {
  try {
    const list = (await get<Omit<DownloadedTrack, 'audioBlob' | 'localAudioUrl'>[]>(TRACKS_METADATA_KEY)) || [];
    
    // Reconstruct with local object URLs from stored Blobs
    const tracksWithBlobs: DownloadedTrack[] = [];
    for (const item of list) {
      const blob = await get<Blob>(`track_${item.id}_blob`);
      const localAudioUrl = blob ? URL.createObjectURL(blob) : undefined;
      tracksWithBlobs.push({
        ...item,
        audioBlob: blob,
        localAudioUrl,
      });
    }
    return tracksWithBlobs;
  } catch (err) {
    console.error('Failed to load tracks from IndexedDB:', err);
    return [];
  }
}

export async function saveTrack(track: DownloadedTrack, audioBlob: Blob): Promise<void> {
  try {
    const currentList = (await get<Omit<DownloadedTrack, 'audioBlob' | 'localAudioUrl'>[]>(TRACKS_METADATA_KEY)) || [];
    
    // Store blob separately in IndexedDB for performance
    await set(`track_${track.id}_blob`, audioBlob);
    
    const { audioBlob: _, localAudioUrl: __, ...meta } = track;
    const existingIndex = currentList.findIndex(t => t.id === track.id);
    if (existingIndex >= 0) {
      currentList[existingIndex] = meta;
    } else {
      currentList.unshift(meta);
    }
    
    await set(TRACKS_METADATA_KEY, currentList);
  } catch (err) {
    console.error('Failed to save track to IndexedDB:', err);
    throw err;
  }
}

export async function deleteTrack(trackId: string): Promise<void> {
  try {
    const currentList = (await get<Omit<DownloadedTrack, 'audioBlob' | 'localAudioUrl'>[]>(TRACKS_METADATA_KEY)) || [];
    const updated = currentList.filter(t => t.id !== trackId);
    await set(TRACKS_METADATA_KEY, updated);
    await del(`track_${trackId}_blob`);
  } catch (err) {
    console.error('Failed to delete track from IndexedDB:', err);
    throw err;
  }
}

export async function clearAllTracks(): Promise<void> {
  try {
    const allKeys = await keys();
    for (const key of allKeys) {
      if (typeof key === 'string' && (key.startsWith('track_') || key === TRACKS_METADATA_KEY)) {
        await del(key);
      }
    }
  } catch (err) {
    console.error('Failed to clear tracks:', err);
  }
}

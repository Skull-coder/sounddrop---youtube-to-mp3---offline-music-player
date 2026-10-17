# SoundDrop — Real Audio YouTube MP3 Converter with Google Play-Style Download Queue & Android Light Theme

A comprehensive architectural overhaul that implements genuine YouTube audio extraction via high-fidelity stream resolution and FFmpeg libmp3lame transcoding, introduces a multi-item background download queue positioned directly below the audio quality section with Google Play Store-style circular percentage indicators, lifts queue state to persist across tab switching and app reloads, and restyles the entire app with a clean Android light theme (crisp white, royal blue, slate grey, and rich black).

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed and are locked into the revised architecture:
> - **Real Audio Extraction (Zero Beeps)**: Replace the test synthesis with a real YouTube audio stream extraction pipeline. Downloaded audio contains the authentic stereo audio of the song, converted to MP3 at the user-selected bitrate (128k, 192k default, or 320k) with embedded ID3 metadata and cover art.
> - **Queue Placement & Display**: Positioned directly on the **Convert** page below the Audio Quality section under a dedicated **Currently Downloading** section. Each item displays track info, downloaded size vs total size (`current downloaded / size of download`), and a Google Play Store-style circular progress indicator with percentage in the center. Once 100% completed, items transition smoothly into the **My Music** library.
> - **Background Persistence & Sequential Queue**: Downloads run sequentially one-by-one with automatic retry. Queue state is lifted to root storage (IndexedDB/localStorage) so switching tabs or reloading the app does not disrupt the queue or lose progress.
> - **UI Theme (Android Light Theme with shadcn styling)**: Pure white canvas (`bg-white` / `bg-slate-50`), rich black typography (`text-slate-900`), soft neutral grey cards (`bg-white` with `border-slate-200`), and royal blue primary accents (`#2563EB`). Styled specifically for Android touch ergonomics.

---

### 1. Overview & Core Concept

- **What It Does**: Users can paste multiple YouTube URLs to add them to an active download queue. The app extracts authentic YouTube audio streams, transcodes them to standard MP3 at 128k/192k/320k using server-side FFmpeg, displays real-time Play Store circular progress indicators, and saves full MP3 tracks directly into the in-app offline music player library.
- **Key Value**: Real audio music downloads, seamless background queue execution across tab switches, Android-native light theme aesthetics, and dual deployment (installable Android PWA + downloadable Expo APK project).

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Queueing & Conversion Flow**:
   - The user opens the app (clean, bright Android light theme with white canvas and blue accents).
   - Pastes a YouTube share link. The app immediately displays the video title, artist, and thumbnail.
   - User selects the bitrate (`128k`, `192k [Default]`, `320k`) and taps **Add to Download Queue**.
   - The song appears in the **Currently Downloading** queue right below the quality selector.
   - The user can immediately paste another link to queue multiple songs!
   - Active download displays real-time progress: `1.8 MB / 4.2 MB` with an SVG circular progress ring and percentage number (`42%`) in the center (Google Play Store style).
   - When finished, a smooth checkmark animation occurs and the track moves into the **My Music** offline library.

2. **Tab Navigation Without Interruptions**:
   - Switching between **Convert** and **My Music** never stops active downloads.
   - The queue manager runs in the background at the root level.
   - Active queue count is reflected on the top bar and tab badges.

3. **Offline Playback & Sharing**:
   - In **My Music**, all saved tracks display artwork, title, bitrate badge, duration, and file size.
   - Docked bottom music player with seek scrubber, play/pause, loop, shuffle, and Android native Web Share sheet.

#### Visual Identity & Android Light Theme
- **Dominant Canvas (60%)**: Pure white (`#FFFFFF`) with subtle off-white backgrounds (`#F8FAFC`).
- **Structural Surfaces (30%)**: Clean slate-white cards with soft hairline borders (`border-slate-200`, `bg-white`, subtle elevation `shadow-sm`).
- **Accent Budget (10%)**: Royal Electric Blue (`#2563EB` / `blue-600`) for primary buttons, active tabs, and circular progress rings.
- **Typography & Android Ergonomics**:
  - Headings: Plus Jakarta Sans in deep slate-black (`text-slate-900`).
  - Metadata & Numbers: Monospace tabular numerals (`font-mono tabular-nums`).
  - Touch targets $\ge 44 \times 44\text{px}$ for all playback, paste, and queue controls.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real YouTube Audio Extraction Pipeline**:
  - *Chosen Approach*: Multi-tier server-side extraction resolving direct audio streams from YouTube via reliable stream providers and transcoding with system FFmpeg to MP3 with ID3 tags.
  - *Why*: Eliminates all placeholder/sine tones and guarantees authentic stereo music files with real artist, title, and album art.

- **Decision 2: Root-Level Download Queue Manager with IndexedDB Persistence**:
  - *Chosen Approach*: Lift download queue state to a global context stored in IndexedDB/localStorage.
  - *Why*: Prevents loss of download progress when users switch tabs, close tabs, or experience mobile screen timeouts.

- **Decision 3: Google Play Store Circular Progress Indicator**:
  - *Chosen Approach*: SVG circle with dynamic `strokeDashoffset` and centered tabular percentage text (`68%`), transitioning to a green checkmark upon completion before smooth removal.
  - *Why*: Matches Android-native user expectations and provides instant visual clarity on download stages.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                     ANDROID LIGHT THEME MOBILE VIEWPORT                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar: SoundDrop (Blue/Black) + Queue Badge + Install/APK      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────── Segmented Tab Bar ───────────────────────┐  │
│  │      [ 📥 Convert Video ]            [ 🎵 My Music (Count) ]    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  VIEW A: CONVERTER (White & Slate Theme)                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ URL Input Box + One-Tap [ Paste ] Button                         │  │
│  │ Video Preview Card (HD Thumbnail + Title + Channel)              │  │
│  │ Audio Quality: [ 128k ] [ 192k Default ] [ 320k ]                │  │
│  │ [ + Add to Download Queue ] Button                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  CURRENTLY DOWNLOADING QUEUE SECTION (In-Place below Quality)          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Track 1: Song Name · Channel                                     │  │
│  │ Status: 2.4 MB / 5.1 MB · 192 kbps                               │  │
│  │ [ Play Store Circular Progress Ring: ( 64% ) ]                   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Track 2: Upcoming Song (Queued · Waiting in line)                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────── Persistent Audio Player Bar ──────────────────┐  │
│  │ Clean White/Slate Player + Scrubber + Play/Pause + Share Sheet  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                               REST / Blobs
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND (server.ts)                       │
│                                                                        │
│  • GET  /api/info?url=...         -> Video title, thumbnail, channel   │
│  • POST /api/convert              -> Streams REAL audio & encodes MP3  │
│  • GET  /api/download/:trackId    -> Serves authentic MP3 audio file   │
│  • GET  /api/export-expo          -> Standalone Expo APK project zip   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Queue Data Model
```typescript
export interface QueueItem {
  id: string;               // Unique queue item ID
  videoId: string;
  url: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  bitrate: AudioBitrate;
  status: 'waiting' | 'downloading' | 'transcoding' | 'saving' | 'completed' | 'error';
  percent: number;          // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  downloadedFormatted: string; // e.g. "2.4 MB"
  totalFormatted: string;      // e.g. "5.1 MB"
  errorMessage?: string;
  retryCount: number;
}
```

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  bitrate: string;
  fileUri: string;
  duration: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [bitrate, setBitrate] = useState<'128k' | '192k' | '320k'>('192k');
  const [isConverting, setIsConverting] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUrl(text);
  };

  const handleConvert = async () => {
    if (!url.trim()) {
      Alert.alert('Notice', 'Please paste a YouTube link.');
      return;
    }
    setIsConverting(true);
    try {
      const res = await fetch('https://ais-pre-2u3u7czjc3ki2dhk3shx5k-1010252219033.asia-southeast1.run.app/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), bitrate })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed');
      }

      const localFileUri = `${FileSystem.documentDirectory}${data.trackId}.mp3`;
      const fullDownloadUrl = `https://ais-pre-2u3u7czjc3ki2dhk3shx5k-1010252219033.asia-southeast1.run.app${data.downloadUrl}`;
      
      const downloadRes = await FileSystem.downloadAsync(fullDownloadUrl, localFileUri);

      const newTrack: Track = {
        id: data.trackId || String(Date.now()),
        title: data.title || 'YouTube Song',
        artist: data.artist || 'SoundDrop',
        thumbnail: data.thumbnailUrl || 'https://i.ytimg.com/vi/default/hqdefault.jpg',
        bitrate,
        fileUri: downloadRes.uri,
        duration: data.durationFormatted || '3:30'
      };

      setTracks(prev => [newTrack, ...prev]);
      setUrl('');
      Alert.alert('Success', 'Track downloaded and saved to your in-app music library!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to convert YouTube link.');
    } finally {
      setIsConverting(false);
    }
  };

  const playTrack = async (track: Track) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.fileUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (err) {
      Alert.alert('Playback Error', 'Cannot play this track right now.');
    }
  };

  const togglePlay = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const shareTrack = async (track: Track) => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing Error', 'Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(track.fileUri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Ionicons name="musical-notes" size={24} color="#2563EB" />
        <Text style={styles.headerTitle}>Sound<Text style={{ color: '#2563EB' }}>Drop</Text></Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Paste YouTube Share Link</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="https://youtu.be/..."
            placeholderTextColor="#94A3B8"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste}>
            <Text style={styles.pasteText}>Paste</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 14 }]}>Audio Quality</Text>
        <View style={styles.bitrateRow}>
          {(['128k', '192k', '320k'] as const).map(rate => (
            <TouchableOpacity
              key={rate}
              style={[styles.bitrateBtn, bitrate === rate && styles.bitrateActive]}
              onPress={() => setBitrate(rate)}
            >
              <Text style={[styles.bitrateText, bitrate === rate && styles.bitrateTextActive]}>
                {rate} {rate === '192k' ? '(Default)' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.convertBtn}
          onPress={handleConvert}
          disabled={isConverting}
        >
          {isConverting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.convertBtnText}>Convert & Download MP3</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.libraryHeader}>
        <Text style={styles.sectionTitle}>Downloaded Music ({tracks.length})</Text>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item)}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackMeta}>{item.artist} · {item.bitrate}</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => shareTrack(item)}>
              <Ionicons name="share-social-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-download-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyText}>No downloaded tracks yet</Text>
            <Text style={styles.emptySub}>Paste a YouTube link above to start downloading</Text>
          </View>
        }
      />

      {currentTrack && (
        <View style={styles.playerBar}>
          <Image source={{ uri: currentTrack.thumbnail }} style={styles.playerThumb} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.playerSub}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity style={styles.playerBtn} onPress={togglePlay}>
            <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={36} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  card: { margin: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  label: { fontSize: 13, color: '#334155', marginBottom: 8, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1' },
  pasteBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  pasteText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  bitrateRow: { flexDirection: 'row', gap: 8 },
  bitrateBtn: { flex: 1, paddingVertical: 9, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  bitrateActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  bitrateText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  bitrateTextActive: { color: '#2563EB', fontWeight: 'bold' },
  convertBtn: { marginTop: 16, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  convertBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  libraryHeader: { paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  trackItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  thumbnail: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#E2E8F0' },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  trackMeta: { color: '#64748B', fontSize: 11, marginTop: 3 },
  actionBtn: { padding: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 36 },
  emptyText: { color: '#64748B', fontSize: 14, fontWeight: '600', marginTop: 10 },
  emptySub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  playerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 },
  playerThumb: { width: 46, height: 46, borderRadius: 10 },
  playerInfo: { flex: 1, marginLeft: 12 },
  playerTitle: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  playerSub: { color: '#64748B', fontSize: 11 },
  playerBtn: { padding: 6 }
});

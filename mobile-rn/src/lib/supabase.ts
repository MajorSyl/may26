import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// The Supabase Auth session (JWT access/refresh tokens) is the one piece of
// this app's local state sensitive enough to warrant SecureStore over plain
// AsyncStorage -- everything else (cached lists, UI prefs) can use
// AsyncStorage directly if a screen needs it. expo-secure-store has no size
// guarantee above ~2KB on Android and no multi-get, so this adapter chunks
// large values across multiple keys rather than truncating silently.
const CHUNK_SIZE = 1800;

const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const chunkCountRaw = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!chunkCountRaw) return SecureStore.getItemAsync(key);
    const chunkCount = parseInt(chunkCountRaw, 10);
    const parts: string[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const part = await SecureStore.getItemAsync(`${key}_${i}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
      return;
    }
    const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < chunkCount; i++) {
      await SecureStore.setItemAsync(`${key}_${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunkCount));
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
  async removeItem(key: string): Promise<void> {
    const chunkCountRaw = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCountRaw) {
      const chunkCount = parseInt(chunkCountRaw, 10);
      for (let i = 0; i < chunkCount; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_chunks`);
    }
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
};

// expo-secure-store has no real web implementation (there's no OS keychain
// in a browser) -- its web shim throws ("getValueWithKeyAsync is not a
// function") the moment the Supabase client tries to read a persisted
// session. AsyncStorage backs onto localStorage on web and works fine
// there; SecureStore is only meaningfully more secure on iOS/Android, so
// that's where it's worth the chunking complexity.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: Platform.OS === 'web' ? AsyncStorage : SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

// AsyncStorage export for non-auth local caching (favorites, "seen" flags,
// etc.) -- kept separate from the auth adapter above on purpose.
export { AsyncStorage };

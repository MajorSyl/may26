import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Supabase's default session storage is the browser's localStorage, which
// is not the recommended choice inside a Capacitor app: WebView-backed
// localStorage on iOS/Android is more exposed to eviction under OS storage
// pressure than each platform's real native key-value store. This adapter
// backs Supabase's session persistence with @capacitor/preferences
// (UserDefaults on iOS, SharedPreferences on Android) instead -- the
// combination Supabase's own docs recommend for Capacitor/React Native.
// It's only ever wired in when isNativeApp() is true (see supabase-service.ts),
// so the web build's behavior is completely unchanged.
export const capacitorPreferencesStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },
  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
};

// Safe to call in any context, including a plain browser -- Capacitor's
// core JS is explicitly designed to no-op and return false outside a real
// native shell, which is what lets this codebase stay identical between
// the web deployment and the native app.
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

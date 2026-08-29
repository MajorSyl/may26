import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is async (unlike web localStorage), so every sandbox-fallback
// read/write in service.ts awaits these instead of the sync getItem/setItem
// pattern the web app's safeStorage helper used.
export const getLocalData = async <T>(key: string, defaultVal: T): Promise<T> => {
  try {
    const val = await AsyncStorage.getItem(key);
    if (!val) {
      await AsyncStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(val) as T;
  } catch {
    return defaultVal;
  }
};

export const setLocalData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Best-effort local cache; a write failure here shouldn't break the flow.
  }
};

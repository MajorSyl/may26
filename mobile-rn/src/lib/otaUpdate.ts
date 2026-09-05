import * as Updates from 'expo-updates';

// Checks for and downloads (but doesn't apply) a new OTA JS bundle. A no-op
// returning false in Expo Go, a dev client, or web -- Updates.isEnabled is
// only true inside a real EAS build that has expo-updates configured.
export const checkAndFetchOtaUpdate = async (): Promise<boolean> => {
  if (!Updates.isEnabled) return false;
  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return false;
    await Updates.fetchUpdateAsync();
    return true;
  } catch {
    return false;
  }
};

export const applyOtaUpdate = async (): Promise<void> => {
  await Updates.reloadAsync();
};

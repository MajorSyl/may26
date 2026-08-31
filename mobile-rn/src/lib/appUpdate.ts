import Constants from 'expo-constants';

// Published alongside the APK on every successful build (see
// .github/workflows/eas-build.yml) -- same permanent, no-login GitHub
// Release URL pattern already used for the APK itself, so there's no new
// hosting/caching surface to worry about.
const VERSION_JSON_URL = 'https://github.com/MajorSyl/may26/releases/download/android-latest/version.json';
export const APK_DOWNLOAD_URL = 'https://github.com/MajorSyl/may26/releases/download/android-latest/rcfs.apk';

export interface RemoteVersionInfo {
  versionName: string;
  versionCode: number | null;
  apkUrl: string;
}

export const getInstalledVersionCode = (): number | null => {
  const code = Constants.expoConfig?.android?.versionCode;
  return typeof code === 'number' ? code : null;
};

// Only meaningful for the native Android build -- the web app is always
// "current" the moment it's deployed, there's nothing to check.
export const checkForAppUpdate = async (): Promise<RemoteVersionInfo | null> => {
  try {
    const res = await fetch(VERSION_JSON_URL, { cache: 'no-store' as any });
    if (!res.ok) return null;
    const data = (await res.json()) as RemoteVersionInfo;
    const installed = getInstalledVersionCode();
    if (installed == null || data.versionCode == null) return null;
    if (data.versionCode > installed) return data;
    return null;
  } catch {
    return null;
  }
};

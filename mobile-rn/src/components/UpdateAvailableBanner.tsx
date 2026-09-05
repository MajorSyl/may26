import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { Download, X } from 'lucide-react-native';
import { checkForAppUpdate, RemoteVersionInfo } from '../lib/appUpdate';
import { checkAndFetchOtaUpdate, applyOtaUpdate } from '../lib/otaUpdate';
import { colors } from '../theme';

type PendingUpdate = { kind: 'ota' } | { kind: 'apk'; info: RemoteVersionInfo };

// Native-only: the web app is always "current" the moment it's deployed,
// there's nothing to check. Two update paths, checked in priority order:
//
// 1. OTA (expo-updates): covers the vast majority of changes -- any pure
//    JS/asset change ships instantly to already-installed apps with no
//    reinstall. This is what "no need to reinstall for updates" actually
//    means in an Expo-managed app.
// 2. APK (native rebuild): only needed when something requires a new
//    native build -- a new native dependency, permission, or a
//    runtimeVersion bump. Falls back to this only if there's no OTA
//    update pending, since an OTA update alone can't apply on top of an
//    APK that's already behind on native code.
export default function UpdateAvailableBanner() {
  const [pending, setPending] = useState<PendingUpdate | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      const otaReady = await checkAndFetchOtaUpdate();
      if (otaReady) {
        setPending({ kind: 'ota' });
        return;
      }
      const apkInfo = await checkForAppUpdate();
      if (apkInfo) setPending({ kind: 'apk', info: apkInfo });
    })();
  }, []);

  if (Platform.OS === 'web' || !pending || dismissed) return null;

  const isOta = pending.kind === 'ota';

  return (
    <View
      style={{ position: 'absolute', top: 50, left: 12, right: 12, zIndex: 999 }}
      className="bg-rotary-dark rounded-2xl p-4 flex-row items-center gap-3 shadow-lg"
    >
      <Download size={18} color={colors.white} />
      <View className="flex-1">
        <Text className="text-xs font-bold text-white">{isOta ? 'Update ready' : 'A new version is available'}</Text>
        <Text className="text-[10px] text-slate-300 mt-0.5">
          {isOta ? 'Restart to get the latest version.' : 'Update to get the latest features and fixes.'}
        </Text>
      </View>
      <Pressable
        onPress={() => (isOta ? applyOtaUpdate() : Linking.openURL(pending.info.apkUrl))}
        className="bg-rotary-azure px-3 py-2 rounded-lg"
      >
        <Text className="text-[10px] font-bold uppercase text-white">{isOta ? 'Restart' : 'Update'}</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)}>
        <X size={16} color={colors.slate400} />
      </Pressable>
    </View>
  );
}

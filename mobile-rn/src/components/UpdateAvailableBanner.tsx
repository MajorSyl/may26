import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { Download, X } from 'lucide-react-native';
import { checkForAppUpdate, RemoteVersionInfo } from '../lib/appUpdate';
import { colors } from '../theme';

// Native-only: the web app has no "installed version" to be behind, it's
// always whatever was last deployed. Checks once per app launch.
export default function UpdateAvailableBanner() {
  const [update, setUpdate] = useState<RemoteVersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    checkForAppUpdate().then(setUpdate);
  }, []);

  if (Platform.OS === 'web' || !update || dismissed) return null;

  return (
    <View style={{ position: 'absolute', top: 50, left: 12, right: 12, zIndex: 999 }} className="bg-rotary-dark rounded-2xl p-4 flex-row items-center gap-3 shadow-lg">
      <Download size={18} color={colors.white} />
      <View className="flex-1">
        <Text className="text-xs font-bold text-white">A new version is available</Text>
        <Text className="text-[10px] text-slate-300 mt-0.5">Update to get the latest features and fixes.</Text>
      </View>
      <Pressable onPress={() => Linking.openURL(update.apkUrl)} className="bg-rotary-azure px-3 py-2 rounded-lg">
        <Text className="text-[10px] font-bold uppercase text-white">Update</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)}>
        <X size={16} color={colors.slate400} />
      </Pressable>
    </View>
  );
}

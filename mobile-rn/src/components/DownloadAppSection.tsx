import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Alert } from '../lib/alert';
import { Apple, CirclePlay, Smartphone, QrCode } from 'lucide-react-native';
import { colors } from '../theme';

// Fill these in once each is actually available -- every badge below
// degrades to a tasteful "Coming Soon" state on its own until its URL is
// set, rather than ever being a dead link.
const APP_STORE_URL: string | null = null; // e.g. 'https://apps.apple.com/app/id0000000000'
const PLAY_STORE_URL: string | null = null; // e.g. 'https://play.google.com/store/apps/details?id=org.rcfsunset.mobile'
// eas-build.yml re-hosts each successful Android build as a GitHub Release
// asset at this exact URL (tag `android-latest`, updated in place on every
// build, so this value never has to change again).
const APK_DOWNLOAD_URL: string | null =
  'https://github.com/MajorSyl/may26/releases/download/android-latest/rcfs.apk';

function StoreBadge({
  icon: Icon,
  storeLabel,
  actionLabel,
  url
}: {
  icon: typeof Apple;
  storeLabel: string;
  actionLabel: string;
  url: string | null;
}) {
  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Coming Soon', `RCFS isn't listed on the ${storeLabel} yet -- check back soon.`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-1 flex-row items-center gap-3 px-4 py-3 rounded-2xl border ${
        url ? 'bg-rotary-dark border-rotary-dark' : 'bg-slate-100 border-slate-200'
      }`}
    >
      <Icon size={26} color={url ? colors.white : colors.slate400} />
      <View>
        <Text className={`text-[9px] uppercase tracking-wider ${url ? 'text-slate-300' : 'text-slate-400'}`}>
          {url ? actionLabel : 'Coming Soon'}
        </Text>
        <Text className={`text-sm font-extrabold ${url ? 'text-white' : 'text-slate-500'}`}>{storeLabel}</Text>
      </View>
    </Pressable>
  );
}

// Promotional "get the app" block, similar placement/treatment to a
// typical marketing-site app-download CTA -- sits on Home, below the
// main content. Badges are always shown (so visitors know a mobile app
// exists at all) but each degrades to "Coming Soon" until its real link
// is filled in above; no dead links, no fabricated store presence.
export default function DownloadAppSection() {
  const anyLive = !!APP_STORE_URL || !!PLAY_STORE_URL || !!APK_DOWNLOAD_URL;

  return (
    <View className="bg-rotary-dark rounded-3xl p-6 gap-5">
      <View className="items-center gap-2">
        <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
          <Smartphone size={22} color={colors.white} />
        </View>
        <Text className="text-xl font-extrabold text-white text-center">Get the RCFS App</Text>
        <Text className="text-xs text-slate-300 text-center leading-relaxed max-w-xs">
          Take the club with you -- events, projects, and the members directory, right on your phone.
        </Text>
      </View>

      <View className="flex-row gap-3">
        <StoreBadge icon={Apple} storeLabel="App Store" actionLabel="Download on the" url={APP_STORE_URL} />
        <StoreBadge icon={CirclePlay} storeLabel="Google Play" actionLabel="Get it on" url={PLAY_STORE_URL} />
      </View>

      {APK_DOWNLOAD_URL ? (
        <Pressable onPress={() => Linking.openURL(APK_DOWNLOAD_URL)} className="flex-row items-center justify-center gap-2 py-2">
          <QrCode size={14} color={colors.slate400} />
          <Text className="text-[11px] font-bold text-slate-300 uppercase">Or download the Android APK directly</Text>
        </Pressable>
      ) : !anyLive ? (
        <Text className="text-[10px] text-slate-400 text-center">
          Not published yet -- store listings and a direct Android download are both in progress.
        </Text>
      ) : null}
    </View>
  );
}

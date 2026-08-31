import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Alert } from '../lib/alert';
import { Apple, CirclePlay, Smartphone, Download, ShieldAlert } from 'lucide-react-native';
import { APK_DOWNLOAD_URL } from '../lib/appUpdate';
import { colors } from '../theme';

// Fill these in once each is actually live -- each badge degrades to a
// tasteful "Coming Soon" state on its own until its URL is set, rather
// than ever being a dead link or implying a store listing that doesn't
// exist yet (App Store review guideline / Play Store policy accuracy).
const APP_STORE_URL: string | null = null; // e.g. 'https://apps.apple.com/app/id0000000000'
const PLAY_STORE_URL: string | null = null; // e.g. 'https://play.google.com/store/apps/details?id=org.rcfsunset.mobile'

function StoreBadge({ icon: Icon, storeLabel, actionLabel, url }: { icon: typeof Apple; storeLabel: string; actionLabel: string; url: string | null }) {
  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Coming Soon', `RCFS isn't listed on the ${storeLabel} yet -- check back soon.`);
    }
  };

  return (
    <Pressable onPress={handlePress} className={`flex-1 flex-row items-center gap-3 px-4 py-3 rounded-2xl border ${url ? 'bg-white/10 border-white/10' : 'bg-white/5 border-white/5'}`}>
      <Icon size={22} color={url ? colors.white : colors.slate400} />
      <View>
        <Text className={`text-[9px] uppercase tracking-wider ${url ? 'text-slate-300' : 'text-slate-500'}`}>{url ? actionLabel : 'Coming Soon'}</Text>
        <Text className={`text-xs font-extrabold ${url ? 'text-white' : 'text-slate-500'}`}>{storeLabel}</Text>
      </View>
    </Pressable>
  );
}

// "Get the app" section on Home. The direct Android APK is the real,
// working download today -- it leads, styled and worded like an actual
// CTA (matching how Easyfen presents its own direct download), not a
// buried afterthought link. Never implies Play Store availability or
// approval; App Store/Play Store badges stay clearly "Coming Soon" until
// those listings are genuinely live.
export default function DownloadAppSection() {
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

      <View className="bg-white rounded-2xl p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-xl bg-emerald-50 items-center justify-center">
            <Download size={20} color={colors.emerald600} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-slate-800">Download for Android</Text>
            <Text className="text-[11px] font-bold text-emerald-600 uppercase">Free -- Direct Install</Text>
          </View>
        </View>
        <Pressable onPress={() => Linking.openURL(APK_DOWNLOAD_URL)} className="bg-rotary-dark rounded-xl py-3 items-center">
          <Text className="text-xs font-bold uppercase text-white tracking-wider">Download APK -- Free</Text>
        </Pressable>
        <View className="flex-row items-start gap-2">
          <ShieldAlert size={13} color={colors.slate400} style={{ marginTop: 1 }} />
          <Text className="text-[10px] text-slate-400 leading-relaxed flex-1">
            Free direct download -- no Play Store needed. Since this isn't installed through the Play Store, Android will ask you
            to allow installs from this source the first time; that's expected for direct downloads.
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <StoreBadge icon={Apple} storeLabel="App Store" actionLabel="Download on the" url={APP_STORE_URL} />
        <StoreBadge icon={CirclePlay} storeLabel="Google Play" actionLabel="Coming to" url={PLAY_STORE_URL} />
      </View>
    </View>
  );
}

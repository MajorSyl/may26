import React from 'react';
import { View, Text, Pressable, Image, Linking, Platform } from 'react-native';
import { CirclePlay, ExternalLink } from 'lucide-react-native';
import { parseVideoUrl } from '../lib/videoEmbed';
import { colors } from '../theme';

// Renders a pasted YouTube/Facebook/Instagram/Google Drive share link as a
// playable embed. Only the web build can host a real iframe player (no
// react-native-webview dependency here, so native falls back to a
// thumbnail + "Watch on X" link, same as when a link's platform can't be
// confidently turned into an embed URL at all). Facebook/Instagram embeds
// can silently fail to render for a given post depending on its privacy
// settings -- browsers don't expose that as a JS-detectable error for a
// cross-origin iframe, so rather than fake a failure check, the "Watch on
// X" link is always shown alongside those embeds as a working escape
// hatch, not just as a fallback state.
export default function VideoEmbed({ url }: { url: string }) {
  const parsed = parseVideoUrl(url);
  const isWeb = Platform.OS === 'web';
  const canEmbed = isWeb && !!parsed.embedUrl;
  const showWatchLink = parsed.platform === 'facebook' || parsed.platform === 'instagram' || !canEmbed;

  return (
    <View className="gap-2">
      <View style={{ aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.rotaryDark }}>
        {canEmbed
          ? React.createElement('iframe', {
              src: parsed.embedUrl!,
              style: { width: '100%', height: '100%', border: 0 },
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowFullScreen: true,
              loading: 'lazy',
              title: 'Club video'
            })
          : (
            <Pressable onPress={() => Linking.openURL(parsed.originalUrl)} className="flex-1 items-center justify-center">
              {parsed.thumbnailUrl ? (
                <Image source={{ uri: parsed.thumbnailUrl }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
              ) : null}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,17,40,0.5)' }} />
              <CirclePlay size={48} color={colors.white} />
              <Text className="text-white text-xs font-bold mt-2">Watch on {parsed.platformLabel}</Text>
            </Pressable>
          )}
      </View>

      {showWatchLink && canEmbed ? (
        <Pressable onPress={() => Linking.openURL(parsed.originalUrl)} className="flex-row items-center gap-1.5 self-start">
          <ExternalLink size={12} color={colors.slate500} />
          <Text className="text-[11px] font-semibold text-slate-500">Trouble viewing? Watch on {parsed.platformLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

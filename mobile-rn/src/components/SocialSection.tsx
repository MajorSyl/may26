import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';
import { Facebook, Instagram, ArrowUpRight } from 'lucide-react-native';
import { SiteSettings, splitLines } from '../lib/service';
import { SocialPost, getSocialPosts } from '../lib/social';
import InstagramFeed from './InstagramFeed';
import { colors } from '../theme';

// No Facebook timeline embed: the club's Facebook is a profile, and
// Facebook's Page Plugin only renders Pages (profiles show a broken frame).
// Instagram's per-post embed needs no token for posts listed in Settings.
function instagramEmbedUrl(url: string): string | null {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
}

function Frame({ src, title, height }: { src: string; title: string; height: number }) {
  if (Platform.OS !== 'web') return null;
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      style={{ width: '100%', height, border: 0, overflow: 'hidden', display: 'block', background: '#fff' }}
      allow="encrypted-media"
    />
  );
}

function FollowCard({
  label,
  handle,
  url,
  Icon,
  color
}: {
  label: string;
  handle: string;
  url: string;
  Icon: typeof Facebook;
  color: string;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={`Follow us on ${label}`}
      className="bg-white border border-slate-200 rounded-2xl p-5 flex-row items-center gap-4 hover:shadow-lg transition-shadow min-h-[88px]"
    >
      <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}14` }}>
        <Icon size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</Text>
        <Text className="text-base font-semibold text-rotary-royal-deep" numberOfLines={2}>
          {handle}
        </Text>
      </View>
      <ArrowUpRight size={20} color={colors.slate500} />
    </Pressable>
  );
}

export default function SocialSection({ settings }: { settings: SiteSettings }) {
  const [igPosts, setIgPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    let active = true;
    getSocialPosts(6, 'instagram').then((p) => active && setIgPosts(p));
    return () => {
      active = false;
    };
  }, []);

  const fb = settings.socialFacebookUrl;
  const ig = settings.socialInstagramUrl;
  const igHandle = ig ? `@${ig.replace(/\/+$/, '').split('/').pop()}` : '';
  const igEmbeds = splitLines(settings.instagramPostUrls)
    .map(instagramEmbedUrl)
    .filter((u): u is string => !!u)
    .slice(0, 3);

  // Live Instagram posts take over the section once the sync has run;
  // until then, embeds and follow cards stand in.
  if (igPosts.length > 0) {
    return (
      <View className="gap-8">
        <InstagramFeed posts={igPosts} profileUrl={ig} />
        {fb ? (
          <View className="md:w-1/2">
            <FollowCard label="Facebook" handle="Rotary Club of Freetown-Sunset" url={fb} Icon={Facebook} color="#1877F2" />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-6">
      <View className="gap-4 md:flex-row">
        {fb ? (
          <View className="md:flex-1">
            <FollowCard label="Facebook" handle="Rotary Club of Freetown-Sunset" url={fb} Icon={Facebook} color="#1877F2" />
          </View>
        ) : null}
        {ig ? (
          <View className="md:flex-1">
            <FollowCard label="Instagram" handle={igHandle} url={ig} Icon={Instagram} color="#C13584" />
          </View>
        ) : null}
      </View>
      <View className="gap-4">
        {igEmbeds.length > 0 ? (
          <View className="gap-4 sm:flex-row sm:flex-wrap">
            {igEmbeds.map((src) => (
              <View key={src} className="sm:w-[48%] bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <Frame src={src} title="Instagram post from Rotary Club of Freetown-Sunset" height={480} />
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

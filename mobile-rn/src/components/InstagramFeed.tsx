import React from 'react';
import { View, Text, Pressable, Linking, Platform, Image } from 'react-native';
import { Instagram, Play, Layers, ArrowUpRight } from 'lucide-react-native';
import { SocialPost } from '../lib/social';
import { colors } from '../theme';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-GB', sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
}

function kindOf(post: SocialPost): { label: string; Icon: typeof Play } | null {
  if (post.mediaType === 'VIDEO') return { label: 'Reel', Icon: Play };
  if (post.mediaType === 'CAROUSEL_ALBUM') return { label: 'Album', Icon: Layers };
  return null;
}

// Fixed-aspect thumbnail, so a conservative centered cover crop (AGENTS.md).
function Thumb({ uri, alt }: { uri: string; alt: string }) {
  if (Platform.OS === 'web') {
    return (
      <img
        src={uri}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center 40%' }}
      />
    );
  }
  return <Image source={{ uri }} accessibilityLabel={alt} resizeMode="cover" style={{ width: '100%', height: '100%' }} />;
}

export function InstagramPostCard({ post }: { post: SocialPost }) {
  const kind = kindOf(post);
  const caption = (post.caption || '').trim();
  return (
    <Pressable
      onPress={() => Linking.openURL(post.permalink)}
      accessibilityRole="link"
      accessibilityLabel={`Instagram post${caption ? `: ${caption.slice(0, 80)}` : ''}. Opens Instagram.`}
      className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <View className="w-full aspect-square bg-rotary-cream">
        {post.imageUrl ? (
          <Thumb uri={post.imageUrl} alt={caption ? caption.slice(0, 120) : 'Instagram post from Rotary Club of Freetown-Sunset'} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Instagram size={28} color={colors.rotaryRoyal} />
          </View>
        )}
      </View>
      <View className="flex-1 p-4 gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-xs font-semibold text-slate-500">{formatDate(post.postedAt)}</Text>
          {kind ? (
            <View className="flex-row items-center gap-1 bg-rotary-gold-soft rounded-full px-2 py-0.5">
              <kind.Icon size={11} color={colors.rotaryRoyal} />
              <Text className="text-[11px] font-semibold text-rotary-royal">{kind.label}</Text>
            </View>
          ) : null}
        </View>
        {caption ? (
          <Text className="text-sm leading-6 text-slate-700" numberOfLines={3}>
            {caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function InstagramFeed({ posts, profileUrl }: { posts: SocialPost[]; profileUrl: string }) {
  const handle = profileUrl ? `@${profileUrl.replace(/\/+$/, '').split('/').pop()}` : 'Instagram';
  return (
    <View className="gap-6">
      <View className="flex-row flex-wrap items-center justify-between gap-4">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-2xl bg-rotary-gold-soft items-center justify-center">
            <Instagram size={22} color={colors.rotaryRoyal} />
          </View>
          <View>
            <Text className="text-base font-semibold text-rotary-royal-deep">{handle}</Text>
            <Text className="text-sm text-slate-500">Latest from Instagram</Text>
          </View>
        </View>
        {profileUrl ? (
          <Pressable
            onPress={() => Linking.openURL(profileUrl)}
            accessibilityRole="link"
            className="min-h-[44px] px-5 rounded-full border border-rotary-royal flex-row items-center gap-2 hover:bg-rotary-royal/5"
          >
            <Text className="text-[15px] font-semibold text-rotary-royal">Follow on Instagram</Text>
            <ArrowUpRight size={16} color={colors.rotaryRoyal} />
          </Pressable>
        ) : null}
      </View>
      <View className="flex-row flex-wrap -mx-2">
        {posts.map((post) => (
          <View key={post.id} className="w-1/2 md:w-1/3 p-2">
            <InstagramPostCard post={post} />
          </View>
        ))}
      </View>
    </View>
  );
}

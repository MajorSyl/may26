import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Linking } from 'react-native';
import { Instagram, Facebook, ArrowRight } from 'lucide-react-native';
import { SocialPost, getSocialPosts } from '../lib/social';
import { colors } from '../theme';

// Compact preview for the Home screen -- up to 6 recent posts in a small
// grid, "View All" through to the full SocialFeedScreen. Renders nothing
// at all if there's no cached data yet (never-configured, first sync
// hasn't run, or the sync is failing) -- a missing social feed must never
// look like a broken page.
export default function SocialFeedSection({ onViewAll }: { onViewAll: () => void }) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSocialPosts(6)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Instagram size={16} color={colors.rotaryAzure} />
          <Facebook size={16} color={colors.rotaryAzure} />
          <Text className="text-xl font-extrabold text-rotary-dark">Follow Our Journey</Text>
        </View>
        <Pressable onPress={onViewAll} className="flex-row items-center gap-1">
          <Text className="text-[11px] font-bold text-rotary-azure uppercase">View All</Text>
          <ArrowRight size={13} color={colors.rotaryAzure} />
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2 md:gap-3">
        {posts.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => Linking.openURL(p.permalink)}
            className="w-[31.5%] md:w-[15.5%] aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
          >
            {p.mediaUrl ? (
              <Image source={{ uri: p.mediaUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
            ) : (
              <View className="flex-1 items-center justify-center">
                {p.platform === 'instagram' ? (
                  <Instagram size={18} color={colors.slate400} />
                ) : (
                  <Facebook size={18} color={colors.slate400} />
                )}
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

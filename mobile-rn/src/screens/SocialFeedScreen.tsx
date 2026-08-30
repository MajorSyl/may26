import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Linking } from 'react-native';
import { Instagram, Facebook, ExternalLink } from 'lucide-react-native';
import { SocialPost, getSocialPosts } from '../lib/social';
import { ScreenScroll, ScreenTitle, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

type Filter = 'all' | 'instagram' | 'facebook';

export default function SocialFeedScreen() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    logPageView('social_feed');
    getSocialPosts(60)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.platform === filter);

  return (
    <ScreenScroll wide>
      <View className="gap-2 md:max-w-3xl">
        <Badge label="Stay Connected" tone="gold" />
        <Text className="text-3xl font-extrabold text-rotary-dark">Social Feed</Text>
        <Text className="text-sm text-slate-500 leading-relaxed">Recent posts from our Instagram and Facebook pages.</Text>
      </View>

      <View className="flex-row gap-2">
        {(['all', 'instagram', 'facebook'] as const).map((f) => {
          const isSel = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border ${
                isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {f === 'instagram' && <Instagram size={13} color={isSel ? colors.white : colors.slate500} />}
              {f === 'facebook' && <Facebook size={13} color={isSel ? colors.white : colors.slate500} />}
              <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{f}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <LoadingBlock label="Loading recent posts..." />
      ) : filtered.length === 0 ? (
        <EmptyBlock label="No posts to show yet. Check back soon, or follow us directly on Instagram and Facebook." />
      ) : (
        <View className="gap-4 md:flex-row md:flex-wrap">
          {filtered.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => Linking.openURL(p.permalink)}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden md:w-[48%] lg:w-[31%]"
            >
              {p.mediaUrl ? (
                <View className="w-full h-48 bg-slate-100">
                  <Image source={{ uri: p.mediaUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
                </View>
              ) : null}
              <View className="p-4 gap-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    {p.platform === 'instagram' ? (
                      <Instagram size={13} color={colors.rotaryAzure} />
                    ) : (
                      <Facebook size={13} color={colors.rotaryAzure} />
                    )}
                    <Text className="text-[10px] font-bold uppercase text-slate-400">{p.platform}</Text>
                  </View>
                  <ExternalLink size={13} color={colors.slate400} />
                </View>
                {p.caption ? (
                  <Text className="text-xs text-slate-600 leading-relaxed" numberOfLines={3}>
                    {p.caption}
                  </Text>
                ) : null}
                {p.postedAt ? <Text className="text-[10px] text-slate-400">{new Date(p.postedAt).toLocaleDateString()}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

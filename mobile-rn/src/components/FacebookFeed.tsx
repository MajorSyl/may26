import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Linking, Platform, ActivityIndicator } from 'react-native';
import { Facebook, ArrowUpRight } from 'lucide-react-native';
import { Badge } from './ui';
import { colors } from '../theme';

interface FacebookPost {
  id: string;
  message: string | null;
  imageUrl: string | null;
  permalink: string | null;
  createdTime: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Pulls from /api/facebook-feed, a Vercel serverless function (see
// /api/facebook-feed.js) cached at the edge for an hour. Web-only: that
// route only exists on the deployed site's own domain, not inside the
// native app bundle. Degrades to rendering nothing at all on any failure
// or empty response -- a missing news feed must never look like a broken
// page (same convention as SocialFeedSection elsewhere on Home).
export default function FacebookFeed() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let active = true;
    fetch('/api/facebook-feed')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (active) setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch(() => {
        if (active) setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  if (loading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color={colors.rotaryAzure} />
      </View>
    );
  }

  if (posts.length === 0) return null;

  return (
    <View className="gap-4">
      <View className="items-center gap-1.5">
        <Badge label="Latest Updates" />
        <Text className="text-xl font-extrabold text-rotary-dark text-center">From Our Facebook Page</Text>
      </View>

      <View className="gap-3">
        {posts.map((post) => (
          <Pressable
            key={post.id}
            onPress={() => post.permalink && Linking.openURL(post.permalink)}
            className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden"
          >
            {post.imageUrl ? (
              <View className="w-full h-44 bg-slate-100">
                <Image source={{ uri: post.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
              </View>
            ) : null}
            <View className="p-4 gap-2">
              {post.message ? (
                <Text className="text-xs text-slate-600 leading-relaxed" numberOfLines={4}>
                  {post.message}
                </Text>
              ) : null}
              <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-1.5">
                  <Facebook size={12} color={colors.slate400} />
                  <Text className="text-[10px] text-slate-400 uppercase">{formatDate(post.createdTime)}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-[10px] font-bold text-rotary-azure uppercase">View on Facebook</Text>
                  <ArrowUpRight size={12} color={colors.rotaryAzure} />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

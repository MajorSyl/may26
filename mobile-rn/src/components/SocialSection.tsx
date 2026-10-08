import React from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';
import { Facebook, Instagram, ArrowUpRight } from 'lucide-react-native';
import { SiteSettings, splitLines } from '../lib/service';
import { colors } from '../theme';

// Embeds need no access token: Facebook's Page Plugin renders the page
// timeline, and Instagram's per-post embed renders any public post an admin
// lists in Settings. A live auto-updating Instagram grid would need a Meta
// API token.
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
        <Text className="text-base font-semibold text-rotary-royal-deep" numberOfLines={1}>
          {handle}
        </Text>
      </View>
      <ArrowUpRight size={20} color={colors.slate500} />
    </Pressable>
  );
}

export default function SocialSection({ settings }: { settings: SiteSettings }) {
  const fb = settings.socialFacebookUrl;
  const ig = settings.socialInstagramUrl;
  const igHandle = ig ? `@${ig.replace(/\/+$/, '').split('/').pop()}` : '';
  const igEmbeds = splitLines(settings.instagramPostUrls)
    .map(instagramEmbedUrl)
    .filter((u): u is string => !!u)
    .slice(0, 3);
  const fbEmbed = fb
    ? `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fb)}&tabs=timeline&width=500&height=560&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
    : null;

  return (
    <View className="gap-6 lg:flex-row lg:items-start">
      {fbEmbed && Platform.OS === 'web' ? (
        <View className="w-full lg:w-[500px] bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <Frame src={fbEmbed} title="Rotary Club of Freetown-Sunset on Facebook" height={560} />
        </View>
      ) : null}

      <View className="flex-1 gap-4">
        {fb ? <FollowCard label="Facebook" handle="Rotary Club of Freetown-Sunset" url={fb} Icon={Facebook} color="#1877F2" /> : null}
        {ig ? <FollowCard label="Instagram" handle={igHandle} url={ig} Icon={Instagram} color="#C13584" /> : null}
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

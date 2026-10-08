import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, StyleProp, ViewStyle, Platform } from 'react-native';
import { ImageOff } from 'lucide-react-native';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  // 'cover' is only for fixed-aspect card thumbnails (AGENTS.md); full-detail
  // views keep the default 'contain'.
  fit?: 'contain' | 'cover';
  eager?: boolean;
}

// Ported from the web app's SafeImage: any external/unsplash URL is treated
// as an unverified stock/placeholder image and rendered as a "Photo Coming
// Soon" box instead -- only genuinely uploaded images render as real
// photos. This is a deliberate anti-placeholder-image policy, not a bug
// (see AGENTS.md). Per this project's RN non-negotiables, every real image
// renders with resizeMode="contain" -- never "cover" -- so a photo is never
// cropped or has a face cut off, even though the web version used
// object-cover in some card layouts.
//
// "Genuinely uploaded" now includes real https URLs from this project's own
// Supabase Storage buckets (site-images, avatars) -- those are actual admin/
// member-uploaded photos, not stock placeholders, even though they're http(s)
// like an unverified external link would be. It also includes assets served
// from this site's own domain (e.g. static files committed to the repo's
// public/ folder, used for content that predates a Storage upload) -- same
// reasoning, just a different genuine hosting path. Everything else http(s)
// (pasted external URLs, unsplash, etc.) still gets the placeholder treatment.
const SUPABASE_STORAGE_PREFIX = process.env.EXPO_PUBLIC_SUPABASE_URL ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/` : null;
const OWN_SITE_PREFIXES = ['https://rcfsunset.org/', 'https://www.rcfsunset.org/'];
const OWN_SITE_IMAGE = /^https:\/\/(?:www\.)?rcfsunset\.org(\/images\/.+)\.(?:jpe?g|png)$/i;

// Same-origin WebP copy of a photo committed under public/images, so every
// deploy (including previews) serves its own optimized file.
function webpFor(src: string): string {
  const m = src.match(OWN_SITE_IMAGE);
  return m ? `${m[1]}.webp` : src;
}

function WebImage({ src, alt, fit, eager }: { src: string; alt: string; fit: 'contain' | 'cover'; eager?: boolean }) {
  const [current, setCurrent] = useState(webpFor(src));
  return (
    <img
      src={current}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => current !== src && setCurrent(src)}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: fit,
        objectPosition: fit === 'cover' ? 'center 40%' : 'center',
        backgroundColor: '#f1f5f9'
      }}
    />
  );
}

export default function SafeImage({ src, alt, style, containerStyle, fit = 'contain', eager }: SafeImageProps) {
  const isOwnUpload =
    !!src &&
    ((!!SUPABASE_STORAGE_PREFIX && src.startsWith(SUPABASE_STORAGE_PREFIX)) || OWN_SITE_PREFIXES.some((p) => src.startsWith(p)));
  const isExternalOrPlaceholder = !src || (!isOwnUpload && (src.includes('unsplash.com') || src.startsWith('http')));

  if (isExternalOrPlaceholder) {
    return (
      <View style={[styles.placeholder, containerStyle]}>
        <View style={styles.placeholderIconWrap}>
          <ImageOff size={16} color="#94a3b8" />
        </View>
        <Text style={styles.placeholderTitle}>Photo Coming Soon</Text>
        <Text style={styles.placeholderAlt} numberOfLines={2}>{alt}</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return <WebImage key={src} src={src as string} alt={alt} fit={fit} eager={eager} />;
  }

  return (
    <Image
      source={{ uri: src }}
      accessibilityLabel={alt}
      resizeMode="contain"
      style={[styles.image, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc'
  },
  placeholder: {
    flex: 1,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    gap: 6
  },
  placeholderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  placeholderAlt: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 200
  }
});

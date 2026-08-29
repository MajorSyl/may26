import React from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { ImageOff } from 'lucide-react-native';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

// Ported from the web app's SafeImage: any external/unsplash URL is treated
// as an unverified stock/placeholder image and rendered as a "Photo Coming
// Soon" box instead -- only genuinely uploaded (data: URI) images render as
// real photos. This is a deliberate anti-placeholder-image policy, not a
// bug (see AGENTS.md). Per this project's RN non-negotiables, every real
// image renders with resizeMode="contain" -- never "cover" -- so a photo is
// never cropped or has a face cut off, even though the web version used
// object-cover in some card layouts.
export default function SafeImage({ src, alt, style, containerStyle }: SafeImageProps) {
  const isExternalOrPlaceholder = !src || src.includes('unsplash.com') || src.startsWith('http');

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

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChevronRight, Image as ImageIcon, LucideIcon } from 'lucide-react-native';
import { uploadSiteImage } from '../lib/storage';
import { colors } from '../theme';

// Shared building blocks used across every ported screen, so each screen
// file stays focused on its own content instead of re-declaring the same
// badge/button/card markup. Uses NativeWind className throughout.

// `wide`: text-first screens (About, Contact, forms, ...) cap and center
// their content at tablet/desktop widths for readability -- a full-bleed
// column of text stretched across a desktop window reads poorly. Grid
// screens (Gallery, MembersDirectory, Events, ClubGallery) pass wide so
// their multi-column layouts can use the full available width instead.
//
// `edgeToEdge`: an optional header (e.g. a hero image) rendered above the
// padded content, genuinely full-bleed to the viewport edge. This exists
// specifically so screens never need a negative-margin trick to cancel
// the content padding -- that technique is fragile on RN Web (real mobile
// browsers can render the negative margin as actual overflow past the
// viewport edge, clipping the bled content instead of bleeding it).
export function ScreenScroll({
  children,
  wide = false,
  edgeToEdge
}: {
  children: React.ReactNode;
  wide?: boolean;
  edgeToEdge?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-rotary-light">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        {edgeToEdge}
        <View
          className={wide ? 'w-full md:px-6 lg:px-10' : 'w-full md:max-w-3xl md:mx-auto lg:max-w-4xl'}
          style={{ paddingTop: 16, paddingHorizontal: 16, gap: 24 }}
        >
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Badge({ label, tone = 'azure' }: { label: string; tone?: 'azure' | 'gold' }) {
  const bg = tone === 'gold' ? 'bg-rotary-gold/10' : 'bg-rotary-azure/10';
  const text = tone === 'gold' ? 'text-rotary-gold' : 'text-rotary-azure';
  return (
    <View className={`self-start px-3 py-1 rounded-full ${bg}`}>
      <Text className={`text-[10px] font-bold uppercase tracking-wider ${text}`}>{label}</Text>
    </View>
  );
}

// The native header already shows the page title (see each Stack.Screen's
// `options.title`) -- this renders only the descriptive subtitle beneath
// it, rather than repeating the title as a second, body-level heading.
export function ScreenTitle({ subtitle }: { title?: string; subtitle?: string }) {
  if (!subtitle) return null;
  return (
    <View className="gap-2">
      <Text className="text-slate-500 text-sm leading-relaxed">{subtitle}</Text>
    </View>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-md ${className}`}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'solid'
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`py-3.5 rounded-xl items-center justify-center flex-row gap-2 ${
        variant === 'solid' ? 'bg-rotary-azure' : 'bg-white border border-slate-300'
      } ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? colors.white : colors.rotaryAzure} />
      ) : (
        <Text className={`font-bold uppercase text-xs tracking-wider ${variant === 'solid' ? 'text-white' : 'text-slate-700'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  multiline
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'number-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'characters' | 'sentences' | 'words';
  multiline?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slate400}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        className={`bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-slate-800 text-sm ${
          multiline ? 'py-3 min-h-[90px]' : 'py-3'
        }`}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
      />
    </View>
  );
}

export function LinkRow({ icon: Icon, label, sublabel, onPress }: { icon: LucideIcon; label: string; sublabel?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-2xl border border-slate-200 p-4 flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-xl bg-rotary-azure/10 items-center justify-center">
        <Icon size={18} color={colors.rotaryAzure} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-slate-800">{label}</Text>
        {sublabel ? <Text className="text-[11px] text-slate-400 mt-0.5">{sublabel}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.slate400} />
    </Pressable>
  );
}

// w-11 h-11 (44x44) meets the common mobile touch-target minimum
// (Apple HIG / WCAG 2.5.5) -- this was 36x36 before, too small for a
// comfortable tap on the admin edit/delete/reorder buttons that use it.
export function IconButton({ icon: Icon, onPress, color }: { icon: LucideIcon; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} className="w-11 h-11 rounded-full items-center justify-center bg-slate-50 border border-slate-200">
      <Icon size={16} color={color || colors.slate500} />
    </Pressable>
  );
}

// Admin-only direct photo upload for site content (Page Content sections,
// Projects, Gallery) -- uploads straight to the `site-images` Storage
// bucket instead of requiring an admin to paste a URL. Plain <Image>, not
// SafeImage: this shows a real just-uploaded https Storage URL, not an
// unverified external/stock link, so SafeImage's placeholder-first policy
// doesn't apply here.
export function ImagePickerField({
  label,
  imageUrl,
  onChange,
  folder
}: {
  label: string;
  imageUrl: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo library access is needed to upload a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
    if (result.canceled || !result.assets?.[0]) return;
    setUploading(true);
    setError('');
    try {
      const asset = result.assets[0];
      const url = await uploadSiteImage(asset.uri, folder, asset.mimeType || 'image/jpeg');
      onChange(url);
    } catch (err: any) {
      setError(err?.message || 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="gap-2">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      {imageUrl ? (
        <View className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <Image source={{ uri: imageUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        </View>
      ) : null}
      <Pressable
        onPress={handlePick}
        disabled={uploading}
        className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50"
      >
        {uploading ? <ActivityIndicator size="small" color={colors.rotaryAzure} /> : <ImageIcon size={16} color={colors.slate500} />}
        <Text className="text-xs font-bold text-slate-600">{uploading ? 'Uploading...' : imageUrl ? 'Change Photo' : 'Upload Photo'}</Text>
      </Pressable>
      {error ? <Text className="text-[10px] text-rose-600">{error}</Text> : null}
    </View>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <View className="py-16 items-center justify-center gap-3">
      <ActivityIndicator color={colors.rotaryAzure} size="large" />
      <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</Text>
    </View>
  );
}

export function EmptyBlock({ label }: { label: string }) {
  return (
    <View className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 items-center">
      <Text className="text-slate-500 text-center text-sm">{label}</Text>
    </View>
  );
}

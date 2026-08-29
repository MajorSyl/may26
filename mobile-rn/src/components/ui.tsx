import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

// Shared building blocks used across every ported screen, so each screen
// file stays focused on its own content instead of re-declaring the same
// badge/button/card markup. Uses NativeWind className throughout.

export function ScreenScroll({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-rotary-light">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingTop: 16, paddingHorizontal: 16, gap: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
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

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="gap-2">
      <Text className="text-3xl font-extrabold text-rotary-dark tracking-tight">{title}</Text>
      {subtitle ? <Text className="text-slate-500 text-sm leading-relaxed">{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`bg-white rounded-3xl border border-slate-200 p-5 shadow-sm ${className}`}>{children}</View>;
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

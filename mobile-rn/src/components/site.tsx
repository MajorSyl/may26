import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ArrowLeft, ArrowRight, LucideIcon } from 'lucide-react-native';
import SiteFooter from '../navigation/SiteFooter';
import { colors } from '../theme';

// Public-site building blocks. Sections are full-width bands with their own
// centered container, so background tones can run edge to edge.

export function SitePage({ children, footer = true }: { children: React.ReactNode; footer?: boolean }) {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      {children}
      {footer ? <SiteFooter /> : null}
    </ScrollView>
  );
}

const TONES = {
  white: 'bg-white',
  cream: 'bg-rotary-cream',
  royal: 'bg-rotary-royal',
  deep: 'bg-rotary-royal-deep'
} as const;

export function Section({
  children,
  tone = 'white',
  tight,
  className = ''
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  tight?: boolean;
  className?: string;
}) {
  return (
    <View className={`w-full ${TONES[tone]}`}>
      <View className={`w-full max-w-6xl mx-auto px-5 sm:px-8 ${tight ? 'py-10 sm:py-12' : 'py-14 sm:py-20'} ${className}`}>{children}</View>
    </View>
  );
}

export function Eyebrow({ label, onDark }: { label: string; onDark?: boolean }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="w-6 h-[3px] rounded-full bg-rotary-gold" />
      <Text className={`text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] ${onDark ? 'text-white/80' : 'text-rotary-royal'}`}>{label}</Text>
    </View>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
  onDark
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
  onDark?: boolean;
}) {
  return (
    <View className={`gap-3 ${center ? 'items-center' : ''} max-w-2xl ${center ? 'mx-auto' : ''}`}>
      {eyebrow ? <Eyebrow label={eyebrow} onDark={onDark} /> : null}
      <Text
        accessibilityRole="header"
        className={`font-display text-[28px] leading-[34px] sm:text-4xl sm:leading-[44px] font-extrabold ${onDark ? 'text-white' : 'text-rotary-royal-deep'} ${center ? 'text-center' : ''}`}
      >
        {title}
      </Text>
      {intro ? (
        <Text className={`text-base leading-7 ${onDark ? 'text-white/85' : 'text-slate-600'} ${center ? 'text-center' : ''}`}>{intro}</Text>
      ) : null}
    </View>
  );
}

export function CTAButton({
  label,
  onPress,
  variant = 'primary',
  icon = true
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'light' | 'outline-light';
  icon?: boolean;
}) {
  const styles = {
    primary: { box: 'bg-rotary-royal hover:bg-rotary-royal-deep', text: 'text-white', icon: colors.white },
    secondary: { box: 'bg-white border border-slate-300 hover:border-rotary-royal', text: 'text-rotary-royal-deep', icon: colors.rotaryRoyal },
    light: { box: 'bg-white hover:bg-rotary-cream', text: 'text-rotary-royal-deep', icon: colors.rotaryRoyal },
    'outline-light': { box: 'border border-white/60 hover:bg-white/10', text: 'text-white', icon: colors.white }
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`min-h-[48px] px-6 rounded-full flex-row items-center justify-center gap-2 transition-colors duration-200 active:opacity-90 ${styles.box}`}
    >
      <Text className={`text-[15px] font-semibold ${styles.text}`}>{label}</Text>
      {icon ? <ArrowRight size={16} color={styles.icon} /> : null}
    </Pressable>
  );
}

export function TextLink({ label, onPress, onDark, back }: { label: string; onPress: () => void; onDark?: boolean; back?: boolean }) {
  const color = onDark ? colors.white : colors.rotaryLink;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" className="flex-row items-center gap-1.5 min-h-[44px] self-start">
      {back ? <ArrowLeft size={16} color={color} /> : null}
      <Text className={`text-[15px] font-semibold ${onDark ? 'text-white' : 'text-rotary-link'}`}>{label}</Text>
      {!back ? <ArrowRight size={16} color={color} /> : null}
    </Pressable>
  );
}

// Clearly marked stand-in for content the club still needs to supply.
export function PlaceholderNote({ label }: { label: string }) {
  return (
    <View className="self-start border border-dashed border-amber-400 bg-amber-50 rounded-lg px-2.5 py-1">
      <Text className="text-[11px] font-semibold text-amber-800">Placeholder · {label}</Text>
    </View>
  );
}

export function IconTile({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <View className="h-full bg-white border border-slate-200 rounded-2xl p-5 gap-3 min-h-[140px]">
      <View className="w-11 h-11 rounded-xl bg-rotary-gold-soft items-center justify-center">
        <Icon size={20} color={colors.rotaryRoyal} />
      </View>
      <Text className="text-[15px] leading-6 font-semibold text-rotary-royal-deep">{label}</Text>
    </View>
  );
}

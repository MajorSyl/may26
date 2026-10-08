import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform, Image, Modal, Animated, Easing, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, X } from 'lucide-react-native';
import { colors } from '../theme';

const NAV_LINKS: { label: string; tab: string; screen?: string; routes: string[] }[] = [
  { label: 'Home', tab: 'HomeTab', screen: 'Home', routes: ['Home'] },
  { label: 'About', tab: 'HomeTab', screen: 'About', routes: ['About'] },
  { label: 'Projects', tab: 'ProjectsTab', screen: 'Gallery', routes: ['Gallery', 'ProjectDetails'] },
  { label: 'Members', tab: 'MembersTab', screen: 'MembersDirectory', routes: ['MembersDirectory'] },
  { label: 'Contact', tab: 'MoreTab', screen: 'Contact', routes: ['Contact'] }
];

const DRAWER_WIDTH = 300;

export function ClubLockup({ compact, onDark }: { compact?: boolean; onDark?: boolean }) {
  const text = onDark ? 'text-white' : 'text-rotary-royal';
  return (
    <View className="flex-row items-center gap-3">
      <View>
        <View className="flex-row items-center gap-1.5">
          <Text className={`font-display text-[22px] leading-[24px] font-extrabold ${text}`}>Rotary</Text>
          <Image
            source={require('../assets/rotary-wheel.png')}
            style={{ width: 24, height: 24 }}
            accessibilityLabel="Rotary wheel"
          />
        </View>
        <Text className={`text-[11px] leading-[14px] font-semibold tracking-wide mt-0.5 ${text}`}>Club of Freetown-Sunset</Text>
      </View>
      {!compact ? (
        <View className={`hidden md:flex border-l pl-3 ${onDark ? 'border-white/40' : 'border-slate-300'}`}>
          {['Create', 'Lasting', 'Impact'].map((w) => (
            <Text key={w} className={`text-[10px] leading-[12px] font-extrabold italic uppercase ${text}`}>
              {w}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function SiteHeader({ routeName }: { routeName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const slide = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  useEffect(() => {
    if (menuOpen) {
      slide.setValue(DRAWER_WIDTH);
      Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    }
  }, [menuOpen, slide]);

  useEffect(() => {
    if (width >= 768 && menuOpen) setMenuOpen(false);
  }, [width, menuOpen]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  if (Platform.OS !== 'web') return null;

  const go = (tab: string, screen?: string) => {
    setMenuOpen(false);
    const parent = navigation.getParent();
    if (!parent) return;
    (parent.navigate as any)(tab, screen ? { screen } : undefined);
  };

  const isActive = (routes: string[]) => !!routeName && routes.includes(routeName);

  return (
    <View style={{ position: 'relative', zIndex: 40 }} className="bg-white border-b border-slate-200">
      <View className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex-row items-center justify-between" style={{ height: 72 }}>
        <Pressable onPress={() => go('HomeTab', 'Home')} accessibilityRole="link" accessibilityLabel="Rotary Club of Freetown-Sunset, home" className="py-2">
          <ClubLockup />
        </Pressable>

        <View role="navigation" className="hidden md:flex flex-row items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.routes);
            return (
              <Pressable
                key={link.label}
                onPress={() => go(link.tab, link.screen)}
                accessibilityRole="link"
                aria-current={active ? 'page' : undefined}
                className="px-4 min-h-[44px] justify-center rounded-full hover:bg-rotary-cream transition-colors"
              >
                <Text className={`text-[15px] font-semibold ${active ? 'text-rotary-royal' : 'text-slate-600'}`}>{link.label}</Text>
                <View className={`h-[2px] rounded-full mt-1 ${active ? 'bg-rotary-gold' : 'bg-transparent'}`} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          className="md:hidden w-11 h-11 items-center justify-center rounded-full active:bg-slate-100"
        >
          <Menu size={24} color={colors.rotaryRoyal} />
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={() => setMenuOpen(false)}>
        <View className="flex-1 flex-row">
          <Pressable className="flex-1" onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu" />
          <Animated.View
            style={{
              width: DRAWER_WIDTH,
              maxWidth: '86%',
              height: '100%',
              backgroundColor: colors.white,
              borderLeftWidth: 1,
              borderLeftColor: colors.slate200,
              shadowColor: '#0E2F63',
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: -8, height: 0 },
              transform: [{ translateX: slide }]
            }}
          >
            <View className="flex-row items-center justify-between px-5" style={{ height: 72 }}>
              <ClubLockup compact />
              <Pressable
                onPress={() => setMenuOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                className="w-11 h-11 items-center justify-center rounded-full active:bg-slate-100"
              >
                <X size={24} color={colors.rotaryRoyal} />
              </Pressable>
            </View>
            <View role="navigation" className="px-3 pt-2 gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.routes);
                return (
                  <Pressable
                    key={link.label}
                    onPress={() => go(link.tab, link.screen)}
                    accessibilityRole="link"
                    aria-current={active ? 'page' : undefined}
                    className={`min-h-[52px] px-4 rounded-xl flex-row items-center justify-between ${active ? 'bg-rotary-cream' : 'active:bg-slate-50'}`}
                  >
                    <Text className={`font-display text-lg font-bold ${active ? 'text-rotary-royal' : 'text-rotary-royal-deep'}`}>{link.label}</Text>
                    {active ? <View className="w-2 h-2 rounded-full bg-rotary-gold" /> : null}
                  </Pressable>
                );
              })}
            </View>
            <View className="mt-auto px-6 pb-8 gap-1">
              <Text className="text-xs font-extrabold italic uppercase text-rotary-royal">Create Lasting Impact</Text>
              <Text className="text-xs text-slate-500">Rotary Club of Freetown-Sunset</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

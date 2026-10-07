import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, X } from 'lucide-react-native';
import { colors } from '../theme';

// Web-only. Rendered by each public stack's `header` screenOption.
const NAV_LINKS: { label: string; tab: string; screen?: string }[] = [
  { label: 'Home', tab: 'HomeTab' },
  { label: 'About', tab: 'HomeTab', screen: 'About' },
  { label: 'Projects', tab: 'ProjectsTab' },
  { label: 'Members', tab: 'MembersTab' },
  { label: 'Contact', tab: 'MoreTab', screen: 'Contact' }
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation<any>();

  if (Platform.OS !== 'web') return null;

  const goTab = (tab: string, screen?: string) => {
    setMenuOpen(false);
    const parent = navigation.getParent();
    if (!parent) return;
    if (screen) (parent.navigate as any)(tab, { screen });
    else (parent.navigate as any)(tab);
  };

  return (
    <View style={{ position: 'relative', zIndex: 40 }}>
      <View className="bg-white border-b border-slate-200 shadow-sm">
        <View className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 flex-row items-center justify-between" style={{ height: 68 }}>
          <Pressable onPress={() => goTab('HomeTab')} className="py-2 flex-row items-center gap-3">
            <View>
              <Text className="text-lg sm:text-xl font-extrabold text-rotary-royal tracking-tight leading-none">Rotary</Text>
              <Text className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-rotary-royal leading-none mt-0.5">
                Club of Freetown-Sunset
              </Text>
            </View>
            <View className="hidden md:flex border-l border-slate-300 pl-3 py-0.5">
              <Text className="text-[9px] font-extrabold italic uppercase text-rotary-royal leading-tight">Create</Text>
              <Text className="text-[9px] font-extrabold italic uppercase text-rotary-royal leading-tight">Lasting</Text>
              <Text className="text-[9px] font-extrabold italic uppercase text-rotary-royal leading-tight">Impact</Text>
            </View>
          </Pressable>

          <View className="hidden sm:flex flex-row items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => goTab(link.tab, link.screen)}
                className="px-3.5 py-2 rounded-lg hover:bg-slate-100"
              >
                <Text className="text-[13px] font-bold text-slate-700">{link.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden w-10 h-10 items-center justify-center rounded-lg active:bg-slate-100"
          >
            {menuOpen ? <X size={22} color={colors.rotaryDark} /> : <Menu size={22} color={colors.rotaryDark} />}
          </Pressable>
        </View>
      </View>

      {menuOpen && (
        <View className="sm:hidden absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-lg" style={{ zIndex: 50 }}>
          <View className="px-4 py-3 gap-1">
            {NAV_LINKS.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => goTab(link.tab, link.screen)}
                className="px-3 py-3 rounded-lg active:bg-slate-100"
              >
                <Text className="text-sm font-bold text-slate-700">{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

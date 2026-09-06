import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, X, ShieldCheck, UserCircle2 } from 'lucide-react-native';
import { colors } from '../theme';

// The web-only public site header: logo left, nav links right (tablet/
// desktop), collapsing into a hamburger + dropdown menu below 640px. This
// replaces the old bottom-tab-bar-that-becomes-a-left-sidebar setup for
// every public page (see ResponsiveTabBar.tsx, now a no-op on web) --
// that pattern is reserved for a future logged-in member/admin dashboard,
// not the public site. Rendered once per public stack navigator (Home,
// Projects, Events, Members, More) via each one's `header` screenOption,
// so it sits above that stack's own ScrollView -- structurally "sticky"
// for free, no scroll listener needed, since it never enters the
// scrolling content itself.
//
// Uses the exact same getParent() hop pattern as HomeScreen's goToTab and
// MoreScreen's goToRootScreen: one hop from this stack to the Tab
// navigator for tab targets, two hops to the root Stack for the
// standalone auth screens.
const NAV_LINKS: { label: string; tab: string; screen?: string }[] = [
  { label: 'Home', tab: 'HomeTab' },
  { label: 'Projects', tab: 'ProjectsTab' },
  { label: 'Events', tab: 'EventsTab' },
  { label: 'Members', tab: 'MembersTab' },
  { label: 'About', tab: 'HomeTab', screen: 'About' },
  { label: 'More', tab: 'MoreTab' }
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

  const goRoot = (screen: 'AdminLogin' | 'MemberAccount') => {
    setMenuOpen(false);
    (navigation.getParent()?.getParent() as any)?.navigate(screen);
  };

  return (
    <View style={{ position: 'relative', zIndex: 40 }}>
      <View className="bg-white border-b border-slate-200 shadow-sm">
        <View className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 flex-row items-center justify-between" style={{ height: 64 }}>
          <Pressable onPress={() => goTab('HomeTab')} className="py-2">
            <Text className="text-xl font-extrabold text-rotary-azure tracking-tight">RCFS</Text>
          </Pressable>

          <View className="hidden sm:flex flex-row items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => goTab(link.tab, link.screen)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                <Text className="text-[13px] font-bold text-slate-700">{link.label}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => goRoot('MemberAccount')}
              className="ml-2 flex-row items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100"
            >
              <UserCircle2 size={15} color={colors.slate600} />
              <Text className="text-[13px] font-bold text-slate-700">Sign In</Text>
            </Pressable>
            <Pressable
              onPress={() => goRoot('AdminLogin')}
              accessibilityLabel="Admin Sign In"
              className="w-9 h-9 rounded-full bg-rotary-dark items-center justify-center hover:opacity-90"
            >
              <ShieldCheck size={16} color={colors.white} />
            </Pressable>
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
            <View className="h-px bg-slate-200 my-1" />
            <Pressable onPress={() => goRoot('MemberAccount')} className="flex-row items-center gap-2 px-3 py-3 rounded-lg active:bg-slate-100">
              <UserCircle2 size={16} color={colors.slate600} />
              <Text className="text-sm font-bold text-slate-700">Member Sign In</Text>
            </Pressable>
            <Pressable onPress={() => goRoot('AdminLogin')} className="flex-row items-center gap-2 px-3 py-3 rounded-lg active:bg-slate-100">
              <ShieldCheck size={16} color={colors.rotaryDark} />
              <Text className="text-sm font-bold text-rotary-dark">Admin Sign In</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

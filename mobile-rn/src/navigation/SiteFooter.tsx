import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Facebook, Instagram, Mail } from 'lucide-react-native';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { ClubLockup } from './SiteHeader';
import { colors } from '../theme';

const LINKS: { label: string; tab: string; screen: string }[] = [
  { label: 'Home', tab: 'HomeTab', screen: 'Home' },
  { label: 'About', tab: 'HomeTab', screen: 'About' },
  { label: 'Projects', tab: 'ProjectsTab', screen: 'Gallery' },
  { label: 'Members', tab: 'MembersTab', screen: 'MembersDirectory' },
  { label: 'Contact', tab: 'MoreTab', screen: 'Contact' }
];

// Two getParent() hops reach the root stack (AdminLogin); one hop reaches
// the tab navigator.
export default function SiteFooter() {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let active = true;
    getSiteSettings().then((s) => active && setSettings(s));
    return () => {
      active = false;
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  const goTab = (tab: string, screen: string) => (navigation.getParent()?.navigate as any)?.(tab, { screen });
  const goAdminLogin = () => (navigation.getParent()?.getParent() as any)?.navigate('AdminLogin');

  const social = [
    { label: 'Facebook', url: settings.socialFacebookUrl, Icon: Facebook },
    { label: 'Instagram', url: settings.socialInstagramUrl, Icon: Instagram }
  ].filter((s) => !!s.url);

  return (
    <View className="w-full bg-rotary-royal-deep mt-auto">
      <View className="w-full max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-8 gap-10">
        <View className="gap-10 md:flex-row md:flex-wrap md:justify-between md:gap-x-12">
          <View className="gap-4 md:max-w-xs">
            <ClubLockup onDark />
            <Text className="text-sm leading-6 text-white/75">
              Professionals united in service, creating lasting impact in Freetown and across Sierra Leone.
            </Text>
            <View className="flex-row gap-3">
              {social.map(({ label, url, Icon }) => (
                <Pressable
                  key={label}
                  onPress={() => Linking.openURL(url)}
                  accessibilityRole="link"
                  accessibilityLabel={label}
                  className="w-11 h-11 rounded-full border border-white/30 items-center justify-center hover:bg-white/10"
                >
                  <Icon size={18} color={colors.white} />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-gold">Explore</Text>
            {LINKS.map((l) => (
              <Pressable key={l.label} onPress={() => goTab(l.tab, l.screen)} accessibilityRole="link" className="min-h-[32px] justify-center">
                <Text className="text-[15px] text-white/85 hover:text-white">{l.label}</Text>
              </Pressable>
            ))}
          </View>

          <View className="gap-3 md:max-w-xs">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-gold">Get in touch</Text>
            {settings.contactEmail ? (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${settings.contactEmail}`)}
                accessibilityRole="link"
                className="flex-row items-center gap-2 min-h-[32px]"
              >
                <Mail size={16} color={colors.white} />
                <Text className="text-[15px] text-white/85">{settings.contactEmail}</Text>
              </Pressable>
            ) : null}
            {settings.meetingSchedule ? (
              <Text className="text-sm leading-6 text-white/75">
                We meet {settings.meetingSchedule}
                {settings.meetingLocation ? ` at ${settings.meetingLocation}` : ''}.
              </Text>
            ) : null}
          </View>
        </View>

        <View className="border-t border-white/15 pt-6 gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text className="text-xs text-white/60">
            © {new Date().getFullYear()} Rotary Club of Freetown-Sunset{settings.districtLabel ? ` · ${settings.districtLabel}` : ''}
          </Text>
          <View className="flex-row items-center gap-5">
            <Pressable onPress={() => goTab('MoreTab', 'PrivacyPolicy')} accessibilityRole="link" className="min-h-[44px] justify-center">
              <Text className="text-xs text-white/60 hover:text-white">Privacy Policy</Text>
            </Pressable>
            <Pressable onPress={goAdminLogin} accessibilityRole="link" className="min-h-[44px] justify-center">
              <Text className="text-xs text-white/60 hover:text-white">Admin sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

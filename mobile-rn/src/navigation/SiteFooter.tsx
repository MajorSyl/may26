import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Facebook, Instagram } from 'lucide-react-native';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { colors } from '../theme';

// Two getParent() hops reach the root stack (AdminLogin); one hop reaches
// a sibling tab (PrivacyPolicy under MoreTab).
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

  const goAdminLogin = () => {
    (navigation.getParent()?.getParent() as any)?.navigate('AdminLogin');
  };

  const goPrivacy = () => {
    const parent = navigation.getParent();
    if (!parent) return;
    (parent.navigate as any)('MoreTab', { screen: 'PrivacyPolicy' });
  };

  return (
    <View className="items-center gap-3 pt-6 pb-2 border-t border-slate-200">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => Linking.openURL(settings.socialFacebookUrl)}
          accessibilityLabel="Facebook"
          accessibilityRole="link"
          className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center hover:border-slate-300"
        >
          <Facebook size={16} color={colors.slate600} />
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(settings.socialInstagramUrl)}
          accessibilityLabel="Instagram"
          accessibilityRole="link"
          className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center hover:border-slate-300"
        >
          <Instagram size={16} color={colors.slate600} />
        </Pressable>
      </View>
      <Text className="text-[11px] text-slate-400 text-center">
        Rotary Club of Freetown-Sunset &middot; Rotary District 9101 &middot; Create Lasting Impact
      </Text>
      <View className="flex-row items-center gap-4">
        <Pressable onPress={goPrivacy}>
          <Text className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">Privacy Policy</Text>
        </Pressable>
        <View className="w-1 h-1 rounded-full bg-slate-300" />
        <Pressable onPress={goAdminLogin}>
          <Text className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">Admin</Text>
        </Pressable>
      </View>
    </View>
  );
}

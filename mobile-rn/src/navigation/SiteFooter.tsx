import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Quiet, bottom-of-page home for the two links the brief wants out of the
// header: Admin sign-in (no longer prominent top-right) and Privacy Policy
// (no longer worth a "More" nav item of its own). Web-only, rendered once
// at the end of Home's content, matching SiteHeader's getParent() hop
// pattern (two hops to the root Stack for AdminLogin, one hop + nested
// screen for the Privacy Policy page under MoreTab).
export default function SiteFooter() {
  const navigation = useNavigation<any>();

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

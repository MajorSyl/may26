import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Image as ImageIcon, Heart, Mail, ShieldCheck, ChevronRight, Sun, Shield, UserPlus, Instagram } from 'lucide-react-native';
import { MoreStackParamList, TabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<MoreStackParamList, 'More'>,
  BottomTabScreenProps<TabParamList>
>;

function MenuRow({ icon: Icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-4">
      <View className="w-9 h-9 rounded-xl bg-rotary-azure/10 items-center justify-center">
        <Icon size={17} color={colors.rotaryAzure} />
      </View>
      <Text className="flex-1 font-semibold text-slate-800 text-sm">{label}</Text>
      <ChevronRight size={16} color={colors.slate400} />
    </Pressable>
  );
}

export default function MoreScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  // The two auth screens live in the root stack (a sibling of the tab
  // navigator, not a child of this tab's own stack), so reaching them
  // means climbing two levels: this MoreStack -> the Tab navigator -> the
  // RootStack. React Navigation doesn't type that hop cleanly, hence `any`.
  const goToRootScreen = (screen: 'AdminLogin' | 'MemberAccount') => {
    (navigation.getParent()?.getParent() as any)?.navigate(screen);
  };

  return (
    <ScrollView className="flex-1 bg-rotary-light" contentContainerStyle={{ padding: 16, paddingTop: 16, paddingBottom: insets.bottom + 32, gap: 12 }}>
      <MenuRow icon={ImageIcon} label="Club Gallery" onPress={() => navigation.navigate('ClubGallery')} />
      <MenuRow icon={Instagram} label="Social Feed" onPress={() => navigation.navigate('SocialFeed')} />
      <MenuRow icon={Heart} label="Get Involved" onPress={() => navigation.navigate('GetInvolved')} />
      <MenuRow icon={Mail} label="Contact" onPress={() => navigation.navigate('Contact')} />
      <MenuRow icon={Sun} label="What is Rotary" onPress={() => navigation.navigate('WhatIsRotary')} />
      <MenuRow icon={Shield} label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />

      <View className="h-px bg-slate-200 my-2" />

      <MenuRow icon={UserPlus} label="Member Sign In" onPress={() => goToRootScreen('MemberAccount')} />
      <MenuRow icon={ShieldCheck} label="Admin Sign In" onPress={() => goToRootScreen('AdminLogin')} />
    </ScrollView>
  );
}

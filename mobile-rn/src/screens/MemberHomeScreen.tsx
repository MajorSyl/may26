import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { logOut } from '../lib/service';
import { ScreenScroll, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberHome'>;

// Placeholder landing screen after a successful member login, per this
// rebuild's scope -- the real member portal (profile, submissions, chat,
// timeline) is being redesigned separately and intentionally not built
// here. See MIGRATION_NOTES.md.
export default function MemberHomeScreen({ navigation }: Props) {
  return (
    <ScreenScroll>
      <View className="items-center gap-4 py-12">
        <CheckCircle size={48} color={colors.emerald600} />
        <Text className="text-2xl font-extrabold text-slate-800 text-center">You're signed in</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed max-w-xs">
          The full Member Portal (profile, submissions, chat, timeline) is being redesigned separately and isn't part of
          this rebuild yet.
        </Text>
        <View className="w-full pt-4">
          <PrimaryButton
            label="Log Out"
            variant="outline"
            onPress={async () => {
              await logOut();
              navigation.popToTop();
            }}
          />
        </View>
      </View>
    </ScreenScroll>
  );
}

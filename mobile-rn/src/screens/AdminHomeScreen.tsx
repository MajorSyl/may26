import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { logOut } from '../lib/service';
import { ScreenScroll, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

// Placeholder landing screen after a successful admin login, per this
// rebuild's scope -- the real admin dashboard (Projects/Events/Members/
// Inquiries/Approvals/Settings/Roles/Analytics) is being redesigned
// separately and intentionally not built here. See MIGRATION_NOTES.md.
export default function AdminHomeScreen({ navigation }: Props) {
  return (
    <ScreenScroll>
      <View className="items-center gap-4 py-12">
        <ShieldCheck size={48} color={colors.rotaryAzure} />
        <Text className="text-2xl font-extrabold text-slate-800 text-center">Admin access granted</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed max-w-xs">
          The full admin dashboard (projects, events, members, approvals, settings, roles, analytics) is being redesigned
          separately and isn't part of this rebuild yet.
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

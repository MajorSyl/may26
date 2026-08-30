import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle, UserCircle, FileText } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { logOut } from '../lib/service';
import { ScreenScroll, PrimaryButton, LinkRow } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberHome'>;

// Chat/timeline are being redesigned separately (see MIGRATION_NOTES.md) --
// this hub covers Profile and Submissions, the two pieces built this pass.
export default function MemberHomeScreen({ navigation }: Props) {
  return (
    <ScreenScroll>
      <View className="items-center gap-3 py-6">
        <CheckCircle size={40} color={colors.emerald600} />
        <Text className="text-2xl font-extrabold text-slate-800 text-center">You're signed in</Text>
        <Text className="text-xs text-slate-400 text-center">RCFS -- Member Portal</Text>
      </View>

      <View className="gap-3">
        <LinkRow icon={UserCircle} label="My Profile" sublabel="View and edit your member details" onPress={() => navigation.navigate('MemberProfile')} />
        <LinkRow icon={FileText} label="My Submissions" sublabel="Submit a project or photo for review" onPress={() => navigation.navigate('MemberSubmissions')} />
      </View>

      <View className="pt-2">
        <PrimaryButton
          label="Log Out"
          variant="outline"
          onPress={async () => {
            await logOut();
            navigation.popToTop();
          }}
        />
      </View>
    </ScreenScroll>
  );
}

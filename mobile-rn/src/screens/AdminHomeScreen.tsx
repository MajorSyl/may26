import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck, FolderKanban, CalendarDays, Users, Mail, ClipboardCheck, Settings, KeyRound, BarChart3 } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { logOut } from '../lib/service';
import { ScreenScroll, PrimaryButton, LinkRow } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

// Realtime chat/timeline moderation is out of scope here (separate pass,
// see MIGRATION_NOTES.md); everything else from the old AdminDashboard is
// covered by the sections below, wired to the same Supabase tables/RLS.
export default function AdminHomeScreen({ navigation }: Props) {
  return (
    <ScreenScroll>
      <View className="items-center gap-3 py-6">
        <ShieldCheck size={40} color={colors.rotaryAzure} />
        <Text className="text-2xl font-extrabold text-slate-800 text-center">Admin Access Granted</Text>
        <Text className="text-xs text-slate-400 text-center">Rotary Dist. 9101 Security Protocol Compliance Grid</Text>
      </View>

      <View className="gap-3">
        <LinkRow icon={FolderKanban} label="Projects" sublabel="Create, edit, or remove club projects" onPress={() => navigation.navigate('AdminProjects')} />
        <LinkRow icon={CalendarDays} label="Events" sublabel="Manage the club calendar" onPress={() => navigation.navigate('AdminEvents')} />
        <LinkRow icon={Users} label="Members" sublabel="Edit member profiles" onPress={() => navigation.navigate('AdminMembers')} />
        <LinkRow icon={Mail} label="Inquiries" sublabel="Contact form + Get Involved submissions" onPress={() => navigation.navigate('AdminInquiries')} />
        <LinkRow icon={ClipboardCheck} label="Approvals" sublabel="Review member-submitted projects & photos" onPress={() => navigation.navigate('AdminApprovals')} />
        <LinkRow icon={Settings} label="Settings" sublabel="Site copy and contact details" onPress={() => navigation.navigate('AdminSettings')} />
        <LinkRow icon={KeyRound} label="Roles" sublabel="Manage admin & reviewer access" onPress={() => navigation.navigate('AdminRoles')} />
        <LinkRow icon={BarChart3} label="Analytics" sublabel="Club activity at a glance" onPress={() => navigation.navigate('AdminAnalytics')} />
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

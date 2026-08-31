import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck, FolderKanban, CalendarDays, Users, Mail, ClipboardCheck, Settings, KeyRound, BarChart3, UserCheck, LayoutTemplate, Image as ImageIcon, ListChecks, Instagram } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { logOut, getCurrentOfficerRole, OfficerRole } from '../lib/service';
import { ScreenScroll, PrimaryButton, LinkRow } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

const FULL_ACCESS: OfficerRole[] = ['admin', 'president', 'secretary'];

// Realtime chat/timeline moderation is out of scope here (separate pass,
// see MIGRATION_NOTES.md); everything else from the old AdminDashboard is
// covered by the sections below, wired to the same Supabase tables/RLS.
// Sections are hidden (not just disabled) for scoped officer roles so a
// Treasurer/Media officer never lands on a screen they can't actually use
// -- this is a UX convenience on top of the real RLS enforcement, not a
// substitute for it.
export default function AdminHomeScreen({ navigation }: Props) {
  const [role, setRole] = useState<OfficerRole | null>(null);

  useEffect(() => {
    getCurrentOfficerRole().then(setRole).catch(() => setRole(null));
  }, []);

  const isFull = role === null || FULL_ACCESS.includes(role);
  const isMedia = isFull || role === 'media';
  const isTreasurer = isFull || role === 'treasurer';

  return (
    <ScreenScroll>
      <View className="items-center gap-2 py-4">
        <ShieldCheck size={32} color={colors.rotaryAzure} />
        <Text className="text-xs text-slate-400 text-center">Manage the club's site and membership below.</Text>
      </View>

      <View className="gap-3">
        {isTreasurer && (
          <LinkRow icon={FolderKanban} label="Projects" sublabel="Create, edit, or remove club projects" onPress={() => navigation.navigate('AdminProjects')} />
        )}
        {isFull && <LinkRow icon={CalendarDays} label="Events" sublabel="Manage the club calendar" onPress={() => navigation.navigate('AdminEvents')} />}
        {isFull && <LinkRow icon={Users} label="Members" sublabel="Edit member profiles" onPress={() => navigation.navigate('AdminMembers')} />}
        {isFull && <LinkRow icon={Mail} label="Inquiries" sublabel="Contact form + Get Involved submissions" onPress={() => navigation.navigate('AdminInquiries')} />}
        {isMedia && (
          <LinkRow icon={ClipboardCheck} label="Approvals" sublabel="Review member-submitted projects & photos" onPress={() => navigation.navigate('AdminApprovals')} />
        )}
        {isMedia && <LinkRow icon={ImageIcon} label="Gallery" sublabel="Add, edit, or remove gallery photos" onPress={() => navigation.navigate('AdminGallery')} />}
        {isFull && <LinkRow icon={Settings} label="Settings" sublabel="Site copy and contact details" onPress={() => navigation.navigate('AdminSettings')} />}
        {isMedia && (
          <LinkRow icon={LayoutTemplate} label="Page Content" sublabel="Manage Home/About/etc. sections" onPress={() => navigation.navigate('AdminContentBlocks')} />
        )}
        {isFull && <LinkRow icon={KeyRound} label="Roles" sublabel="Manage officer access" onPress={() => navigation.navigate('AdminRoles')} />}
        {isFull && (
          <LinkRow icon={UserCheck} label="Pending Members" sublabel="Approve or reject new member sign-ups" onPress={() => navigation.navigate('AdminPendingMembers')} />
        )}
        {isFull && <LinkRow icon={BarChart3} label="Analytics" sublabel="Traffic charts and club activity" onPress={() => navigation.navigate('AdminAnalytics')} />}
        {isFull && <LinkRow icon={ListChecks} label="Visitor Log" sublabel="Searchable page-view log" onPress={() => navigation.navigate('AdminVisitorLog')} />}
        {isMedia && (
          <LinkRow icon={Instagram} label="Social Feed" sublabel="Instagram/Facebook credentials, sync & token status" onPress={() => navigation.navigate('AdminSocialFeed')} />
        )}
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

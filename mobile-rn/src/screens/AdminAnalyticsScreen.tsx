import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Users, FolderKanban, CalendarDays, Mail, ClipboardList, CalendarCheck, ClipboardCheck, KeyRound, AlertTriangle, LucideIcon } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { AnalyticsSnapshot, adminGetAnalytics } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminAnalytics'>;

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <Card className="flex-1 gap-2 items-start" >
      <View className="w-9 h-9 rounded-xl bg-rotary-azure/10 items-center justify-center">
        <Icon size={16} color={colors.rotaryAzure} />
      </View>
      <Text className="text-2xl font-black text-slate-800">{value}</Text>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</Text>
    </Card>
  );
}

export default function AdminAnalyticsScreen({}: Props) {
  const [stats, setStats] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetAnalytics()
      .then(setStats)
      .catch((err) => setError(err?.message || 'Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenScroll>
      <ScreenTitle title="Analytics" subtitle="Club activity at a glance." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading || !stats ? (
        <LoadingBlock label="Crunching numbers..." />
      ) : (
        <>
          <View className="flex-row gap-3">
            <StatTile icon={Users} label="Members" value={stats.members} />
            <StatTile icon={FolderKanban} label="Projects" value={stats.projects} />
          </View>
          <View className="flex-row gap-3">
            <StatTile icon={CalendarDays} label="Events" value={stats.events} />
            <StatTile icon={KeyRound} label="Admins" value={stats.admins} />
          </View>
          <View className="flex-row gap-3">
            <StatTile icon={Mail} label="Inquiries" value={stats.inquiries} />
            <StatTile icon={ClipboardList} label="Applications" value={stats.applications} />
          </View>
          <View className="flex-row gap-3">
            <StatTile icon={CalendarCheck} label="RSVPs" value={stats.rsvps} />
            <StatTile icon={ClipboardCheck} label="Pending Approvals" value={stats.pendingSubmissions} />
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

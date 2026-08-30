import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Users, FolderKanban, CalendarDays, Mail, ClipboardList, CalendarCheck, ClipboardCheck, KeyRound, AlertTriangle, Eye, MapPin, LucideIcon } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { AnalyticsSnapshot, adminGetAnalytics } from '../lib/service';
import { AnalyticsSummary, adminGetAnalyticsSummary } from '../lib/analytics';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminAnalytics'>;

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <Card className="flex-1 gap-2 items-start">
      <View className="w-9 h-9 rounded-xl bg-rotary-azure/10 items-center justify-center">
        <Icon size={16} color={colors.rotaryAzure} />
      </View>
      <Text className="text-2xl font-black text-slate-800">{value}</Text>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</Text>
    </Card>
  );
}

// Hand-rolled bar chart (react-native-svg, already a dependency via
// lucide-react-native) instead of pulling in a charting library -- avoids
// repeating the Metro/reanimated dependency-version conflict documented in
// MIGRATION_NOTES.md for anything that isn't already in the tree.
function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const width = 320;
  const height = 120;
  const barGap = 4;
  const barWidth = data.length > 0 ? (width - barGap * (data.length - 1)) / data.length : 0;
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <View>
      <Svg width={width} height={height + 16}>
        {data.map((d, i) => {
          const barHeight = (d.count / max) * height;
          const x = i * (barWidth + barGap);
          return <Rect key={i} x={x} y={height - barHeight} width={barWidth} height={Math.max(barHeight, 2)} rx={2} fill={colors.rotaryAzure} />;
        })}
      </Svg>
      <View className="flex-row justify-between mt-1">
        <Text className="text-[8px] text-slate-400">{data[0]?.label}</Text>
        <Text className="text-[8px] text-slate-400">{data[data.length - 1]?.label}</Text>
      </View>
    </View>
  );
}

export default function AdminAnalyticsScreen({ navigation }: Props) {
  const [stats, setStats] = useState<AnalyticsSnapshot | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminGetAnalytics(), adminGetAnalyticsSummary()])
      .then(([s, sum]) => {
        setStats(s);
        setSummary(sum);
      })
      .catch((err) => setError(err?.message || 'Could not load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenScroll>
      <ScreenTitle title="Analytics" subtitle="Club activity and site traffic at a glance." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading || !stats || !summary ? (
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

          <View className="flex-row gap-3">
            <StatTile icon={Eye} label="Page Views (recent)" value={summary.totalViews} />
            <StatTile icon={Users} label="Unique Visitors" value={summary.uniqueVisitors} />
          </View>

          <Card className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Views, Last 14 Days</Text>
            <BarChart data={summary.dailyCounts} />
          </Card>

          <Card className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Most-Visited Pages</Text>
            {summary.topPages.length === 0 ? (
              <Text className="text-xs text-slate-400">No page views logged yet.</Text>
            ) : (
              summary.topPages.map((p) => (
                <View key={p.page} className="flex-row items-center justify-between py-1.5 border-b border-slate-50">
                  <Text className="text-xs text-slate-700">{p.page}</Text>
                  <Text className="text-xs font-bold text-slate-800">{p.count}</Text>
                </View>
              ))
            )}
          </Card>

          <Card className="gap-3">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={13} color={colors.rotaryAzure} />
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Locations</Text>
            </View>
            {summary.topLocations.length === 0 ? (
              <Text className="text-xs text-slate-400">No location data yet.</Text>
            ) : (
              summary.topLocations.map((l) => (
                <View key={l.label} className="flex-row items-center justify-between py-1.5 border-b border-slate-50">
                  <Text className="text-xs text-slate-700">{l.label}</Text>
                  <Text className="text-xs font-bold text-slate-800">{l.count}</Text>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </ScreenScroll>
  );
}

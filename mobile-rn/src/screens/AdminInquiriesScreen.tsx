import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Trash2, AlertTriangle, Mail, FolderKanban, CalendarCheck } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { ContactInquiry, ProjectApplication, EventRSVP } from '../types';
import { adminListInquiries, adminDeleteInquiry, adminListApplications, adminListRsvps } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminInquiries'>;
type Tab = 'inquiries' | 'applications' | 'rsvps';

export default function AdminInquiriesScreen({}: Props) {
  const [tab, setTab] = useState<Tab>('inquiries');
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [i, a, r] = await Promise.all([adminListInquiries(), adminListApplications(), adminListRsvps()]);
      setInquiries(i);
      setApplications(a);
      setRsvps(r);
    } catch (err: any) {
      setError(err?.message || 'Could not load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeleteInquiry = (item: ContactInquiry) => {
    Alert.alert('Delete Inquiry', `Remove this inquiry from ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteInquiry(item.id);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not delete this inquiry.');
          }
        }
      }
    ]);
  };

  const TABS: { id: Tab; label: string; icon: typeof Mail; count: number }[] = [
    { id: 'inquiries', label: 'Inquiries', icon: Mail, count: inquiries.length },
    { id: 'applications', label: 'Applications', icon: FolderKanban, count: applications.length },
    { id: 'rsvps', label: 'RSVPs', icon: CalendarCheck, count: rsvps.length }
  ];

  return (
    <ScreenScroll>
      <ScreenTitle title="Inquiries" subtitle="Contact, project applications, and event RSVPs." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-2">
        {TABS.map((t) => {
          const isSel = tab === t.id;
          const Icon = t.icon;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              className={`flex-1 items-center gap-1 py-2.5 rounded-xl border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
            >
              <Icon size={14} color={isSel ? colors.white : colors.slate500} />
              <Text className={`text-[9px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>
                {t.label} ({t.count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <LoadingBlock label="Loading..." />
      ) : tab === 'inquiries' ? (
        inquiries.length === 0 ? (
          <EmptyBlock label="No inquiries yet." />
        ) : (
          <View className="gap-3">
            {inquiries.map((item) => (
              <Card key={item.id} className="gap-2">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1 gap-1">
                    <Badge label={item.type} />
                    <Text className="text-sm font-bold text-slate-800">{item.name}</Text>
                    <Text className="text-[11px] text-slate-400">{item.email}</Text>
                    {item.subject ? <Text className="text-xs text-slate-600 font-semibold mt-1">{item.subject}</Text> : null}
                    <Text className="text-xs text-slate-500 leading-relaxed">{item.message}</Text>
                  </View>
                  <IconButton icon={Trash2} onPress={() => handleDeleteInquiry(item)} color={colors.rose600} />
                </View>
              </Card>
            ))}
          </View>
        )
      ) : tab === 'applications' ? (
        applications.length === 0 ? (
          <EmptyBlock label="No project applications yet." />
        ) : (
          <View className="gap-3">
            {applications.map((item) => (
              <Card key={item.id} className="gap-1">
                <Text className="text-sm font-bold text-slate-800">{item.name}</Text>
                <Text className="text-[11px] text-slate-400">{item.email}</Text>
                <Text className="text-xs text-slate-500 leading-relaxed mt-1">{item.statement}</Text>
              </Card>
            ))}
          </View>
        )
      ) : rsvps.length === 0 ? (
        <EmptyBlock label="No RSVPs yet." />
      ) : (
        <View className="gap-3">
          {rsvps.map((item) => (
            <Card key={item.id} className="gap-1">
              <Text className="text-sm font-bold text-slate-800">{item.name}</Text>
              <Text className="text-[11px] text-slate-400">{item.email}</Text>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

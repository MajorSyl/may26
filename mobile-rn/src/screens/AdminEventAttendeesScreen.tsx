import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Users, Mail, AlertTriangle, MapPin, Plus, Trash2, Search } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { EventRSVP, AttendanceRecord, UserProfile } from '../types';
import { adminListEventRsvps, adminListAttendance, adminManualCheckIn, adminRemoveAttendance, getUsers } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminEventAttendees'>;

export default function AdminEventAttendeesScreen({ route }: Props) {
  const { eventId, eventTitle } = route.params;
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [r, a, m] = await Promise.all([adminListEventRsvps(eventId), adminListAttendance(eventId), getUsers()]);
      setRsvps(r);
      setAttendance(a);
      setMembers(m);
    } catch (err: any) {
      setError(err?.message || 'Could not load attendees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const attendedIds = new Set(attendance.map((a) => a.member_id));
  const candidates = members.filter((m) => m.authUserId && !attendedIds.has(m.authUserId) && search && m.name.toLowerCase().includes(search.toLowerCase()));

  const handleManualAdd = (m: UserProfile) => {
    Alert.alert('Add Attendance', `Mark "${m.name}" as attended? Use this when their GPS check-in isn't working (e.g. indoors).`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        onPress: async () => {
          try {
            await adminManualCheckIn(eventId, m.authUserId!);
            setSearch('');
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not add attendance.');
          }
        }
      }
    ]);
  };

  const handleRemove = (a: AttendanceRecord) => {
    Alert.alert('Remove Attendance', `Remove "${a.memberName || 'this record'}" from the attendance list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminRemoveAttendance(a.id);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not remove this record.');
          }
        }
      }
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenTitle subtitle={eventTitle} />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <LoadingBlock label="Loading attendees..." />
      ) : (
        <>
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center gap-1 py-4">
              <Text className="text-2xl font-extrabold text-slate-800">{rsvps.length}</Text>
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider text-center">RSVPs</Text>
            </Card>
            <Card className="flex-1 items-center gap-1 py-4">
              <Text className="text-2xl font-extrabold text-emerald-600">{attendance.length}</Text>
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider text-center">Checked In</Text>
            </Card>
          </View>

          <View className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</Text>
            {attendance.length === 0 ? (
              <EmptyBlock label="No check-ins yet." />
            ) : (
              <View className="gap-2">
                {attendance.map((a) => (
                  <Card key={a.id} className="flex-row items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800">{a.memberName || 'Unknown member'}</Text>
                      <Text className="text-[11px] text-slate-400">{new Date(a.checked_in_at).toLocaleTimeString()}</Text>
                    </View>
                    {a.confidence === 'low' && <Badge label="Low Confidence" tone="gold" />}
                    {a.confidence === 'manual' && <Badge label="Manual" />}
                    <IconButton icon={Trash2} onPress={() => handleRemove(a)} color={colors.rose600} />
                  </Card>
                ))}
              </View>
            )}

            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 mt-1">
              <Search size={14} color={colors.slate400} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Add attendance manually (e.g. GPS unreliable indoors)..."
                placeholderTextColor={colors.slate400}
                className="flex-1 px-2 py-2.5 text-xs text-slate-700"
              />
            </View>
            {candidates.slice(0, 6).map((m) => (
              <Pressable key={m.uid} onPress={() => handleManualAdd(m)}>
                <Card className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-slate-700">{m.name}</Text>
                  <View className="flex-row items-center gap-1">
                    <Plus size={13} color={colors.rotaryAzure} />
                    <Text className="text-[10px] font-bold uppercase text-rotary-azure">Add</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>

          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">RSVPs</Text>
          {rsvps.length === 0 ? (
            <EmptyBlock label="No RSVPs yet." />
          ) : (
            <View className="gap-2">
              {rsvps.map((r) => (
                <Card key={r.id} className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-800">{r.name}</Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Mail size={11} color={colors.slate400} />
                      <Text className="text-[11px] text-slate-500">{r.email}</Text>
                    </View>
                  </View>
                  {r.member_id ? <Badge label="Member" /> : <Badge label="Guest" tone="gold" />}
                </Card>
              ))}
            </View>
          )}
        </>
      )}
    </ScreenScroll>
  );
}

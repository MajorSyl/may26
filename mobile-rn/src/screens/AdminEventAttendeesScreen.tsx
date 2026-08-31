import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Users, Mail, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { EventRSVP } from '../types';
import { adminListEventRsvps } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminEventAttendees'>;

export default function AdminEventAttendeesScreen({ route }: Props) {
  const { eventId, eventTitle } = route.params;
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminListEventRsvps(eventId)
      .then(setRsvps)
      .catch((err: any) => setError(err?.message || 'Could not load attendees.'))
      .finally(() => setLoading(false));
  }, [eventId]);

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
          <Card className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-2xl bg-rotary-azure/10 items-center justify-center">
              <Users size={20} color={colors.rotaryAzure} />
            </View>
            <View>
              <Text className="text-2xl font-extrabold text-slate-800">{rsvps.length}</Text>
              <Text className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total RSVPs</Text>
            </View>
          </Card>

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

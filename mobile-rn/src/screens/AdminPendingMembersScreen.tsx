import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, X as XIcon, AlertTriangle, Clock } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { MemberProfile, adminListPendingProfiles, adminReviewProfile } from '../lib/memberAccount';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, EmptyBlock } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPendingMembers'>;

export default function AdminPendingMembersScreen({}: Props) {
  const [items, setItems] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminListPendingProfiles());
    } catch (err: any) {
      setError(err?.message || 'Could not load pending members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = (p: MemberProfile, decision: 'approved' | 'rejected') => {
    Alert.alert(
      decision === 'approved' ? 'Approve Member' : 'Reject Request',
      `${decision === 'approved' ? 'Approve' : 'Reject'} the membership request from "${p.fullName || p.email}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: decision === 'approved' ? 'Approve' : 'Reject',
          style: decision === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            setBusyId(p.id);
            try {
              await adminReviewProfile(p.id, decision);
              await load();
            } catch (err: any) {
              setError(err?.message || 'Could not update this request.');
            } finally {
              setBusyId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Pending Members" subtitle="New member dashboard sign-ups awaiting approval." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <LoadingBlock label="Loading requests..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="No pending member requests." />
      ) : (
        <View className="gap-3">
          {items.map((p) => (
            <Card key={p.id} className="gap-3">
              <View className="flex-row items-center gap-1.5">
                <Clock size={13} color={colors.amber500} />
                <Text className="text-[10px] font-bold uppercase text-amber-600">Pending Since {new Date(p.requestedAt).toLocaleDateString()}</Text>
              </View>
              <Text className="text-sm font-bold text-slate-800">{p.fullName || 'Unnamed'}</Text>
              <Text className="text-xs text-slate-500">{p.email}</Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleDecision(p, 'approved')}
                  disabled={busyId === p.id}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600"
                >
                  <Check size={14} color={colors.white} />
                  <Text className="text-[10px] font-bold uppercase text-white">Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDecision(p, 'rejected')}
                  disabled={busyId === p.id}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-rose-200"
                >
                  <XIcon size={14} color={colors.rose600} />
                  <Text className="text-[10px] font-bold uppercase text-rose-600">Reject</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

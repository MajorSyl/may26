import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, X as XIcon, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { Submission } from '../types';
import { adminListSubmissions, adminApproveSubmission, adminRejectSubmission } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, TextField, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminApprovals'>;

export default function AdminApprovalsScreen({}: Props) {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminListSubmissions('pending'));
    } catch (err: any) {
      setError(err?.message || 'Could not load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = (sub: Submission) => {
    Alert.alert('Approve Submission', `Publish "${sub.title}" as a ${sub.kind === 'project' ? 'project' : 'gallery photo'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setBusyId(sub.id);
          setError('');
          try {
            await adminApproveSubmission(sub);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not approve this submission.');
          } finally {
            setBusyId(null);
          }
        }
      }
    ]);
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    setError('');
    try {
      await adminRejectSubmission(id, rejectReason || 'Not a fit at this time.');
      setRejectingId(null);
      setRejectReason('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not reject this submission.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Approvals" subtitle="Member-submitted projects and photos awaiting review." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <LoadingBlock label="Loading submissions..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="Nothing pending review." />
      ) : (
        <View className="gap-3">
          {items.map((s) => (
            <Card key={s.id} className="gap-3">
              <View className="flex-row items-center justify-between">
                <Badge label={s.kind} tone="gold" />
                <Text className="text-[10px] text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text className="text-sm font-bold text-slate-800">{s.title}</Text>
              {s.description ? <Text className="text-xs text-slate-500 leading-relaxed">{s.description}</Text> : null}
              {s.category ? <Text className="text-[11px] text-slate-400">Category: {s.category}</Text> : null}

              {rejectingId === s.id ? (
                <View className="gap-3">
                  <TextField label="Reason (shown to member)" value={rejectReason} onChangeText={setRejectReason} placeholder="e.g. Needs more detail" />
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <PrimaryButton label="Cancel" variant="outline" onPress={() => setRejectingId(null)} />
                    </View>
                    <View className="flex-1">
                      <PrimaryButton label="Confirm Reject" onPress={() => handleReject(s.id)} loading={busyId === s.id} />
                    </View>
                  </View>
                </View>
              ) : (
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleApprove(s)}
                    disabled={busyId === s.id}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600"
                  >
                    <Check size={14} color={colors.white} />
                    <Text className="text-[10px] font-bold uppercase text-white">Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setRejectingId(s.id)}
                    disabled={busyId === s.id}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-rose-200"
                  >
                    <XIcon size={14} color={colors.rose600} />
                    <Text className="text-[10px] font-bold uppercase text-rose-600">Reject</Text>
                  </Pressable>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

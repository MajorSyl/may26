import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserCheck, X, AlertTriangle, Clock } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { RoleRequest } from '../types';
import { adminListRoleRequests, adminApproveRoleRequest, adminDenyRoleRequest, OFFICER_ROLE_LABELS, OfficerRole } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminRoleRequests'>;

export default function AdminRoleRequestsScreen({}: Props) {
  const [items, setItems] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminListRoleRequests());
    } catch (err: any) {
      setError(err?.message || 'Could not load access requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = (r: RoleRequest) => {
    Alert.alert('Grant Access', `Grant "${r.memberName || 'this member'}" ${OFFICER_ROLE_LABELS[r.requested_role as OfficerRole]}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Grant',
        onPress: async () => {
          setBusyId(r.id);
          try {
            await adminApproveRoleRequest(r);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not approve this request.');
          } finally {
            setBusyId(null);
          }
        }
      }
    ]);
  };

  const handleDeny = (r: RoleRequest) => {
    Alert.alert('Deny Request', `Deny access request from "${r.memberName || 'this member'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deny',
        style: 'destructive',
        onPress: async () => {
          setBusyId(r.id);
          try {
            await adminDenyRoleRequest(r.id);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not deny this request.');
          } finally {
            setBusyId(null);
          }
        }
      }
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenTitle subtitle="Members who've asked for officer access." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <LoadingBlock label="Loading requests..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="No pending access requests." />
      ) : (
        <View className="gap-3">
          {items.map((r) => (
            <Card key={r.id} className="gap-3">
              <View className="flex-row items-center gap-1.5">
                <Clock size={13} color={colors.amber500} />
                <Text className="text-[10px] font-bold uppercase text-amber-600">{new Date(r.created_at).toLocaleDateString()}</Text>
              </View>
              <Text className="text-sm font-bold text-slate-800">{r.memberName || 'Unknown member'}</Text>
              <Badge label={OFFICER_ROLE_LABELS[r.requested_role as OfficerRole] || r.requested_role} />
              {r.note ? <Text className="text-xs text-slate-500 leading-relaxed">{r.note}</Text> : null}
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <PrimaryButton label="Approve" onPress={() => handleApprove(r)} loading={busyId === r.id} />
                </View>
                <View className="flex-1">
                  <PrimaryButton label="Deny" variant="outline" onPress={() => handleDeny(r)} loading={busyId === r.id} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

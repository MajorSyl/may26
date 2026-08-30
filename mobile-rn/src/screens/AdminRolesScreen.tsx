import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, Trash2, AlertTriangle, KeyRound } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { UserProfile } from '../types';
import { AdminRow, adminListAdmins, adminAddAdmin, adminRemoveAdmin, getUsers } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminRoles'>;

export default function AdminRolesScreen({}: Props) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, m] = await Promise.all([adminListAdmins(), getUsers()]);
      setAdmins(a);
      setMembers(m);
    } catch (err: any) {
      setError(err?.message || 'Could not load admin roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const adminUserIds = new Set(admins.map((a) => a.userId));
  const candidates = members.filter(
    (m) => m.authUserId && !adminUserIds.has(m.authUserId) && (search === '' || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = (m: UserProfile) => {
    Alert.alert('Grant Admin Access', `Give "${m.name}" full admin access?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Grant',
        onPress: async () => {
          setBusyId(m.uid);
          try {
            await adminAddAdmin(m.authUserId!, 'admin');
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not grant access.');
          } finally {
            setBusyId(null);
          }
        }
      }
    ]);
  };

  const handleRemove = (row: AdminRow) => {
    Alert.alert('Revoke Admin Access', `Remove admin access for "${row.memberName || row.userId}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          setBusyId(row.userId);
          try {
            await adminRemoveAdmin(row.userId);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not revoke access.');
          } finally {
            setBusyId(null);
          }
        }
      }
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Roles" subtitle="Who has admin access to this app." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <LoadingBlock label="Loading roles..." />
      ) : (
        <>
          <View className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Admins ({admins.length})</Text>
            {admins.length === 0 ? (
              <EmptyBlock label="No admins configured." />
            ) : (
              admins.map((a) => (
                <Card key={a.userId} className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-rotary-azure/10 items-center justify-center">
                    <KeyRound size={15} color={colors.rotaryAzure} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-800">{a.memberName || 'Unknown member'}</Text>
                    <Badge label={a.role} />
                  </View>
                  <IconButton icon={Trash2} onPress={() => handleRemove(a)} color={colors.rose600} />
                </Card>
              ))
            )}
          </View>

          <View className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Grant Access</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <Search size={16} color={colors.slate400} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search members to promote..."
                placeholderTextColor={colors.slate400}
                className="flex-1 px-2 py-2.5 text-xs text-slate-700"
              />
            </View>
            {search.length > 0 &&
              candidates.slice(0, 8).map((m) => (
                <Pressable key={m.uid} onPress={() => handleAdd(m)} disabled={busyId === m.uid}>
                  <Card className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-slate-700">{m.name}</Text>
                    <Text className="text-[10px] font-bold uppercase text-rotary-azure">Grant Admin</Text>
                  </Card>
                </Pressable>
              ))}
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

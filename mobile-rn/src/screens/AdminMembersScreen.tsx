import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, X, Pencil, Trash2, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { UserProfile } from '../types';
import { getUsers, adminUpdateMember, adminDeleteMember } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, EmptyBlock, PrimaryButton, TextField, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminMembers'>;

const ROLES = ['Rotarian', 'Club Officer', 'President', 'Guest'] as const;

export default function AdminMembersScreen({}: Props) {
  const [items, setItems] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: 'Rotarian' as UserProfile['role'], classification: '', committee: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getUsers());
    } catch (err: any) {
      setError(err?.message || 'Could not load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (m: UserProfile) => {
    setForm({ name: m.name, role: m.role, classification: m.classification || '', committee: m.committee || '', bio: m.bio || '' });
    setEditingUid(m.uid);
  };

  const handleSave = async () => {
    if (!editingUid || !form.name) return;
    setSaving(true);
    setError('');
    try {
      await adminUpdateMember(editingUid, form);
      setEditingUid(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not save this member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (m: UserProfile) => {
    Alert.alert('Remove Member', `Remove "${m.name}" from the roster? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteMember(m.uid);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not remove this member.');
          }
        }
      }
    ]);
  };

  const filtered = items.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenScroll>
      <ScreenTitle title="Members" subtitle="Edit existing member profiles." />
      <Text className="text-[11px] text-slate-400 -mt-4">
        New member logins are provisioned by a club officer outside this app for now.
      </Text>

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {editingUid && (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Edit Member</Text>
            <Pressable onPress={() => setEditingUid(null)}>
              <X size={18} color={colors.slate400} />
            </Pressable>
          </View>
          <TextField label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextField label="Classification" value={form.classification} onChangeText={(v) => setForm({ ...form, classification: v })} />
          <TextField label="Committee" value={form.committee} onChangeText={(v) => setForm({ ...form, committee: v })} />
          <TextField label="Bio" value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline />
          <View className="flex-row flex-wrap gap-2">
            {ROLES.map((r) => {
              const isSel = form.role === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setForm({ ...form, role: r })}
                  className={`px-3 py-2 rounded-xl border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Save" onPress={handleSave} loading={saving} disabled={!form.name} />
        </Card>
      )}

      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
        <Search size={16} color={colors.slate400} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search members..."
          placeholderTextColor={colors.slate400}
          className="flex-1 px-2 py-2.5 text-xs text-slate-700"
        />
      </View>

      {loading ? (
        <LoadingBlock label="Loading members..." />
      ) : filtered.length === 0 ? (
        <EmptyBlock label="No members found." />
      ) : (
        <View className="gap-3">
          {filtered.map((m) => (
            <Card key={m.uid} className="gap-2">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-bold text-slate-800">{m.name}</Text>
                  <Text className="text-[11px] text-slate-400">
                    {m.role}
                    {m.committee ? ` -- ${m.committee}` : ''}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <IconButton icon={Pencil} onPress={() => startEdit(m)} />
                  <IconButton icon={Trash2} onPress={() => handleDelete(m)} color={colors.rose600} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

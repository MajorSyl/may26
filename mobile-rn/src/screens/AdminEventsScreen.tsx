import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X, Pencil, Trash2, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { ClubEvent } from '../types';
import { getEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, PrimaryButton, TextField, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminEvents'>;

const EVENT_TYPES = ['Weekly Meeting', 'Service Project', 'Social', 'Fundraiser'] as const;

const BLANK = { title: '', date: '', time: '', location: '', speaker: '', description: '', type: 'Weekly Meeting' as ClubEvent['type'] };

export default function AdminEventsScreen({}: Props) {
  const [items, setItems] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getEvents());
    } catch (err: any) {
      setError(err?.message || 'Could not load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm(BLANK);
    setEditingId('new');
  };

  const startEdit = (e: ClubEvent) => {
    setForm({ title: e.title, date: e.date, time: e.time, location: e.location, speaker: e.speaker || '', description: e.description || '', type: e.type });
    setEditingId(e.id);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time || !form.location) return;
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        await adminCreateEvent(form);
      } else if (editingId) {
        await adminUpdateEvent(editingId, form);
      }
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not save this event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (e: ClubEvent) => {
    Alert.alert('Delete Event', `Remove "${e.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteEvent(e.id);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not delete this event.');
          }
        }
      }
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Events" subtitle="Manage the club calendar." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {editingId === null ? (
        <PrimaryButton label="Add Event" onPress={startNew} />
      ) : (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">{editingId === 'new' ? 'New Event' : 'Edit Event'}</Text>
            <Pressable onPress={() => setEditingId(null)}>
              <X size={18} color={colors.slate400} />
            </Pressable>
          </View>
          <TextField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="e.g. Weekly Fellowship Lunch" />
          <TextField label="Date" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" />
          <TextField label="Time" value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="e.g. 12:30 PM" />
          <TextField label="Location" value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} placeholder="e.g. Radisson Blu, Freetown" />
          <TextField label="Speaker" value={form.speaker} onChangeText={(v) => setForm({ ...form, speaker: v })} placeholder="Optional" />
          <TextField label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Optional" multiline />
          <View className="flex-row flex-wrap gap-2">
            {EVENT_TYPES.map((t) => {
              const isSel = form.type === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setForm({ ...form, type: t })}
                  className={`px-3 py-2 rounded-xl border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Save" onPress={handleSave} loading={saving} disabled={!form.title || !form.date || !form.time || !form.location} />
        </Card>
      )}

      {loading ? (
        <LoadingBlock label="Loading events..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="No events yet." />
      ) : (
        <View className="gap-3">
          {items.map((e) => (
            <Card key={e.id} className="gap-2">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                  <Badge label={e.type} />
                  <Text className="text-sm font-bold text-slate-800">{e.title}</Text>
                  <Text className="text-[11px] text-slate-400">
                    {e.date} -- {e.time} -- {e.location}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <IconButton icon={Pencil} onPress={() => startEdit(e)} />
                  <IconButton icon={Trash2} onPress={() => handleDelete(e)} color={colors.rose600} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

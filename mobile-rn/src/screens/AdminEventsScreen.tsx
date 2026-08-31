import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X, Pencil, Trash2, AlertTriangle, Users, QrCode, MapPin } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { ClubEvent } from '../types';
import { getEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent, triggerNewsletterSend } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, PrimaryButton, TextField, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminEvents'>;

const EVENT_TYPES = ['Weekly Meeting', 'Service Project', 'Social', 'Fundraiser'] as const;

const BLANK = {
  title: '',
  date: '',
  time: '',
  location: '',
  speaker: '',
  description: '',
  type: 'Weekly Meeting' as ClubEvent['type'],
  attendance_tracking_enabled: false,
  venue_lat: '',
  venue_lng: '',
  venue_radius_m: '100'
};

export default function AdminEventsScreen({ navigation }: Props) {
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
    setForm({
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location,
      speaker: e.speaker || '',
      description: e.description || '',
      type: e.type,
      attendance_tracking_enabled: !!e.attendance_tracking_enabled,
      venue_lat: e.venue_lat != null ? String(e.venue_lat) : '',
      venue_lng: e.venue_lng != null ? String(e.venue_lng) : '',
      venue_radius_m: String(e.venue_radius_m || 100)
    });
    setEditingId(e.id);
  };

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Location isn\'t available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, venue_lat: String(pos.coords.latitude), venue_lng: String(pos.coords.longitude) })),
      () => setError('Could not get your location. Enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time || !form.location) return;
    setSaving(true);
    setError('');
    try {
      const payload: any = { ...form, venue_lat: form.venue_lat ? parseFloat(form.venue_lat) : null, venue_lng: form.venue_lng ? parseFloat(form.venue_lng) : null, venue_radius_m: parseInt(form.venue_radius_m, 10) || 100 };
      if (editingId === 'new') {
        const id = await adminCreateEvent(payload);
        triggerNewsletterSend('event', id);
      } else if (editingId) {
        await adminUpdateEvent(editingId, payload);
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

          <View className="gap-3 pt-2 border-t border-slate-100">
            <Pressable
              onPress={() => setForm({ ...form, attendance_tracking_enabled: !form.attendance_tracking_enabled })}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700">Attendance Tracking</Text>
                <Text className="text-[10px] text-slate-400">QR + GPS check-in for this event</Text>
              </View>
              <View className={`w-11 h-6 rounded-full ${form.attendance_tracking_enabled ? 'bg-rotary-azure' : 'bg-slate-200'} justify-center px-0.5`}>
                <View className={`w-5 h-5 rounded-full bg-white ${form.attendance_tracking_enabled ? 'self-end' : 'self-start'}`} />
              </View>
            </Pressable>

            {form.attendance_tracking_enabled && (
              <View className="gap-3">
                <Pressable onPress={useMyLocation} className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <MapPin size={14} color={colors.rotaryAzure} />
                  <Text className="text-[11px] font-bold uppercase text-rotary-azure">Use My Current Location</Text>
                </Pressable>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextField label="Venue Latitude" value={form.venue_lat} onChangeText={(v) => setForm({ ...form, venue_lat: v.replace(/[^0-9.\-]/g, '') })} keyboardType="number-pad" />
                  </View>
                  <View className="flex-1">
                    <TextField label="Venue Longitude" value={form.venue_lng} onChangeText={(v) => setForm({ ...form, venue_lng: v.replace(/[^0-9.\-]/g, '') })} keyboardType="number-pad" />
                  </View>
                </View>
                <TextField label="Allowed Radius (meters)" value={form.venue_radius_m} onChangeText={(v) => setForm({ ...form, venue_radius_m: v.replace(/\D/g, '') })} keyboardType="number-pad" />
              </View>
            )}
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
                  {e.attendance_tracking_enabled && (
                    <IconButton icon={QrCode} onPress={() => navigation.navigate('AdminEventCheckIn', { eventId: e.id, eventTitle: e.title })} />
                  )}
                  <IconButton icon={Users} onPress={() => navigation.navigate('AdminEventAttendees', { eventId: e.id, eventTitle: e.title })} />
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

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X, Trash2, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { GalleryPhoto } from '../types';
import { getGalleryPhotos } from '../lib/service';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, PrimaryButton, TextField, IconButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminGallery'>;

const CATEGORIES = ['meetings', 'anniversary', 'outreach', 'rotaract'] as const;
const BLANK = { title: '', description: '', category: 'meetings' as (typeof CATEGORIES)[number], imageUrl: '', location: '' };

// Direct CRUD on gallery_photos for admin-added photos -- the Approvals
// screen covers member-submitted photos; this covers admin uploads/edits/
// removals of any gallery photo.
export default function AdminGalleryScreen({}: Props) {
  const [items, setItems] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getGalleryPhotos());
    } catch (err: any) {
      setError(err?.message || 'Could not load gallery photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!isSupabaseConfigured || !supabase || !form.title || !form.imageUrl) return;
    setSaving(true);
    setError('');
    try {
      const { error } = await supabase.from('gallery_photos').insert({
        title: form.title,
        description: form.description || null,
        category: form.category,
        image_url: form.imageUrl,
        location: form.location || null
      });
      if (error) throw error;
      setForm(BLANK);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not add this photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (p: GalleryPhoto) => {
    Alert.alert('Delete Photo', `Remove "${p.title}" from the gallery?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!supabase) return;
          try {
            const { error } = await supabase.from('gallery_photos').delete().eq('id', p.id);
            if (error) throw error;
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not delete this photo.');
          }
        }
      }
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Gallery" subtitle="Add, edit, or remove club gallery photos." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {!showForm ? (
        <PrimaryButton label="Add Photo" onPress={() => setShowForm(true)} />
      ) : (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">New Photo</Text>
            <Pressable onPress={() => setShowForm(false)}>
              <X size={18} color={colors.slate400} />
            </Pressable>
          </View>
          <TextField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
          <TextField label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
          <TextField label="Image URL" value={form.imageUrl} onChangeText={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://..." autoCapitalize="none" />
          <TextField label="Location" value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} />
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isSel = form.category === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setForm({ ...form, category: c })}
                  className={`px-3 py-2 rounded-xl border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Save" onPress={handleSave} loading={saving} disabled={!form.title || !form.imageUrl} />
        </Card>
      )}

      {loading ? (
        <LoadingBlock label="Loading gallery..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="No gallery photos yet." />
      ) : (
        <View className="gap-3">
          {items.map((p) => (
            <Card key={p.id} className="flex-row items-center justify-between gap-2">
              <View className="flex-1 gap-1">
                <Badge label={p.category} />
                <Text className="text-sm font-bold text-slate-800">{p.title}</Text>
              </View>
              <IconButton icon={Trash2} onPress={() => handleDelete(p)} color={colors.rose600} />
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

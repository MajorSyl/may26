import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X, Pencil, Trash2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import {
  ContentBlock,
  ContentPage,
  adminListContentBlocks,
  adminCreateContentBlock,
  adminUpdateContentBlock,
  adminDeleteContentBlock
} from '../lib/cms';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, EmptyBlock, PrimaryButton, TextField, IconButton, ImagePickerField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminContentBlocks'>;

const PAGES: { id: ContentPage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'what_is_rotary', label: 'What is Rotary' },
  { id: 'get_involved', label: 'Get Involved' },
  { id: 'contact', label: 'Contact' }
];

const BLANK = { title: '', body: '', imageUrl: '' };

export default function AdminContentBlocksScreen({}: Props) {
  const [page, setPage] = useState<ContentPage>('home');
  const [items, setItems] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async (p: ContentPage) => {
    setLoading(true);
    try {
      setItems(await adminListContentBlocks(p));
    } catch (err: any) {
      setError(err?.message || 'Could not load content blocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const startNew = () => {
    setForm(BLANK);
    setEditingId('new');
  };

  const startEdit = (b: ContentBlock) => {
    setForm({ title: b.title || '', body: b.body || '', imageUrl: b.imageUrl || '' });
    setEditingId(b.id);
  };

  const handleSave = async () => {
    if (!form.title && !form.body) return;
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        const nextOrder = items.length > 0 ? Math.max(...items.map((b) => b.sortOrder)) + 1 : 0;
        await adminCreateContentBlock({
          page,
          sortOrder: nextOrder,
          title: form.title || null,
          body: form.body || null,
          imageUrl: form.imageUrl || null,
          isVisible: true
        });
      } else if (editingId) {
        await adminUpdateContentBlock(editingId, { title: form.title || null, body: form.body || null, imageUrl: form.imageUrl || null });
      }
      setEditingId(null);
      await load(page);
    } catch (err: any) {
      setError(err?.message || 'Could not save this block.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (b: ContentBlock) => {
    Alert.alert('Delete Block', `Remove "${b.title || 'this block'}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteContentBlock(b.id);
            await load(page);
          } catch (err: any) {
            setError(err?.message || 'Could not delete this block.');
          }
        }
      }
    ]);
  };

  const handleToggleVisible = async (b: ContentBlock) => {
    try {
      await adminUpdateContentBlock(b.id, { isVisible: !b.isVisible });
      await load(page);
    } catch (err: any) {
      setError(err?.message || 'Could not update visibility.');
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    try {
      await Promise.all([adminUpdateContentBlock(a.id, { sortOrder: b.sortOrder }), adminUpdateContentBlock(b.id, { sortOrder: a.sortOrder })]);
      await load(page);
    } catch (err: any) {
      setError(err?.message || 'Could not reorder blocks.');
    }
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Page Content" subtitle="Add, edit, remove, and reorder sections -- no code change needed." />

      <View className="flex-row flex-wrap gap-2">
        {PAGES.map((p) => {
          const isSel = page === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPage(p.id)}
              className={`px-3 py-2 rounded-xl border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {editingId === null ? (
        <PrimaryButton label="Add Section" onPress={startNew} />
      ) : (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">{editingId === 'new' ? 'New Section' : 'Edit Section'}</Text>
            <Pressable onPress={() => setEditingId(null)}>
              <X size={18} color={colors.slate400} />
            </Pressable>
          </View>
          <TextField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Section title" />
          <TextField label="Body" value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} placeholder="Section copy" multiline />
          <ImagePickerField label="Photo (optional)" imageUrl={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} folder={`content/${page}`} />
          <PrimaryButton label="Save" onPress={handleSave} loading={saving} disabled={!form.title && !form.body} />
        </Card>
      )}

      {loading ? (
        <LoadingBlock label="Loading sections..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="No custom sections for this page yet. Defaults are shown to visitors." />
      ) : (
        <View className="gap-3">
          {items.map((b, i) => (
            <Card key={b.id} className="gap-2">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                  {b.title ? <Text className="text-sm font-bold text-slate-800">{b.title}</Text> : null}
                  {b.body ? (
                    <Text className="text-xs text-slate-500" numberOfLines={2}>
                      {b.body}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
                <View className="flex-row items-center gap-2">
                  <Switch value={b.isVisible} onValueChange={() => handleToggleVisible(b)} trackColor={{ true: colors.rotaryAzure }} />
                  <Text className="text-[10px] text-slate-400 uppercase">{b.isVisible ? 'Visible' : 'Hidden'}</Text>
                </View>
                <View className="flex-row gap-2">
                  <IconButton icon={ArrowUp} onPress={() => handleMove(i, -1)} />
                  <IconButton icon={ArrowDown} onPress={() => handleMove(i, 1)} />
                  <IconButton icon={Pencil} onPress={() => startEdit(b)} />
                  <IconButton icon={Trash2} onPress={() => handleDelete(b)} color={colors.rose600} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

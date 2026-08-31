import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Alert } from '../lib/alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X, Pencil, Trash2, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { Project } from '../types';
import { getProjects, adminCreateProject, adminUpdateProject, adminDeleteProject, triggerNewsletterSend } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, PrimaryButton, TextField, IconButton, ImagePickerField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminProjects'>;

const BLANK = {
  title: '',
  category: '',
  description: '',
  year: String(new Date().getFullYear()),
  impact: '',
  status: 'Active' as Project['status'],
  imageUrl: '',
  wellsBuilt: '0',
  studentsSponsored: '0',
  fundsRaised: '0',
  peopleImpacted: '0'
};

export default function AdminProjectsScreen({}: Props) {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getProjects());
    } catch (err: any) {
      setError(err?.message || 'Could not load projects.');
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

  const startEdit = (p: Project) => {
    setForm({
      title: p.title,
      category: p.category,
      description: p.description,
      year: String(p.year),
      impact: p.impact || '',
      status: p.status,
      imageUrl: p.imageUrl || '',
      wellsBuilt: String(p.wellsBuilt || 0),
      studentsSponsored: String(p.studentsSponsored || 0),
      fundsRaised: String(p.fundsRaised || 0),
      peopleImpacted: String(p.peopleImpacted || 0)
    });
    setEditingId(p.id);
  };

  const handleSave = async () => {
    if (!form.title || !form.category || !form.description) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        year: parseInt(form.year, 10) || new Date().getFullYear(),
        impact: form.impact,
        status: form.status,
        imageUrl: form.imageUrl,
        wellsBuilt: parseInt(form.wellsBuilt, 10) || 0,
        studentsSponsored: parseInt(form.studentsSponsored, 10) || 0,
        fundsRaised: parseFloat(form.fundsRaised) || 0,
        peopleImpacted: parseInt(form.peopleImpacted, 10) || 0
      };
      if (editingId === 'new') {
        const id = await adminCreateProject(payload);
        triggerNewsletterSend('project', id);
      } else if (editingId) {
        await adminUpdateProject(editingId, payload);
      }
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not save this project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (p: Project) => {
    Alert.alert('Delete Project', `Remove "${p.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteProject(p.id);
            await load();
          } catch (err: any) {
            setError(err?.message || 'Could not delete this project.');
          }
        }
      }
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Projects" subtitle="Create, edit, or remove club projects." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {editingId === null ? (
        <PrimaryButton label="Add Project" onPress={startNew} />
      ) : (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">{editingId === 'new' ? 'New Project' : 'Edit Project'}</Text>
            <Pressable onPress={() => setEditingId(null)}>
              <X size={18} color={colors.slate400} />
            </Pressable>
          </View>
          <TextField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="e.g. Kaningo Water Project" />
          <TextField label="Category" value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} placeholder="e.g. Water & Sanitation" />
          <TextField label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Overview" multiline />
          <TextField label="Year" value={form.year} onChangeText={(v) => setForm({ ...form, year: v.replace(/\D/g, '').slice(0, 4) })} keyboardType="number-pad" />
          <TextField label="Impact" value={form.impact} onChangeText={(v) => setForm({ ...form, impact: v })} placeholder="e.g. 500+ beneficiaries" />
          <ImagePickerField label="Project Photo" imageUrl={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} folder="projects" />

          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Impact Numbers</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Wells Built" value={form.wellsBuilt} onChangeText={(v) => setForm({ ...form, wellsBuilt: v.replace(/\D/g, '') })} keyboardType="number-pad" />
            </View>
            <View className="flex-1">
              <TextField label="Students Sponsored" value={form.studentsSponsored} onChangeText={(v) => setForm({ ...form, studentsSponsored: v.replace(/\D/g, '') })} keyboardType="number-pad" />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Funds Raised (USD)" value={form.fundsRaised} onChangeText={(v) => setForm({ ...form, fundsRaised: v.replace(/[^0-9.]/g, '') })} keyboardType="number-pad" />
            </View>
            <View className="flex-1">
              <TextField label="People Impacted" value={form.peopleImpacted} onChangeText={(v) => setForm({ ...form, peopleImpacted: v.replace(/\D/g, '') })} keyboardType="number-pad" />
            </View>
          </View>

          <View className="flex-row gap-2">
            {(['Planning', 'Active', 'Completed'] as const).map((s) => {
              const isSel = form.status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Save" onPress={handleSave} loading={saving} disabled={!form.title || !form.category || !form.description} />
        </Card>
      )}

      {loading ? (
        <LoadingBlock label="Loading projects..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="No projects yet." />
      ) : (
        <View className="gap-3">
          {items.map((p) => (
            <Card key={p.id} className="gap-2">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                  <Badge label={p.status} />
                  <Text className="text-sm font-bold text-slate-800">{p.title}</Text>
                  <Text className="text-[11px] text-slate-400">{p.category} -- {p.year}</Text>
                </View>
                <View className="flex-row gap-2">
                  <IconButton icon={Pencil} onPress={() => startEdit(p)} />
                  <IconButton icon={Trash2} onPress={() => handleDelete(p)} color={colors.rose600} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, X, Check, AlertTriangle, Image as ImageIcon, FolderKanban } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { Submission } from '../types';
import { getMySubmissions, createSubmission } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, Badge, LoadingBlock, EmptyBlock, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberSubmissions'>;

const STATUS_TONE: Record<Submission['status'], 'azure' | 'gold'> = { pending: 'gold', approved: 'azure', rejected: 'gold' };

export default function MemberSubmissionsScreen({}: Props) {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<'project' | 'photo'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getMySubmissions());
    } catch (err: any) {
      setError(err?.message || 'Could not load your submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (!title) return;
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({ kind, title, description, category, imageUrl, year: new Date().getFullYear() });
      setTitle('');
      setDescription('');
      setCategory('');
      setImageUrl('');
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenScroll>
      <View className="flex-row items-center justify-between">
        <ScreenTitle title="My Submissions" subtitle="Propose a project or a photo for the gallery." />
      </View>

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {!showForm ? (
        <PrimaryButton label="New Submission" onPress={() => setShowForm(true)} />
      ) : (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">New Submission</Text>
            <Pressable onPress={() => setShowForm(false)}>
              <X size={18} color={colors.slate400} />
            </Pressable>
          </View>

          <View className="flex-row gap-2">
            {(['project', 'photo'] as const).map((k) => {
              const isSel = kind === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setKind(k)}
                  className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                    isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {k === 'project' ? (
                    <FolderKanban size={13} color={isSel ? colors.white : colors.slate500} />
                  ) : (
                    <ImageIcon size={13} color={isSel ? colors.white : colors.slate500} />
                  )}
                  <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{k}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Kaningo Water Project" />
          <TextField label="Category" value={category} onChangeText={setCategory} placeholder={kind === 'photo' ? 'meetings / outreach / rotaract / anniversary' : 'e.g. Water & Sanitation'} />
          <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Tell us about it" multiline />
          <TextField label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />

          <PrimaryButton label="Submit for Review" onPress={handleSubmit} loading={submitting} disabled={!title} />
        </Card>
      )}

      {loading ? (
        <LoadingBlock label="Loading your submissions..." />
      ) : items.length === 0 ? (
        <EmptyBlock label="You haven't submitted anything yet." />
      ) : (
        <View className="gap-3">
          {items.map((s) => (
            <Card key={s.id} className="gap-2">
              <View className="flex-row items-center justify-between">
                <Badge label={s.status} tone={STATUS_TONE[s.status]} />
                <Text className="text-[10px] text-slate-400 uppercase">{s.kind}</Text>
              </View>
              <Text className="text-sm font-bold text-slate-800">{s.title}</Text>
              {s.description ? <Text className="text-xs text-slate-500 leading-relaxed">{s.description}</Text> : null}
              {s.status === 'rejected' && s.rejectReason ? (
                <View className="bg-rose-50 rounded-lg p-2.5 mt-1">
                  <Text className="text-[11px] text-rose-700">Reason: {s.rejectReason}</Text>
                </View>
              ) : null}
              {s.status === 'approved' ? (
                <View className="flex-row items-center gap-1.5 mt-1">
                  <Check size={13} color={colors.emerald600} />
                  <Text className="text-[11px] text-emerald-700 font-semibold">Published</Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

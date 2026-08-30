import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, MapPin, Smartphone, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { PageView, adminListPageViews } from '../lib/analytics';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, EmptyBlock } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminVisitorLog'>;

export default function AdminVisitorLogScreen({}: Props) {
  const [items, setItems] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminListPageViews(200)
      .then(setItems)
      .catch((err) => setError(err?.message || 'Could not load the visitor log.'))
      .finally(() => setLoading(false));
  }, []);

  const term = search.toLowerCase();
  const filtered = items.filter(
    (v) =>
      !term ||
      v.page.toLowerCase().includes(term) ||
      (v.city || '').toLowerCase().includes(term) ||
      (v.country || '').toLowerCase().includes(term) ||
      (v.device || '').toLowerCase().includes(term)
  );

  return (
    <ScreenScroll>
      <ScreenTitle title="Visitor Log" subtitle={`${items.length} recent page views (searchable, most recent first).`} />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
        <Search size={16} color={colors.slate400} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Filter by page, city, country, device..."
          placeholderTextColor={colors.slate400}
          className="flex-1 px-2 py-2.5 text-xs text-slate-700"
        />
      </View>

      {loading ? (
        <LoadingBlock label="Loading visitor log..." />
      ) : filtered.length === 0 ? (
        <EmptyBlock label="No matching page views." />
      ) : (
        <View className="gap-2">
          {filtered.map((v) => (
            <Card key={v.id} className="p-3.5 gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-slate-800">{v.page}</Text>
                <Text className="text-[10px] text-slate-400">{new Date(v.createdAt).toLocaleString()}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <MapPin size={11} color={colors.slate400} />
                  <Text className="text-[10px] text-slate-500">{v.city && v.country ? `${v.city}, ${v.country}` : v.country || 'Unknown'}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Smartphone size={11} color={colors.slate400} />
                  <Text className="text-[10px] text-slate-500">{v.device || 'unknown'}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

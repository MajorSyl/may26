import React, { useEffect, useState } from 'react';
import { View, Text, Linking, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { SupportReceipt, adminListSupportReceipts, adminSetSupportReceiptStatus } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, EmptyBlock, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminSupportReceipts'>;

const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

// Orange Money receipts sent from the public Support page. Check each one
// against the Orange Money merchant account, then mark it Received.
export default function AdminSupportReceiptsScreen({}: Props) {
  const [items, setItems] = useState<SupportReceipt[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminListSupportReceipts());
    } catch (err: any) {
      setError(err?.message || 'Could not load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: 'pending' | 'received') => {
    setBusyId(id);
    setError('');
    try {
      await adminSetSupportReceiptStatus(id, status);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not update this receipt.');
    } finally {
      setBusyId(null);
    }
  };

  const pending = (items || []).filter((r) => r.status === 'pending').length;

  return (
    <ScreenScroll>
      <ScreenTitle
        title="Support Receipts"
        subtitle={`Orange Money receipts sent from the Support page. Check each against the merchant account, then mark it received.${pending ? ` ${pending} waiting.` : ''}`}
      />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      {loading && !items ? (
        <LoadingBlock label="Loading receipts..." />
      ) : !items || items.length === 0 ? (
        <EmptyBlock label="No receipts yet." />
      ) : (
        <View className="gap-3">
          {items.map((r) => (
            <Card key={r.id} className="gap-3">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-extrabold text-slate-800">{r.name}</Text>
                  {r.contact ? <Text className="text-xs text-slate-500">{r.contact}</Text> : null}
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={12} color={colors.slate400} />
                    <Text className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleString('en-GB')}</Text>
                  </View>
                </View>
                {r.status === 'received' ? (
                  <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-emerald-50">
                    <CheckCircle size={12} color="#047857" />
                    <Text className="text-[11px] font-bold text-emerald-700">Received</Text>
                  </View>
                ) : (
                  <View className="px-2 py-1 rounded-full bg-amber-50">
                    <Text className="text-[11px] font-bold text-amber-700">To check</Text>
                  </View>
                )}
              </View>

              {r.amount ? <Text className="text-sm text-slate-700">Amount: {r.amount}</Text> : null}
              {r.note ? <Text className="text-sm text-slate-600">“{r.note}”</Text> : null}

              {r.receiptUrl ? (
                isPdf(r.receiptUrl) ? (
                  <PrimaryButton label="Open receipt (PDF)" variant="outline" onPress={() => Linking.openURL(r.receiptUrl)} />
                ) : (
                  <View className="gap-2">
                    <Image
                      source={{ uri: r.receiptUrl }}
                      accessibilityLabel={`Receipt from ${r.name}`}
                      resizeMode="contain"
                      style={{ width: '100%', height: 320, backgroundColor: '#f8fafc', borderRadius: 12 }}
                    />
                    <PrimaryButton label="Open full size" variant="outline" onPress={() => Linking.openURL(r.receiptUrl)} />
                  </View>
                )
              ) : (
                <View className="flex-row items-center gap-1.5">
                  <FileText size={12} color={colors.slate400} />
                  <Text className="text-[11px] text-slate-400">No receipt attached</Text>
                </View>
              )}

              {r.status === 'pending' ? (
                <PrimaryButton label="Mark as received" onPress={() => setStatus(r.id, 'received')} loading={busyId === r.id} />
              ) : (
                <PrimaryButton label="Move back to To check" variant="outline" onPress={() => setStatus(r.id, 'pending')} loading={busyId === r.id} />
              )}
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

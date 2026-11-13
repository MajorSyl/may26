import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Paperclip, X, CheckCircle, Send } from 'lucide-react-native';
import { submitSupportReceipt } from '../lib/service';
import { colors } from '../theme';

const inputClass = 'min-h-[48px] bg-white border border-slate-300 rounded-2xl px-4 text-[15px] text-slate-800';

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-rotary-royal-deep">
        {label}
        {optional ? <Text className="font-normal text-slate-500"> (optional)</Text> : null}
      </Text>
      {children}
    </View>
  );
}

// Optional: after paying with Orange Money, a giver can send their name, the
// amount, a short note and a photo/screenshot of the confirmation SMS, so the
// club can confirm the payment was received. Reviewed in Admin → Support Receipts.
export default function SupportReceiptForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<{ uri: string; mimeType: string; name: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const pickFile = async () => {
    setError('');
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const a = result.assets[0];
    const mimeType = a.mimeType || (a.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    if (a.size && a.size > 5 * 1024 * 1024) {
      setError('That file is larger than 5 MB. Please attach a smaller photo or screenshot.');
      return;
    }
    setFile({ uri: a.uri, mimeType, name: a.name || 'receipt' });
  };

  const submit = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!file && !note.trim() && !amount.trim()) {
      setError('Please attach your receipt, or add the amount or a short note.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await submitSupportReceipt({ name, contact, amount, note, file });
      setStatus('sent');
    } catch (err: any) {
      setStatus('idle');
      setError(err?.message || 'Could not send your details. Please try again.');
    }
  };

  if (status === 'sent') {
    return (
      <View className="bg-white border border-emerald-200 rounded-3xl p-6 gap-2">
        <View className="flex-row items-center gap-2">
          <CheckCircle size={20} color="#047857" />
          <Text className="font-display text-lg font-bold text-rotary-royal-deep">Thank you for your support</Text>
        </View>
        <Text className="text-[15px] leading-6 text-slate-600">
          We have received your details and will confirm your contribution once we have checked it against our Orange Money account.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white border border-slate-200 rounded-3xl p-6 gap-4">
      <View className="gap-1">
        <Text className="font-display text-lg font-bold text-rotary-royal-deep">Already given? Send us your receipt</Text>
        <Text className="text-[15px] leading-6 text-slate-600">
          Optional. Attach a photo or screenshot of your Orange Money confirmation so we can confirm we received it and thank you.
        </Text>
      </View>

      <Field label="Your name">
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={100}
          autoComplete="name"
          accessibilityLabel="Your name"
          className={inputClass}
        />
      </Field>
      <View className="gap-4 sm:flex-row">
        <View className="sm:flex-1">
          <Field label="Phone or email" optional>
            <TextInput
              value={contact}
              onChangeText={setContact}
              maxLength={120}
              accessibilityLabel="Phone or email (optional)"
              className={inputClass}
            />
          </Field>
        </View>
        <View className="sm:w-40">
          <Field label="Amount" optional>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              maxLength={40}
              placeholder="e.g. SLE 200"
              placeholderTextColor={colors.slate400}
              accessibilityLabel="Amount (optional)"
              className={inputClass}
            />
          </Field>
        </View>
      </View>
      <Field label="Short note" optional>
        <TextInput
          value={note}
          onChangeText={setNote}
          maxLength={500}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Short note (optional)"
          className="min-h-[88px] bg-white border border-slate-300 rounded-2xl px-4 py-3 text-[15px] text-slate-800"
        />
      </Field>

      <Field label="Receipt" optional>
        {file ? (
          <View className="flex-row items-center gap-3 bg-rotary-cream rounded-2xl px-4 py-3">
            <Paperclip size={16} color={colors.rotaryRoyal} />
            <Text className="flex-1 text-[15px] text-rotary-royal-deep" numberOfLines={1}>
              {file.name}
            </Text>
            <Pressable
              onPress={() => setFile(null)}
              accessibilityRole="button"
              accessibilityLabel="Remove attached receipt"
              className="w-9 h-9 items-center justify-center rounded-full"
            >
              <X size={16} color={colors.slate500} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={pickFile}
            accessibilityRole="button"
            className="min-h-[48px] flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:border-rotary-royal"
          >
            <Paperclip size={16} color={colors.rotaryRoyal} />
            <Text className="text-[15px] font-semibold text-rotary-royal-deep">Attach photo, screenshot or PDF</Text>
          </Pressable>
        )}
        <Text className="text-xs text-slate-500">Up to 5 MB. Only club administrators can see it.</Text>
      </Field>

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={status === 'sending'}
        accessibilityRole="button"
        className="min-h-[48px] px-6 rounded-full bg-rotary-royal hover:bg-rotary-royal-deep flex-row items-center justify-center gap-2"
      >
        {status === 'sending' ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Send size={16} color={colors.white} />
            <Text className="text-[15px] font-semibold text-white">Send receipt</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

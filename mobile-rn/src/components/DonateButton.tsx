import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Linking } from 'react-native';
import { Heart, X, AlertTriangle } from 'lucide-react-native';
import { createDonationCheckout } from '../lib/donations';
import { PrimaryButton, TextField } from './ui';
import { colors } from '../theme';

const PRESET_AMOUNTS = [25, 50, 100, 250];

export default function DonateButton({ projectId, projectTitle }: { projectId?: string; projectTitle?: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('50');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDonate = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 100) {
      setError('Enter an amount of at least $1.');
      return;
    }
    setLoading(true);
    setError('');
    const { url, error: err } = await createDonationCheckout(cents, projectId, email || null);
    setLoading(false);
    if (err || !url) {
      setError(err || 'Could not start checkout.');
      return;
    }
    Linking.openURL(url);
    setOpen(false);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-rotary-gold">
        <Heart size={16} color={colors.white} />
        <Text className="text-xs font-bold uppercase text-white tracking-wider">Donate{projectTitle ? ` to this Project` : ''}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white rounded-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-slate-800">{projectTitle ? `Donate to ${projectTitle}` : 'Donate to RCFS'}</Text>
              <Pressable onPress={() => setOpen(false)}>
                <X size={18} color={colors.slate400} />
              </Pressable>
            </View>

            {error ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
                <AlertTriangle size={16} color="#e11d48" />
                <Text className="text-xs text-rose-700 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="flex-row flex-wrap gap-2">
              {PRESET_AMOUNTS.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAmount(String(a))}
                  className={`px-4 py-2.5 rounded-xl border ${amount === String(a) ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={`text-sm font-bold ${amount === String(a) ? 'text-white' : 'text-slate-600'}`}>${a}</Text>
                </Pressable>
              ))}
            </View>

            <TextField label="Custom Amount (USD)" value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))} keyboardType="number-pad" />
            <TextField label="Email (optional receipt)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />

            <PrimaryButton label="Continue to Payment" onPress={handleDonate} loading={loading} disabled={!amount} />
            <Text className="text-[10px] text-slate-400 text-center">Securely processed by Stripe. You'll be redirected to complete payment.</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

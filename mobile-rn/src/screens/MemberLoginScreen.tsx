import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { loginWithRotaryIdAndPin } from '../lib/service';
import { ScreenScroll, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberLogin'>;

// Rotary ID + 6-digit PIN, same as the web app's Dashboard.tsx login form --
// calls the same member-login Edge Function against the same Supabase
// project. On success this lands on a placeholder MemberHome screen; the
// real member portal (profile, submissions, chat, timeline) is a separate,
// later pass.
export default function MemberLoginScreen({ navigation }: Props) {
  const [rotaryId, setRotaryId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!rotaryId || pin.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await loginWithRotaryIdAndPin(rotaryId, pin);
      navigation.replace('MemberHome');
    } catch (err: any) {
      setError(err?.message || 'Could not log in. Check your Rotary ID and PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <Pressable onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start">
        <ArrowLeft size={16} color={colors.slate500} />
        <Text className="text-xs font-bold text-slate-500 uppercase">Back</Text>
      </Pressable>

      <View className="bg-white rounded-3xl border border-slate-100 p-6 gap-6 mt-4">
        <View className="items-center gap-1.5">
          <View className="w-14 h-14 rounded-2xl bg-rotary-azure/10 items-center justify-center">
            <Shield size={26} color={colors.rotaryAzure} />
          </View>
          <Text className="text-xl font-extrabold text-slate-800">Member Portal</Text>
          <Text className="text-[10px] uppercase tracking-widest text-slate-400">RCFS</Text>
        </View>

        {error ? (
          <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
            <AlertCircle size={16} color="#e11d48" />
            <Text className="text-xs text-rose-700 flex-1">{error}</Text>
          </View>
        ) : null}

        <Text className="text-xs text-slate-500 text-center leading-relaxed">
          Member accounts are created by a club officer. If you're a member without a login yet, contact an officer to be
          added.
        </Text>

        <TextField label="Rotary ID" value={rotaryId} onChangeText={(v) => setRotaryId(v.toUpperCase())} placeholder="e.g. RCFS-001" autoCapitalize="characters" />
        <TextField
          label="6-Digit PIN"
          value={pin}
          onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          keyboardType="number-pad"
          secureTextEntry
        />

        <PrimaryButton label="Sign In" onPress={handleLogin} loading={loading} disabled={!rotaryId || pin.length !== 6} />

        <Text className="text-center text-[11px] text-slate-400">Forgot your PIN? Contact a club officer to reset it.</Text>
      </View>
    </ScreenScroll>
  );
}

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { loginAdmin, isSupabaseConfigured } from '../lib/service';
import { ScreenScroll, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;

// Supabase email/password, then re-verified against the `admins` table --
// same two-layer check as the web app's AdminDashboard.tsx (frontend check
// for UX, RLS for actual enforcement; nothing here weakens that). On
// success this lands on a placeholder AdminHome screen; the real admin
// dashboard (Projects/Events/Members/Inquiries/Approvals/Settings/Roles/
// Analytics) is a separate, later pass.
export default function AdminLoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await loginAdmin(email, password);
      navigation.replace('AdminHome');
    } catch (err: any) {
      setError(err?.message || 'Supabase authentication failed. Please confirm email & password.');
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
            <Lock size={26} color={colors.rotaryAzure} />
          </View>
          <Text className="text-xl font-extrabold text-slate-800">Rotary CMS Access Gate</Text>
          <Text className="text-[10px] text-slate-400 text-center">Authorized Officers of Freetown Sunset Chapter</Text>
        </View>

        {!isSupabaseConfigured ? (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex-row items-center gap-2">
            <AlertTriangle size={16} color={colors.amber500} />
            <Text className="text-xs text-amber-700 flex-1">
              Admin access requires a configured Supabase project (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
                <AlertTriangle size={16} color="#e11d48" />
                <Text className="text-xs text-rose-700 flex-1">{error}</Text>
              </View>
            ) : null}

            <TextField label="Admin Email" value={email} onChangeText={setEmail} placeholder="admin@example.com" keyboardType="email-address" autoCapitalize="none" />
            <TextField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

            <PrimaryButton label="Sign In with Supabase" onPress={handleLogin} loading={loading} disabled={!email || !password} />
          </>
        )}

        <Text className="text-[10px] text-slate-400 text-center">Rotary Dist. 9101 Security Protocol Compliance Grid</Text>
      </View>
    </ScreenScroll>
  );
}

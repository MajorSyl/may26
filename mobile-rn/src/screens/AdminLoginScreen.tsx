import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { loginAdmin, resolveAdminUsername, isSupabaseConfigured } from '../lib/service';
import { ScreenScroll, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;

type IdentifierMode = 'username' | 'email';

// Supabase email/password, then re-verified against the `admins` table --
// same two-layer check as the web app's AdminDashboard.tsx (frontend check
// for UX, RLS for actual enforcement; nothing here weakens that). An admin
// can sign in with either their email or a chosen username (admins.username,
// resolved server-side to the real email via resolve_admin_email before the
// actual Supabase Auth call) -- Supabase Auth itself only ever sees a real
// email either way.
export default function AdminLoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<IdentifierMode>('username');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) return;
    setLoading(true);
    setError('');
    try {
      let email = identifier;
      if (mode === 'username') {
        const resolved = await resolveAdminUsername(identifier);
        // Falls through to loginAdmin with a bogus placeholder rather than
        // stopping early -- an unmatched username must fail exactly like a
        // wrong password, never with a different ("username not found")
        // message, so this path can't be used to enumerate usernames.
        email = resolved ?? `${identifier}@invalid.invalid`;
      }
      await loginAdmin(email, password);
      navigation.replace('AdminHome');
    } catch (err: any) {
      setError(err?.message === 'Invalid login credentials' ? `Incorrect ${mode} or password.` : err?.message || 'Unable to sign in. Please try again.');
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
          <View className="w-14 h-14 rounded-2xl bg-rotary-dark items-center justify-center">
            <Lock size={24} color={colors.white} />
          </View>
          <Text className="text-[10px] uppercase tracking-widest text-slate-400">RCFS</Text>
        </View>

        {!isSupabaseConfigured ? (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex-row items-center gap-2">
            <AlertTriangle size={16} color={colors.amber500} />
            <Text className="text-xs text-amber-700 flex-1">Admin access isn't configured yet. Please contact your site administrator.</Text>
          </View>
        ) : (
          <>
            {error ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
                <AlertTriangle size={16} color="#e11d48" />
                <Text className="text-xs text-rose-700 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="flex-row bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
              {(['username', 'email'] as IdentifierMode[]).map((m) => {
                const isSel = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setMode(m);
                      setIdentifier('');
                    }}
                    className={`flex-1 py-2 rounded-lg items-center ${isSel ? 'bg-rotary-dark' : ''}`}
                  >
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${isSel ? 'text-white' : 'text-slate-500'}`}>
                      {m === 'username' ? 'Username' : 'Email'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'username' ? (
              <TextField label="Username" value={identifier} onChangeText={setIdentifier} placeholder="yourusername" autoCapitalize="none" />
            ) : (
              <TextField label="Email" value={identifier} onChangeText={setIdentifier} placeholder="you@rcfsunset.org" keyboardType="email-address" autoCapitalize="none" />
            )}
            <TextField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

            <PrimaryButton label="Sign In" onPress={handleLogin} loading={loading} disabled={!identifier || !password} />
          </>
        )}

        <Text className="text-[10px] text-slate-400 text-center leading-relaxed">
          This area is restricted to authorized RCFS officers. All access is logged.
        </Text>
      </View>
    </ScreenScroll>
  );
}

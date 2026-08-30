import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User as UserIcon, Clock, XCircle, ShieldCheck, Camera, AlertTriangle, Check } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import {
  MemberProfile,
  getMemberProfile,
  getGoogleSuggestedName,
  createMemberProfile,
  updateMemberProfile,
  signUpMemberAccount,
  signInMemberAccount,
  signOutMemberAccount,
  signInWithGoogle,
  uploadAvatar
} from '../lib/memberAccount';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ScreenScroll, PrimaryButton, TextField, Card, Badge, LoadingBlock } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberAccount'>;
type ViewState = 'loading' | 'auth' | 'choose-kind' | 'dashboard';

// New self-serve member dashboard: email/password + Google sign-in, then
// routed by membership_status (pending/approved/rejected/guest). Separate
// from the existing Rotary-ID+PIN Member Portal (MemberLoginScreen) --
// this is an additive, parallel system per the brief, not a replacement.
export default function MemberAccountScreen({}: Props) {
  const [view, setView] = useState<ViewState>('loading');
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [kind, setKind] = useState<'member' | 'guest'>('member');
  const [fullName, setFullName] = useState('');

  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setView('auth');
      return;
    }
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setView('auth');
      return;
    }
    const p = await getMemberProfile();
    setProfile(p);
    if (!p) {
      const suggested = await getGoogleSuggestedName();
      setFullName(suggested);
      setView('choose-kind');
    } else {
      setEditFullName(p.fullName || '');
      setEditBio(p.bio || '');
      setEditPhone(p.phone || '');
      setEditPhotoUrl(p.photoUrl);
      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAuthSubmit = async () => {
    if (!email || !password) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'signup') {
        const { needsEmailConfirmation } = await signUpMemberAccount(email, password);
        if (needsEmailConfirmation) {
          setNotice('Check your email to confirm your account, then sign in.');
          setMode('signin');
        } else {
          await refresh();
        }
      } else {
        await signInMemberAccount(email, password);
        await refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleChooseKind = async () => {
    if (!fullName) return;
    setBusy(true);
    setError('');
    try {
      await createMemberProfile(kind, fullName);
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Could not set up your account.');
    } finally {
      setBusy(false);
    }
  };

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo library access is needed to set a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const asset = result.assets[0];
      const contentType = asset.mimeType || 'image/jpeg';
      const url = await uploadAvatar(asset.uri, contentType);
      setEditPhotoUrl(url);
    } catch (err: any) {
      setError(err?.message || 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await updateMemberProfile({
        fullName: editFullName,
        bio: editBio,
        phone: editPhone,
        photoUrl: editPhotoUrl || undefined
      });
      setNotice('Profile updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOutMemberAccount();
    setProfile(null);
    setEmail('');
    setPassword('');
    setView('auth');
  };

  if (view === 'loading') {
    return (
      <ScreenScroll>
        <LoadingBlock label="Loading your account..." />
      </ScreenScroll>
    );
  }

  if (view === 'auth') {
    return (
      <ScreenScroll>
        <View className="items-center gap-1.5 pt-2">
          <View className="w-14 h-14 rounded-2xl bg-rotary-azure/10 items-center justify-center">
            <UserIcon size={26} color={colors.rotaryAzure} />
          </View>
          <Text className="text-xl font-extrabold text-slate-800">Member Dashboard</Text>
          <Text className="text-[11px] text-slate-400 text-center">Sign up or sign in to request member access</Text>
        </View>

        <View className="flex-row bg-slate-100 rounded-xl p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-2.5 rounded-lg items-center ${mode === m ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold uppercase ${mode === m ? 'text-rotary-dark' : 'text-slate-400'}`}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            </Pressable>
          ))}
        </View>

        {notice ? (
          <View className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex-row items-center gap-2">
            <Check size={16} color={colors.rotaryAzure} />
            <Text className="text-xs text-sky-700 flex-1">{notice}</Text>
          </View>
        ) : null}
        {error ? (
          <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
            <AlertTriangle size={16} color="#e11d48" />
            <Text className="text-xs text-rose-700 flex-1">{error}</Text>
          </View>
        ) : null}

        <Card className="gap-4">
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          <PrimaryButton
            label={mode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={handleAuthSubmit}
            loading={busy}
            disabled={!email || !password}
          />

          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="text-[10px] text-slate-400 uppercase">Or</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <PrimaryButton label="Continue with Google" onPress={handleGoogle} loading={busy} variant="outline" />
        </Card>
      </ScreenScroll>
    );
  }

  if (view === 'choose-kind') {
    return (
      <ScreenScroll>
        <View className="items-center gap-1.5 pt-2">
          <ShieldCheck size={32} color={colors.rotaryAzure} />
          <Text className="text-xl font-extrabold text-slate-800 text-center">One more thing</Text>
          <Text className="text-xs text-slate-500 text-center leading-relaxed">
            Are you a member of Rotary Club of Freetown Sunset, or a guest?
          </Text>
        </View>

        {error ? (
          <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
            <AlertTriangle size={16} color="#e11d48" />
            <Text className="text-xs text-rose-700 flex-1">{error}</Text>
          </View>
        ) : null}

        <Card className="gap-4">
          <TextField label="Your Name" value={fullName} onChangeText={setFullName} placeholder="Full name" />

          <View className="gap-2">
            <Pressable
              onPress={() => setKind('member')}
              className={`p-4 rounded-xl border ${kind === 'member' ? 'bg-rotary-azure/10 border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-sm font-bold ${kind === 'member' ? 'text-rotary-azure' : 'text-slate-700'}`}>I'm a Member</Text>
              <Text className="text-[11px] text-slate-500 mt-0.5">Your request goes to a club admin for approval.</Text>
            </Pressable>
            <Pressable
              onPress={() => setKind('guest')}
              className={`p-4 rounded-xl border ${kind === 'guest' ? 'bg-rotary-azure/10 border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-sm font-bold ${kind === 'guest' ? 'text-rotary-azure' : 'text-slate-700'}`}>I'm a Guest</Text>
              <Text className="text-[11px] text-slate-500 mt-0.5">Immediate access to public content only.</Text>
            </Pressable>
          </View>

          <PrimaryButton label="Continue" onPress={handleChooseKind} loading={busy} disabled={!fullName} />
        </Card>
      </ScreenScroll>
    );
  }

  // dashboard
  const status = profile?.membershipStatus;

  return (
    <ScreenScroll>
      {status === 'pending' && (
        <Card className="items-center gap-3 py-8">
          <Clock size={32} color={colors.amber500} />
          <Text className="text-lg font-extrabold text-slate-800 text-center">Request Pending</Text>
          <Text className="text-xs text-slate-500 text-center leading-relaxed">
            Your membership request is awaiting approval from a club admin. You'll get full access once approved.
          </Text>
          <PrimaryButton label="Sign Out" variant="outline" onPress={handleSignOut} />
        </Card>
      )}

      {status === 'rejected' && (
        <Card className="items-center gap-3 py-8">
          <XCircle size={32} color={colors.rose600} />
          <Text className="text-lg font-extrabold text-slate-800 text-center">Request Not Approved</Text>
          <Text className="text-xs text-slate-500 text-center leading-relaxed">
            Your membership request wasn't approved. Contact a club officer if you think this is a mistake.
          </Text>
          <PrimaryButton label="Sign Out" variant="outline" onPress={handleSignOut} />
        </Card>
      )}

      {(status === 'approved' || status === 'guest') && (
        <>
          <View className="items-center gap-2 pt-2">
            <Badge label={status === 'approved' ? 'Approved Member' : 'Guest Access'} tone={status === 'approved' ? 'azure' : 'gold'} />
            {status === 'guest' && (
              <Text className="text-[11px] text-slate-400 text-center px-4">
                Guests have read-only access to public content. The Members Directory and member-only sections aren't
                available.
              </Text>
            )}
          </View>

          {error ? (
            <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
              <AlertTriangle size={16} color="#e11d48" />
              <Text className="text-xs text-rose-700 flex-1">{error}</Text>
            </View>
          ) : null}
          {notice ? (
            <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex-row items-center gap-2">
              <Check size={16} color={colors.emerald600} />
              <Text className="text-[11px] font-bold text-emerald-800">{notice}</Text>
            </View>
          ) : null}

          <Card className="gap-4">
            <View className="items-center gap-3">
              <Pressable onPress={handlePickPhoto} className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {editPhotoUrl ? (
                  <Image source={{ uri: editPhotoUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
                ) : (
                  <UserIcon size={32} color={colors.slate400} />
                )}
                <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rotary-azure items-center justify-center border-2 border-white">
                  <Camera size={12} color={colors.white} />
                </View>
              </Pressable>
              {uploadingPhoto ? <Text className="text-[10px] text-slate-400">Uploading...</Text> : null}
            </View>

            <TextField label="Name" value={editFullName} onChangeText={setEditFullName} placeholder="Full name" />
            <TextField label="Phone" value={editPhone} onChangeText={setEditPhone} placeholder="+232 ..." />
            <TextField label="Bio" value={editBio} onChangeText={setEditBio} placeholder="A short bio" multiline />

            <PrimaryButton label="Save Profile" onPress={handleSaveProfile} loading={busy} />
          </Card>

          <PrimaryButton label="Sign Out" variant="outline" onPress={handleSignOut} />
        </>
      )}
    </ScreenScroll>
  );
}

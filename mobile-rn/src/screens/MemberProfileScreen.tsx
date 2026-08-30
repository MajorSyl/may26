import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { UserProfile } from '../types';
import { getMyProfile, getMyContactInfo, updateMyProfile, saveMyContactInfo, MemberContactInfo } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberProfile'>;

export default function MemberProfileScreen({}: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [bio, setBio] = useState('');
  const [classification, setClassification] = useState('');
  const [committee, setCommittee] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile();
        setProfile(p);
        setBio(p.bio || '');
        setClassification(p.classification || '');
        setCommittee(p.committee || '');
        const contact = await getMyContactInfo(p.uid);
        setEmail(contact?.email || '');
        setPhone(contact?.phone || '');
        setBirthday(contact?.birthday || '');
      } catch (err: any) {
        setError(err?.message || 'Could not load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      await updateMyProfile(profile.uid, { bio, classification, committee });
      await saveMyContactInfo({ uid: profile.uid, email, phone, birthday });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenScroll>
        <LoadingBlock label="Loading your profile..." />
      </ScreenScroll>
    );
  }

  if (!profile) {
    return (
      <ScreenScroll>
        <Card>
          <Text className="text-sm text-rose-600">{error || 'Profile not found.'}</Text>
        </Card>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenTitle title={profile.name} subtitle={`${profile.role} -- Rotary ID ${profile.rotaryId || 'N/A'}`} />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Club Profile</Text>
        <TextField label="Classification" value={classification} onChangeText={setClassification} placeholder="e.g. Import/Export" />
        <TextField label="Committee" value={committee} onChangeText={setCommittee} placeholder="e.g. Community Service" />
        <TextField label="Bio" value={bio} onChangeText={setBio} placeholder="A short bio for the members directory" multiline />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Private Contact Info</Text>
        <Text className="text-[10px] text-slate-400 -mt-2">Never shown on the public Members Directory.</Text>
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Phone" value={phone} onChangeText={setPhone} placeholder="+232 ..." keyboardType="default" />
        <TextField label="Birthday" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" />
      </Card>

      <PrimaryButton label={success ? 'Saved!' : 'Save Changes'} onPress={handleSave} loading={saving} />
      {success && (
        <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex-row items-center gap-2">
          <Check size={16} color={colors.emerald600} />
          <Text className="text-[11px] font-bold text-emerald-800">Profile updated.</Text>
        </View>
      )}
    </ScreenScroll>
  );
}

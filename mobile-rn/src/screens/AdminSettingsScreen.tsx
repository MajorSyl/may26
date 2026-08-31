import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { getSiteSettings, saveSiteSettings, SiteSettings } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminSettings'>;

export default function AdminSettingsScreen({}: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch((err) => setError(err?.message || 'Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof SiteSettings, value: string) => settings && setSettings({ ...settings, [key]: value });

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    try {
      await saveSiteSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <ScreenScroll>
        <LoadingBlock label="Loading settings..." />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenTitle title="Settings" subtitle="Site copy and contact details." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Home</Text>
        <TextField label="Hero Title" value={settings.homeHeroTitle} onChangeText={(v) => set('homeHeroTitle', v)} />
        <TextField label="Hero Subtitle" value={settings.homeHeroSubtitle} onChangeText={(v) => set('homeHeroSubtitle', v)} multiline />
        <TextField
          label="Featured Video URL"
          value={settings.homeVideoUrl}
          onChangeText={(v) => set('homeVideoUrl', v)}
          placeholder="YouTube, Facebook, Instagram, or Google Drive share link"
          autoCapitalize="none"
        />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">About</Text>
        <TextField label="Header Title" value={settings.aboutHeaderTitle} onChangeText={(v) => set('aboutHeaderTitle', v)} />
        <TextField label="Header Description" value={settings.aboutHeaderDesc} onChangeText={(v) => set('aboutHeaderDesc', v)} multiline />
        <TextField label="Vision" value={settings.aboutVisionBody} onChangeText={(v) => set('aboutVisionBody', v)} multiline />
        <TextField label="Mission" value={settings.aboutMissionBody} onChangeText={(v) => set('aboutMissionBody', v)} multiline />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Get Involved</Text>
        <TextField label="Title" value={settings.involvedTitle} onChangeText={(v) => set('involvedTitle', v)} />
        <TextField label="Subtitle" value={settings.involvedSubtitle} onChangeText={(v) => set('involvedSubtitle', v)} multiline />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</Text>
        <TextField label="Email" value={settings.contactEmail} onChangeText={(v) => set('contactEmail', v)} keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Phone" value={settings.contactPhone} onChangeText={(v) => set('contactPhone', v)} />
        <TextField label="Facebook URL" value={settings.socialFacebookUrl} onChangeText={(v) => set('socialFacebookUrl', v)} autoCapitalize="none" />
        <TextField label="Instagram URL" value={settings.socialInstagramUrl} onChangeText={(v) => set('socialInstagramUrl', v)} autoCapitalize="none" />
      </Card>

      <PrimaryButton label={success ? 'Saved!' : 'Save Settings'} onPress={handleSave} loading={saving} />
      {success && (
        <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex-row items-center gap-2">
          <Check size={16} color={colors.emerald600} />
          <Text className="text-[11px] font-bold text-emerald-800">Settings saved.</Text>
        </View>
      )}
    </ScreenScroll>
  );
}

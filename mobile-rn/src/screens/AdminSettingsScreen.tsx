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
        <TextField label="Who We Are (intro under the club name)" value={settings.homeHeroSubtitle} onChangeText={(v) => set('homeHeroSubtitle', v)} multiline />
        <TextField
          label="Impact Highlights (one per line: figure | description)"
          value={settings.impactHighlights}
          onChangeText={(v) => set('impactHighlights', v)}
          placeholder="100+ | boreholes delivered with the Rotary Club of Fishers"
          multiline
        />
        <TextField
          label="Instagram Post Links (one per line, optional)"
          value={settings.instagramPostUrls}
          onChangeText={(v) => set('instagramPostUrls', v)}
          placeholder="https://www.instagram.com/p/..."
          autoCapitalize="none"
          multiline
        />
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
        <TextField label="Year Founded" value={settings.foundedYear} onChangeText={(v) => set('foundedYear', v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" />
        <TextField label="Rotary District" value={settings.districtLabel} onChangeText={(v) => set('districtLabel', v)} placeholder="Rotary District 9101" />
        <TextField label="Header Title" value={settings.aboutHeaderTitle} onChangeText={(v) => set('aboutHeaderTitle', v)} />
        <TextField label="Header Description" value={settings.aboutHeaderDesc} onChangeText={(v) => set('aboutHeaderDesc', v)} multiline />
        <TextField label="Vision" value={settings.aboutVisionBody} onChangeText={(v) => set('aboutVisionBody', v)} multiline />
        <TextField label="Mission" value={settings.aboutMissionBody} onChangeText={(v) => set('aboutMissionBody', v)} multiline />
        <TextField label="Introduction to Rotary" value={settings.aboutRotaryIntro} onChangeText={(v) => set('aboutRotaryIntro', v)} multiline />
        <TextField label="Our Main Areas of Work (one per line)" value={settings.aboutAreasOfWork} onChangeText={(v) => set('aboutAreasOfWork', v)} multiline />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Members</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField label="Total Members" value={settings.membersTotal} onChangeText={(v) => set('membersTotal', v.replace(/\D/g, ''))} keyboardType="number-pad" />
          </View>
          <View className="flex-1">
            <TextField label="Members in Diaspora" value={settings.membersDiaspora} onChangeText={(v) => set('membersDiaspora', v.replace(/\D/g, ''))} keyboardType="number-pad" />
          </View>
        </View>
        <TextField label="Executive Term" value={settings.executiveTermLabel} onChangeText={(v) => set('executiveTermLabel', v)} placeholder="2026–2027" />
        <Text className="text-[11px] text-slate-400">
          Executive names, positions, photos and order are set per member under Admin → Members.
        </Text>
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Meetings</Text>
        <TextField label="When" value={settings.meetingSchedule} onChangeText={(v) => set('meetingSchedule', v)} placeholder="Thursdays, 6:30 PM" />
        <TextField label="Where" value={settings.meetingLocation} onChangeText={(v) => set('meetingLocation', v)} />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Get Involved</Text>
        <TextField label="Title" value={settings.involvedTitle} onChangeText={(v) => set('involvedTitle', v)} />
        <TextField label="Subtitle" value={settings.involvedSubtitle} onChangeText={(v) => set('involvedSubtitle', v)} multiline />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</Text>
        <TextField label="Email" value={settings.contactEmail} onChangeText={(v) => set('contactEmail', v)} keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Phone (hidden on the site until a real number is entered)" value={settings.contactPhone} onChangeText={(v) => set('contactPhone', v)} />
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

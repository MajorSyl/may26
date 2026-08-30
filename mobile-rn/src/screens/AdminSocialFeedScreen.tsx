import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Instagram, Facebook } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { SocialConfig, adminGetSocialConfig, adminSaveSocialCredentials, adminTriggerSocialSync } from '../lib/social';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, PrimaryButton, TextField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminSocialFeed'>;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function TokenHealth({ label, icon: Icon, expiresAt }: { label: string; icon: typeof Instagram; expiresAt: string | null }) {
  const days = daysUntil(expiresAt);
  let tone: 'ok' | 'warn' | 'bad' | 'unknown' = 'unknown';
  if (days !== null) {
    tone = days < 0 ? 'bad' : days < 7 ? 'bad' : days < 14 ? 'warn' : 'ok';
  }
  const toneColor = { ok: colors.emerald600, warn: colors.amber500, bad: colors.rose600, unknown: colors.slate400 }[tone];
  const toneLabel =
    days === null
      ? 'No token set'
      : days < 0
        ? `Expired ${Math.abs(days)}d ago`
        : `Expires in ${days}d`;

  return (
    <Card className="flex-1 gap-2">
      <View className="flex-row items-center gap-2">
        <Icon size={16} color={colors.rotaryAzure} />
        <Text className="text-xs font-bold text-slate-800">{label}</Text>
      </View>
      <Text className="text-sm font-extrabold" style={{ color: toneColor }}>
        {toneLabel}
      </Text>
    </Card>
  );
}

export default function AdminSocialFeedScreen({}: Props) {
  const [config, setConfig] = useState<SocialConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [igToken, setIgToken] = useState('');
  const [igAccountId, setIgAccountId] = useState('');
  const [fbToken, setFbToken] = useState('');
  const [fbPageId, setFbPageId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const c = await adminGetSocialConfig();
      setConfig(c);
      setMetaAppId(c.metaAppId);
      setMetaAppSecret(c.metaAppSecret);
      setIgToken(c.instagramAccessToken);
      setIgAccountId(c.instagramAccountId);
      setFbToken(c.facebookAccessToken);
      setFbPageId(c.facebookPageId);
    } catch (err: any) {
      setError(err?.message || 'Could not load social feed settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await adminSaveSocialCredentials({
        metaAppId,
        metaAppSecret,
        instagramAccessToken: igToken,
        instagramAccountId: igAccountId,
        facebookAccessToken: fbToken,
        facebookPageId: fbPageId
      });
      setNotice('Credentials saved. Tap "Sync Now" to pull posts immediately.');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not save credentials.');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setNotice('');
    try {
      await adminTriggerSocialSync();
      setNotice('Sync triggered. Refresh this screen in a few seconds to see the result.');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not trigger a sync.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !config) {
    return (
      <ScreenScroll>
        <LoadingBlock label="Loading social feed settings..." />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenTitle title="Social Feed" subtitle="Instagram + Facebook integration, credentials, and sync status." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}
      {notice ? (
        <View className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex-row items-center gap-2">
          <CheckCircle size={16} color={colors.rotaryAzure} />
          <Text className="text-xs text-sky-700 flex-1">{notice}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <TokenHealth label="Instagram Token" icon={Instagram} expiresAt={config.instagramTokenExpiresAt} />
        <TokenHealth label="Facebook Token" icon={Facebook} expiresAt={config.facebookTokenExpiresAt} />
      </View>

      <Card className="gap-2">
        <View className="flex-row items-center gap-2">
          <Clock size={14} color={colors.slate400} />
          <Text className="text-xs font-bold text-slate-700">
            Last synced: {config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : 'Never'}
          </Text>
        </View>
        {config.lastSyncError ? <Text className="text-[11px] text-rose-600">{config.lastSyncError}</Text> : null}
        <View className="flex-row items-center gap-2 pt-2 border-t border-slate-100">
          <RefreshCw size={14} color={colors.slate400} />
          <Text className="text-xs font-bold text-slate-700">
            Last token refresh attempt: {config.lastRefreshAttemptAt ? new Date(config.lastRefreshAttemptAt).toLocaleString() : 'Never'}
          </Text>
        </View>
        {config.lastRefreshError ? <Text className="text-[11px] text-rose-600">{config.lastRefreshError}</Text> : null}
        <PrimaryButton label="Sync Now" onPress={handleSync} loading={syncing} variant="outline" />
      </Card>

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Meta App Credentials</Text>
        <Text className="text-[11px] text-slate-400 -mt-2">From your Meta Developer app -- used only to refresh tokens.</Text>
        <TextField label="App ID" value={metaAppId} onChangeText={setMetaAppId} placeholder="123456789012345" autoCapitalize="none" />
        <TextField label="App Secret" value={metaAppSecret} onChangeText={setMetaAppSecret} placeholder="••••••••" secureTextEntry />
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <Instagram size={14} color={colors.rotaryAzure} />
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Instagram (Business Account)</Text>
        </View>
        <TextField label="Access Token" value={igToken} onChangeText={setIgToken} placeholder="Long-lived access token" secureTextEntry />
        <TextField label="Business Account ID" value={igAccountId} onChangeText={setIgAccountId} placeholder="17841400..." autoCapitalize="none" />
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <Facebook size={14} color={colors.rotaryAzure} />
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Facebook (Page)</Text>
        </View>
        <TextField label="Page Access Token" value={fbToken} onChangeText={setFbToken} placeholder="Long-lived page access token" secureTextEntry />
        <TextField label="Page ID" value={fbPageId} onChangeText={setFbPageId} placeholder="100064..." autoCapitalize="none" />
      </Card>

      <PrimaryButton label="Save Credentials" onPress={handleSave} loading={saving} />
    </ScreenScroll>
  );
}

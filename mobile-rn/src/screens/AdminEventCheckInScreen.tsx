import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RefreshCw, AlertTriangle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { getCheckinToken } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminEventCheckIn'>;

const ROTATE_MS = 30_000;

// The QR encodes RCFS-CHECKIN:{code} -- a random, server-issued, ~45s-lived
// code (see get-checkin-token). Re-fetched every 30s so a screenshot taken
// by someone off-site is stale well before they could act on it. The same
// code is also shown as plain text for members without camera access.
export default function AdminEventCheckInScreen({ route }: Props) {
  const { eventId, eventTitle } = route.params;
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState('');
  const expiresAtRef = useRef(0);

  const fetchToken = async () => {
    try {
      const { code: c, expiresAt } = await getCheckinToken(eventId);
      setCode(c);
      expiresAtRef.current = new Date(expiresAt).getTime();
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Could not generate a check-in code.');
    }
  };

  useEffect(() => {
    fetchToken();
    const rotateTimer = setInterval(fetchToken, ROTATE_MS);
    const tickTimer = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round((expiresAtRef.current - Date.now()) / 1000)));
    }, 500);
    return () => {
      clearInterval(rotateTimer);
      clearInterval(tickTimer);
    };
  }, [eventId]);

  return (
    <ScreenScroll>
      <ScreenTitle subtitle={eventTitle} />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <Card className="items-center gap-5 py-8">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Display this on a screen at the venue</Text>
        {code ? (
          <View className="bg-white p-4 rounded-2xl border border-slate-200">
            <QRCode value={`RCFS-CHECKIN:${code}`} size={220} />
          </View>
        ) : (
          <View className="w-[220px] h-[220px] items-center justify-center">
            <RefreshCw size={28} color={colors.slate400} />
          </View>
        )}

        <View className="items-center gap-1">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Or type this code</Text>
          <Text className="text-3xl font-extrabold text-rotary-dark tracking-[6px]">{code || '--------'}</Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <RefreshCw size={12} color={colors.slate400} />
          <Text className="text-[11px] text-slate-400">Refreshes in {secondsLeft}s</Text>
        </View>
      </Card>

      <Text className="text-[11px] text-slate-400 text-center leading-relaxed">
        Members must be within the venue's allowed radius and scan (or type) this code before it rotates. Codes are single-use
        per member -- everyone can check in with the same code while it's live.
      </Text>
    </ScreenScroll>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, MapPin, Check, AlertTriangle, KeyRound } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { submitCheckIn } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberCheckIn'>;

// Camera QR scanning uses the browser's getUserMedia + jsQR (pure JS, no
// native camera module in this build) -- web only. Native falls back to
// manual code entry, which works everywhere and is always shown as a
// backup even on web in case camera access is denied or unreliable.
export default function MemberCheckInScreen({ route, navigation }: Props) {
  const { eventId, eventTitle } = route.params;
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ confidence?: string; alreadyCheckedIn?: boolean } | null>(null);
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: any) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => stopCamera, []);

  const startScan = async () => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !(navigator as any).mediaDevices) {
      setCameraError('Camera scanning needs the web app -- open rcfsunset.org in your phone browser, or type the code below.');
      return;
    }
    try {
      setCameraError('');
      const stream = await (navigator as any).mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const jsQR = require('jsqr').default || require('jsqr');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const tick = () => {
        if (!streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data?.startsWith('RCFS-CHECKIN:')) {
            const value = code.data.replace('RCFS-CHECKIN:', '');
            stopCamera();
            handleCheckIn(value);
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setCameraError('Could not access the camera. Type the code below instead.');
    }
  };

  const handleCheckIn = (codeOverride?: string) => {
    const code = (codeOverride || manualCode).trim();
    if (!code) return;
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Location access is needed to check in -- please use the web app on your phone browser.');
      return;
    }
    setBusy(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await submitCheckIn(code, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 999);
          setResult(res);
        } catch (err: any) {
          setError(err?.message || 'Could not check in.');
        } finally {
          setBusy(false);
        }
      },
      () => {
        setError('Could not get your location. Please allow location access and try again.');
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (result) {
    return (
      <ScreenScroll>
        <Card className="items-center gap-3 py-10">
          <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center">
            <Check size={28} color={colors.emerald600} />
          </View>
          <Text className="text-lg font-extrabold text-slate-800 text-center">
            {result.alreadyCheckedIn ? "You're already checked in!" : "You're checked in!"}
          </Text>
          <Text className="text-xs text-slate-500 text-center">{eventTitle}</Text>
          {result.confidence === 'low' ? (
            <Text className="text-[11px] text-amber-600 text-center px-4">
              Your location signal was weak, so this check-in is flagged for officer review -- no action needed from you.
            </Text>
          ) : null}
          <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
        </Card>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenTitle subtitle={eventTitle} />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <Card className="items-center gap-4">
        {Platform.OS === 'web' ? (
          <View className="w-full items-center gap-3">
            <View className="w-full aspect-square max-w-xs rounded-2xl overflow-hidden bg-slate-900 items-center justify-center">
              {scanning ? (
                React.createElement('video', { ref: videoRef, style: { width: '100%', height: '100%', objectFit: 'cover' }, muted: true, playsInline: true })
              ) : (
                <Camera size={32} color={colors.slate500} />
              )}
              {React.createElement('canvas', { ref: canvasRef, style: { display: 'none' } })}
            </View>
            {cameraError ? <Text className="text-[11px] text-rose-500 text-center">{cameraError}</Text> : null}
            {!scanning && (
              <PrimaryButton label="Scan QR Code" onPress={startScan} />
            )}
          </View>
        ) : (
          <View className="items-center gap-2 py-4">
            <Camera size={28} color={colors.slate400} />
            <Text className="text-[11px] text-slate-400 text-center px-4">
              Camera check-in works in the web app -- open rcfsunset.org on your phone's browser, or type the code below.
            </Text>
          </View>
        )}

        <View className="w-full flex-row items-center gap-3">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="text-[10px] text-slate-400 uppercase">Or Enter Code</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        <View className="w-full flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3">
          <KeyRound size={16} color={colors.slate400} />
          <TextInput
            value={manualCode}
            onChangeText={(v) => setManualCode(v.toUpperCase())}
            placeholder="e.g. K7P2QX9M"
            placeholderTextColor={colors.slate400}
            autoCapitalize="characters"
            className="flex-1 py-3 text-sm font-bold tracking-widest text-slate-700"
          />
        </View>

        <View className="flex-row items-center gap-1.5">
          <MapPin size={12} color={colors.slate400} />
          <Text className="text-[10px] text-slate-400">We'll check your location is near the venue</Text>
        </View>

        <PrimaryButton label="Check In" onPress={() => handleCheckIn()} loading={busy} disabled={!manualCode} />
      </Card>
    </ScreenScroll>
  );
}

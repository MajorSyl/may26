import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sun, Compass, Users, LucideIcon } from 'lucide-react-native';
import { colors } from '../theme';

const SEEN_KEY = 'rcfs_onboarding_seen_v1';

interface Slide {
  icon: LucideIcon;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: Sun,
    title: 'Welcome to RCFS',
    body: "Your home for the Rotary Club of Freetown Sunset -- news, service projects, and events, right on your phone."
  },
  {
    icon: Compass,
    title: 'Stay in the Loop',
    body: 'Browse our community service projects, upcoming meetings, and the members directory anytime.'
  },
  {
    icon: Users,
    title: 'Join the Community',
    body: "Sign up for the Member Dashboard to connect with fellow Rotarians and follow club activity."
  }
];

// First-run welcome flow -- shown once per install, gated behind an
// AsyncStorage flag so it never interrupts a returning visitor. Sits above
// everything else (including the auth modals) since it's meant to greet a
// brand-new user before they've done anything at all.
export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY).then((seen) => {
      if (!seen) setVisible(true);
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(SEEN_KEY, 'true').catch(() => {});
  };

  if (!visible) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;
  const Icon = slide.icon;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <View className="w-full max-w-sm bg-white rounded-3xl p-6 gap-5">
          <View className="items-center gap-3 pt-2">
            <View className="w-16 h-16 rounded-2xl bg-rotary-azure/10 items-center justify-center">
              <Icon size={30} color={colors.rotaryAzure} />
            </View>
            <Text className="text-xl font-extrabold text-slate-800 text-center">{slide.title}</Text>
            <Text className="text-sm text-slate-500 text-center leading-relaxed">{slide.body}</Text>
          </View>

          <View className="flex-row items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <View key={i} className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-rotary-azure' : 'w-1.5 bg-slate-200'}`} />
            ))}
          </View>

          <View className="flex-row gap-3">
            {!isLast ? (
              <Pressable onPress={dismiss} className="flex-1 items-center py-3">
                <Text className="text-xs font-bold uppercase text-slate-400">Skip</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={isLast ? dismiss : () => setStep(step + 1)}
              className="flex-[2] py-3.5 rounded-xl items-center bg-rotary-azure"
            >
              <Text className="text-xs font-bold uppercase text-white tracking-wider">{isLast ? 'Get Started' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

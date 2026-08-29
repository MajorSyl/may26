import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Compass, Heart } from 'lucide-react-native';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { FULL_MEMBER_LIST } from '../memberData';
import { ScreenScroll, Badge } from '../components/ui';
import { colors } from '../theme';

const FOUR_WAY_TEST = [
  { num: 1, q: 'Is it the TRUTH?', desc: 'We advocate for honesty and clarity in our reporting and communications.' },
  {
    num: 2,
    q: 'Is it FAIR to all concerned?',
    desc: 'We consult, listen, and partner with local community committees to guarantee equal resource distribution without bias.'
  },
  {
    num: 3,
    q: 'Will it build GOODWILL and BETTER FRIENDSHIPS?',
    desc: 'We bridge lines of profession and origin. Weekly meetings foster lifelong, collaborative friends unified by service.'
  },
  {
    num: 4,
    q: 'Will it be BENEFICIAL to all concerned?',
    desc: 'Our projects must leave a permanent, self-sustaining positive health, economic, or physical impact in Sierra Leone.'
  }
];

// Simplified from the web app's admin-editable block layout (About.tsx) into
// a fixed section order, matching the same simplification made in HomeScreen.
export default function AboutScreen() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [openTest, setOpenTest] = useState<number | null>(0);

  useEffect(() => {
    let active = true;
    getSiteSettings().then((s) => active && setSettings(s));
    return () => {
      active = false;
    };
  }, []);

  const leadership = FULL_MEMBER_LIST.filter((m) => m.title);

  return (
    <ScreenScroll>
      <View className="items-center gap-3">
        <Badge label={settings.aboutHeaderBadge} tone="gold" />
        <Text className="text-3xl font-extrabold text-slate-800 text-center leading-snug">{settings.aboutHeaderTitle}</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">{settings.aboutHeaderDesc}</Text>
      </View>

      <View className="gap-4">
        <View className="bg-white p-6 rounded-3xl border border-slate-200 gap-3">
          <View className="p-3 bg-rotary-azure/10 rounded-2xl self-start">
            <Compass size={22} color={colors.rotaryAzure} />
          </View>
          <Text className="text-lg font-bold text-slate-800">{settings.aboutVisionTitle}</Text>
          <Text className="text-xs text-slate-500 leading-relaxed">{settings.aboutVisionBody}</Text>
        </View>
        <View className="bg-amber-50 p-6 rounded-3xl border border-amber-100 gap-3">
          <View className="p-3 bg-rotary-gold/15 rounded-2xl self-start">
            <Heart size={22} color={colors.rotaryGold} />
          </View>
          <Text className="text-lg font-bold text-slate-800">{settings.aboutMissionTitle}</Text>
          <Text className="text-xs text-slate-500 leading-relaxed">{settings.aboutMissionBody}</Text>
        </View>
      </View>

      <View className="gap-4">
        <Badge label="Ethical Guardrails" tone="gold" />
        <Text className="text-2xl font-extrabold text-slate-800">The Four-Way Test</Text>
        <View className="gap-3">
          {FOUR_WAY_TEST.map((test, i) => {
            const isOpen = openTest === i;
            return (
              <Pressable
                key={test.num}
                onPress={() => setOpenTest(isOpen ? null : i)}
                className={`rounded-2xl border p-4 ${isOpen ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="w-8 h-8 rounded-xl bg-slate-800 items-center justify-center">
                      <Text className="text-rotary-gold font-bold text-xs">{test.num}</Text>
                    </View>
                    <Text className="font-extrabold text-slate-800 text-xs flex-1">{test.q}</Text>
                  </View>
                  <Text className="text-rotary-gold text-xl">{isOpen ? '−' : '+'}</Text>
                </View>
                {isOpen && <Text className="text-xs text-slate-600 leading-relaxed mt-3">{test.desc}</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      {leadership.length > 0 && (
        <View className="gap-4">
          <Text className="text-xs font-semibold uppercase text-rotary-azure text-center">Board of Directors</Text>
          <Text className="text-2xl font-bold text-rotary-dark text-center">Club Leadership</Text>
          <View className="gap-3">
            {leadership.map((leader, i) => (
              <View key={i} className="bg-white border border-slate-200 rounded-3xl p-5 items-center gap-2">
                <View className="w-16 h-16 rounded-full border-2 border-rotary-azure bg-sky-50 items-center justify-center">
                  <Text className="text-rotary-azure font-extrabold">
                    {leader.name.replace('Rtn. ', '').split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <Text className="font-extrabold text-slate-800 text-sm text-center">{leader.name}</Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-rotary-azure">{leader.title}</Text>
                {leader.classification && (
                  <Text className="text-xs text-slate-500 text-center">Classification: {leader.classification}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScreenScroll>
  );
}

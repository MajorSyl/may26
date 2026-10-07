import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Compass,
  Heart,
  Calendar,
  ShieldAlert,
  Droplets,
  Baby,
  BookOpen,
  TrendingUp,
  Sprout
} from 'lucide-react-native';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { ROTARY_FOCUS_AREAS } from '../data';
import { ScreenScroll, Badge } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

const OBJECTS_OF_ROTARY = [
  'Building friendship as an opportunity for service.',
  'High ethical standards in business, professions, and community life.',
  'Applying the ideal of service in each Rotarian’s personal, business, and community life.',
  'Advancing international understanding, goodwill, and peace through a world fellowship of professionals united in service.'
];

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

const FOCUS_ICONS = [ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout];

// Who we are, in one place: founding, vision, a brief introduction to
// Rotary, the Objects of Rotary, the Four-Way Test, and our areas of
// work -- informative without being text-heavy, per the club's revamp
// brief. Individual leadership bios moved to the Members page, which now
// owns "names and positions" so this page isn't duplicating that list.
export default function AboutScreen() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [openTest, setOpenTest] = useState<number | null>(0);

  useEffect(() => {
    logPageView('about');
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <ScreenScroll>
      <View className="items-center gap-3 w-full sm:max-w-2xl mx-auto">
        <Badge label={settings.aboutHeaderBadge} tone="gold" />
        <Text className="text-3xl font-extrabold text-slate-800 text-center leading-snug">{settings.aboutHeaderTitle}</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">{settings.aboutHeaderDesc}</Text>
        <View className="flex-row items-center gap-2 bg-rotary-azure/10 rounded-full px-4 py-1.5 mt-1">
          <Calendar size={13} color={colors.rotaryAzure} />
          <Text className="text-[11px] font-bold text-rotary-azure">Founded 2014 &middot; Rotary District 9101</Text>
        </View>
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

      {/* What is Rotary, briefly */}
      <View className="gap-4">
        <Badge label="What Is Rotary?" />
        <Text className="text-2xl font-extrabold text-slate-800">A Global Fellowship of Service</Text>
        <Text className="text-sm text-slate-500 leading-relaxed">
          Rotary is a global network of neighbors, friends, and problem-solvers who come together to take action and
          create lasting change -- across communities and around the world. Our club is part of Rotary District 9101,
          spanning West Africa.
        </Text>
      </View>

      {/* Objects of Rotary */}
      <View className="gap-4">
        <Text className="text-xl font-extrabold text-slate-800">The Objects of Rotary</Text>
        <View className="gap-2.5">
          {OBJECTS_OF_ROTARY.map((obj, i) => (
            <View key={i} className="flex-row items-start gap-3 bg-white border border-slate-100 rounded-2xl p-4">
              <View className="w-6 h-6 rounded-full bg-rotary-azure items-center justify-center mt-0.5">
                <Text className="text-white text-[11px] font-extrabold">{i + 1}</Text>
              </View>
              <Text className="text-xs text-slate-600 leading-relaxed flex-1">{obj}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Four-Way Test */}
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

      {/* Areas of work */}
      <View className="gap-4">
        <Text className="text-xl font-extrabold text-slate-800">Our Main Areas of Work</Text>
        <View className="gap-3 sm:flex-row sm:flex-wrap">
          {ROTARY_FOCUS_AREAS.map((area, i) => {
            const Icon = FOCUS_ICONS[i];
            return (
              <View key={area.title} className="bg-white border border-slate-100 rounded-2xl p-4 gap-2 sm:w-[48%] lg:w-[31%]">
                <View className="w-9 h-9 rounded-xl bg-rotary-azure/10 items-center justify-center">
                  <Icon size={17} color={colors.rotaryAzure} />
                </View>
                <Text className="text-sm font-bold text-slate-800">{area.title}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScreenScroll>
  );
}

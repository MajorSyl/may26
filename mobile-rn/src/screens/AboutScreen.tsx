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
import { ROTARY_FOCUS_AREAS, OBJECTS_OF_ROTARY, FOUR_WAY_TEST } from '../data';
import { ScreenScroll, Badge } from '../components/ui';
import SiteFooter from '../navigation/SiteFooter';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

const FOCUS_ICONS = [ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout];

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
        <Text className="text-xs text-slate-500 leading-relaxed">
          The Object of Rotary is to encourage and foster the ideal of service as a basis of worthy enterprise and, in
          particular, to encourage and foster:
        </Text>
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
        <Text className="text-xs text-slate-500">Of the things we think, say or do:</Text>
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

      <SiteFooter />
    </ScreenScroll>
  );
}

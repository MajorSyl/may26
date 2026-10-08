import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Droplets, Baby, BookOpen, Heart, Users, Sprout, TrendingUp, ShieldAlert, Sparkles, CalendarDays, MapPin, Compass, Target } from 'lucide-react-native';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, splitLines } from '../lib/service';
import { OBJECTS_OF_ROTARY, FOUR_WAY_TEST } from '../data';
import SafeImage from '../components/SafeImage';
import { SitePage, Section, SectionHeading, CTAButton, IconTile, PlaceholderNote } from '../components/site';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

function iconForArea(area: string) {
  const a = area.toLowerCase();
  if (a.includes('water') || a.includes('sanitation')) return Droplets;
  if (a.includes('maternal') || a.includes('child')) return Baby;
  if (a.includes('education') || a.includes('literacy')) return BookOpen;
  if (a.includes('health') || a.includes('nutrition') || a.includes('disease')) return Heart;
  if (a.includes('environment')) return Sprout;
  if (a.includes('economic')) return TrendingUp;
  if (a.includes('peace')) return ShieldAlert;
  if (a.includes('community') || a.includes('welfare')) return Users;
  return Sparkles;
}

export default function AboutScreen() {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    logPageView('about');
    getSiteSettings().then(setSettings);
  }, []);

  const goTab = (tab: string, screen: string) => (navigation.getParent()?.navigate as any)?.(tab, { screen });
  const areas = splitLines(settings.aboutAreasOfWork);

  return (
    <SitePage>
      <Section tone="cream">
        <View className="gap-8 lg:flex-row lg:items-center lg:gap-14">
          <View className="flex-1 gap-6 rcfs-rise">
            <SectionHeading eyebrow="About us" title={settings.aboutHeaderTitle.replace(/\.$/, '')} intro={settings.aboutHeaderDesc} />
            <View className="flex-row flex-wrap gap-x-6 gap-y-3">
              {settings.foundedYear ? (
                <View className="flex-row items-center gap-2">
                  <CalendarDays size={18} color={colors.rotaryRoyal} />
                  <Text className="text-[15px] font-semibold text-rotary-royal-deep">Founded {settings.foundedYear}</Text>
                </View>
              ) : (
                <PlaceholderNote label="founding year" />
              )}
              {settings.districtLabel ? (
                <View className="flex-row items-center gap-2 shrink max-w-full">
                  <MapPin size={18} color={colors.rotaryRoyal} />
                  <Text className="shrink text-[15px] font-semibold text-rotary-royal-deep">{settings.districtLabel} · Freetown, Sierra Leone</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View className="w-full lg:w-[46%] aspect-[16/10] rounded-3xl overflow-hidden bg-slate-100">
            <SafeImage
              src="https://rcfsunset.org/images/projects/russell-primary-school-partnership.jpg"
              alt="Rotary Club of Freetown-Sunset members with pupils of Russell Primary School"
              fit="cover"
              eager
            />
          </View>
        </View>
      </Section>

      <Section>
        <View className="gap-5 md:flex-row">
          {[
            { Icon: Compass, title: settings.aboutVisionTitle, body: settings.aboutVisionBody },
            { Icon: Target, title: settings.aboutMissionTitle, body: settings.aboutMissionBody }
          ].map(({ Icon, title, body }) => (
            <View key={title} className="flex-1 border border-slate-200 rounded-3xl p-6 sm:p-8 gap-4">
              <View className="w-12 h-12 rounded-xl bg-rotary-gold-soft items-center justify-center">
                <Icon size={22} color={colors.rotaryRoyal} />
              </View>
              <Text className="font-display text-2xl font-bold text-rotary-royal-deep">{title}</Text>
              <Text className="text-base leading-7 text-slate-600">{body}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section tone="cream">
        <View className="gap-10 lg:flex-row lg:gap-16">
          <View className="lg:w-[40%]">
            <SectionHeading eyebrow="What is Rotary?" title="People of action, around the world" intro={settings.aboutRotaryIntro || undefined} />
          </View>
          <View className="flex-1 gap-5">
            <Text className="font-display text-xl font-bold text-rotary-royal-deep">The Objects of Rotary</Text>
            <Text className="text-base leading-7 text-slate-600">
              The Object of Rotary is to encourage and foster the ideal of service as a basis of worthy enterprise and, in particular, to
              encourage and foster:
            </Text>
            {OBJECTS_OF_ROTARY.map((obj, i) => (
              <View key={obj} className="flex-row items-start gap-4 bg-white rounded-2xl p-5">
                <Text className="font-display text-2xl font-extrabold text-rotary-gold w-6">{i + 1}</Text>
                <Text className="flex-1 text-base leading-7 text-slate-700">{obj}</Text>
              </View>
            ))}
          </View>
        </View>
      </Section>

      <Section tone="royal">
        <View className="gap-10">
          <SectionHeading eyebrow="Our compass" title="The Four-Way Test" intro="Of the things we think, say or do:" onDark />
          <View className="flex-row flex-wrap -mx-3">
            {FOUR_WAY_TEST.map((t) => (
              <View key={t.num} className="w-full sm:w-1/2 lg:w-1/4 p-3">
                <View className="border-t-2 border-rotary-gold pt-4 gap-2">
                  <Text className="font-display text-4xl font-extrabold text-rotary-gold">{t.num}</Text>
                  <Text className="font-display text-xl leading-7 font-bold text-white">{t.q}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Section>

      <Section>
        <View className="gap-8">
          <SectionHeading eyebrow="Our work" title="Our main areas of work" />
          {areas.length > 0 ? (
            <View className="flex-row flex-wrap -mx-2">
              {areas.map((area) => (
                <View key={area} className="w-1/2 md:w-1/3 lg:w-1/5 p-2">
                  <IconTile icon={iconForArea(area)} label={area} />
                </View>
              ))}
            </View>
          ) : (
            <PlaceholderNote label="main areas of work" />
          )}
          <View className="flex-col sm:flex-row gap-3">
            <CTAButton label="See our projects" onPress={() => goTab('ProjectsTab', 'Gallery')} />
            <CTAButton label="Get in Touch" variant="secondary" onPress={() => goTab('MoreTab', 'Contact')} />
          </View>
        </View>
      </Section>
    </SitePage>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout, Users, MapPin, CalendarDays, Globe2 } from 'lucide-react-native';
import { HomeStackParamList } from '../navigation/types';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, getProjects, parseImpactHighlights } from '../lib/service';
import { Project } from '../types';
import { ROTARY_FOCUS_AREAS, FOUR_WAY_TEST, OBJECTS_SHORT } from '../data';
import ProjectCard, { StatusChip } from '../components/ProjectCard';
import SafeImage from '../components/SafeImage';
import SocialSection from '../components/SocialSection';
import { SitePage, Section, SectionHeading, CTAButton, TextLink, IconTile, Eyebrow, PlaceholderNote } from '../components/site';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const FOCUS_ICONS = [ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout];

export default function HomeScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    logPageView('home');
    getSiteSettings().then((s) => active && setSettings(s));
    getProjects().then((p) => active && setProjects(p));
    return () => {
      active = false;
    };
  }, []);

  const goTab = (tab: 'ProjectsTab' | 'MembersTab' | 'MoreTab', screen: string, params?: object) =>
    (navigation.getParent()?.navigate as any)?.(tab, { screen, params });
  const openProject = (project: Project) => goTab('ProjectsTab', 'ProjectDetails', { project });

  const featured = projects.find((p) => p.isFeatured) || projects[0];
  const rest = projects.filter((p) => p.id !== featured?.id);
  const ongoing = rest.filter((p) => p.status !== 'Completed');
  const completed = rest.filter((p) => p.status === 'Completed');
  const mixed = [...ongoing.slice(0, 2), ...completed.slice(0, 2)];
  const selection = (mixed.length >= 3 ? mixed : rest).slice(0, 3);

  const highlights = parseImpactHighlights(settings.impactHighlights);
  const partnerCount = new Set(projects.flatMap((p) => p.partners || [])).size;
  const derivedImpact = [
    { figure: String(projects.length), label: 'community projects on record' },
    { figure: String(projects.filter((p) => p.status !== 'Completed').length), label: 'projects under way right now' },
    { figure: String(partnerCount), label: 'partner organisations at home and abroad' }
  ].filter((h) => h.figure !== '0');
  const impact = highlights.length > 0 ? highlights : derivedImpact;

  const facts = [
    settings.foundedYear ? { Icon: CalendarDays, label: `Founded ${settings.foundedYear}` } : null,
    settings.membersTotal ? { Icon: Users, label: `${settings.membersTotal} members` } : null,
    settings.membersDiaspora ? { Icon: Globe2, label: `${settings.membersDiaspora} in the diaspora` } : null,
    settings.meetingSchedule ? { Icon: MapPin, label: `Meets ${settings.meetingSchedule}` } : null
  ].filter(Boolean) as { Icon: typeof Users; label: string }[];

  return (
    <SitePage>
      {/* Hero: aspect never narrower than the 3:2 photo, so any crop is vertical only. */}
      <View className="w-full aspect-[3/2] sm:aspect-[16/9] lg:aspect-[2/1] max-h-[640px] bg-rotary-cream">
        <Image
          source={require('../assets/hero-connect.webp')}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel="Rotary Club of Freetown-Sunset members with children and residents at the handover of the Kerefay Loko MCHP community well"
        />
      </View>

      <Section tight>
        <View className="items-center gap-7 sm:gap-8 w-full max-w-3xl mx-auto py-2 sm:py-4">
          <Text accessibilityRole="header" className="text-center">
            <Text className="rcfs-line rcfs-welcome font-display text-lg leading-7 sm:text-2xl sm:leading-9 font-medium text-slate-500">
              Welcome to the
            </Text>{' '}
            <Text className="rcfs-line rcfs-title font-display mt-1 text-[34px] leading-[40px] sm:text-5xl sm:leading-[58px] lg:text-[60px] lg:leading-[68px] font-extrabold text-rotary-royal-deep">
              Rotary Club of Freetown{'\u2011'}Sunset
            </Text>
          </Text>

          <View className="flex-row items-center justify-center gap-3 sm:gap-4">
            <View className="rcfs-rule-l w-6 sm:w-12 h-[3px] rounded-full bg-rotary-gold" />
            <Text className="rcfs-theme shrink text-sm sm:text-lg font-bold italic uppercase tracking-[0.12em] sm:tracking-[0.2em] text-rotary-royal text-center">
              Create Lasting Impact
            </Text>
            <View className="rcfs-rule-r w-6 sm:w-12 h-[3px] rounded-full bg-rotary-gold" />
          </View>

          <View className="rcfs-ctas w-full sm:w-auto flex-col sm:flex-row gap-3 pt-1">
            <CTAButton label="Our Projects" onPress={() => goTab('ProjectsTab', 'Gallery')} />
            <CTAButton label="Get in Touch" variant="secondary" onPress={() => goTab('MoreTab', 'Contact')} />
          </View>
        </View>
      </Section>

      {/* WHO WE ARE */}
      <Section tone="cream">
        <View className="gap-8 lg:flex-row lg:gap-16">
          <View className="lg:w-[42%]">
            <SectionHeading eyebrow="Who we are" title="Neighbours, professionals and friends, united in service" />
          </View>
          <View className="flex-1 gap-6">
            {settings.homeHeroSubtitle ? (
              <Text className="text-lg leading-8 text-slate-700">{settings.homeHeroSubtitle}</Text>
            ) : (
              <PlaceholderNote label="Who we are introduction" />
            )}
            {facts.length > 0 ? (
              <View className="flex-row flex-wrap gap-x-6 gap-y-3">
                {facts.map(({ Icon, label }) => (
                  <View key={label} className="flex-row items-center gap-2 shrink max-w-full">
                    <Icon size={18} color={colors.rotaryRoyal} />
                    <Text className="text-[15px] font-semibold text-rotary-royal-deep">{label}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <TextLink label="Read our story" onPress={() => navigation.navigate('About')} />
          </View>
        </View>
      </Section>

      {/* WHAT ROTARY IS */}
      <Section>
        <View className="gap-10">
          <SectionHeading
            eyebrow="What is Rotary?"
            title="A global network that takes action"
            intro={settings.aboutRotaryIntro || undefined}
          />
          <View className="gap-5 lg:flex-row">
            <View className="lg:flex-1 bg-rotary-cream rounded-3xl p-6 sm:p-8 gap-5">
              <Text className="font-display text-xl font-bold text-rotary-royal-deep">The Objects of Rotary</Text>
              {OBJECTS_SHORT.map((obj, i) => (
                <View key={obj} className="flex-row items-start gap-4">
                  <Text className="font-display text-2xl font-extrabold text-rotary-gold w-6">{i + 1}</Text>
                  <Text className="flex-1 text-base leading-7 text-slate-700">{obj}</Text>
                </View>
              ))}
            </View>
            <View className="lg:flex-1 bg-rotary-royal rounded-3xl p-6 sm:p-8 gap-5">
              <View className="gap-1">
                <Text className="font-display text-xl font-bold text-white">The Four-Way Test</Text>
                <Text className="text-sm text-white/75">Of the things we think, say or do:</Text>
              </View>
              {FOUR_WAY_TEST.map((t) => (
                <View key={t.num} className="flex-row items-start gap-4">
                  <Text className="font-display text-2xl font-extrabold text-rotary-gold w-6">{t.num}</Text>
                  <Text className="flex-1 text-base leading-7 font-semibold text-white">{t.q}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="gap-5">
            <Text className="font-display text-xl font-bold text-rotary-royal-deep">Our key areas of focus</Text>
            <View className="flex-row flex-wrap -mx-2">
              {ROTARY_FOCUS_AREAS.map((area, i) => (
                <View key={area.title} className="w-1/2 md:w-1/3 lg:w-1/4 p-2">
                  <IconTile icon={FOCUS_ICONS[i]} label={area.title} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </Section>

      {/* WHAT WE DO */}
      <Section tone="cream">
        <View className="gap-10">
          <SectionHeading eyebrow="What we do" title="Service you can see in our community" />

          {featured ? (
            <View className="bg-white rounded-3xl overflow-hidden border border-slate-200 lg:flex-row lg:items-center">
              <View className="w-full lg:w-[54%] aspect-[3/2] bg-slate-100">
                <SafeImage src={featured.imageUrl} alt={featured.title} fit="cover" eager />
              </View>
              <View className="flex-1 p-6 sm:p-8 gap-4 justify-center">
                <View className="flex-row flex-wrap items-center gap-3">
                  <Eyebrow label="Flagship project" />
                  <StatusChip project={featured} />
                </View>
                <Text className="font-display text-2xl leading-8 sm:text-3xl sm:leading-10 font-extrabold text-rotary-royal-deep">
                  {featured.title}
                </Text>
                <Text className="text-base leading-7 text-slate-600" numberOfLines={3}>
                  {featured.description}
                </Text>
                {featured.impact ? (
                  <View className="border-l-4 border-rotary-gold pl-4 gap-1">
                    <Text className="text-xs font-bold uppercase tracking-wider text-rotary-royal">Who benefited · Impact</Text>
                    <Text className="text-base leading-7 font-medium text-rotary-royal-deep">{featured.impact}</Text>
                  </View>
                ) : null}
                {featured.partners && featured.partners.length > 0 ? (
                  <Text className="text-sm leading-6 text-slate-500">In partnership with {featured.partners.join(' and ')}</Text>
                ) : null}
                <View className="flex-row">
                  <CTAButton label="Read the full story" onPress={() => openProject(featured)} />
                </View>
              </View>
            </View>
          ) : null}

          {selection.length > 0 ? (
            <View className="gap-6">
              <View className="flex-row items-end justify-between gap-4">
                <Text className="font-display text-xl font-bold text-rotary-royal-deep">Ongoing and completed projects</Text>
              </View>
              <View className="flex-row flex-wrap -mx-3">
                {selection.map((project) => (
                  <View key={project.id} className="w-full sm:w-1/2 lg:w-1/3 p-3">
                    <ProjectCard project={project} compact onPress={() => openProject(project)} />
                  </View>
                ))}
              </View>
              <View className="flex-row">
                <CTAButton label="View all projects" variant="secondary" onPress={() => goTab('ProjectsTab', 'Gallery')} />
              </View>
            </View>
          ) : null}
        </View>
      </Section>

      {/* OUR IMPACT */}
      {impact.length > 0 ? (
        <Section tone="royal">
          <View className="gap-10">
            <SectionHeading eyebrow="Our impact" title="The difference we make" onDark />
            <View className="flex-row flex-wrap -mx-3">
              {impact.map((item) => (
                <View key={`${item.figure}-${item.label}`} className="w-full sm:w-1/2 lg:w-1/4 p-3">
                  <View className="border-t-2 border-rotary-gold pt-4 gap-2">
                    <Text className="font-display text-5xl font-extrabold text-white">{item.figure}</Text>
                    <Text className="text-[15px] leading-6 text-white/85">{item.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Section>
      ) : null}

      {/* SOCIAL */}
      <Section>
        <View className="gap-10">
          <SectionHeading
            eyebrow="Stay connected"
            title="Follow our journey"
            intro="Meetings, handovers and moments of fellowship, as they happen."
          />
          <SocialSection settings={settings} />
        </View>
      </Section>

      {/* HOW TO CONNECT */}
      <Section tone="cream">
        <View className="items-center gap-6">
          <SectionHeading
            center
            eyebrow="Connect with us"
            title="Join us in creating lasting impact"
            intro={
              settings.meetingSchedule
                ? `Visitors are always welcome. We meet ${settings.meetingSchedule}${settings.meetingLocation ? ` at ${settings.meetingLocation}` : ''}.`
                : 'Volunteer, partner on a project, or simply come and meet us.'
            }
          />
          <View className="flex-col sm:flex-row gap-3">
            <CTAButton label="Get in Touch" onPress={() => goTab('MoreTab', 'Contact')} />
            <CTAButton label="Meet our members" variant="secondary" onPress={() => goTab('MembersTab', 'MembersDirectory')} />
          </View>
        </View>
      </Section>
    </SitePage>
  );
}

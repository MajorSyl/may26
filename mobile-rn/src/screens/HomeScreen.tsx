import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Heart,
  Droplets,
  Baby,
  BookOpen,
  TrendingUp,
  Sprout,
  Facebook,
  Instagram,
  Users
} from 'lucide-react-native';
import { HomeStackParamList } from '../navigation/types';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, getProjects } from '../lib/service';
import { Project } from '../types';
import { ROTARY_FOCUS_AREAS, FOUR_WAY_TEST } from '../data';
import ProjectCard from '../components/ProjectCard';
import SafeImage from '../components/SafeImage';
import { ScreenScroll, Badge } from '../components/ui';
import SiteFooter from '../navigation/SiteFooter';
import { logPageView } from '../lib/analytics';
import SocialFeedSection from '../components/SocialFeedSection';
import FacebookFeed from '../components/FacebookFeed';
import { colors } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const FOCUS_ICONS = [ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout];

const FLAGSHIP_PROJECT_ID = 'safe-water-rural-health-facilities-bombali';

// Short labels for the four Objects; the official wording is on About.
const OBJECTS_SHORT = [
  'Acquaintance as an opportunity for service',
  'High ethical standards in business and professions',
  'Service in personal, business and community life',
  'International understanding, goodwill and peace'
];

// Figures taken from the club's own project records (projects table).
const IMPACT = [
  { figure: '100+', text: 'boreholes delivered across Sierra Leone with the Rotary Club of Fishers, Indiana' },
  { figure: '6', text: 'rural health posts in Bombali District getting safe water -- the first 2 handed over in July 2026' },
  { figure: '1,000+', text: 'teenage mothers a year supported through the Aberdeen Women’s Centre' },
  { figure: '400', text: 'pupils served a holiday meal at Russell Primary School, December 2025' }
];

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

  const goToTab = (tab: 'ProjectsTab' | 'EventsTab' | 'MembersTab' | 'MoreTab', screen?: string, params?: object) => {
    const parent = navigation.getParent();
    if (!parent) return;
    if (screen) {
      (parent.navigate as any)(tab, { screen, params });
    } else {
      (parent.navigate as any)(tab);
    }
  };

  const flagship = projects.find((p) => p.id === FLAGSHIP_PROJECT_ID) || projects[0];
  const rest = projects.filter((p) => p.id !== flagship?.id);
  const ongoing = rest.filter((p) => p.status !== 'Completed');
  const completed = rest.filter((p) => p.status === 'Completed');
  const selection = [...ongoing.slice(0, 1), ...completed.slice(0, 2)];
  const otherProjects = (selection.length >= 3 ? selection : rest).slice(0, 3);

  // Container aspect ratio stays at or above the source photo's native 3:2
  // (1080x720) at every breakpoint, widening only slightly on larger
  // screens -- that keeps "cover" cropping strictly vertical (top/bottom),
  // never horizontal, so the full width of the crowd is always in frame.
  const hero = (
    <View className="w-full aspect-[3/2] sm:aspect-[16/9] lg:aspect-[2/1] bg-rotary-dark">
      <Image
        source={require('../assets/hero-connect.jpg')}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
        accessibilityLabel="A Rotary Club of Freetown Sunset sign for the Kerefay Loko MCHP Community Well project, surrounded by club members and applauding local children and residents at the dedication ceremony"
      />
    </View>
  );

  return (
    <ScreenScroll edgeToEdge={hero}>
      {/* WHO WE ARE */}
      <View className="gap-3.5 items-center w-full sm:max-w-xl lg:max-w-2xl mx-auto">
        <Text className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-rotary-dark text-center leading-tight">
          Rotary Club of Freetown{'\u2011'}Sunset
        </Text>
        <Text className="text-xl sm:text-2xl font-extrabold italic text-rotary-gold text-center tracking-wide uppercase">
          Create Lasting Impact
        </Text>
        <Text className="text-sm sm:text-base text-slate-600 text-center leading-relaxed">
          A diverse fellowship of Sierra Leonean and international professionals, united by Rotary's "Service Above Self"
          and devoted to practical, lasting impact in our Freetown community.
        </Text>
        <View className="flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center pt-1.5">
          <Pressable
            onPress={() => navigation.navigate('About')}
            className="flex-row items-center justify-center gap-2 bg-rotary-azure px-5 py-3 rounded-xl w-full sm:w-auto hover:bg-rotary-azure-dark active:opacity-90"
          >
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Our Story</Text>
            <ArrowRight size={14} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={() => goToTab('MoreTab', 'Contact')}
            className="flex-row items-center justify-center bg-white border border-slate-300 px-5 py-3 rounded-xl w-full sm:w-auto hover:bg-slate-50 active:opacity-90"
          >
            <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">Get In Touch</Text>
          </Pressable>
        </View>
      </View>

      {/* WHAT ROTARY IS ABOUT */}
      <View className="gap-5">
        <View className="gap-3">
          <Badge label="What Is Rotary?" />
          <Text className="text-2xl sm:text-3xl font-extrabold text-rotary-dark leading-snug">
            A Global Network, United in Service
          </Text>
          <Text className="text-sm text-slate-500 leading-relaxed sm:max-w-2xl">
            Rotary brings together neighbors, friends, and problem-solvers across the world who see a need and take
            action -- building lasting change in their communities and beyond.
          </Text>
        </View>

        <View className="gap-4 lg:flex-row">
          <View className="bg-white border border-slate-200 rounded-3xl p-5 gap-3 lg:flex-1">
            <Text className="text-sm font-extrabold text-rotary-dark uppercase tracking-wide">The Objects of Rotary</Text>
            {OBJECTS_SHORT.map((obj, i) => (
              <View key={obj} className="flex-row items-start gap-3">
                <View className="w-6 h-6 rounded-full bg-rotary-azure items-center justify-center">
                  <Text className="text-white text-[11px] font-extrabold">{i + 1}</Text>
                </View>
                <Text className="text-xs text-slate-600 leading-relaxed flex-1 pt-1">{obj}</Text>
              </View>
            ))}
          </View>
          <View className="bg-rotary-dark rounded-3xl p-5 gap-3 lg:flex-1">
            <Text className="text-sm font-extrabold text-white uppercase tracking-wide">The Four-Way Test</Text>
            <Text className="text-[11px] text-slate-300">Of the things we think, say or do:</Text>
            {FOUR_WAY_TEST.map((t) => (
              <View key={t.num} className="flex-row items-start gap-3">
                <View className="w-6 h-6 rounded-lg bg-white/10 items-center justify-center">
                  <Text className="text-rotary-gold text-[11px] font-extrabold">{t.num}</Text>
                </View>
                <Text className="text-xs font-bold text-white leading-relaxed flex-1 pt-1">{t.q}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-extrabold text-rotary-dark uppercase tracking-wide">Our Key Areas of Focus</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {ROTARY_FOCUS_AREAS.map((area, i) => {
              const Icon = FOCUS_ICONS[i];
              return (
                <View key={area.title} className="flex-row items-center gap-2 bg-white border border-slate-200 rounded-full pl-2 pr-3.5 py-2">
                  <View className="w-6 h-6 rounded-full bg-rotary-azure/10 items-center justify-center">
                    <Icon size={13} color={colors.rotaryAzure} />
                  </View>
                  <Text className="text-[11px] font-bold text-slate-700">{area.title}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate('About')} className="flex-row items-center gap-2">
          <Text className="text-rotary-azure font-bold text-sm">More About Rotary and Our Club</Text>
          <ArrowRight size={16} color={colors.rotaryAzure} />
        </Pressable>
      </View>

      {/* WHAT WE DO */}
      <View className="gap-5">
        <View>
          <Badge label="Our Projects" tone="gold" />
          <Text className="text-2xl sm:text-3xl font-extrabold text-rotary-dark mt-2">What We Do</Text>
        </View>

        {flagship && (
          <Pressable
            onPress={() => goToTab('ProjectsTab', 'ProjectDetails', { project: flagship })}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 lg:flex-row"
          >
            <View className="w-full lg:w-1/2 aspect-[16/10] lg:aspect-auto lg:min-h-[340px] bg-slate-100">
              {flagship.imageUrl ? (
                <SafeImage src={flagship.imageUrl} alt={flagship.title} />
              ) : (
                <View className="w-full h-full items-center justify-center bg-rotary-dark" />
              )}
            </View>
            <View className="p-6 gap-3 lg:w-1/2 lg:justify-center">
              <Badge label="Flagship Project" tone="gold" />
              <Text className="text-xl sm:text-2xl font-extrabold text-rotary-dark leading-snug">{flagship.title}</Text>
              <Text className="text-sm text-slate-500 leading-relaxed" numberOfLines={4}>
                {flagship.description}
              </Text>
              {flagship.impact ? (
                <View className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mt-1 gap-0.5">
                  <Text className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Impact</Text>
                  <Text className="text-xs font-bold text-emerald-900">{flagship.impact}</Text>
                </View>
              ) : null}
              {flagship.partners && flagship.partners.length > 0 ? (
                <Text className="text-xs text-slate-500">
                  <Text className="font-bold text-slate-600">In partnership with </Text>
                  {flagship.partners.join(' and ')}
                </Text>
              ) : null}
              <View className="flex-row items-center gap-1.5 pt-1">
                <Text className="text-[11px] font-bold uppercase tracking-wide text-rotary-azure">Read The Full Story</Text>
                <ArrowRight size={13} color={colors.rotaryAzure} />
              </View>
            </View>
          </Pressable>
        )}

        {otherProjects.length > 0 && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-slate-700">Ongoing &amp; Completed Projects</Text>
              <Pressable
                onPress={() => goToTab('ProjectsTab')}
                className="flex-row items-center gap-1.5 border border-slate-300 bg-white rounded-xl px-3 py-2 hover:bg-slate-50"
              >
                <Text className="text-[10px] font-bold uppercase text-slate-700">All Projects</Text>
                <ExternalLink size={12} color={colors.slate600} />
              </Pressable>
            </View>
            <View className="gap-4 sm:flex-row sm:flex-wrap">
              {otherProjects.map((project) => (
                <View key={project.id} className="sm:w-[48%] lg:w-[31.5%]">
                  <ProjectCard project={project} onPress={() => goToTab('ProjectsTab', 'ProjectDetails', { project })} />
                </View>
              ))}
            </View>
          </View>
        )}

        {projects.length === 0 && (
          <View className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-200">
            <Text className="text-slate-400 text-sm text-center">
              Our project portfolio is being updated. Contact a club officer to learn about our current initiatives.
            </Text>
          </View>
        )}
      </View>

      {/* OUR IMPACT */}
      <View className="bg-rotary-azure rounded-3xl p-7 sm:p-10 gap-6">
        <View className="gap-2">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-white/70">Our Impact</Text>
          <Text className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">The Difference We Make</Text>
        </View>
        <View className="gap-6 sm:flex-row sm:flex-wrap">
          {IMPACT.map((item) => (
            <View key={item.figure + item.text} className="gap-1 sm:w-[46%] lg:w-[22%]">
              <Text className="text-4xl font-extrabold text-white">{item.figure}</Text>
              <Text className="text-xs text-white/85 leading-relaxed">{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* OUR MEMBERS */}
      <Pressable
        onPress={() => goToTab('MembersTab')}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md"
      >
        <View className="w-14 h-14 rounded-2xl bg-rotary-gold/15 items-center justify-center">
          <Users size={24} color={colors.rotaryGold} />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-xl font-extrabold text-rotary-dark">60 Vibrant Members</Text>
          <Text className="text-sm text-slate-500 leading-relaxed">
            Business leaders and professionals united in service, including 12 members in the diaspora.
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-rotary-azure">Meet Our Members</Text>
          <ArrowRight size={13} color={colors.rotaryAzure} />
        </View>
      </Pressable>

      {/* SOCIAL MEDIA */}
      <View className="gap-5">
        <View className="items-center gap-2">
          <Badge label="Stay Connected" />
          <Text className="text-2xl font-extrabold text-rotary-dark text-center">Follow Our Journey</Text>
          <Text className="text-sm text-slate-500 text-center">See our latest projects and meetings as they happen.</Text>
        </View>
        <View className="flex-col sm:flex-row gap-3 justify-center">
          <Pressable
            onPress={() => Linking.openURL(settings.socialFacebookUrl)}
            accessibilityRole="link"
            className="flex-row items-center justify-center gap-2 bg-[#1877F2] px-5 py-3 rounded-xl hover:opacity-90"
          >
            <Facebook size={16} color={colors.white} />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Facebook</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(settings.socialInstagramUrl)}
            accessibilityRole="link"
            className="flex-row items-center justify-center gap-2 bg-[#DD2A7B] px-5 py-3 rounded-xl hover:opacity-90"
          >
            <Instagram size={16} color={colors.white} />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Instagram</Text>
          </Pressable>
        </View>
        <FacebookFeed />
        <SocialFeedSection onViewAll={() => goToTab('MoreTab', 'SocialFeed')} />
      </View>

      {/* HOW TO CONNECT WITH US */}
      <View className="bg-rotary-dark rounded-3xl p-7 sm:p-10 gap-4 items-center">
        <Badge label="Join the Fellowship" tone="gold" />
        <Text className="text-xl sm:text-2xl font-extrabold text-white text-center leading-snug">
          We Meet Every Thursday at 6:30 PM, Lagoonda Hotel
        </Text>
        <Text className="text-sm text-slate-300 text-center leading-relaxed sm:max-w-lg">
          Whether you want to volunteer, partner on a project, or simply learn more about Rotary, we'd love to hear from
          you.
        </Text>
        <View className="flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1">
          <Pressable
            onPress={() => goToTab('MoreTab', 'Contact')}
            className="flex-row items-center justify-center gap-2 bg-rotary-azure px-5 py-3 rounded-xl w-full sm:w-auto hover:bg-rotary-azure-dark active:opacity-90"
          >
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Contact Us</Text>
            <ArrowRight size={14} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={() => goToTab('EventsTab')}
            className="flex-row items-center justify-center bg-white/10 border border-white/30 px-5 py-3 rounded-xl w-full sm:w-auto hover:bg-white/20 active:opacity-90"
          >
            <Text className="text-white text-xs font-bold uppercase tracking-wider">View Meeting Calendar</Text>
          </Pressable>
        </View>
      </View>

      <SiteFooter />
    </ScreenScroll>
  );
}

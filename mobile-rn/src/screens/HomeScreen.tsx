import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
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
  Sprout
} from 'lucide-react-native';
import { HomeStackParamList } from '../navigation/types';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { getProjects } from '../lib/service';
import { Project } from '../types';
import { ROTARY_FOCUS_AREAS } from '../data';
import ProjectCard from '../components/ProjectCard';
import SafeImage from '../components/SafeImage';
import MemberSpotlight from '../components/MemberSpotlight';
import { ScreenScroll, Badge } from '../components/ui';
import SiteFooter from '../navigation/SiteFooter';
import { logPageView } from '../lib/analytics';
import SocialFeedSection from '../components/SocialFeedSection';
import FacebookFeed from '../components/FacebookFeed';
import { colors } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const FOCUS_ICONS = [ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout];

// The homepage as the club's Sept 2026 revamp brief asks for it: an
// editorial story, not a pile of information. One fixed scroll order --
// Who we are -> What Rotary is about -> What we do -> our impact -> how
// to connect -- rather than a grab-bag of sections competing for
// attention. "Our impact" is deliberately folded into the flagship
// project panel's own numbers rather than a separate stats dashboard
// (that was removed earlier this project specifically because a wall of
// tiles read as more "functional dashboard" than "story").
const FLAGSHIP_PROJECT_ID = 'safe-water-rural-health-facilities-bombali';

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

  const goToTab = (tab: 'ProjectsTab' | 'EventsTab' | 'MoreTab', screen?: string, params?: object) => {
    const parent = navigation.getParent();
    if (!parent) return;
    if (screen) {
      (parent.navigate as any)(tab, { screen, params });
    } else {
      (parent.navigate as any)(tab);
    }
  };

  const flagship = projects.find((p) => p.id === FLAGSHIP_PROJECT_ID) || projects[0];
  const otherProjects = projects.filter((p) => p.id !== flagship?.id).slice(0, 3);

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
        <Badge label="Create Lasting Impact" tone="gold" />
        <Text className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-rotary-dark text-center leading-tight">
          Rotary Club of Freetown-Sunset
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
      <View className="gap-4">
        <Badge label="What Is Rotary?" />
        <Text className="text-2xl sm:text-3xl font-extrabold text-rotary-dark leading-snug">
          A Global Network, United in Service
        </Text>
        <Text className="text-sm text-slate-500 leading-relaxed sm:max-w-2xl">
          Rotary brings together neighbors, friends, and problem-solvers across the world who see a need and take action.
          Every Rotarian lives by the Four-Way Test and channels service into seven key areas of focus -- from clean water
          and health to education and peace.
        </Text>

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

        <Pressable onPress={() => navigation.navigate('About')} className="flex-row items-center gap-2">
          <Text className="text-rotary-azure font-bold text-sm">Read Our Full Story, Objects & The Four-Way Test</Text>
          <ArrowRight size={16} color={colors.rotaryAzure} />
        </Pressable>
      </View>

      <FacebookFeed />

      {/* WHAT WE DO -- flagship project + the rest */}
      <View className="gap-5">
        <View>
          <Badge label="Pioneering Action" tone="gold" />
          <Text className="text-2xl sm:text-3xl font-extrabold text-rotary-dark mt-2">What We Do</Text>
        </View>

        {flagship && (
          <Pressable
            onPress={() => goToTab('ProjectsTab', 'ProjectDetails', { project: flagship })}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 lg:flex-row"
          >
            <View className="w-full lg:w-1/2 aspect-[16/10] lg:aspect-auto bg-slate-100">
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
                <View className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mt-1">
                  <Text className="text-xs font-bold text-emerald-700">{flagship.impact}</Text>
                </View>
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
              <Text className="text-base font-extrabold text-slate-700">More of Our Work</Text>
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

      <MemberSpotlight />

      <SocialFeedSection onViewAll={() => goToTab('MoreTab', 'SocialFeed')} />

      {/* HOW TO CONNECT WITH US -- closing CTA */}
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

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRight, CheckCircle, Users, ExternalLink, Compass } from 'lucide-react-native';
import { HomeStackParamList } from '../navigation/types';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { getProjects } from '../lib/service';
import { Project } from '../types';
import SafeImage from '../components/SafeImage';
import MemberSpotlight from '../components/MemberSpotlight';
import { ScreenScroll, Badge, Card } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { ContentBlock, getContentBlocks } from '../lib/cms';
import SocialFeedSection from '../components/SocialFeedSection';
import DownloadAppSection from '../components/DownloadAppSection';
import { colors } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

// Ported from the web app's Home.tsx, simplified from its admin-editable
// block-reordering CMS system (tied to AdminDashboard's Design tab, out of
// scope for this rebuild) into a fixed section order: hero, mission,
// recent projects, member spotlight, announcements. Content strings still
// come from the same getSiteSettings() the web app's CMS edits, so an
// admin's copy edits still show up here.
export default function HomeScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    let active = true;
    logPageView('home');
    getSiteSettings().then((s) => active && setSettings(s));
    getProjects().then((p) => active && setProjects(p));
    getContentBlocks('home').then((b) => active && setBlocks(b));
    return () => {
      active = false;
    };
  }, []);

  const goToTab = (tab: 'ProjectsTab' | 'EventsTab' | 'MoreTab', screen?: string) => {
    const parent = navigation.getParent();
    if (!parent) return;
    if (screen) {
      (parent.navigate as any)(tab, { screen });
    } else {
      (parent.navigate as any)(tab);
    }
  };

  const completedProjects = projects.filter((p) => p.status === 'Completed').slice(0, 3);

  const hero = (
    <View className="w-full bg-rotary-dark items-center justify-center">
      <Image
        source={require('../assets/hero-connect.jpg')}
        resizeMode="contain"
        style={{ width: '100%', height: 260 }}
        accessibilityLabel="Rotary Club of Freetown Sunset - Kerefay Loko MCHP Community Well dedication"
      />
    </View>
  );

  return (
    <ScreenScroll edgeToEdge={hero}>
      {/* Hero copy */}
      <View className="gap-4 items-center">
        <Badge label="Welcome to Freetown Sunset" />
        <Text className="text-3xl font-extrabold text-rotary-dark text-center leading-tight">
          Fellowship, Integrity, and Direct Local Service
        </Text>
        <Text className="text-sm text-slate-600 text-center leading-relaxed">
          Founded on Freetown's beautiful shores, the Rotary Club of Freetown Sunset (RCFS) gathers a diverse cohort of
          passionate Sierra Leonean and international professionals. Sharing a deep devotion to community enrichment, we
          combine energetic fellowship with rigorous, hands-on humanitarian initiatives in local neighborhoods.
        </Text>
        <View className="flex-row flex-wrap gap-3 justify-center pt-1">
          <Pressable onPress={() => navigation.navigate('About')} className="flex-row items-center gap-2 bg-rotary-azure px-4 py-2.5 rounded-xl">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Read Our Core Values</Text>
            <ArrowRight size={14} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => goToTab('MoreTab', 'Contact')} className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl">
            <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">Contact Our Officers</Text>
          </Pressable>
        </View>
      </View>

      {/* Mission */}
      <View className="gap-4">
        <Badge label="The Sunset Mission" />
        <Text className="text-2xl font-extrabold text-rotary-dark leading-snug">{settings.homeHeroTitle}</Text>
        <Text className="text-sm text-slate-500 leading-relaxed">{settings.homeHeroSubtitle}</Text>
        <Pressable onPress={() => navigation.navigate('About')} className="flex-row items-center gap-2">
          <Text className="text-rotary-azure font-bold text-sm">Explore Our Story & Ethics</Text>
          <ArrowRight size={16} color={colors.rotaryAzure} />
        </Pressable>

        <View className="gap-3 mt-2">
          <View className="bg-white p-5 rounded-3xl border border-slate-200 flex-row items-start gap-4">
            <View className="p-3 bg-indigo-50 rounded-2xl">
              <Compass size={22} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase text-indigo-600">Our Approach</Text>
              <Text className="font-extrabold text-slate-800 mt-1">Service Above Self</Text>
              <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                We work to identify real community needs and respond with practical, locally-supported solutions.
              </Text>
            </View>
          </View>
          <View className="bg-white p-5 rounded-3xl border border-slate-200 flex-row items-start gap-4">
            <View className="p-3 bg-emerald-50 rounded-2xl">
              <CheckCircle size={22} color={colors.emerald600} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase text-emerald-600">The 4-Way Test</Text>
              <Text className="font-extrabold text-slate-800 mt-1">Ethical Guardrails</Text>
              <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                We follow Rotary's ethical Four-Way Test in all of our decisions and activities.
              </Text>
            </View>
          </View>
          <View className="bg-white p-5 rounded-3xl border border-slate-200 flex-row items-start gap-4">
            <View className="p-3 bg-amber-50 rounded-2xl">
              <Users size={22} color={colors.amber500} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase text-amber-600">Our Values</Text>
              <Text className="font-extrabold text-slate-800 mt-1">Community Cooperation</Text>
              <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                We aim to work alongside local leaders and community members on the projects we undertake.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent projects */}
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="gap-1 flex-1 pr-2">
            <Badge label="Pioneering Action" tone="gold" />
            <Text className="text-xl font-extrabold text-rotary-dark">Recent Completed Projects</Text>
          </View>
          <Pressable onPress={() => goToTab('ProjectsTab')} className="flex-row items-center gap-1.5 border border-slate-300 bg-white rounded-xl px-3 py-2">
            <Text className="text-[10px] font-bold uppercase text-slate-700">All</Text>
            <ExternalLink size={12} color={colors.slate600} />
          </Pressable>
        </View>

        {completedProjects.length === 0 ? (
          <View className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-200">
            <Text className="text-slate-400 text-sm text-center">
              Our project portfolio is being updated. Contact a club officer to learn about our current initiatives.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {completedProjects.map((project) => (
              <View key={project.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                {project.imageUrl && (
                  <View className="w-full h-40">
                    <SafeImage src={project.imageUrl} alt={project.title} />
                  </View>
                )}
                <View className="p-5 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[10px] font-bold uppercase text-rotary-azure">{project.category}</Text>
                    <View className="bg-emerald-500 px-2.5 py-0.5 rounded-full">
                      <Text className="text-[9px] font-extrabold uppercase text-white">Completed • {project.year}</Text>
                    </View>
                  </View>
                  <Text className="font-extrabold text-slate-800 leading-snug">{project.title}</Text>
                  <Text className="text-xs text-slate-500 leading-relaxed" numberOfLines={4}>
                    {project.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <MemberSpotlight />

      <SocialFeedSection onViewAll={() => goToTab('MoreTab', 'SocialFeed')} />

      <DownloadAppSection />

      {/* Announcements */}
      <View className="gap-4">
        <Text className="text-xl font-extrabold text-rotary-dark text-center">Latest News from Sunset</Text>
        <View className="gap-4">
          <View className="bg-white p-5 rounded-3xl border border-slate-200 gap-2">
            <Badge label="Weekly Meetings" tone="gold" />
            <Text className="font-bold text-slate-800">Join Us at Our Next Meeting</Text>
            <Text className="text-xs text-slate-500 leading-relaxed">
              We gather every Thursday at the Lagoonda Hotel. Check our events calendar for the latest meeting details and
              guest speakers.
            </Text>
            <Pressable onPress={() => goToTab('EventsTab')} className="flex-row items-center gap-1.5 mt-1">
              <Text className="text-rotary-azure text-xs font-bold">View Meeting Calendar</Text>
              <ArrowRight size={13} color={colors.rotaryAzure} />
            </Pressable>
          </View>
          <View className="bg-white p-5 rounded-3xl border border-slate-200 gap-2">
            <Badge label="Our Projects" />
            <Text className="font-bold text-slate-800">Ask Us About Our Current Projects</Text>
            <Text className="text-xs text-slate-500 leading-relaxed">
              We're always working on new service initiatives across Freetown. Visit our gallery or reach out to a club
              officer to learn what we're doing right now.
            </Text>
            <Pressable onPress={() => goToTab('ProjectsTab')} className="flex-row items-center gap-1.5 mt-1">
              <Text className="text-rotary-azure text-xs font-bold">Examine Gallery</Text>
              <ArrowRight size={13} color={colors.rotaryAzure} />
            </Pressable>
          </View>
        </View>
      </View>

      {blocks.length > 0 && (
        <View className="gap-4">
          {blocks.map((b) => (
            <Card key={b.id} className="gap-2">
              {b.imageUrl ? (
                <View className="w-full h-40 rounded-xl overflow-hidden -mt-1 mb-1">
                  <Image source={{ uri: b.imageUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
                </View>
              ) : null}
              {b.title ? <Text className="text-lg font-bold text-slate-800">{b.title}</Text> : null}
              {b.body ? <Text className="text-xs text-slate-500 leading-relaxed">{b.body}</Text> : null}
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

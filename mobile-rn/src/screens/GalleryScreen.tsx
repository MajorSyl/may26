import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Images, ArrowRight } from 'lucide-react-native';
import { ProjectsStackParamList } from '../navigation/types';
import { Project } from '../types';
import { getProjects } from '../lib/service';
import { ScreenScroll, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import ProjectCard from '../components/ProjectCard';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'Gallery'>;

// Grouped into two clear sections instead of a 4-option status filter --
// "a cleaner, more cohesive presentation that allows visitors to see our
// work at a glance" rather than a click-to-filter interaction, per the
// club's revamp brief. Ongoing covers both Active and Planning statuses;
// most clubs don't distinguish the two in casual conversation.
export default function GalleryScreen({ navigation }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logPageView('gallery');
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const ongoing = projects.filter((p) => p.status === 'Active' || p.status === 'Planning');
  const completed = projects.filter((p) => p.status === 'Completed');

  const renderGrid = (list: Project[]) => (
    <View className="gap-4 sm:flex-row sm:flex-wrap">
      {list.map((project) => (
        <View key={project.id} className="sm:w-[48%] lg:w-[31.5%]">
          <ProjectCard project={project} onPress={() => navigation.navigate('ProjectDetails', { project })} />
        </View>
      ))}
    </View>
  );

  return (
    <ScreenScroll>
      <View className="flex-row items-start justify-between gap-3">
        <View className="gap-2 flex-1">
          <Badge label="On-The-Ground Impact" tone="gold" />
          <Text className="text-sm text-slate-500 leading-relaxed">
            A look at our club's community service projects -- ongoing and completed.
          </Text>
        </View>
        <Pressable
          onPress={() => (navigation.getParent() as any)?.navigate('MoreTab', { screen: 'ClubGallery' })}
          className="flex-row items-center gap-1.5 border border-slate-300 bg-white rounded-xl px-3 py-2 hover:bg-slate-50 shrink-0"
        >
          <Images size={13} color={colors.slate600} />
          <Text className="text-[10px] font-bold uppercase text-slate-700">Photo Gallery</Text>
        </Pressable>
      </View>

      {loading ? (
        <LoadingBlock label="Retrieving Club ventures..." />
      ) : projects.length === 0 ? (
        <EmptyBlock label="Our project portfolio is being updated. Contact a club officer to learn about our current initiatives." />
      ) : (
        <>
          {ongoing.length > 0 && (
            <View className="gap-4">
              <Text className="text-xl font-extrabold text-rotary-dark">Ongoing Projects</Text>
              {renderGrid(ongoing)}
            </View>
          )}
          {completed.length > 0 && (
            <View className="gap-4">
              <Text className="text-xl font-extrabold text-rotary-dark">Completed Projects</Text>
              {renderGrid(completed)}
            </View>
          )}
        </>
      )}

      <Pressable
        onPress={() => (navigation.getParent() as any)?.navigate('MoreTab', { screen: 'GetInvolved' })}
        className="bg-rotary-dark rounded-3xl p-6 flex-row items-center justify-between gap-3"
      >
        <View className="flex-1">
          <Text className="text-white font-extrabold text-base">Want to get involved?</Text>
          <Text className="text-slate-300 text-xs mt-1">We welcome partners, donors, and new members.</Text>
        </View>
        <ArrowRight size={18} color={colors.white} />
      </Pressable>
    </ScreenScroll>
  );
}

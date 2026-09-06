import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Filter } from 'lucide-react-native';
import { ProjectsStackParamList } from '../navigation/types';
import { Project } from '../types';
import { getProjects } from '../lib/service';
import { ScreenScroll, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import ProjectCard from '../components/ProjectCard';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'Gallery'>;

const STATUSES = ['All', 'Completed', 'Active', 'Planning'];

export default function GalleryScreen({ navigation }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    logPageView('gallery');
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => statusFilter === 'All' || p.status === statusFilter);

  return (
    <ScreenScroll>
      <View className="gap-2 md:max-w-3xl">
        <Badge label="On-The-Ground Impact" tone="gold" />
        <Text className="text-sm text-slate-500 leading-relaxed">
          A look at our club's community service projects — completed, active, and planned.
        </Text>
      </View>

      <View className="bg-white rounded-3xl border border-slate-200 p-4 gap-3">
        <View className="flex-row items-center gap-2">
          <Filter size={15} color={colors.rotaryAzure} />
          <Text className="font-bold text-sm text-slate-800">Filter Active Projects</Text>
        </View>
        <View className="flex-row gap-2">
          {STATUSES.map((st) => {
            const isSel = statusFilter === st;
            return (
              <Pressable
                key={st}
                onPress={() => setStatusFilter(st)}
                className={`flex-1 py-3 rounded-lg items-center border ${isSel ? 'bg-rotary-dark border-rotary-dark' : 'bg-slate-50 border-slate-200'}`}
              >
                <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{st}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <LoadingBlock label="Retrieving Club ventures..." />
      ) : filtered.length === 0 ? (
        <EmptyBlock
          label={
            projects.length === 0
              ? 'Our project portfolio is being updated. Contact a club officer to learn about our current initiatives.'
              : 'No projects found matching the active filter.'
          }
        />
      ) : (
        <View className="gap-4 sm:flex-row sm:flex-wrap">
          {filtered.map((project) => (
            <View key={project.id} className="sm:w-[48%] lg:w-[31.5%]">
              <ProjectCard project={project} onPress={() => navigation.navigate('ProjectDetails', { project })} />
            </View>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

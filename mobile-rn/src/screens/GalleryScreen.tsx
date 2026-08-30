import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Filter, Clock, ArrowRight } from 'lucide-react-native';
import { ProjectsStackParamList } from '../navigation/types';
import { Project } from '../types';
import { getProjects } from '../lib/service';
import { ScreenScroll, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import SafeImage from '../components/SafeImage';
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
    <ScreenScroll wide>
      <View className="gap-2 md:max-w-3xl">
        <Badge label="On-The-Ground Impact" tone="gold" />
        <Text className="text-3xl font-extrabold text-rotary-dark">Service Gallery</Text>
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
        <View className="gap-4 md:flex-row md:flex-wrap">
          {filtered.map((project) => {
            const isCompleted = project.status === 'Completed';
            const isActive = project.status === 'Active';
            return (
              <Pressable
                key={project.id}
                onPress={() => navigation.navigate('ProjectDetails', { project })}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden md:w-[48%] lg:w-[31%]"
              >
                {project.imageUrl && (
                  <View className="w-full h-40">
                    <SafeImage src={project.imageUrl} alt={project.title} />
                  </View>
                )}
                <View className="p-5 gap-3">
                  <View className="flex-row items-center justify-between">
                    <View className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md flex-1 mr-2">
                      <Text className="text-[9px] font-bold uppercase text-slate-800" numberOfLines={1}>{project.category}</Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-lg ${isCompleted ? 'bg-emerald-600' : isActive ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                      <Text className="text-[9px] font-extrabold uppercase text-white">{project.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={12} color={colors.rotaryGold} />
                    <Text className="text-[10px] font-bold uppercase text-slate-400">{project.year} Program</Text>
                  </View>
                  <Text className="font-extrabold text-slate-800 leading-tight">{project.title}</Text>
                  <Text className="text-xs text-slate-500 leading-relaxed" numberOfLines={4}>{project.description}</Text>
                  {project.impact && (
                    <View className="bg-slate-50 border border-slate-100 rounded-2xl p-3 gap-1">
                      <Text className="text-[9px] font-bold uppercase text-slate-400">Sunset Impact Metric</Text>
                      <Text className="text-[11px] font-bold text-slate-700">{project.impact}</Text>
                    </View>
                  )}
                  <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                    <Text className="text-[11px] font-black text-rotary-azure uppercase tracking-wider">Explore Project Details</Text>
                    <ArrowRight size={16} color={colors.rotaryAzure} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowRight, FolderKanban } from 'lucide-react-native';
import { Project } from '../types';
import SafeImage from './SafeImage';
import { colors } from '../theme';

const STATUS_TONE: Record<string, string> = {
  Completed: 'bg-emerald-600',
  Active: 'bg-indigo-600',
  Planning: 'bg-amber-600'
};

export default function ProjectCard({ project, onPress }: { project: Project; onPress: () => void }) {
  const statusBg = STATUS_TONE[project.status] || 'bg-slate-600';

  return (
    <Pressable
      onPress={onPress}
      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
    >
      <View className="w-full aspect-[16/10] bg-slate-100">
        {project.imageUrl ? (
          <SafeImage src={project.imageUrl} alt={project.title} />
        ) : (
          // Solid brand navy rather than a CSS gradient class -- NativeWind's
          // gradient utilities only render on web, not inside the native
          // Android app, which this same component also renders into.
          <View className="w-full h-full items-center justify-center bg-rotary-dark">
            <View className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center">
              <FolderKanban size={20} color={colors.white} />
            </View>
          </View>
        )}
      </View>

      <View className="p-5 gap-2.5">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            <Text className="text-[9px] font-bold uppercase tracking-wide text-slate-600" numberOfLines={1}>
              {project.category}
            </Text>
          </View>
          <View className={`${statusBg} px-2.5 py-1 rounded-full`}>
            <Text className="text-[9px] font-extrabold uppercase tracking-wide text-white" numberOfLines={1}>
              {project.status} • {project.year}
            </Text>
          </View>
        </View>

        <Text className="text-base font-extrabold text-rotary-dark leading-snug" numberOfLines={2}>
          {project.title}
        </Text>
        <Text className="text-[13px] text-slate-500 leading-relaxed" numberOfLines={2}>
          {project.description}
        </Text>
        {project.impact ? (
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <Text className="text-[11px] font-bold text-emerald-800 leading-snug" numberOfLines={2}>
              {project.impact}
            </Text>
          </View>
        ) : null}
        {project.partners && project.partners.length > 0 ? (
          <Text className="text-[11px] text-slate-500" numberOfLines={1}>
            <Text className="font-bold text-slate-600">With </Text>
            {project.partners.join(', ')}
          </Text>
        ) : null}

        <View className="flex-row items-center gap-1.5 pt-2.5 mt-0.5 border-t border-slate-100">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-rotary-azure">Read More</Text>
          <ArrowRight size={13} color={colors.rotaryAzure} />
        </View>
      </View>
    </Pressable>
  );
}

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowRight, FolderKanban, Sparkles } from 'lucide-react-native';
import { Project } from '../types';
import SafeImage from './SafeImage';
import { colors } from '../theme';

export function statusLabel(project: Project): string {
  return `${project.status === 'Completed' ? 'Completed' : 'Ongoing'} · ${project.year}`;
}

export function StatusChip({ project }: { project: Project }) {
  const done = project.status === 'Completed';
  return (
    <View className={`self-start px-2.5 py-1 rounded-full ${done ? 'bg-emerald-50' : 'bg-rotary-gold-soft'}`}>
      <Text className={`text-[11px] font-bold uppercase tracking-wide ${done ? 'text-emerald-800' : 'text-amber-900'}`}>
        {statusLabel(project)}
      </Text>
    </View>
  );
}

// Photo-led tile. `compact` drops the description for the homepage selection.
export default function ProjectCard({ project, onPress, compact }: { project: Project; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${project.title}. ${statusLabel(project)}. Read the full story.`}
      className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300"
    >
      <View className="w-full aspect-[3/2] bg-slate-100">
        {project.imageUrl ? (
          <SafeImage src={project.imageUrl} alt={project.title} fit="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-rotary-cream gap-2">
            <FolderKanban size={22} color={colors.rotaryRoyal} />
            <Text className="text-[11px] font-semibold text-slate-500">Photo coming soon</Text>
          </View>
        )}
      </View>

      <View className="flex-1 p-5 gap-3">
        <StatusChip project={project} />
        <Text className="font-display text-lg leading-6 font-bold text-rotary-royal-deep" numberOfLines={2}>
          {project.title}
        </Text>
        {!compact ? (
          <Text className="text-sm leading-6 text-slate-600" numberOfLines={2}>
            {project.description}
          </Text>
        ) : null}
        {project.impact ? (
          <View className="flex-row gap-2">
            <Sparkles size={15} color={colors.rotaryRoyal} style={{ marginTop: 3 }} />
            <Text className="flex-1 text-sm leading-6 font-medium text-rotary-royal-deep" numberOfLines={2}>
              {project.impact}
            </Text>
          </View>
        ) : null}
        {project.partners && project.partners.length > 0 ? (
          <Text className="text-xs leading-5 text-slate-500" numberOfLines={1}>
            With {project.partners.join(', ')}
          </Text>
        ) : null}
        <View className="mt-auto pt-2 flex-row items-center gap-1.5">
          <Text className="text-sm font-semibold text-rotary-link">Read the story</Text>
          <ArrowRight size={15} color={colors.rotaryLink} />
        </View>
      </View>
    </Pressable>
  );
}

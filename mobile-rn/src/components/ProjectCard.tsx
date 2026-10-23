import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowRight, FolderKanban, Handshake } from 'lucide-react-native';
import { Project } from '../types';
import SafeImage from './SafeImage';
import { colors } from '../theme';

export function statusLabel(project: Project): string {
  return `${project.status === 'Completed' ? 'Completed' : 'Ongoing'} · ${project.year}`;
}

// "Water & Sanitation / Health (WASH)" -> "Water & Sanitation"
export function shortCategory(category?: string): string {
  return (category || '').split('/')[0].replace(/\(.*?\)/g, '').trim();
}

export function StatusChip({ project }: { project: Project }) {
  const done = project.status === 'Completed';
  return (
    <View className={`self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${done ? 'bg-emerald-50' : 'bg-rotary-gold-soft'}`}>
      <View className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-emerald-600' : 'bg-rotary-gold'}`} />
      <Text className={`text-[11px] font-bold uppercase tracking-wide ${done ? 'text-emerald-800' : 'text-amber-900'}`}>
        {statusLabel(project)}
      </Text>
    </View>
  );
}

// Photo-led tile with a fixed 4:3 image so every card in a row lines up.
// `compact` drops the description for the homepage selection.
export default function ProjectCard({ project, onPress, compact }: { project: Project; onPress: () => void; compact?: boolean }) {
  const category = shortCategory(project.category);
  const partners = project.partners?.filter(Boolean) ?? [];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${project.title}. ${statusLabel(project)}. Read the full story.`}
      className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300"
    >
      <View className="w-full aspect-[4/3] bg-slate-100">
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

        <View className="gap-1">
          <Text className="text-[11px] leading-4 font-semibold uppercase tracking-wider text-rotary-royal" numberOfLines={1}>
            {category || 'Service project'}
          </Text>
          <Text className="font-display text-lg leading-6 font-bold text-rotary-royal-deep min-h-[48px]" numberOfLines={2}>
            {project.title}
          </Text>
        </View>

        {!compact && project.description ? (
          <Text className="text-sm leading-6 text-slate-600 min-h-[72px]" numberOfLines={3}>
            {project.description}
          </Text>
        ) : null}

        {project.impact ? (
          <View className="bg-rotary-cream rounded-xl px-3.5 py-2.5 border-l-[3px] border-rotary-gold">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-rotary-royal">Impact</Text>
            <Text className="mt-0.5 text-sm leading-5 font-medium text-rotary-royal-deep" numberOfLines={3}>
              {project.impact}
            </Text>
          </View>
        ) : null}

        <View className="mt-auto pt-3 border-t border-slate-100 gap-2.5">
          {partners.length > 0 ? (
            <View className="flex-row items-start gap-2">
              <Handshake size={14} color={colors.slate500} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs leading-5 text-slate-500" numberOfLines={2}>
                With {partners.join(', ')}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-semibold text-rotary-link">Read the story</Text>
            <ArrowRight size={15} color={colors.rotaryLink} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

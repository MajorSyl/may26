import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowRight, FolderKanban } from 'lucide-react-native';
import { Project } from '../types';
import SafeImage from './SafeImage';
import { colors } from '../theme';

// Shared card used everywhere a Project renders as a tile -- Home's
// "Recent Completed Projects" and the full Projects list (GalleryScreen).
// One template, one set of rules, so the two never drift apart again:
//
// - Fixed-aspect image area (same ratio at every breakpoint -- only the
//   card's overall width changes, via the parent's responsive flex-wrap
//   layout) with a neutral backdrop so SafeImage's mandatory
//   resizeMode="contain" (AGENTS.md: real photos are never cropped, to
//   keep faces/subjects intact -- deliberately NOT object-fit: cover)
//   never leaves a jarring empty gap; letterboxing reads as intentional
//   matting instead.
// - No photo at all (not "unverified", genuinely absent) gets a distinct
//   brand-gradient placeholder, so every card is the same height whether
//   or not a photo has been uploaded yet.
// - Category + status pills share one row, same pill sizing/type scale.
// - Title and description both line-clamp (numberOfLines), so card
//   height never depends on how much copy an officer wrote.
// - The whole card is one Pressable, with a real web hover lift and a
//   pressed/active scale that works on both touch and mouse.
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
        <Text className="text-[13px] text-slate-500 leading-relaxed" numberOfLines={3}>
          {project.description}
        </Text>

        <View className="flex-row items-center gap-1.5 pt-2.5 mt-0.5 border-t border-slate-100">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-rotary-azure">Read More</Text>
          <ArrowRight size={13} color={colors.rotaryAzure} />
        </View>
      </View>
    </Pressable>
  );
}

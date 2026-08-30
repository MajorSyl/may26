import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Calendar, MapPin, X } from 'lucide-react-native';
import { GalleryPhoto } from '../types';
import { getGalleryPhotos } from '../lib/service';
import { ScreenScroll, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import SafeImage from '../components/SafeImage';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

const CATEGORY_LABELS: Record<GalleryPhoto['category'], string> = {
  meetings: 'Weekly Meetings',
  anniversary: 'Anniversary Celebration',
  outreach: 'Community Outreach',
  rotaract: 'Rotaract Collaboration'
};

const CATEGORIES: { id: 'all' | GalleryPhoto['category']; title: string }[] = [
  { id: 'all', title: 'All Club Moments' },
  { id: 'meetings', title: 'Meetings' },
  { id: 'anniversary', title: 'Anniversaries' },
  { id: 'outreach', title: 'Outreach' },
  { id: 'rotaract', title: 'Rotaract' }
];

export default function ClubGalleryScreen() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | GalleryPhoto['category']>('all');
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    logPageView('club_gallery');
    getGalleryPhotos()
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all' ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <ScreenScroll wide>
      <View className="gap-2 md:max-w-3xl">
        <Badge label="Historical Archives" tone="gold" />
        <Text className="text-3xl font-extrabold text-rotary-dark">Club Archives & Memoirs</Text>
        <Text className="text-sm text-slate-500 leading-relaxed">
          A photo archive of our club meetings, outreach campaigns, and collaborations with Rotaract, drawn from photos our
          members have submitted and a club officer has approved.
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isSel = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-3 rounded-xl border ${isSel ? 'bg-rotary-gold border-rotary-gold' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-[11px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{cat.title}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <LoadingBlock label="Loading gallery..." />
      ) : filtered.length === 0 ? (
        <EmptyBlock label={photos.length === 0 ? 'No photos have been added to the gallery yet.' : 'No photos found in this category.'} />
      ) : (
        <View className="gap-4 md:flex-row md:flex-wrap">
          {filtered.map((photo) => (
            <Pressable
              key={photo.id}
              onPress={() => setSelected(photo)}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden md:w-[31%]"
            >
              <View className="w-full h-40">
                <SafeImage src={photo.imageUrl} alt={photo.title} />
              </View>
              <View className="p-5 gap-2">
                <Badge label={CATEGORY_LABELS[photo.category]} />
                <Text className="font-extrabold text-slate-800 leading-tight">{photo.title}</Text>
                {photo.description ? (
                  <Text className="text-xs text-slate-500 leading-relaxed" numberOfLines={3}>{photo.description}</Text>
                ) : null}
                {(photo.takenDate || photo.location) && (
                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
                    <View className="flex-row items-center gap-1">
                      <Calendar size={12} color={colors.rotaryGold} />
                      <Text className="text-[9px] font-bold uppercase text-slate-400">{photo.takenDate || ''}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color={colors.rotaryAzure} />
                      <Text className="text-[9px] font-bold uppercase text-slate-400">{photo.location || ''}</Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View className="flex-1 bg-slate-950/80 items-center justify-center p-4">
          <View className="bg-white rounded-3xl overflow-hidden w-full max-w-md">
            <Pressable onPress={() => setSelected(null)} className="absolute top-3 right-3 z-10 bg-slate-900/50 rounded-full p-2">
              <X size={18} color={colors.white} />
            </Pressable>
            {selected && (
              <>
                <View className="w-full h-56">
                  <SafeImage src={selected.imageUrl} alt={selected.title} />
                </View>
                <View className="p-6 gap-3">
                  <Badge label={CATEGORY_LABELS[selected.category]} />
                  <Text className="text-lg font-black text-slate-900 leading-tight">{selected.title}</Text>
                  {selected.description ? <Text className="text-xs text-slate-600 leading-relaxed">{selected.description}</Text> : null}
                  {selected.location ? (
                    <View className="flex-row items-center gap-2 pt-3 border-t border-slate-100">
                      <MapPin size={14} color={colors.rotaryGold} />
                      <Text className="text-[10px] font-bold uppercase text-slate-500">{selected.location}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenScroll>
  );
}

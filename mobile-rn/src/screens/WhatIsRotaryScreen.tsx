import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout, Award, BookMarked } from 'lucide-react-native';
import { ROTARY_FOCUS_AREAS } from '../data';
import { ScreenScroll, Badge, Card } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { ContentBlock, getContentBlocks } from '../lib/cms';
import { colors } from '../theme';

const ICONS = [ShieldAlert, Heart, Droplets, Baby, BookOpen, TrendingUp, Sprout];

export default function WhatIsRotaryScreen() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    logPageView('what_is_rotary');
    getContentBlocks('what_is_rotary').then(setBlocks);
  }, []);

  return (
    <ScreenScroll>
      <View className="items-center gap-3">
        <Badge label="Global Movement" />
        <Text className="text-3xl font-extrabold text-slate-800 text-center">The 7 Areas of Focus</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">
          Rotary International channels support into specific service pathways. Each Sunset initiative must align directly
          with one of these critical global sectors.
        </Text>
      </View>

      <View className="gap-4">
        {ROTARY_FOCUS_AREAS.map((area, i) => {
          const Icon = ICONS[i] || Award;
          const isAzure = i % 2 === 0;
          return (
            <View key={i} className="bg-white border border-slate-100 rounded-3xl p-5 gap-3">
              <View className={`p-3 rounded-2xl self-start ${isAzure ? 'bg-rotary-azure/10' : 'bg-rotary-gold/10'}`}>
                <Icon size={22} color={isAzure ? colors.rotaryAzure : colors.rotaryGold} />
              </View>
              <Text className="text-lg font-bold text-slate-800">{area.title}</Text>
              <Text className="text-xs text-slate-500 leading-relaxed">{area.description}</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50">
                Sector 0{i + 1} • verified
              </Text>
            </View>
          );
        })}
      </View>

      <View className="bg-rotary-azure/5 border border-rotary-azure/10 rounded-3xl p-6 gap-4">
        <Badge label="District 9101 Structure" />
        <Text className="text-xl font-extrabold text-rotary-dark leading-tight">
          Connecting Sierra Leone with a Global Network of 1.4 Million Neighbors
        </Text>
        <Text className="text-sm text-slate-600 leading-relaxed">
          Rotary is an international association representing business, trades, and municipal officers. Together, we secure
          grants, establish scholarship pathways, and coordinate with World Health Organization (WHO) initiatives.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center flex-1 min-w-[120px]">
            <Text className="text-2xl font-extrabold text-rotary-azure">1.4M</Text>
            <Text className="text-[9px] font-bold uppercase text-slate-400 mt-1">Active Rotarians</Text>
          </View>
          <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center flex-1 min-w-[120px]">
            <Text className="text-2xl font-extrabold text-rotary-gold">46,000+</Text>
            <Text className="text-[9px] font-bold uppercase text-slate-400 mt-1">Local Clubs</Text>
          </View>
          <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center w-full flex-row justify-center gap-2">
            <BookMarked size={16} color={colors.rotaryAzure} />
            <Text className="text-base font-bold text-slate-800">Service Above Self</Text>
          </View>
        </View>
      </View>

      {blocks.length > 0 && (
        <View className="gap-4">
          {blocks.map((b) => (
            <Card key={b.id} className="gap-2">
              {b.title ? <Text className="text-lg font-bold text-slate-800">{b.title}</Text> : null}
              {b.body ? <Text className="text-xs text-slate-500 leading-relaxed">{b.body}</Text> : null}
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

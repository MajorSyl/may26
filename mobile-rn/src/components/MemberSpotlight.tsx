import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Star, Award, Shuffle, Calendar } from 'lucide-react-native';
import { FULL_MEMBER_LIST } from '../memberData';
import { colors } from '../theme';

function initialsOf(name: string): string {
  const cleaned = name.replace('Rtn. ', '');
  const parts = cleaned.split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
}

export default function MemberSpotlight() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * FULL_MEMBER_LIST.length));
  }, []);

  const member = FULL_MEMBER_LIST[index];
  if (!member) return null;

  const handleShuffle = () => {
    if (FULL_MEMBER_LIST.length <= 1) return;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * FULL_MEMBER_LIST.length);
    setIndex(next);
  };

  return (
    <View className="bg-slate-50 rounded-3xl border border-slate-100 p-6 gap-6">
      <View className="items-center gap-2">
        <View className="flex-row items-center gap-1.5 bg-rotary-gold/15 border border-rotary-gold/25 px-3 py-1 rounded-full">
          <Star size={13} color={colors.rotaryGold} />
          <Text className="text-[11px] font-bold uppercase tracking-widest text-rotary-gold">Spotlight On Service</Text>
        </View>
        <Text className="text-2xl font-extrabold text-slate-900">Meet Our Members</Text>
        <Text className="text-xs text-slate-500 text-center leading-relaxed">
          A look at the members of the Rotary Club of Freetown Sunset who make our local humanitarian work possible.
        </Text>
      </View>

      <View className="bg-white rounded-3xl border border-slate-200 p-6 gap-5">
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-rotary-azure/10 border border-rotary-azure/20 items-center justify-center">
            <Text className="text-xl font-extrabold text-rotary-azure">{initialsOf(member.name)}</Text>
          </View>
          <View className="flex-1 gap-1.5">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Text className="text-lg font-extrabold text-slate-800">{member.name}</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-rotary-azure/10 border border-rotary-azure/20 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold uppercase text-rotary-azure">{member.role}</Text>
              </View>
              {member.isPaulHarrisFellow && (
                <View className="bg-rotary-gold/10 border border-rotary-gold/20 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                  <Award size={11} color={colors.rotaryGold} />
                  <Text className="text-[10px] font-bold uppercase text-rotary-gold">
                    PHF{member.paulHarrisLevel && member.paulHarrisLevel !== 'None' ? ` (${member.paulHarrisLevel})` : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {(member.classification || member.joinedDate) && (
          <View className="flex-row flex-wrap gap-4">
            {member.classification && (
              <View className="flex-row items-center gap-1.5">
                <Award size={13} color={colors.rotaryGold} />
                <Text className="text-xs text-slate-500">
                  Classification: <Text className="font-semibold text-slate-700">{member.classification}</Text>
                </Text>
              </View>
            )}
            {member.joinedDate && (
              <View className="flex-row items-center gap-1.5">
                <Calendar size={13} color={colors.slate400} />
                <Text className="text-xs text-slate-500">Member since {new Date(member.joinedDate).getFullYear()}</Text>
              </View>
            )}
          </View>
        )}

        {member.committee && (
          <View className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 self-start">
            <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Commitment Area</Text>
            <Text className="text-xs font-semibold text-slate-700">{member.committee}</Text>
          </View>
        )}

        <Pressable
          onPress={handleShuffle}
          className="mt-2 self-start flex-row items-center gap-2 bg-slate-900 px-4 py-2.5 rounded-xl"
        >
          <Shuffle size={14} color={colors.white} />
          <Text className="text-white text-xs font-semibold">Meet Another Member</Text>
        </Pressable>
      </View>
    </View>
  );
}

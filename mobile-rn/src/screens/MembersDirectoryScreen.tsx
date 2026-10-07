import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, UserCircle2 } from 'lucide-react-native';
import { UserProfile } from '../types';
import { getUsers } from '../lib/service';
import { ScreenScroll, Badge, LoadingBlock, EmptyBlock } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

function initialsOf(name: string): string {
  const cleaned = name.replace(/Rtn\.\s+/g, '');
  const parts = cleaned.split(' ').filter(Boolean);
  return parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Simplified per the club's revamp brief: no individual "year joined" or
// PHF status on public cards, no filter tabs. Just an intro ("60 vibrant
// members"), the 2026-2027 Executive by name and role, then a clean,
// name-only general roster -- plus Member Sign In, moved here from the
// header per the brief's "login shouldn't be prominent in the top-right
// corner" direction.
export default function MembersDirectoryScreen() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    logPageView('members_directory');
    getUsers()
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  const president = members.find((m) => m.role === 'President');
  const executiveBoard = members.filter((m) => m.role === 'Club Officer' && m.committee === 'Executive Board');
  const generalMembers = members
    .filter((m) => m.uid !== president?.uid && !executiveBoard.some((e) => e.uid === m.uid))
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const diasporaCount = 12;

  return (
    <ScreenScroll>
      <View className="items-center gap-3 w-full sm:max-w-2xl mx-auto">
        <Badge label="Our Fellowship" tone="gold" />
        <Text className="text-3xl font-extrabold text-rotary-dark text-center leading-snug">
          {members.length || 60} Vibrant Members
        </Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">
          Business leaders and professionals united in service, including {diasporaCount} members in the diaspora.
        </Text>
      </View>

      {loading ? (
        <LoadingBlock label="Loading members..." />
      ) : (
        <>
          {/* 2026-2027 Executive */}
          <View className="gap-4">
            <Text className="text-xl font-extrabold text-rotary-dark">2026&ndash;2027 Executive</Text>
            <View className="gap-3 sm:flex-row sm:flex-wrap">
              {president && (
                <View className="bg-white border border-rotary-gold/40 rounded-2xl p-4 flex-row items-center gap-3 sm:w-[48%] lg:w-[31%]">
                  <View className="w-12 h-12 rounded-full bg-rotary-gold/15 items-center justify-center">
                    <Text className="font-extrabold text-rotary-gold">{initialsOf(president.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-extrabold text-slate-800 text-sm">{president.name}</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-rotary-gold mt-0.5">President</Text>
                  </View>
                </View>
              )}
              {executiveBoard.map((m) => (
                <View key={m.uid} className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center gap-3 sm:w-[48%] lg:w-[31%]">
                  <View className="w-12 h-12 rounded-full bg-rotary-azure/10 items-center justify-center">
                    <Text className="font-extrabold text-rotary-azure">{initialsOf(m.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-extrabold text-slate-800 text-sm">{m.name}</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-rotary-azure mt-0.5">Executive Board</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* General members -- names only */}
          <View className="gap-4">
            <Text className="text-xl font-extrabold text-rotary-dark">Our Members</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <Search size={16} color={colors.slate400} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name..."
                placeholderTextColor={colors.slate400}
                className="flex-1 px-2 py-2.5 text-xs text-slate-700"
              />
            </View>
            {generalMembers.length === 0 ? (
              <EmptyBlock label={`No members matching "${search}" found.`} />
            ) : (
              <View className="flex-row flex-wrap gap-2.5">
                {generalMembers.map((m) => (
                  <View key={m.uid} className="bg-white border border-slate-200 rounded-full px-4 py-2.5">
                    <Text className="text-xs font-semibold text-slate-700">{m.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}

      <Pressable
        onPress={() => (navigation.getParent()?.getParent() as any)?.navigate('MemberAccount')}
        className="flex-row items-center justify-center gap-2 bg-white border border-slate-300 rounded-xl py-3.5 hover:bg-slate-50"
      >
        <UserCircle2 size={16} color={colors.slate600} />
        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">Member Sign In</Text>
      </Pressable>
    </ScreenScroll>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Search, Shield, Award, Calendar, Crown, UserCheck, Lock } from 'lucide-react-native';
import { UserProfile } from '../types';
import { getUsers } from '../lib/service';
import { ScreenScroll, LoadingBlock, EmptyBlock } from '../components/ui';
import { colors } from '../theme';

function initialsOf(name: string): string {
  const cleaned = name.replace(/Rtn\.\s+/g, '');
  const parts = cleaned.split(' ').filter(Boolean);
  return parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Simplified from the web app's MembersDirectory: same three filter tabs
// (Charter & Active / Board Executives / Paul Harris Fellows), but without
// the "Verbatim Roster" sub-tab, which was a redundant stripped-down
// duplicate view of the same member list.
export default function MembersDirectoryScreen() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'executives' | 'phfs'>('all');

  useEffect(() => {
    getUsers()
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  const executives = members.filter((m) => m.role === 'President' || m.role === 'Club Officer');

  const filtered = members.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      (m.classification && m.classification.toLowerCase().includes(term)) ||
      (m.committee && m.committee.toLowerCase().includes(term));
    if (!matchesSearch) return false;
    if (tab === 'executives') return executives.some((e) => e.uid === m.uid);
    if (tab === 'phfs') return !!m.isPaulHarrisFellow;
    return true;
  });

  return (
    <ScreenScroll>
      <View className="gap-2">
        <View className="self-start px-3 py-1 rounded-full bg-rotary-azure/10">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-rotary-azure">Sunset Fellowship Roster</Text>
        </View>
        <Text className="text-3xl font-extrabold text-rotary-dark">Members Directory</Text>
        <Text className="text-sm text-slate-500 leading-relaxed">
          Meet the dedicated business leaders, executives, and professionals who constitute the Rotary Club of Freetown
          Sunset. Together we advocate for the ultimate civic standards under "Service Above Self".
        </Text>
      </View>

      <View className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex-row items-start gap-3">
        <View className="p-2 rounded-xl bg-orange-50">
          <Lock size={16} color={colors.amber500} />
        </View>
        <Text className="text-[11px] text-slate-500 leading-snug flex-1">
          To protect member privacy, phone numbers and email addresses are never published on this public page. Authorized
          members and club officers can access full contact details through the secure Portal.
        </Text>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
          <Search size={16} color={colors.slate400} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search roster..."
            placeholderTextColor={colors.slate400}
            className="flex-1 px-2 py-2.5 text-xs text-slate-700"
          />
        </View>
        <View className="flex-row gap-2">
          {[
            { id: 'all' as const, label: 'Charter & Active', icon: UserCheck },
            { id: 'executives' as const, label: 'Executives', icon: Crown },
            { id: 'phfs' as const, label: 'PHFs', icon: Award }
          ].map((t) => {
            const isSel = tab === t.id;
            const Icon = t.icon;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                  isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Icon size={13} color={isSel ? colors.white : colors.slate500} />
                <Text className={`text-[10px] font-bold uppercase ${isSel ? 'text-white' : 'text-slate-500'}`}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <LoadingBlock label="Querying Chapter member profiles..." />
      ) : filtered.length === 0 ? (
        <EmptyBlock label={`No members matching "${search}" found in this section.`} />
      ) : (
        <View className="gap-3">
          {filtered.map((m) => {
            const isExec = executives.some((e) => e.uid === m.uid);
            return (
              <View key={m.uid} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <View className={`h-3 w-full ${isExec ? 'bg-rotary-gold' : m.isPaulHarrisFellow ? 'bg-rotary-azure' : 'bg-slate-200'}`} />
                <View className="p-5 gap-3">
                  <View className="flex-row items-center gap-3">
                    <View className="w-14 h-14 rounded-full bg-rotary-azure/10 items-center justify-center border-2 border-white">
                      <Text className="font-extrabold text-rotary-azure">{initialsOf(m.name)}</Text>
                    </View>
                    <Text className="font-extrabold text-slate-800 text-sm flex-1">{m.name}</Text>
                  </View>
                  <View className="gap-2 border-t border-slate-100 pt-3">
                    {m.classification && (
                      <View className="flex-row items-center gap-2">
                        <Shield size={13} color={colors.rotaryAzure} />
                        <Text className="text-xs text-slate-600">{m.classification}</Text>
                      </View>
                    )}
                    {m.committee && (
                      <View className="flex-row items-center gap-2">
                        <UserCheck size={13} color="#6366f1" />
                        <Text className="text-xs text-slate-600">{m.committee}</Text>
                      </View>
                    )}
                    {m.joinedDate && (
                      <View className="flex-row items-center gap-2">
                        <Calendar size={13} color={colors.slate400} />
                        <Text className="text-[10px] text-slate-400">
                          Joined Sunset: {new Date(m.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </Text>
                      </View>
                    )}
                  </View>
                  {m.isPaulHarrisFellow && (
                    <View className="flex-row items-center gap-1.5 pt-2 border-t border-amber-100">
                      <Award size={14} color={colors.rotaryGold} />
                      <Text className="text-[10px] font-extrabold uppercase text-rotary-gold">{m.paulHarrisLevel || 'Paul Harris Fellow'}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

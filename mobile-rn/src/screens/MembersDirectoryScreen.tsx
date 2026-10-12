import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, LogIn } from 'lucide-react-native';
import { UserProfile } from '../types';
import { getPublicMembers, getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { LoadingBlock } from '../components/ui';
import { SitePage, Section, SectionHeading, PlaceholderNote, Eyebrow } from '../components/site';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

function initialsOf(name: string): string {
  return name
    .replace(/Rtn\.?\s+/g, '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// exec_order 1-9 is the Board of Directors, 10+ the Committee Chairs.
const CHAIRS_FROM = 10;
const isExecutive = (m: UserProfile) => !!m.clubPosition;
const isBoard = (m: UserProfile) => (m.execOrder ?? 999) < CHAIRS_FROM;

function execSort(a: UserProfile, b: UserProfile): number {
  return (a.execOrder ?? 999) - (b.execOrder ?? 999) || a.name.localeCompare(b.name);
}

function LeaderCard({ member }: { member: UserProfile }) {
  return (
    <View className="h-full items-center gap-3 bg-white border border-slate-200 rounded-2xl p-5">
      {member.avatarUrl ? (
        <Image
          source={{ uri: member.avatarUrl }}
          accessibilityLabel={member.name}
          style={{ width: 112, height: 112, borderRadius: 56 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-28 h-28 rounded-full bg-rotary-royal items-center justify-center">
          <Text className="font-display text-2xl font-bold text-white">{initialsOf(member.name)}</Text>
        </View>
      )}
      <View className="items-center gap-1">
        <Text className="text-base font-semibold text-rotary-royal-deep text-center">{member.name}</Text>
        <Text className="text-sm font-medium text-rotary-link text-center">{member.clubPosition}</Text>
      </View>
    </View>
  );
}

function LeaderGroup({ title, members }: { title: string; members: UserProfile[] }) {
  if (members.length === 0) return null;
  return (
    <View className="gap-4">
      <Text className="font-display text-xl font-bold text-rotary-royal-deep">{title}</Text>
      <View className="flex-row flex-wrap -mx-2">
        {members.map((m) => (
          <View key={m.uid} className="w-1/2 md:w-1/3 lg:w-1/4 p-2">
            <LeaderCard member={m} />
          </View>
        ))}
      </View>
    </View>
  );
}

function MemberLoginButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="self-start min-h-[48px] px-5 rounded-full border border-rotary-royal flex-row items-center gap-2 hover:bg-rotary-royal/5"
    >
      <LogIn size={16} color={colors.rotaryRoyal} />
      <Text className="text-[15px] font-semibold text-rotary-royal">Member login</Text>
    </Pressable>
  );
}

export default function MembersDirectoryScreen() {
  const navigation = useNavigation<any>();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    logPageView('members_directory');
    getSiteSettings().then(setSettings);
    getPublicMembers()
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  const goMemberLogin = () => (navigation.getParent()?.getParent() as any)?.navigate('MemberAccount');

  const executive = members.filter(isExecutive).sort(execSort);
  const roster = members
    .filter((m) => m.role !== 'Guest')
    .filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const term = settings.executiveTermLabel;

  return (
    <SitePage>
      <Section tone="cream">
        <View className="gap-8 md:flex-row md:items-end md:justify-between">
          <View className="gap-4 md:flex-1 md:max-w-2xl rcfs-rise">
            <Eyebrow label="Our members" />
            {settings.membersTotal ? (
              <Text accessibilityRole="header" className="font-display text-[34px] leading-[42px] sm:text-5xl sm:leading-[56px] font-extrabold text-rotary-royal-deep">
                {settings.membersTotal} vibrant members
                {settings.membersDiaspora ? `, including ${settings.membersDiaspora} in the diaspora` : ''}
              </Text>
            ) : (
              <>
                <Text accessibilityRole="header" className="font-display text-4xl font-extrabold text-rotary-royal-deep">
                  Our members
                </Text>
                <PlaceholderNote label="member count (set in Admin → Settings)" />
              </>
            )}
            <Text className="text-lg leading-8 text-slate-600">Business leaders and professionals, united in service.</Text>
          </View>
          <View className="gap-2">
            <Text className="text-sm text-slate-500">Club member?</Text>
            <MemberLoginButton onPress={goMemberLogin} />
          </View>
        </View>
      </Section>

      {loading ? (
        <Section>
          <LoadingBlock label="Loading members..." />
        </Section>
      ) : (
        <>
          <Section>
            <View className="gap-8">
              <SectionHeading eyebrow="Leadership" title={term ? `${term} Executive` : 'Club Executive'} />
              {!term ? <PlaceholderNote label="executive term (set in Admin → Settings)" /> : null}
              <LeaderGroup title="Board of Directors" members={executive.filter(isBoard)} />
              <LeaderGroup title="Committee Chairs" members={executive.filter((m) => !isBoard(m))} />
            </View>
          </Section>

          <Section tone="cream">
            <View className="gap-8">
              <View className="gap-5 md:flex-row md:items-end md:justify-between">
                <SectionHeading eyebrow="Fellowship" title="Our members" />
                <View className="flex-row items-center bg-white border border-slate-300 rounded-full px-4 min-h-[48px] md:w-80">
                  <Search size={18} color={colors.slate500} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search by name"
                    placeholderTextColor={colors.slate500}
                    accessibilityLabel="Search members by name"
                    className="flex-1 px-3 py-3 text-[15px] text-slate-800"
                  />
                </View>
              </View>
              {roster.length === 0 ? (
                <Text className="text-base text-slate-500">No members match “{search}”.</Text>
              ) : (
                <View className="flex-row flex-wrap -mx-3">
                  {roster.map((m) => (
                    <View key={m.uid} className="w-full sm:w-1/2 lg:w-1/3 px-3 py-2.5 border-b border-slate-200/70">
                      <Text className="text-base text-rotary-royal-deep">{m.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Section>
        </>
      )}

      <Section tight>
        <View className="bg-rotary-cream rounded-3xl p-6 sm:p-8 gap-4 md:flex-row md:items-center md:justify-between">
          <View className="gap-1 md:flex-1">
            <Text className="font-display text-xl font-bold text-rotary-royal-deep">Members' area</Text>
            <Text className="text-base leading-7 text-slate-600">Sign in for meetings, RSVPs, attendance and club resources.</Text>
          </View>
          <MemberLoginButton onPress={goMemberLogin} />
        </View>
      </Section>
    </SitePage>
  );
}

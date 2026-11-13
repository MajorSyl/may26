import React from 'react';
import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { Mail } from 'lucide-react-native';
import { SitePage, Section, Eyebrow } from './site';
import { colors } from '../theme';

// One paragraph, or a bulleted list. A list item can be plain text or a
// [label, text] pair rendered as "Label: text".
export type LegalBlock = { p: string } | { list: (string | [string, string])[] };
export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

function scrollToSection(id: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.getElementById(`legal-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <View className="gap-4">
      {blocks.map((b, i) =>
        'p' in b ? (
          <Text key={i} className="text-base leading-7 text-slate-700">
            {b.p}
          </Text>
        ) : (
          <View key={i} className="gap-2.5">
            {b.list.map((item, j) => (
              <View key={j} className="flex-row gap-3 pl-1">
                <View className="w-1.5 h-1.5 rounded-full bg-rotary-gold mt-[11px]" />
                <Text className="flex-1 text-base leading-7 text-slate-700">
                  {Array.isArray(item) ? (
                    <>
                      <Text className="font-semibold text-rotary-royal-deep">{item[0]}: </Text>
                      {item[1]}
                    </>
                  ) : (
                    item
                  )}
                </Text>
              </View>
            ))}
          </View>
        )
      )}
    </View>
  );
}

export default function LegalDocument({
  eyebrow,
  title,
  updated,
  intro,
  sections,
  contactEmail
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  contactEmail?: string;
}) {
  return (
    <SitePage>
      <Section tone="cream" tight>
        <View className="gap-4 max-w-3xl rcfs-rise">
          <Eyebrow label={eyebrow} />
          <Text accessibilityRole="header" className="font-display text-[34px] leading-[42px] sm:text-5xl sm:leading-[56px] font-extrabold text-rotary-royal-deep">
            {title}
          </Text>
          <Text className="text-sm font-semibold text-slate-500">Last updated: {updated}</Text>
          <Text className="text-lg leading-8 text-slate-600">{intro}</Text>
        </View>
      </Section>

      <Section>
        <View className="gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* Contents */}
          <View className="gap-3 lg:w-64 bg-rotary-cream rounded-2xl p-5">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-royal">Contents</Text>
            {sections.map((s, i) => (
              <Pressable key={s.id} onPress={() => scrollToSection(s.id)} accessibilityRole="link" className="flex-row gap-2 min-h-[32px] items-center">
                <Text className="text-sm font-semibold text-slate-400 w-6">{i + 1}.</Text>
                <Text className="flex-1 text-sm text-rotary-royal-deep hover:text-rotary-link">{s.title}</Text>
              </Pressable>
            ))}
          </View>

          {/* Body */}
          <View className="gap-10 lg:flex-1 max-w-3xl">
            {sections.map((s, i) => (
              <View key={s.id} nativeID={`legal-${s.id}`} className="gap-4">
                <Text accessibilityRole="header" className="font-display text-2xl font-bold text-rotary-royal-deep">
                  {i + 1}. {s.title}
                </Text>
                <Blocks blocks={s.blocks} />
              </View>
            ))}

            {contactEmail ? (
              <View className="bg-rotary-royal rounded-2xl p-6 gap-3 sm:flex-row sm:items-center sm:justify-between">
                <View className="gap-1 sm:flex-1">
                  <Text className="font-display text-lg font-bold text-white">Questions about this document?</Text>
                  <Text className="text-[15px] leading-6 text-white/80">Write to the Club and we will reply as soon as we can.</Text>
                </View>
                <Pressable
                  onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
                  accessibilityRole="link"
                  className="min-h-[44px] px-5 rounded-full bg-white flex-row items-center gap-2 self-start"
                >
                  <Mail size={16} color={colors.rotaryRoyal} />
                  <Text className="text-[15px] font-semibold text-rotary-royal-deep">{contactEmail}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Section>
    </SitePage>
  );
}

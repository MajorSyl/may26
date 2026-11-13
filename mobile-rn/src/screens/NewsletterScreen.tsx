import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../navigation/types';
import { PublicNewsletterIssue, getNewsletterIssues, getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import SupportClub from '../components/SupportClub';
import { LoadingBlock } from '../components/ui';
import { SitePage, Section, SectionHeading } from '../components/site';
import { FeaturedIssue, IssueRow, SubscribeBox } from '../components/Newsletter';
import { logPageView } from '../lib/analytics';

type Props = NativeStackScreenProps<MoreStackParamList, 'Newsletter'>;

export default function NewsletterScreen(_props: Props) {
  const [issues, setIssues] = useState<PublicNewsletterIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    logPageView('newsletter');
    getSiteSettings().then(setSettings);
    getNewsletterIssues()
      .then(setIssues)
      .finally(() => setLoading(false));
  }, []);

  const [latest, ...past] = issues;
  const years = Array.from(new Set(past.map((i) => new Date(i.createdAt).getFullYear()))).sort((a, b) => b - a);

  return (
    <SitePage>
      <Section tone="cream" tight>
        <View className="rcfs-rise">
          <SectionHeading
            eyebrow="Newsletter"
            title="News from the Rotary Club of Freetown-Sunset"
            intro="Our newsletter shares project updates, meetings, fellowship and the people behind our service. Read the latest issue, browse the archive, or subscribe to receive it by email."
          />
        </View>
      </Section>

      <Section>
        <View className="gap-10">
          {loading ? (
            <LoadingBlock label="Loading newsletters..." />
          ) : latest ? (
            <FeaturedIssue issue={latest} />
          ) : (
            <View className="border border-dashed border-slate-300 rounded-3xl p-8 gap-2">
              <Text className="font-display text-xl font-bold text-rotary-royal-deep">Our first issue is on its way</Text>
              <Text className="text-base leading-7 text-slate-600">Subscribe below and we will email it to you as soon as it is published.</Text>
            </View>
          )}

          <SubscribeBox />

          {past.length > 0 ? (
            <View className="gap-8">
              <View className="flex-row items-center gap-3">
                <Text accessibilityRole="header" className="font-display text-2xl sm:text-3xl font-extrabold text-rotary-royal-deep">
                  Past issues
                </Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>
              {years.map((year) => (
                <View key={year} className="gap-4">
                  {years.length > 1 ? <Text className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{year}</Text> : null}
                  {past
                    .filter((i) => new Date(i.createdAt).getFullYear() === year)
                    .map((issue) => (
                      <IssueRow key={issue.id} issue={issue} />
                    ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Section>

      <Section tone="cream">
        <SupportClub contactEmail={settings.contactEmail} />
      </Section>
    </SitePage>
  );
}

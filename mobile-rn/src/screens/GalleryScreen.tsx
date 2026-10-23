import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectsStackParamList } from '../navigation/types';
import { Project } from '../types';
import { getProjects } from '../lib/service';
import { LoadingBlock, EmptyBlock } from '../components/ui';
import ProjectCard from '../components/ProjectCard';
import { SitePage, Section, SectionHeading, CTAButton, TextLink } from '../components/site';
import { logPageView } from '../lib/analytics';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'Gallery'>;

export default function GalleryScreen({ navigation }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logPageView('gallery');
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const goMore = (screen: string) => (navigation.getParent()?.navigate as any)?.('MoreTab', { screen });
  const ongoing = projects.filter((p) => p.status !== 'Completed');
  const completed = projects.filter((p) => p.status === 'Completed');
  const years = Array.from(new Set(completed.map((p) => p.year))).sort((a, b) => b - a);

  const grid = (list: Project[]) => (
    <View className="flex-row flex-wrap -mx-3">
      {list.map((project) => (
        <View key={project.id} className="w-full sm:w-1/2 lg:w-1/3 p-3">
          <ProjectCard project={project} onPress={() => navigation.navigate('ProjectDetails', { project })} />
        </View>
      ))}
    </View>
  );

  const heading = (title: string, count: number, size: 'lg' | 'md' = 'lg') => (
    <View className="flex-row items-center gap-3">
      <Text
        accessibilityRole="header"
        className={`font-display font-extrabold text-rotary-royal-deep ${size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
      >
        {title}
      </Text>
      <View className="px-2.5 py-0.5 rounded-full bg-slate-100">
        <Text className="text-xs font-bold text-slate-600">
          {count} {count === 1 ? 'project' : 'projects'}
        </Text>
      </View>
      <View className="flex-1 h-px bg-slate-200" />
    </View>
  );

  return (
    <SitePage>
      <Section tone="cream" tight>
        <View className="gap-4 rcfs-rise">
          <SectionHeading
            eyebrow="Our projects"
            title="What we do, and the difference it makes"
            intro="From safe water at rural health posts to classrooms, scholarships and community welfare: service projects delivered with partners at home and abroad."
          />
          <TextLink label="Browse the photo gallery" onPress={() => goMore('ClubGallery')} />
        </View>
      </Section>

      {loading ? (
        <Section>
          <LoadingBlock label="Loading projects..." />
        </Section>
      ) : projects.length === 0 ? (
        <Section>
          <EmptyBlock label="Our project stories are being updated. Please check back soon." />
        </Section>
      ) : (
        <>
          {ongoing.length > 0 ? (
            <Section>
              <View className="gap-8">
                {heading('Ongoing projects', ongoing.length)}
                {grid(ongoing)}
              </View>
            </Section>
          ) : null}
          {completed.length > 0 ? (
            <Section tone={ongoing.length > 0 ? 'cream' : 'white'}>
              <View className="gap-12">
                <View className="gap-4">
                  {heading('Completed projects', completed.length)}
                  {years.length > 1 ? (
                    <Text className="text-sm text-slate-500">Newest first · {years.join(' · ')}</Text>
                  ) : null}
                </View>
                {years.map((year) => {
                  const list = completed.filter((p) => p.year === year);
                  return (
                    <View key={year} className="gap-6">
                      {heading(String(year), list.length, 'md')}
                      {grid(list)}
                    </View>
                  );
                })}
              </View>
            </Section>
          ) : null}
        </>
      )}

      <Section tone="royal" tight>
        <View className="gap-6 md:flex-row md:items-center md:justify-between">
          <View className="md:flex-1">
            <SectionHeading title="Partner with us" intro="We welcome partners, donors and new members who share our commitment to service." onDark />
          </View>
          <View className="flex-row">
            <CTAButton label="Get in Touch" variant="light" onPress={() => goMore('Contact')} />
          </View>
        </View>
      </Section>
    </SitePage>
  );
}

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

  const group = (title: string, list: Project[], tone: 'white' | 'cream') =>
    list.length > 0 ? (
      <Section tone={tone}>
        <View className="gap-8">
          <View className="flex-row items-baseline gap-3">
            <Text accessibilityRole="header" className="font-display text-2xl sm:text-3xl font-extrabold text-rotary-royal-deep">
              {title}
            </Text>
            <Text className="text-base font-semibold text-slate-500">{list.length}</Text>
          </View>
          <View className="flex-row flex-wrap -mx-3">
            {list.map((project) => (
              <View key={project.id} className="w-full sm:w-1/2 lg:w-1/3 p-3">
                <ProjectCard project={project} onPress={() => navigation.navigate('ProjectDetails', { project })} />
              </View>
            ))}
          </View>
        </View>
      </Section>
    ) : null;

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
          {group('Ongoing projects', ongoing, 'white')}
          {group('Completed projects', completed, ongoing.length > 0 ? 'cream' : 'white')}
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

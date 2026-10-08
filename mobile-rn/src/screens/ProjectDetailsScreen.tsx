import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, MapPin, Check } from 'lucide-react-native';
import { ProjectsStackParamList } from '../navigation/types';
import { ProjectApplication } from '../types';
import { submitApplication } from '../lib/service';
import { PrimaryButton, TextField } from '../components/ui';
import { SitePage, Section, SectionHeading, TextLink } from '../components/site';
import { StatusChip, statusLabel } from '../components/ProjectCard';
import SafeImage from '../components/SafeImage';
import { logPageView } from '../lib/analytics';
import { isValidEmail, MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH } from '../lib/validate';
import { colors } from '../theme';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetails'>;

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function ProjectDetailsScreen({ route, navigation }: Props) {
  const { project } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    logPageView(`project_${project.id}`);
  }, [project.id]);

  const handleSubmit = async () => {
    if (!name || !email || !message) return;
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const app: ProjectApplication = {
        id: randomId('app'),
        project_id: project.id,
        name,
        email,
        statement: message,
        submitted_at: new Date().toISOString()
      };
      await submitApplication(app);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err?.message || 'Could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Wells built', value: project.wellsBuilt },
    { label: 'Students sponsored', value: project.studentsSponsored },
    { label: 'Funds raised', value: project.fundsRaised ? `$${project.fundsRaised.toLocaleString()}` : undefined },
    { label: 'People reached', value: project.peopleImpacted ? project.peopleImpacted.toLocaleString() : undefined }
  ].filter((st) => st.value);

  return (
    <SitePage>
      <Section tone="cream" tight>
        <View className="gap-4 rcfs-rise">
          <TextLink back label="All projects" onPress={() => navigation.navigate('Gallery')} />
          <View className="flex-row flex-wrap items-center gap-3">
            <StatusChip project={project} />
            <Text className="text-sm font-semibold text-slate-500">{project.category}</Text>
          </View>
          <Text accessibilityRole="header" className="font-display text-3xl leading-10 sm:text-[42px] sm:leading-[52px] font-extrabold text-rotary-royal-deep max-w-3xl">
            {project.title}
          </Text>
          {project.locationName ? (
            <View className="flex-row items-center gap-1.5">
              <MapPin size={16} color={colors.rotaryRoyal} />
              <Text className="text-[15px] text-slate-600">{project.locationName}</Text>
            </View>
          ) : null}
        </View>
      </Section>

      <Section tight>
        <View className="gap-10 lg:flex-row lg:gap-14">
          <View className="lg:w-[58%] gap-8">
            <View className="w-full aspect-[3/2] rounded-3xl overflow-hidden bg-slate-100">
              <SafeImage src={project.imageUrl} alt={project.title} eager />
            </View>
            <View className="gap-4">
              <Text className="font-display text-2xl font-bold text-rotary-royal-deep">The story</Text>
              <Text className="text-[17px] leading-8 text-slate-700">{project.description}</Text>
              {project.details
                ? project.details.split('\n\n').map((para, i) => (
                    <Text key={i} className="text-base leading-7 text-slate-600">
                      {para}
                    </Text>
                  ))
                : null}
            </View>
          </View>

          <View className="flex-1 gap-5">
            {project.impact ? (
              <View className="bg-rotary-royal rounded-3xl p-6 gap-2">
                <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-gold">Who benefited · Impact</Text>
                <Text className="font-display text-xl leading-8 font-bold text-white">{project.impact}</Text>
              </View>
            ) : null}
            {stats.length > 0 ? (
              <View className="flex-row flex-wrap -mx-1.5">
                {stats.map((st) => (
                  <View key={st.label} className="w-1/2 p-1.5">
                    <View className="border border-slate-200 rounded-2xl p-4 gap-1">
                      <Text className="font-display text-2xl font-extrabold text-rotary-royal-deep">{st.value}</Text>
                      <Text className="text-xs font-semibold text-slate-500">{st.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            {project.partners && project.partners.length > 0 ? (
              <View className="border border-slate-200 rounded-3xl p-6 gap-3">
                <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-royal">In partnership with</Text>
                {project.partners.map((partner) => (
                  <Text key={partner} className="text-base font-semibold text-rotary-royal-deep">
                    {partner}
                  </Text>
                ))}
              </View>
            ) : null}
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color={colors.slate500} />
              <Text className="text-sm text-slate-500">{statusLabel(project)}</Text>
            </View>
          </View>
        </View>
      </Section>

      <Section tone="cream">
        <View className="gap-6 lg:flex-row lg:gap-14">
          <View className="lg:w-[40%]">
            <SectionHeading eyebrow="Get involved" title="Support this project" intro="Volunteer, partner with us or ask a question. We'll get back to you." />
          </View>
          <View className="flex-1 bg-white rounded-3xl p-6 sm:p-8 gap-4 border border-slate-200">
            <TextField label="Full name" value={name} onChangeText={setName} maxLength={MAX_NAME_LENGTH} />
            <TextField label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" maxLength={254} />
            <TextField label="How would you like to help?" value={message} onChangeText={setMessage} multiline maxLength={MAX_MESSAGE_LENGTH} />
            {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
            <PrimaryButton label={success ? 'Sent' : 'Send'} onPress={handleSubmit} loading={loading} disabled={!name || !email || !message} />
            {success ? (
              <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex-row items-center gap-2">
                <Check size={16} color={colors.emerald600} />
                <Text className="text-sm font-semibold text-emerald-800">Thank you. We'll be in touch soon.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Section>
    </SitePage>
  );
}

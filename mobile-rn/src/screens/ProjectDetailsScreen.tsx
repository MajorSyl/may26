import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, MapPin, Check, FileText } from 'lucide-react-native';
import { ProjectsStackParamList } from '../navigation/types';
import { ProjectApplication } from '../types';
import { submitApplication } from '../lib/service';
import { ScreenScroll, Badge, Card, PrimaryButton, TextField } from '../components/ui';
import SafeImage from '../components/SafeImage';
import { logPageView } from '../lib/analytics';
import { isValidEmail, MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH } from '../lib/validate';
import { colors } from '../theme';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetails'>;

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function ProjectDetailsScreen({ route }: Props) {
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <View className="gap-3">
        <Badge label={project.category} tone="gold" />
        <Text className="text-2xl font-black text-slate-800 leading-tight">{project.title}</Text>
        <View className="flex-row flex-wrap gap-4">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={14} color={colors.rotaryAzure} />
            <Text className="text-xs text-slate-500">Rotary Year {project.year} Program</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color="#f43f5e" />
            <Text className="text-xs text-slate-500">{project.locationName || 'Freetown District, Sierra Leone'}</Text>
          </View>
        </View>
      </View>

      {project.imageUrl && (
        <View className="w-full h-52 rounded-3xl overflow-hidden border border-slate-200">
          <SafeImage src={project.imageUrl} alt={project.title} />
        </View>
      )}

      <Card className="gap-4">
        <View className="flex-row items-center gap-2 border-b border-slate-100 pb-3">
          <FileText size={16} color={colors.rotaryGold} />
          <Text className="text-base font-bold text-slate-800">Detailed Operations Report</Text>
        </View>
        <Text className="text-sm text-slate-700 leading-relaxed">{project.description}</Text>
        {project.details ? (
          project.details.split('\n\n').map((p, i) => (
            <Text key={i} className="text-xs text-slate-600 leading-relaxed">{p}</Text>
          ))
        ) : (
          <Text className="text-xs text-slate-400 leading-relaxed">
            No further details have been added for this project yet. Contact a club officer to learn more.
          </Text>
        )}
        {project.impact && (
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 gap-1">
            <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Target Monitoring Output</Text>
            <Text className="text-sm font-extrabold text-slate-800">{project.impact}</Text>
          </View>
        )}
        {((project.wellsBuilt || 0) > 0 || (project.studentsSponsored || 0) > 0 || (project.fundsRaised || 0) > 0 || (project.peopleImpacted || 0) > 0) && (
          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Wells Built', value: project.wellsBuilt },
              { label: 'Students Sponsored', value: project.studentsSponsored },
              { label: 'Funds Raised', value: project.fundsRaised ? `$${project.fundsRaised.toLocaleString()}` : undefined },
              { label: 'People Impacted', value: project.peopleImpacted }
            ]
              .filter((s) => s.value)
              .map((stat) => (
                <View key={stat.label} className="flex-1 min-w-[45%] bg-white rounded-2xl border border-slate-200 p-3 items-center gap-0.5">
                  <Text className="text-lg font-extrabold text-rotary-azure">{stat.value}</Text>
                  <Text className="text-[9px] font-bold uppercase text-slate-400 text-center">{stat.label}</Text>
                </View>
              ))}
          </View>
        )}
      </Card>

      <Card className="gap-3">
        <Badge label="Get Involved" tone="gold" />
        <Text className="text-lg font-bold text-slate-800">Support or Volunteer</Text>
        <Text className="text-xs text-slate-400 leading-relaxed">
          Submit your inquiry to join this project team, propose a donor alignment, or ask logistical questions.
        </Text>

        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Sahr Kamanda" maxLength={MAX_NAME_LENGTH} />
        <TextField label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g. sahr@gmail.com" keyboardType="email-address" autoCapitalize="none" maxLength={254} />
        <TextField label="Message Description" value={message} onChangeText={setMessage} placeholder="How would you like to participate?" multiline maxLength={MAX_MESSAGE_LENGTH} />

        {error ? <Text className="text-xs text-rose-600">{error}</Text> : null}

        <PrimaryButton
          label={success ? 'Sent!' : 'Submit Project Inquiry'}
          onPress={handleSubmit}
          loading={loading}
        />
        {success && (
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex-row items-center gap-2">
            <Check size={16} color={colors.emerald600} />
            <Text className="text-[11px] font-bold text-emerald-800">Inquiry saved. Thank you!</Text>
          </View>
        )}
      </Card>
    </ScreenScroll>
  );
}

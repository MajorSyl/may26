import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Users, Check } from 'lucide-react-native';
import { ContactInquiry } from '../types';
import { getSiteSettings, submitInquiry, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { ScreenScroll, Badge, Card, PrimaryButton, TextField } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { ContentBlock, getContentBlocks } from '../lib/cms';
import { isValidEmail, MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH } from '../lib/validate';
import { colors } from '../theme';

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function GetInvolvedScreen() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    let active = true;
    logPageView('get_involved');
    getSiteSettings().then((s) => active && setSettings(s));
    getContentBlocks('get_involved').then((b) => active && setBlocks(b));
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!name || !email || !message) return;
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const inquiry: ContactInquiry = {
        id: randomId('inq'),
        name,
        email,
        subject: 'Membership Inquiry',
        message,
        type: 'Membership Inquiry',
        createdAt: new Date().toISOString()
      };
      await submitInquiry(inquiry);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err?.message || 'Could not write inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <View className="items-center gap-3">
        <Badge label="Get Involved & Fellowships" />
        <Text className="text-3xl font-extrabold text-rotary-dark text-center">Explore Membership</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">{settings.involvedSubtitle}</Text>
      </View>

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <Users size={18} color={colors.rotaryAzure} />
          <Text className="text-base font-bold text-slate-800">Membership Fellowship Inquiry</Text>
        </View>
        <Text className="text-xs text-slate-500 leading-relaxed">
          Rotary membership is open to professional business leaders and technical directors who wish to devote energy to
          the local scene. Let us know your background so we can send you an official invitation.
        </Text>

        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Dr. Lansana Sesay" maxLength={MAX_NAME_LENGTH} />
        <TextField label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g. lanssesay@gmail.com" keyboardType="email-address" autoCapitalize="none" maxLength={254} />
        <TextField
          label="Tell us why you wish to join"
          value={message}
          onChangeText={setMessage}
          placeholder="Brief summary of your background, experience, or interest in service..."
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
        />

        <PrimaryButton
          label={success ? 'Interest Submitted!' : 'Submit Candidacy Interest'}
          onPress={handleSubmit}
          loading={loading}
        />

        {success && (
          <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex-row items-center justify-center gap-2">
            <Check size={16} color={colors.emerald600} />
            <Text className="text-xs font-bold text-emerald-800 uppercase">Interest submitted successfully!</Text>
          </View>
        )}
        {error ? <Text className="text-xs text-rose-600 text-center">{error}</Text> : null}
      </Card>

      <View className="items-center gap-1.5">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prefer to reach us directly?</Text>
        <Text className="text-xs text-rotary-azure font-semibold">{settings.contactEmail}</Text>
        <Text className="text-xs text-rotary-azure font-semibold">{settings.contactPhone}</Text>
      </View>

      {blocks.length > 0 && (
        <View className="gap-4">
          {blocks.map((b) => (
            <Card key={b.id} className="gap-2">
              {b.imageUrl ? (
                <View className="w-full h-40 rounded-xl overflow-hidden -mt-1 mb-1">
                  <Image source={{ uri: b.imageUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
                </View>
              ) : null}
              {b.title ? <Text className="text-lg font-bold text-slate-800">{b.title}</Text> : null}
              {b.body ? <Text className="text-xs text-slate-500 leading-relaxed">{b.body}</Text> : null}
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

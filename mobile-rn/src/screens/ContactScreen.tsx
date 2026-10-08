import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Phone, Mail, Facebook, Instagram, CheckCircle2, ShieldAlert, ArrowUpRight, CalendarDays } from 'lucide-react-native';
import { ContactInquiry } from '../types';
import { getSiteSettings, submitInquiry, SiteSettings, DEFAULT_SITE_SETTINGS, isPlaceholderPhone } from '../lib/service';
import { PrimaryButton, TextField } from '../components/ui';
import { SitePage, Section, SectionHeading, PlaceholderNote } from '../components/site';
import { logPageView } from '../lib/analytics';
import { isValidEmail, MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH } from '../lib/validate';
import { colors } from '../theme';

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function ContactScreen() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    logPageView('contact');
    getSiteSettings().then((s) => active && setSettings(s));
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
        id: randomId('contact'),
        name,
        email,
        subject: 'General contact from website',
        message,
        type: 'General Contact',
        createdAt: new Date().toISOString()
      };
      await submitInquiry(inquiry);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 6000);
    } catch (err: any) {
      setError(err?.message || 'Could not write message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const phoneMissing = isPlaceholderPhone(settings.contactPhone);
  const igHandle = settings.socialInstagramUrl ? `@${settings.socialInstagramUrl.replace(/\/+$/, '').split('/').pop()}` : '';
  const channels = [
    { key: 'email', label: 'Email', value: settings.contactEmail, href: settings.contactEmail ? `mailto:${settings.contactEmail}` : '', Icon: Mail },
    { key: 'phone', label: 'Phone', value: phoneMissing ? '' : settings.contactPhone, href: phoneMissing ? '' : `tel:${settings.contactPhone.replace(/\s/g, '')}`, Icon: Phone },
    { key: 'facebook', label: 'Facebook', value: 'Rotary Club of Freetown-Sunset', href: settings.socialFacebookUrl, Icon: Facebook },
    { key: 'instagram', label: 'Instagram', value: igHandle, href: settings.socialInstagramUrl, Icon: Instagram }
  ];

  return (
    <SitePage>
      <Section tone="cream" tight>
        <View className="rcfs-rise">
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            intro="Questions, partnerships or joining the club: reach us directly, or send a message and we'll reply."
          />
        </View>
      </Section>

      <Section>
        <View className="gap-10 lg:flex-row lg:gap-14">
          <View className="lg:w-[42%] gap-3">
            {channels.map(({ key, label, value, href, Icon }) => {
              const content = (
                <>
                  <View className="w-12 h-12 rounded-xl bg-rotary-gold-soft items-center justify-center">
                    <Icon size={20} color={colors.rotaryRoyal} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</Text>
                    {value ? (
                      <Text className="text-base font-semibold text-rotary-royal-deep" numberOfLines={1}>
                        {value}
                      </Text>
                    ) : (
                      <PlaceholderNote label={`club ${label.toLowerCase()} needed`} />
                    )}
                  </View>
                  {href ? <ArrowUpRight size={18} color={colors.slate500} /> : null}
                </>
              );
              return href ? (
                <Pressable
                  key={key}
                  onPress={() => Linking.openURL(href)}
                  accessibilityRole="link"
                  accessibilityLabel={`${label}: ${value}`}
                  className="min-h-[72px] flex-row items-center gap-4 border border-slate-200 rounded-2xl px-4 py-3 hover:border-rotary-royal transition-colors"
                >
                  {content}
                </Pressable>
              ) : (
                <View key={key} className="min-h-[72px] flex-row items-center gap-4 border border-slate-200 rounded-2xl px-4 py-3">
                  {content}
                </View>
              );
            })}
            {settings.meetingSchedule ? (
              <View className="flex-row items-start gap-3 pt-4 px-1">
                <CalendarDays size={18} color={colors.rotaryRoyal} style={{ marginTop: 2 }} />
                <Text className="flex-1 text-[15px] leading-6 text-slate-600">
                  Visitors are welcome at our weekly meeting: {settings.meetingSchedule}
                  {settings.meetingLocation ? `, ${settings.meetingLocation}` : ''}.
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-1 bg-rotary-cream rounded-3xl p-6 sm:p-8 gap-4">
            <Text className="font-display text-2xl font-bold text-rotary-royal-deep">Send us a message</Text>
            <TextField label="Full name" value={name} onChangeText={setName} maxLength={MAX_NAME_LENGTH} />
            <TextField label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" maxLength={254} />
            <TextField label="Message" value={message} onChangeText={setMessage} multiline maxLength={MAX_MESSAGE_LENGTH} />
            <PrimaryButton label={loading ? 'Sending...' : 'Send message'} onPress={handleSubmit} loading={loading} disabled={!name || !email || !message} />
            {success ? (
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex-row items-center gap-3">
                <CheckCircle2 size={18} color={colors.emerald600} />
                <Text className="text-sm text-emerald-800 flex-1">Thanks for reaching out. We'll get back to you soon.</Text>
              </View>
            ) : null}
            {error ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
                <ShieldAlert size={18} color={colors.rose600} />
                <Text className="text-sm text-rose-700 flex-1">{error}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Section>
    </SitePage>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, Linking } from 'react-native';
import { Phone, Mail, Clock, Globe, Facebook, Instagram, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import SiteFooter from '../navigation/SiteFooter';
import { ContactInquiry } from '../types';
import { getSiteSettings, submitInquiry, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { ScreenScroll, Badge, Card, PrimaryButton, TextField } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { isValidEmail, MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH } from '../lib/validate';
import { ContentBlock, getContentBlocks } from '../lib/cms';
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
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    let active = true;
    logPageView('contact');
    getSiteSettings().then((s) => active && setSettings(s));
    getContentBlocks('contact').then((b) => active && setBlocks(b));
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
        subject: 'General Contact from mobile app',
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

  const channels = [
    { key: 'email', label: 'Email', value: settings.contactEmail, href: `mailto:${settings.contactEmail}`, Icon: Mail, color: colors.rotaryAzure },
    { key: 'phone', label: 'Phone / WhatsApp', value: settings.contactPhone, href: `tel:${settings.contactPhone.replace(/\s/g, '')}`, Icon: Phone, color: colors.rotaryGold },
    { key: 'facebook', label: 'Facebook', value: 'Rotary Club of Freetown-Sunset', href: settings.socialFacebookUrl, Icon: Facebook, color: '#1877F2' },
    { key: 'instagram', label: 'Instagram', value: '@rcfsunset', href: settings.socialInstagramUrl, Icon: Instagram, color: '#DD2A7B' }
  ];

  return (
    <ScreenScroll>
      <View className="items-center gap-3 w-full sm:max-w-2xl mx-auto">
        <Badge label="Get in Touch" />
        <Text className="text-3xl font-extrabold text-rotary-dark text-center">Contact Us</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">
          Have a question, want to partner on a project, or thinking about joining us? We'd love to hear from you.
        </Text>
      </View>

      <View className="gap-3 sm:flex-row sm:flex-wrap">
        {channels.map(({ key, label, value, href, Icon, color }) => (
          <Pressable
            key={key}
            onPress={() => Linking.openURL(href)}
            accessibilityRole="link"
            className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center gap-3 hover:border-rotary-azure/40 hover:shadow-md sm:w-[48.5%]"
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
              <Icon size={18} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</Text>
              <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>{value}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Card className="gap-4">
        <Text className="text-lg font-extrabold text-slate-800">Send Us a Message</Text>
        <Text className="text-xs text-slate-400 leading-relaxed">We'll get back to you as soon as we can.</Text>
        <TextField label="Full Names" value={name} onChangeText={setName} placeholder="e.g. Sahr Kamanda" maxLength={MAX_NAME_LENGTH} />
        <TextField label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g. name@domain.com" keyboardType="email-address" autoCapitalize="none" maxLength={254} />
        <TextField label="Message" value={message} onChangeText={setMessage} placeholder="Details of your request..." multiline maxLength={MAX_MESSAGE_LENGTH} />
        <PrimaryButton label={loading ? 'Sending...' : 'Send Message'} onPress={handleSubmit} loading={loading} />

        {success && (
          <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex-row items-center gap-3">
            <CheckCircle2 size={18} color={colors.emerald600} />
            <Text className="text-xs text-emerald-800 flex-1">Thanks for reaching out -- we'll get back to you soon.</Text>
          </View>
        )}
        {error ? (
          <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex-row items-center gap-2">
            <ShieldAlert size={18} color="#e11d48" />
            <Text className="text-xs text-rose-700 flex-1">{error}</Text>
          </View>
        ) : null}
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">When &amp; Where We Meet</Text>
        <View className="flex-row gap-2.5">
          <Clock size={14} color={colors.rotaryGold} />
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-700">Thursday Sunsets at 6:30 PM</Text>
            <Text className="text-[11px] text-slate-500">Lagoonda Hotel, Cape Road, Aberdeen, Freetown</Text>
          </View>
        </View>
        <View className="flex-row gap-2.5">
          <Globe size={14} color={colors.rotaryAzure} />
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-700">Rotary District 9101</Text>
            <Text className="text-[11px] text-slate-500">
              Spanning multiple West African nations, coordinating sanitation, literacy, health, and economic initiatives.
            </Text>
          </View>
        </View>
      </Card>

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

      <SiteFooter />
    </ScreenScroll>
  );
}

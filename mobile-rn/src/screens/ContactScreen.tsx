import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Phone, Mail, MapPin, Clock, Globe, Facebook, Instagram, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { ContactInquiry } from '../types';
import { getSiteSettings, submitInquiry, SiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { ScreenScroll, Badge, Card, PrimaryButton, TextField } from '../components/ui';
import { logPageView } from '../lib/analytics';
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

  return (
    <ScreenScroll>
      <View className="gap-2">
        <Badge label="Get in Touch" />
        <Text className="text-3xl font-extrabold text-rotary-dark">Contact Us</Text>
        <Text className="text-sm text-slate-500 leading-relaxed">
          Have an inquiry about participating in our sunset beach service drives? Interested in joining as a nominated guest
          or making an audited project donation? Reach out to our Executive board.
        </Text>
      </View>

      <Card className="gap-4">
        <Text className="text-lg font-extrabold text-slate-800">Transmit Safe Message</Text>
        <Text className="text-xs text-slate-400 leading-relaxed">
          Your inquiry is routed directly to the Club President, Secretary, and Membership directors.
        </Text>
        <TextField label="Full Names" value={name} onChangeText={setName} placeholder="e.g. Sahr Kamanda" />
        <TextField label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g. name@domain.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Write Message Detail" value={message} onChangeText={setMessage} placeholder="Details of your request..." multiline />
        <PrimaryButton label={loading ? 'Transmitting...' : 'Transmit Message'} onPress={handleSubmit} loading={loading} />

        {success && (
          <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex-row items-center gap-3">
            <CheckCircle2 size={18} color={colors.emerald600} />
            <Text className="text-xs text-emerald-800 flex-1">
              Successfully logged! Your message has been registered and synced with our central database.
            </Text>
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
        <Text className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Meeting Coordinates</Text>
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

      <View className="bg-slate-900 rounded-3xl p-5 gap-4">
        <Text className="text-xs font-extrabold text-white uppercase tracking-widest">Secretariat Helpline</Text>
        <View className="flex-row items-center gap-3">
          <View className="p-2 rounded-xl bg-slate-800"><Phone size={16} color={colors.rotaryGold} /></View>
          <View>
            <Text className="text-[10px] font-bold uppercase text-slate-400">Voice / WhatsApp</Text>
            <Text className="text-white font-extrabold">{settings.contactPhone}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="p-2 rounded-xl bg-slate-800"><Mail size={16} color={colors.rotaryAzure} /></View>
          <View>
            <Text className="text-[10px] font-bold uppercase text-slate-400">Administrative Email</Text>
            <Text className="text-white font-semibold">{settings.contactEmail}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="p-2 rounded-xl bg-slate-800"><MapPin size={16} color={colors.emerald600} /></View>
          <View>
            <Text className="text-[10px] font-bold uppercase text-slate-400">Meeting Location</Text>
            <Text className="text-white font-semibold">Lagoonda Hotel, Freetown</Text>
          </View>
        </View>
      </View>

      <Card className="gap-3">
        <Text className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Follow Us Online</Text>
        <View className="flex-row items-center gap-3">
          <View className="p-2 rounded-xl bg-[#1877F2]/10"><Facebook size={16} color="#1877F2" /></View>
          <Text className="text-xs font-semibold text-slate-700 flex-1">Rotary Club of Freetown Sunset</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="p-2 rounded-xl bg-[#DD2A7B]/10"><Instagram size={16} color="#DD2A7B" /></View>
          <Text className="text-xs font-semibold text-slate-700 flex-1">@rcfsunset</Text>
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
    </ScreenScroll>
  );
}

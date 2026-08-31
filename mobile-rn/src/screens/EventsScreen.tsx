import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { ClubEvent, EventRSVP } from '../types';
import { getEvents, submitRSVP } from '../lib/service';
import { ScreenScroll, Badge, Card, PrimaryButton, TextField, LoadingBlock, EmptyBlock } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';
import { Pressable } from 'react-native';

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      logPageView('events');
      const data = await getEvents();
      setEvents(data);
      if (data.length > 0 && !selectedEventId) setSelectedEventId(data[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRsvp = async () => {
    if (!guestName || !guestEmail || !selectedEventId) return;
    setRsvpLoading(true);
    setRsvpError('');
    try {
      const rsvp: EventRSVP = {
        id: randomId('rsvp'),
        event_id: selectedEventId,
        name: guestName,
        email: guestEmail,
        submitted_at: new Date().toISOString()
      };
      await submitRSVP(rsvp);
      setRsvpSuccess(true);
      setGuestName('');
      setGuestEmail('');
      setTimeout(() => setRsvpSuccess(false), 5000);
    } catch (err: any) {
      setRsvpError(err?.message || 'Could not register RSVP. Please try again later.');
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <ScreenScroll wide>
      <View className="gap-2 md:max-w-3xl">
        <Badge label="Fellowship Circles" />
        <Text className="text-sm text-slate-500 leading-relaxed">
          We meet weekly in Freetown. Visiting Rotarians, family guests, and prospective service leaders are always welcome
          to join. Let us know you are coming!
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <Calendar size={18} color={colors.rotaryAzure} />
          <Text className="font-extrabold text-slate-800 uppercase tracking-wider text-sm">Upcoming Calendar</Text>
        </View>

        {loading ? (
          <LoadingBlock label="Loading weekly programs..." />
        ) : events.length === 0 ? (
          <EmptyBlock label="No meetings are currently listed. Please check back shortly or feel free to contact a club officer." />
        ) : (
          <View className="gap-3 md:flex-row md:flex-wrap">
            {events.map((ev) => (
              <Card key={ev.id} className="gap-3 md:w-[48%] lg:w-[31%]">
                <View className="flex-row items-center gap-2">
                  <Badge label={ev.type} />
                </View>
                <Text className="text-lg font-extrabold text-slate-800 leading-snug">{ev.title}</Text>
                {ev.description ? <Text className="text-xs text-slate-500 leading-relaxed">{ev.description}</Text> : null}
                {ev.speaker ? (
                  <View className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200">
                    <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Featured Guest Speaker</Text>
                    <Text className="text-xs font-bold text-slate-700">{ev.speaker}</Text>
                  </View>
                ) : null}
                <View className="gap-2 pt-3 border-t border-slate-100">
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color={colors.slate400} />
                    <Text className="text-xs font-semibold text-slate-600">{ev.date} @ {ev.time}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MapPin size={14} color={colors.slate400} />
                    <Text className="text-xs font-semibold text-slate-600">{ev.location}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View className="gap-4 md:max-w-xl">
        <Badge label="Hospitality Desk" tone="gold" />
        <Text className="text-xl font-bold text-slate-800">Lodge Guest RSVP</Text>
        <Text className="text-xs text-slate-500">Submit your visitor details so we can welcome you at our next meeting.</Text>

        {events.length > 0 && (
          <View className="gap-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Selected Club Event</Text>
            <View className="flex-row flex-wrap gap-2">
              {events.map((ev) => {
                const isSel = selectedEventId === ev.id;
                return (
                  <Pressable
                    key={ev.id}
                    onPress={() => setSelectedEventId(ev.id)}
                    className={`px-3 py-3 rounded-xl border ${isSel ? 'bg-rotary-azure border-rotary-azure' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`text-[11px] font-bold ${isSel ? 'text-white' : 'text-slate-600'}`}>{ev.title}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <TextField label="Your Full Name" value={guestName} onChangeText={setGuestName} placeholder="e.g. Samuel Jalloh" />
        <TextField
          label="Your Email Address"
          value={guestEmail}
          onChangeText={setGuestEmail}
          placeholder="e.g. sam@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <PrimaryButton
          label={rsvpSuccess ? 'RSVP Registered!' : 'Register My RSVP'}
          onPress={handleRsvp}
          loading={rsvpLoading}
          disabled={events.length === 0}
        />
        {rsvpError ? <Text className="text-xs text-rose-600 text-center">{rsvpError}</Text> : null}
      </View>
    </ScreenScroll>
  );
}

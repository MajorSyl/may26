import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { colors } from '../theme';

// Stripe redirects back to /?donation=success or /?donation=cancelled after
// checkout (see create-donation-checkout's success_url/cancel_url). This
// app has no URL-based routing, so the query string is the only signal --
// read it once on mount, then strip it so a refresh doesn't re-show it.
export default function DonationStatusBanner() {
  const [status, setStatus] = useState<'success' | 'cancelled' | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const donation = params.get('donation');
    if (donation === 'success' || donation === 'cancelled') {
      setStatus(donation);
      params.delete('donation');
      const next = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', next);
    }
  }, []);

  if (!status) return null;

  return (
    <View
      style={{ position: 'absolute', top: Platform.OS === 'web' ? 12 : 50, left: 12, right: 12, zIndex: 999 }}
      className={`rounded-2xl p-4 flex-row items-center gap-3 shadow-lg ${status === 'success' ? 'bg-emerald-600' : 'bg-slate-700'}`}
    >
      <Heart size={18} color={colors.white} />
      <Text className="flex-1 text-xs font-bold text-white">
        {status === 'success' ? "Thank you for your donation to RCFS! Your support makes a real difference." : 'Donation cancelled -- no charge was made.'}
      </Text>
      <Pressable onPress={() => setStatus(null)}>
        <X size={16} color={colors.white} />
      </Pressable>
    </View>
  );
}

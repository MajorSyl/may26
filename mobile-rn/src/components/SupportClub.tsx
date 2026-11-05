import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check, Landmark, Smartphone, HeartHandshake } from 'lucide-react-native';
import { colors } from '../theme';

// Taken from the club's official "Yearly Dues" flyer.
export const CLUB_DUES = [
  { label: 'Annual Club Dues', amount: '$250' },
  { label: 'Welfare & Administration Contribution', amount: 'SLE 1,500' }
];

const ACCOUNT_NAME = 'Rotary Club of Freetown Sunset';
const ORANGE_MERCHANT_CODE = '231806';

const BANKS: { bank: string; currency: string; rows: { label: string; value: string }[] }[] = [
  {
    bank: 'Ecobank',
    currency: 'US Dollar account',
    rows: [
      { label: 'Account number', value: '6340027779' },
      { label: 'Account name', value: ACCOUNT_NAME }
    ]
  },
  {
    bank: 'Rokel Commercial Bank (RCB)',
    currency: 'Leones account',
    rows: [
      { label: 'Account number', value: '0211550688301' },
      { label: 'BBAN', value: '002011002550688371' },
      { label: 'Account name', value: ACCOUNT_NAME }
    ]
  }
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Pressable
      onPress={copy}
      accessibilityRole="button"
      accessibilityLabel={copied ? `${label} copied` : `Copy ${label}`}
      className={`min-h-[40px] px-3.5 rounded-full flex-row items-center gap-1.5 border ${copied ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-300 hover:border-rotary-royal'}`}
    >
      {copied ? <Check size={15} color="#047857" /> : <Copy size={15} color={colors.rotaryRoyal} />}
      <Text className={`text-sm font-semibold ${copied ? 'text-emerald-700' : 'text-rotary-royal-deep'}`}>{copied ? 'Copied' : 'Copy'}</Text>
    </Pressable>
  );
}

function DetailRow({ label, value, copyable = true }: { label: string; value: string; copyable?: boolean }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-t border-slate-200">
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</Text>
        <Text selectable className="text-[17px] font-semibold text-rotary-royal-deep" style={{ fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
      </View>
      {copyable ? <CopyButton value={value} label={label.toLowerCase()} /> : null}
    </View>
  );
}

function MethodCard({ icon: Icon, title, subtitle, children }: { icon: typeof Landmark; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <View className="h-full bg-white border border-slate-200 rounded-3xl p-6 gap-4">
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-2xl bg-rotary-cream items-center justify-center">
          <Icon size={20} color={colors.rotaryRoyal} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg font-bold text-rotary-royal-deep">{title}</Text>
          <Text className="text-sm text-slate-500">{subtitle}</Text>
        </View>
      </View>
      <View>{children}</View>
    </View>
  );
}

const ORANGE_STEPS = [
  'Dial #144# on your Orange line (or open the Orange Money app).',
  'Choose the option to pay a merchant (Merchant Payment).',
  `Enter the merchant code ${ORANGE_MERCHANT_CODE}.`,
  'Enter the amount you are paying.',
  'Check that the name shown is the Rotary Club of Freetown Sunset, then confirm with your Orange Money PIN.',
  'Keep the confirmation SMS as your receipt.'
];

export default function SupportClub({ contactEmail }: { contactEmail?: string }) {
  return (
    <View className="gap-10">
      <View className="gap-6 lg:flex-row lg:items-end lg:justify-between">
        <View className="gap-3 max-w-2xl">
          <View className="flex-row items-center gap-2.5">
            <View className="w-6 h-[3px] rounded-full bg-rotary-gold" />
            <Text className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-rotary-royal">Support the club</Text>
          </View>
          <Text accessibilityRole="header" className="font-display text-[28px] leading-[34px] sm:text-4xl sm:leading-[44px] font-extrabold text-rotary-royal-deep">
            Support our work and pay your dues
          </Text>
          <Text className="text-base leading-7 text-slate-600">
            Every contribution helps fund our service projects and keeps this newsletter going. Members can pay their yearly dues using the
            same details. Tap Copy next to any number to copy it.
          </Text>
        </View>

        <View className="bg-rotary-royal rounded-3xl p-6 gap-4 lg:w-[380px]">
          <View className="flex-row items-center gap-2">
            <HeartHandshake size={18} color={colors.white} />
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-gold">Members' yearly dues</Text>
          </View>
          {CLUB_DUES.map((d) => (
            <View key={d.label} className="gap-0.5">
              <Text className="font-display text-3xl font-extrabold text-white">{d.amount}</Text>
              <Text className="text-sm text-white/80">{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row flex-wrap -mx-2.5">
        {BANKS.map((b) => (
          <View key={b.bank} className="w-full md:w-1/2 lg:w-1/3 p-2.5">
            <MethodCard icon={Landmark} title={b.bank} subtitle={b.currency}>
              {b.rows.map((r) => (
                <DetailRow key={r.label} label={r.label} value={r.value} />
              ))}
            </MethodCard>
          </View>
        ))}
        <View className="w-full lg:w-1/3 p-2.5">
          <MethodCard icon={Smartphone} title="Orange Money" subtitle="Pay from your phone">
            <DetailRow label="Merchant code" value={ORANGE_MERCHANT_CODE} />
            <View className="border-t border-slate-200 pt-3 gap-2.5">
              <Text className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">How to pay</Text>
              {ORANGE_STEPS.map((step, i) => (
                <View key={i} className="flex-row gap-3">
                  <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: '#FF7900' }}>
                    <Text className="text-xs font-bold text-white">{i + 1}</Text>
                  </View>
                  <Text className="flex-1 text-[15px] leading-6 text-slate-700">{step}</Text>
                </View>
              ))}
            </View>
          </MethodCard>
        </View>
      </View>

      <View className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
        <Text className="text-[15px] leading-6 text-slate-700">
          <Text className="font-bold text-rotary-royal-deep">After paying: </Text>
          please send your name and the payment receipt or confirmation SMS to the club Treasurer
          {contactEmail ? ` or to ${contactEmail}` : ''}, so we can record and acknowledge your contribution.
        </Text>
      </View>
    </View>
  );
}

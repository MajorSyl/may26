import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check, Smartphone } from 'lucide-react-native';
import { colors } from '../theme';
import SupportReceiptForm from './SupportReceiptForm';

const ORANGE_MERCHANT_CODE = '231806';
const ORANGE = '#FF7900';

const ORANGE_STEPS = [
  'Dial #144# on your Orange line (or open the Orange Money app).',
  'Choose the option to pay a merchant (Merchant Payment).',
  `Enter the merchant code ${ORANGE_MERCHANT_CODE}.`,
  'Enter the amount you would like to give.',
  'Check that the name shown is the Rotary Club of Freetown Sunset, then confirm with your Orange Money PIN.',
  'Keep the confirmation SMS as your receipt.'
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

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
      className={`min-h-[44px] px-4 rounded-full flex-row items-center gap-1.5 border ${copied ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-300 hover:border-rotary-royal'}`}
    >
      {copied ? <Check size={16} color="#047857" /> : <Copy size={16} color={colors.rotaryRoyal} />}
      <Text className={`text-[15px] font-semibold ${copied ? 'text-emerald-700' : 'text-rotary-royal-deep'}`}>
        {copied ? 'Copied' : 'Copy code'}
      </Text>
    </Pressable>
  );
}

// Orange Money support for the newsletter (merchant code from the club).
export default function SupportClub({ contactEmail }: { contactEmail?: string }) {
  // Wide screens: the receipt form fills the column beside the payment card.
  // Narrow screens: it follows the payment steps.
  const wide = useWindowDimensions().width >= 1024;
  const receipt = (
    <View className="gap-3">
      <SupportReceiptForm />
      {contactEmail ? <Text className="text-sm leading-6 text-slate-500">Questions about a contribution? Write to {contactEmail}.</Text> : null}
    </View>
  );
  return (
    <View className="gap-8">
      <View className="gap-8 lg:flex-row lg:items-start lg:gap-12">
        <View className="gap-3 lg:flex-1 lg:pt-4">
          <View className="flex-row items-center gap-2.5">
            <View className="w-6 h-[3px] rounded-full bg-rotary-gold" />
            <Text className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-rotary-royal">Support the newsletter</Text>
          </View>
          <Text
            accessibilityRole="header"
            className="font-display text-[28px] leading-[34px] sm:text-4xl sm:leading-[44px] font-extrabold text-rotary-royal-deep"
          >
            Help us keep the newsletter going
          </Text>
          <Text className="text-base leading-7 text-slate-600">
            If you enjoy reading about our work, you can support the newsletter with a contribution of any amount through Orange Money.
            Every gift helps us share the stories of our service across Freetown and beyond.
          </Text>
          {wide ? <View className="pt-6">{receipt}</View> : null}
        </View>

        <View className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 gap-5 lg:w-[460px]">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: ORANGE }}>
              <Smartphone size={20} color={colors.white} />
            </View>
            <View className="flex-1">
              <Text className="font-display text-lg font-bold text-rotary-royal-deep">Orange Money</Text>
              <Text className="text-sm text-slate-500">Rotary Club of Freetown Sunset</Text>
            </View>
          </View>

          <View className="bg-rotary-cream rounded-2xl px-5 py-4 flex-row flex-wrap items-center justify-between gap-3">
            <View className="gap-0.5">
              <Text className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Merchant code</Text>
              <Text
                selectable
                numberOfLines={1}
                className="font-display text-3xl font-extrabold text-rotary-royal-deep"
                style={{ letterSpacing: 2 }}
              >
                {ORANGE_MERCHANT_CODE}
              </Text>
            </View>
            <CopyButton value={ORANGE_MERCHANT_CODE} label="merchant code" />
          </View>

          <View className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">How to give</Text>
            {ORANGE_STEPS.map((step, i) => (
              <View key={i} className="flex-row gap-3">
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: ORANGE }}>
                  <Text className="text-xs font-bold text-white">{i + 1}</Text>
                </View>
                <Text className="flex-1 text-[15px] leading-6 text-slate-700">{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {!wide ? receipt : null}
    </View>
  );
}

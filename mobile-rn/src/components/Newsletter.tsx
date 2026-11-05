import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Linking, ActivityIndicator } from 'react-native';
import { FileText, Download, BookOpen, CheckCircle, Mail } from 'lucide-react-native';
import { PublicNewsletterIssue, subscribeToNewsletter } from '../lib/service';
import { isValidEmail } from '../lib/validate';
import { colors } from '../theme';

export function formatIssueDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Supabase Storage serves a file as an attachment when ?download is set.
const downloadUrl = (url: string) => `${url}${url.includes('?') ? '&' : '?'}download=`;

function IssueActions({ issue, onDark }: { issue: PublicNewsletterIssue; onDark?: boolean }) {
  return (
    <View className="flex-row flex-wrap gap-3">
      <Pressable
        onPress={() => Linking.openURL(issue.pdfUrl)}
        accessibilityRole="link"
        accessibilityLabel={`Read ${issue.title}`}
        className={`min-h-[44px] px-5 rounded-full flex-row items-center gap-2 ${onDark ? 'bg-white hover:bg-rotary-cream' : 'bg-rotary-royal hover:bg-rotary-royal-deep'}`}
      >
        <BookOpen size={16} color={onDark ? colors.rotaryRoyal : colors.white} />
        <Text className={`text-[15px] font-semibold ${onDark ? 'text-rotary-royal-deep' : 'text-white'}`}>Read</Text>
      </Pressable>
      <Pressable
        onPress={() => Linking.openURL(downloadUrl(issue.pdfUrl))}
        accessibilityRole="link"
        accessibilityLabel={`Download ${issue.title} as PDF`}
        className={`min-h-[44px] px-5 rounded-full flex-row items-center gap-2 border ${onDark ? 'border-white/60 hover:bg-white/10' : 'border-slate-300 bg-white hover:border-rotary-royal'}`}
      >
        <Download size={16} color={onDark ? colors.white : colors.rotaryRoyal} />
        <Text className={`text-[15px] font-semibold ${onDark ? 'text-white' : 'text-rotary-royal-deep'}`}>Download PDF</Text>
      </Pressable>
    </View>
  );
}

// The newest issue, shown large on the Newsletter page and the homepage.
export function FeaturedIssue({ issue, label = 'Latest issue' }: { issue: PublicNewsletterIssue; label?: string }) {
  return (
    <View className="bg-rotary-royal rounded-3xl p-6 sm:p-8 gap-5 md:flex-row md:items-center md:gap-8">
      <View className="w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
        <FileText size={30} color={colors.white} />
      </View>
      <View className="gap-2 md:flex-1">
        <Text className="text-xs font-bold uppercase tracking-[0.16em] text-rotary-gold">{label}</Text>
        <Text className="font-display text-2xl sm:text-3xl font-extrabold text-white">{issue.title}</Text>
        <Text className="text-sm text-white/75">Published {formatIssueDate(issue.createdAt)}</Text>
        {issue.message ? (
          <Text className="text-base leading-7 text-white/85" numberOfLines={4}>
            {issue.message}
          </Text>
        ) : null}
      </View>
      <IssueActions issue={issue} onDark />
    </View>
  );
}

export function IssueRow({ issue }: { issue: PublicNewsletterIssue }) {
  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-5 gap-4 sm:flex-row sm:items-center">
      <View className="w-12 h-12 rounded-xl bg-rotary-cream items-center justify-center">
        <FileText size={22} color={colors.rotaryRoyal} />
      </View>
      <View className="gap-1 sm:flex-1">
        <Text className="text-lg font-bold text-rotary-royal-deep">{issue.title}</Text>
        <Text className="text-sm text-slate-500">{formatIssueDate(issue.createdAt)}</Text>
        {issue.message ? (
          <Text className="text-[15px] leading-6 text-slate-600" numberOfLines={2}>
            {issue.message}
          </Text>
        ) : null}
      </View>
      <IssueActions issue={issue} />
    </View>
  );
}

export function SubscribeBox({ compact }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'subscribed' | 'already' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!isValidEmail(email)) {
      setStatus('error');
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      setStatus(await subscribeToNewsletter(email));
      setEmail('');
    } catch {
      setStatus('error');
      setError('Sorry, we could not subscribe you just now. Please try again.');
    }
  };

  const done = status === 'subscribed' || status === 'already';

  return (
    <View className={`bg-rotary-cream rounded-3xl gap-4 ${compact ? 'p-6' : 'p-6 sm:p-8'}`}>
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
          <Mail size={18} color={colors.rotaryRoyal} />
        </View>
        <Text className="font-display text-xl font-bold text-rotary-royal-deep flex-1">Get each issue by email</Text>
      </View>
      <Text className="text-base leading-7 text-slate-600">
        New issues are emailed to club members automatically. Friends and partners of the club can subscribe here.
      </Text>
      {done ? (
        <View className="flex-row items-center gap-2 bg-white rounded-2xl px-4 py-3">
          <CheckCircle size={18} color={colors.rotaryAzure} />
          <Text className="text-[15px] text-rotary-royal-deep flex-1">
            {status === 'already' ? 'You are already subscribed. Thank you!' : 'Thank you! You will receive the next issue by email.'}
          </Text>
        </View>
      ) : (
        <View className="gap-3 sm:flex-row">
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (status === 'error') setStatus('idle');
            }}
            onSubmitEditing={submit}
            placeholder="Your email address"
            placeholderTextColor={colors.slate500}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address for the newsletter"
            className="sm:flex-1 min-h-[48px] bg-white border border-slate-300 rounded-full px-5 text-[15px] text-slate-800"
          />
          <Pressable
            onPress={submit}
            disabled={status === 'sending'}
            accessibilityRole="button"
            className="min-h-[48px] px-6 rounded-full bg-rotary-royal hover:bg-rotary-royal-deep items-center justify-center"
          >
            {status === 'sending' ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="text-[15px] font-semibold text-white">Subscribe</Text>
            )}
          </Pressable>
        </View>
      )}
      {status === 'error' ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </View>
  );
}

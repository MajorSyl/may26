import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Shield, Database, Users, Trash2, Mail, Lock } from 'lucide-react-native';
import { ScreenScroll, Badge, Card } from '../components/ui';
import { logPageView } from '../lib/analytics';
import { colors } from '../theme';

// Ported verbatim from the web app's PrivacyPolicy.tsx. Note: the "Delete
// My Account" self-serve flow this describes lives in the old member
// Dashboard, which is out of scope for this rebuild -- the copy is kept
// as-is since it's still accurate for the web app members will also use.
export default function PrivacyPolicyScreen() {
  useEffect(() => {
    logPageView('privacy_policy');
  }, []);

  return (
    <ScreenScroll>
      <View className="gap-2">
        <Badge label="Privacy" />
        <Text className="text-sm text-slate-500 leading-relaxed">
          This page explains what information the Rotary Club of Freetown Sunset website and mobile app collect, how it's
          used, and how you can have your account and data removed.
        </Text>
        <Text className="text-[11px] text-slate-400 italic">Last updated: July 2026</Text>
      </View>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Database size={16} color={colors.rotaryAzure} />
          <Text className="text-base font-extrabold text-slate-800">What we collect</Text>
        </View>
        <Text className="text-xs text-slate-600 leading-relaxed">
          <Text className="font-bold text-slate-800">Public visitors: </Text>
          if you use our contact form or newsletter signup, we collect your name, email address, and the message you send.
          This is used only to respond to your inquiry or send occasional club updates.
        </Text>
        <Text className="text-xs text-slate-600 leading-relaxed">
          <Text className="font-bold text-slate-800">Club members: </Text>
          if you're a member with a Rotary ID and PIN login, we hold your club roster information (name, role, committee,
          recognitions) plus anything you choose to add yourself through the Member Portal: a short bio, profile photo,
          contact email, phone number, and birthday. Your PIN is stored as a securely hashed credential — we never store or
          can see it in plain text.
        </Text>
        <Text className="text-xs text-slate-600 leading-relaxed">
          <Text className="font-bold text-slate-800">Member activity: </Text>
          messages you send in the members-only Club Chat, and posts, photos, and comments you share on the Member
          Timeline, are stored so other members can see them. These are only visible to signed-in members, never to the
          public.
        </Text>
        <Text className="text-xs text-slate-600 leading-relaxed">
          <Text className="font-bold text-slate-800">Project submissions: </Text>
          if you submit a project or photo for admin review, we store the details and images you provide until an admin
          reviews it.
        </Text>
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Users size={16} color={colors.rotaryGold} />
          <Text className="text-base font-extrabold text-slate-800">How we use it</Text>
        </View>
        <Text className="text-xs text-slate-600 leading-relaxed">
          We use your information only to run the club's website and member portal: to respond to inquiries, operate member
          login, display the members directory and member-generated content to other signed-in members, and review
          submitted projects and photos.
        </Text>
        <Text className="text-xs text-slate-600 leading-relaxed">
          We do not sell your information, and we do not use third-party advertising or analytics trackers on this site.
        </Text>
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Lock size={16} color={colors.emerald600} />
          <Text className="text-base font-extrabold text-slate-800">Who can see what</Text>
        </View>
        <Text className="text-xs text-slate-600 leading-relaxed">
          Your public members-directory listing (name, role, committee, recognitions) is visible to anyone who visits the
          site, the same way it would appear in a printed club roster.
        </Text>
        <Text className="text-xs text-slate-600 leading-relaxed">
          Club Chat messages and Member Timeline posts are visible only to other signed-in club members — never to the
          public or to visitors who haven't logged in.
        </Text>
        <Text className="text-xs text-slate-600 leading-relaxed">
          Contact form messages and newsletter emails are only seen by club officers who administer the site.
        </Text>
      </Card>

      <View className="bg-slate-900 rounded-3xl p-5 gap-3">
        <View className="flex-row items-center gap-2">
          <Trash2 size={16} color="#fb7185" />
          <Text className="text-base font-extrabold text-white">Deleting your account</Text>
        </View>
        <Text className="text-xs text-slate-300 leading-relaxed">
          If you have a member login, you can permanently delete your account at any time from the Member Portal, under{' '}
          <Text className="text-white font-bold">My Account → Delete My Account</Text>. No need to contact anyone.
        </Text>
        <Text className="text-xs text-slate-300 leading-relaxed">Deleting your account immediately and permanently:</Text>
        <View className="gap-1 pl-2">
          <Text className="text-xs text-slate-300">• Deletes your login (Rotary ID + PIN) — you'll be signed out and can no longer log in</Text>
          <Text className="text-xs text-slate-300">• Deletes your bio, profile photo, contact email, phone number, and birthday</Text>
          <Text className="text-xs text-slate-300">• Deletes your Club Chat messages, and your Member Timeline posts, photos, and comments</Text>
        </View>
        <Text className="text-xs text-slate-300 leading-relaxed">
          Your basic club roster entry (name, role) may remain listed in the public Members Directory, since club
          membership is a real-world affiliation the club administers independently of app access. If you'd like that
          removed too, contact us using the Contact page and we'll handle it directly.
        </Text>
      </View>

      <Card className="gap-2">
        <View className="flex-row items-center gap-2">
          <Mail size={16} color={colors.rotaryAzure} />
          <Text className="text-base font-extrabold text-slate-800">Questions</Text>
        </View>
        <Text className="text-xs text-slate-600 leading-relaxed">
          If you have any questions about this policy or how your data is handled, please reach out through our Contact
          page.
        </Text>
      </Card>
    </ScreenScroll>
  );
}

import React from 'react';
import { Shield, Database, Users, Trash2, Mail, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24 font-sans">
      <section className="space-y-2">
        <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-azure/20">
          <Shield className="w-3.5 h-3.5 mr-1.5" />
          Privacy
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-500 max-w-2xl font-light text-sm">
          This page explains what information the Rotary Club of Freetown Sunset website and mobile app collect, how it's used, and how you can have your account and data removed.
        </p>
        <p className="text-[11px] text-slate-400 italic">Last updated: July 2026</p>
      </section>

      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-extrabold font-display text-slate-800 flex items-center gap-2">
          <Database className="w-4 h-4 text-rotary-azure" />
          What we collect
        </h2>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong className="text-slate-800">Public visitors:</strong> if you use our contact form or newsletter signup, we collect your name, email address, and the message you send. This is used only to respond to your inquiry or send occasional club updates.
          </p>
          <p>
            <strong className="text-slate-800">Club members:</strong> if you're a member with a Rotary ID and PIN login, we hold your club roster information (name, role, committee, recognitions) plus anything you choose to add yourself through the Member Portal: a short bio, profile photo, contact email, phone number, and birthday. Your PIN is stored as a securely hashed credential — we never store or can see it in plain text.
          </p>
          <p>
            <strong className="text-slate-800">Member activity:</strong> messages you send in the members-only Club Chat, and posts, photos, and comments you share on the Member Timeline, are stored so other members can see them. These are only visible to signed-in members, never to the public.
          </p>
          <p>
            <strong className="text-slate-800">Project submissions:</strong> if you submit a project or photo for admin review, we store the details and images you provide until an admin reviews it.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-extrabold font-display text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-rotary-gold" />
          How we use it
        </h2>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2">
          <p>We use your information only to run the club's website and member portal: to respond to inquiries, operate member login, display the members directory and member-generated content to other signed-in members, and review submitted projects and photos.</p>
          <p>We do not sell your information, and we do not use third-party advertising or analytics trackers on this site.</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-extrabold font-display text-slate-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          Who can see what
        </h2>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2">
          <p>Your public members-directory listing (name, role, committee, recognitions) is visible to anyone who visits the site, the same way it would appear in a printed club roster.</p>
          <p>Club Chat messages and Member Timeline posts are visible only to other signed-in club members — never to the public or to visitors who haven't logged in.</p>
          <p>Contact form messages and newsletter emails are only seen by club officers who administer the site.</p>
        </div>
      </section>

      <section className="bg-slate-900 text-slate-300 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          Deleting your account
        </h2>
        <div className="text-xs leading-relaxed space-y-2">
          <p>
            If you have a member login, you can permanently delete your account at any time from the Member Portal, under <strong className="text-white">My Account → Delete My Account</strong>. No need to contact anyone.
          </p>
          <p>Deleting your account immediately and permanently:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Deletes your login (Rotary ID + PIN) — you'll be signed out and can no longer log in</li>
            <li>Deletes your bio, profile photo, contact email, phone number, and birthday</li>
            <li>Deletes your Club Chat messages, and your Member Timeline posts, photos, and comments</li>
          </ul>
          <p>
            Your basic club roster entry (name, role) may remain listed in the public Members Directory, since club membership is a real-world affiliation the club administers independently of app access — this is the same information that would appear in an offline club roster. If you'd like that removed too, or have any other question about your data, contact us using the club's <strong className="text-white">Contact</strong> page and we'll handle it directly.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-extrabold font-display text-slate-800 flex items-center gap-2">
          <Mail className="w-4 h-4 text-rotary-azure" />
          Questions
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          If you have any questions about this policy or how your data is handled, please reach out through our <strong className="text-slate-800">Contact</strong> page.
        </p>
      </section>
    </div>
  );
}

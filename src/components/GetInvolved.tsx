import React, { useState, useEffect } from 'react';
import { submitDbInquiry } from '../db-router';
import { ContactInquiry } from '../types';
import { Users, User, Mail, Check, Send } from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../supabase-service';

export default function GetInvolved() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let active = true;
    getSiteSettings().then(res => {
      if (active) {
        setSettings(res);
      }
    });
    return () => { active = false; };
  }, []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Form states - Membership
  const [memName, setMemName] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memSubject, setMemSubject] = useState('Membership Inquiry');
  const [memMsg, setMemMsg] = useState('');

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName || !memEmail || !memMsg) return;

    setLoading(true);
    setErrorText('');
    setSuccess(false);

    const inquiry: ContactInquiry = {
      id: 'inq_' + Math.random().toString(36).substr(2, 9),
      name: memName,
      email: memEmail,
      subject: memSubject,
      message: memMsg,
      type: 'Membership Inquiry',
      createdAt: new Date().toISOString()
    };

    try {
      await submitDbInquiry(inquiry);
      setSuccess(true);
      setMemName('');
      setMemEmail('');
      setMemMsg('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || 'Could not write inquiry. Please verify database connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* 1. HEADER */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-azure/20">
          Get Involved & Fellowships
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          Explore Membership
        </h1>
        <p className="text-slate-500 font-light leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
          {settings.involvedSubtitle}
        </p>
      </section>

      {/* 2. MEMBERSHIP FORM SCREEN */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Decorative backdrop watermark */}
        <div className="absolute top-0 right-0 p-8 opacity-5 text-rotary-gold">
          <Users className="h-24 w-24" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-rotary-azure" />
              Membership Fellowship Inquiry
            </h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Rotary membership is open to professional business leaders and technical directors who wish to devote energy to the local scene. Let us know your background so we can send you an official invitation.
            </p>
          </div>

          <form onSubmit={handleMembershipSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                  <input
                    id="mem-name-input"
                    type="text"
                    placeholder="e.g. Dr. Lansana Sesay"
                    value={memName}
                    onChange={(e) => setMemName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                  <input
                    id="mem-email-input"
                    type="email"
                    placeholder="e.g. lanssesay@gmail.com"
                    value={memEmail}
                    onChange={(e) => setMemEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5 font-semibold">Your Area of Business or Profession</label>
              <input
                id="mem-subject-input"
                type="text"
                placeholder="e.g. Senior Medical Officer or IT Consultant"
                value={memSubject}
                onChange={(e) => setMemSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5 font-semibold">Tell us why you wish to join the Rotary Club of Freetown-Sunset</label>
              <textarea
                id="mem-message-input"
                placeholder="Brief summary of your background, experience, or interest in service..."
                value={memMsg}
                onChange={(e) => setMemMsg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs h-28 focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700 resize-none"
                required
              />
            </div>

            <button
              id="mem-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-xs font-bold uppercase tracking-widest font-display rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                success 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-rotary-azure hover:bg-rotary-azure/90 text-white hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : success ? (
                <>
                  <Check className="h-5 w-5" />
                  Interest Submitted Successfully!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Candidacy Interest
                </>
              )}
            </button>
          </form>
        </div>

        {success && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-xs text-emerald-800 font-bold uppercase font-display select-none animate-pulse">
            Your inquiry record has been written to the club's administration logs. Thank you!
          </div>
        )}

        {errorText && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs text-rose-700 font-bold uppercase font-display select-none">
            {errorText}
          </div>
        )}
      </div>
    </div>
  );
}

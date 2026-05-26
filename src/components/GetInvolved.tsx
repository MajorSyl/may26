import React, { useState, useEffect } from 'react';
import { submitInquiry } from '../firebase-service';
import { ContactInquiry } from '../types';
import { Heart, Users, Landmark, User, Mail, DollarSign, Check, Send, Sparkles } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'membership' | 'donation'>('donation');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states - Membership
  const [memName, setMemName] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memSubject, setMemSubject] = useState('Membership Inquiry');
  const [memMsg, setMemMsg] = useState('');

  // Form states - Donation
  const [donName, setDonName] = useState('');
  const [donEmail, setDonEmail] = useState('');
  const [donSelector, setDonSelector] = useState('Water, Sanitation, & Hygiene');
  const [donAmount, setDonAmount] = useState('150');

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName || !memEmail || !memMsg) return;

    setLoading(true);
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
      await submitInquiry(inquiry);
      setSuccess(true);
      setMemName('');
      setMemEmail('');
      setMemMsg('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donName || !donEmail || !donAmount) return;

    setLoading(true);
    const inquiry: ContactInquiry = {
      id: 'don_' + Math.random().toString(36).substr(2, 9),
      name: donName,
      email: donEmail,
      subject: `Donation Pledge: $${donAmount} for ${donSelector}`,
      message: `Pledged Donation Amount: $${donAmount}\nTarget Initiative: ${donSelector}`,
      type: 'Donation Inquiry',
      createdAt: new Date().toISOString()
    };

    try {
      await submitInquiry(inquiry);
      setSuccess(true);
      setDonName('');
      setDonEmail('');
      setDonAmount('150');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const donationTiers = [
    { value: '50', label: 'Buy Textbooks', desc: 'Secure 5 curriculum textbooks for Waterloo libraries.' },
    { value: '150', label: 'Midwife Safe Kit', desc: 'Provides sterile equipment & solar lamp for 1 childbirth.' },
    { value: '500', label: 'Clean Water Flow', desc: 'Funds structural well restoration & water diagnostic kits.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* 1. HEADER */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
          {settings.involvedBadge}
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          {settings.involvedTitle}
        </h1>
        <p className="text-slate-500 font-light leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
          {settings.involvedSubtitle}
        </p>
      </section>

      {/* 2. CHOOSE NAVIGATION ACCORDING TO PORTAL NEEDS */}
      <div className="flex md:max-w-md mx-auto bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          id="get-involved-don-btn"
          onClick={() => { setActiveTab('donation'); setSuccess(false); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-display rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'donation' 
              ? 'bg-white text-rotary-azure shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="h-4 w-4" />
          Pledge a Donation
        </button>

        <button
          id="get-involved-mem-btn"
          onClick={() => { setActiveTab('membership'); setSuccess(false); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-display rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'membership' 
              ? 'bg-white text-rotary-azure shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          Explore Membership
        </button>
      </div>

      {/* 3. CONDITIONAL MODULE FORM SCREEN */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Dynamic decorative backdrop sparkles */}
        <div className="absolute top-0 right-0 p-8 opacity-5 text-rotary-gold">
          <Sparkles className="h-24 w-24" />
        </div>

        {activeTab === 'donation' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-block bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded font-display">Financial Trail</span>
              <h3 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
                <Landmark className="h-5 w-5 text-rotary-gold" />
                Sunset Direct Donors Hub
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Pledged donations are logged in our database, and our treasury director will contact you directly to complete secure wire transfers or local mobile money processing.
              </p>
            </div>

            <form onSubmit={handleDonationSubmit} className="space-y-6">
              {/* Tiers grid */}
              <div className="space-y-2">
                <span className="block text:[10px] text-slate-500 font-bold uppercase tracking-wider font-display">Select Suggested Giving Tier</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {donationTiers.map(tier => {
                    const isSelected = donAmount === tier.value;
                    return (
                      <button
                        type="button"
                        key={tier.value}
                        id={`don-tier-${tier.value}`}
                        onClick={() => setDonAmount(tier.value)}
                        className={`p-4 border rounded-2xl text-left transition-all ${
                          isSelected 
                            ? 'border-rotary-azure bg-rotary-azure/5 shadow-xs ring-1 ring-rotary-azure' 
                            : 'border-slate-150 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-extrabold text-slate-800 font-display">${tier.value}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-rotary-azure"></span>}
                        </div>
                        <span className="block text-xs font-bold text-slate-700 mt-1">{tier.label}</span>
                        <span className="block text-[10px] text-slate-400 mt-1.5 leading-tight">{tier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom amount customizer if needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Custom Pledged Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                    <input
                      id="don-custom-amount"
                      type="number"
                      placeholder="Other Amount"
                      value={donAmount}
                      onChange={(e) => setDonAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Target Project Vector</label>
                  <select
                    id="don-vector-select"
                    value={donSelector}
                    onChange={(e) => setDonSelector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                  >
                    <option value="Water, Sanitation, & Hygiene">Water Sanitation (Tombo)</option>
                    <option value="Basic Education & Literacy">Literacy First (Waterloo books)</option>
                    <option value="Maternal & Child Health">Safe Motherhood Kits</option>
                    <option value="Disease Prevention & Treatment">Solar Clinic Cold Chains</option>
                    <option value="Supporting the Environment">Lumley Mangrove Plantation</option>
                  </select>
                </div>
              </div>

              {/* Donor Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                    <input
                      id="don-name-input"
                      type="text"
                      placeholder="e.g. Marie Conteh"
                      value={donName}
                      onChange={(e) => setDonName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Your Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                    <input
                      id="don-email-input"
                      type="email"
                      placeholder="e.g. marie@domain.sl"
                      value={donEmail}
                      onChange={(e) => setDonEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                id="pledge-submit-btn"
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-xs font-bold uppercase tracking-widest font-display rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
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
                    Donation Pledge Logged!
                  </>
                ) : (
                  <>
                    <Heart className="h-4.5 w-4.5" />
                    Record Pledge of ${donAmount} USD
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
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
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Full Name</label>
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
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Email Address</label>
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
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Your Area of Business or Profession</label>
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
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Tell us why you wish to join Rotary Sunset</label>
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
                className={`w-full py-4 text-xs font-bold uppercase tracking-widest font-display rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
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
        )}

        {success && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-xs text-emerald-800 font-bold uppercase font-display select-none animate-pulse">
            Your inquiry record has been written to the club's administration logs. Thank you!
          </div>
        )}
      </div>
    </div>
  );
}

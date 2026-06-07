import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldAlert, Users, Calendar, Clock, Globe } from 'lucide-react';
import { submitDbInquiry } from '../db-router';
import { ContactInquiry } from '../types';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<'Membership Inquiry' | 'Donation Inquiry' | 'General Contact'>('General Contact');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setErrorText('');
    setSuccess(false);

    const inquiry: ContactInquiry = {
      id: 'contact_p_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      subject: subject || `${type} from Contact Page`,
      message,
      type,
      createdAt: new Date().toISOString()
    };

    try {
      await submitDbInquiry(inquiry);
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      console.error(err);
      setErrorText('Could not write message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24 font-sans">
      {/* 1. INTRO HEADER */}
      <section className="space-y-2">
        <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-azure/20">
          Get in Touch
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-500 max-w-2xl font-light text-sm">
          Have an inquiry about participating in our sunset beach service drives? Interested in joining as a nominated guest or making an audited project donation? Reach out to our Executive board.
        </p>
      </section>

      {/* 2. BODY COLUMNS DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* MESSAGE TRANSMITTER FORM (Spans 7) */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold font-display text-slate-800">Transmit Safe Message</h2>
            <p className="text-xs text-slate-400 font-light">Your inquiry is routed directly to the Club President, Secretary, and Membership directors.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text:[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Full Names</label>
                <input
                  type="text"
                  placeholder="e.g. Sahr Kamanda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                  required
                />
              </div>

              <div>
                <label className="block text:[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text:[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Inquiry Focus</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-rotary-azure"
                >
                  <option value="General Contact">General Contact / Guest Greeting</option>
                  <option value="Membership Inquiry">Membership Nominations</option>
                  <option value="Donation Inquiry">Project Funding / Donations</option>
                </select>
              </div>

              <div>
                <label className="block text:[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Subject</label>
                <input
                  type="text"
                  placeholder="Quick summary topic"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                />
              </div>
            </div>

            <div>
              <label className="block text:[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Write Message Detail</label>
              <textarea
                placeholder="Details of your request..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-extrabold font-display uppercase text-[10px] tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Transmitting Inquiries...' : 'Transmit Message'}
            </button>

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <strong className="block font-bold">Successfully logged!</strong>
                  <span>Your message has been registered and synced with our central database list.</span>
                </div>
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs">{errorText}</span>
              </div>
            )}
          </form>
        </section>

        {/* HEADQUARTERS & CONTACT METRICS (Spans 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Map Placement Card */}
          <section className="bg-white rounded-3xl border border-slate-150 p-6 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm font-display tracking-tight uppercase">Meeting Coordinates</h3>
            
            <div className="rounded-2xl border border-slate-250 overflow-hidden h-40 relative">
              <div className="absolute inset-0 bg-sky-50 flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="h-7 w-7 text-rose-600 animate-bounce mb-2" />
                <span className="text-xs font-black text-slate-800 leading-tight">Lagoonda Hotel</span>
                <span className="text-[10px] text-slate-450 leading-tight">Cape Road, Aberdeen</span>
                <span className="text-[9px] text-slate-400 font-bold block mt-1 uppercase font-display select-none">Freetown, Sierra Leone</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-500 font-light leading-relaxed">
              <div className="flex gap-2.5">
                <Clock className="w-4 h-4 text-rotary-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700 font-bold text-[11px]">Thursday Sunsets at 6:30 PM</strong>
                  <span>We host weekly physical fellows and visiting Rotarians in the Mammy Yoko banquet wing.</span>
                </div>
              </div>

              <div className="flex gap-2.5 border-t border-slate-50 pt-3 mt-3">
                <Globe className="w-4 h-4 text-rotary-azure shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700 font-bold text-[11px]">Rotary District 9101</strong>
                  <span>Spanning multiple West African nations, striving to implement critical sanitation, literacy, health, and economic guidelines.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Contact Info */}
          <section className="bg-slate-900 text-slate-350 rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-white text-xs font-display tracking-widest uppercase">Secretariat Helpline</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-rotary-gold border border-slate-700">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 leading-none">Voice / WhatsApp</span>
                  <p className="text-white font-extrabold font-mono mt-0.5 text-sm">076827035</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-rotary-azure border border-slate-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 leading-none">Administrative Email</span>
                  <p className="text-white font-semibold font-mono mt-0.5">contact@freetownsunset.org</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-emerald-450 border border-slate-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 leading-none">Presidential Desk</span>
                  <p className="text-white font-semibold mt-0.5">rtn.president@freetownsunset.org</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

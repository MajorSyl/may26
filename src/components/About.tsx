import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Award, Compass, Heart, Award as Merit } from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../supabase-service';

export default function About() {
  const [activeTest, setActiveTest] = useState<number | null>(0);
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

  const fourWayTest = [
    {
      num: 1,
      q: 'Is it the TRUTH?',
      desc: 'We advocate for scientific truth, absolute financial clarity, and honest reporting. All club donation sheets are publicly audited.'
    },
    {
      num: 2,
      q: 'Is it FAIR to all concerned?',
      desc: 'We consult, listen, and partner with local community committees to guarantee equal resource distribution without bias.'
    },
    {
      num: 3,
      q: 'Will it build GOODWILL and BETTER FRIENDSHIPS?',
      desc: 'We bridge lines of profession and origin. Weekly meetings foster lifelong, collaborative friends unified by service.'
    },
    {
      num: 4,
      q: 'Will it be BENEFICIAL to all concerned?',
      desc: 'Our projects must leave a permanent, self-sustaining positive health, economic, or physical impact in Sierra Leone.'
    }
  ];

  const leadership = [
    {
      name: 'Rtn. Sahr Kamanda',
      role: 'Club President',
      desc: 'Local infrastructure expert pioneering municipal public development and Sunset operations management.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Dr. Fatmata Sesay',
      role: 'Service Projects Director',
      desc: 'Pediatric healthcare consultant spearheading RCFS Safe Motherhood and solar cooling distribution efforts.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Lansana Bangura',
      role: 'Membership Chair',
      desc: 'Senior vocational training advisor organizing outreach circles and corporate sunset fellowships.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {/* 1. HEADER SECTION */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex bg-rotary-gold/10 text-rotary-gold px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
          {settings.aboutHeaderBadge}
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          {settings.aboutHeaderTitle}
        </h1>
        <p className="text-slate-600 text-lg sm:text-slate-500 font-light leading-relaxed whitespace-pre-wrap">
          {settings.aboutHeaderDesc}
        </p>
      </section>

      {/* 2. VISION & MISSION CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow transition-all space-y-4">
          <div className="p-3 bg-rotary-azure/10 text-rotary-azure rounded-2xl w-fit">
            <Compass className="h-6 w-6" />
          </div>
          <span className="inline-block bg-rotary-azure/5 text-rotary-azure text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Directional Guide</span>
          <h3 className="text-xl font-bold font-display text-slate-800">{settings.aboutVisionTitle}</h3>
          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
            {settings.aboutVisionBody}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow transition-all space-y-4">
          <div className="p-3 bg-rotary-gold/10 text-rotary-gold rounded-2xl w-fit">
            <Heart className="h-6 w-6" />
          </div>
          <span className="inline-block bg-rotary-gold/5 text-rotary-gold text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-display">Service Standard</span>
          <h3 className="text-xl font-bold font-display text-slate-800">{settings.aboutMissionTitle}</h3>
          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
            {settings.aboutMissionBody}
          </p>
        </div>
      </section>

      {/* 3. THE FOUR WAY TEST - INTERACTIVE COMPONENT */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Glow ambient bubble */}
        <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 bg-rotary-azure/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-rotary-gold/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        <div className="lg:col-span-5 space-y-4 relative z-10">
          <div className="inline-flex bg-rotary-gold/20 text-rotary-gold border border-rotary-gold/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
            Ethical Guardrails
          </div>
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
            The Four-Way Test
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Of the things we think, say or do, Rotarians apply this ethical crucible. It governs every project commitment, budget vote, and community discussion.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-3 relative z-10">
          {fourWayTest.map((test, index) => {
            const isOpen = activeTest === index;
            return (
              <div 
                key={test.num}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                  isOpen 
                    ? 'bg-slate-800 border-rotary-gold/50 shadow-md' 
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                }`}
                onClick={() => setActiveTest(isOpen ? null : index)}
              >
                <div className="p-4 sm:p-5 flex justify-between items-center select-none">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-800/80 text-rotary-gold font-bold font-display flex items-center justify-center border border-slate-700">
                      {test.num}
                    </span>
                    <span className="font-extrabold font-display text-xs sm:text-sm text-white">
                      {test.q}
                    </span>
                  </div>
                  <span className="text-xl text-rotary-gold">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-800/30 font-light">
                    {test.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CLUB LEADERSHIP PROFILES */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-rotary-azure font-display">Board of Directors</div>
          <h2 className="text-3xl font-bold font-display text-rotary-dark">Club Leadership</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadership.map((leader, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Material Gold band accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-rotary-gold"></div>

              <div className="w-20 h-20 rounded-full border-2 border-rotary-azure overflow-hidden mx-auto shadow-sm">
                <img 
                  src={leader.avatarUrl} 
                  alt={leader.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="referrer"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold font-display text-sm text-slate-800">{leader.name}</h4>
                <p className="text-[10px] text-rotary-azure font-bold uppercase tracking-widest leading-none">{leader.role}</p>
              </div>

              <p className="text-xs text-slate-500 font-light leading-relaxed">
                {leader.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

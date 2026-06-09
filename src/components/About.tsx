import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Award, Compass, Heart, Award as Merit } from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, PageBlock, DEFAULT_ABOUT_LAYOUT } from '../supabase-service';

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
      name: 'Rtn. Abdul Manafi Kemokai',
      role: 'Club President',
      desc: 'Pioneering child rights advocate leading Municipal social and Sunset executive operations.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Adonis Abboud',
      role: 'Service Projects Director',
      desc: 'Senior telecommunication pioneer spearheading RCFS community connectivity and service initiatives.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Afouni Kwaku Ampadu',
      role: 'Membership Chair',
      desc: 'Eminent marketing champion guiding membership growth and professional fellowship development.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  ];

  const getBgStyles = (bgColor: PageBlock['bgColor']) => {
    switch (bgColor) {
      case 'dark':
        return 'bg-slate-900 border border-slate-800 text-white shadow-xl';
      case 'slate':
        return 'bg-slate-50 border border-slate-200 text-slate-850 shadow-sm';
      case 'brand':
        return 'bg-sky-50 border border-sky-100 text-slate-850 shadow-sm';
      case 'gold':
        return 'bg-amber-50 border border-amber-100 text-slate-850 shadow-sm';
      case 'light':
      default:
        return 'bg-white border border-slate-200 text-slate-850 shadow-sm';
    }
  };

  // Safe parsing block of dynamic sequences
  let layout: PageBlock[] = DEFAULT_ABOUT_LAYOUT;
  if (settings.aboutLayout) {
    try {
      layout = JSON.parse(settings.aboutLayout);
    } catch (e) {
      layout = DEFAULT_ABOUT_LAYOUT;
    }
  }

  // Segment renderer
  const renderBlock = (b: PageBlock) => {
    const bgStyles = getBgStyles(b.bgColor);
    const textStyle = b.bgColor === 'dark' ? 'text-white' : 'text-slate-800';
    const subtextStyle = b.bgColor === 'dark' ? 'text-slate-400' : 'text-slate-500';

    switch (b.id) {
      case 'header':
        return (
          <section key={b.id} className={`text-center space-y-4 max-w-5xl mx-auto p-8 sm:p-12 rounded-3xl transition-colors duration-500 ${bgStyles}`}>
            <div className="inline-flex bg-rotary-gold/15 text-rotary-gold px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-gold/25">
              {settings.aboutHeaderBadge}
            </div>
            <h1 className={`text-4xl font-extrabold font-display tracking-tight leading-snug ${textStyle}`}>
              {settings.aboutHeaderTitle}
            </h1>
            <p className={`text-sm sm:text-base font-light leading-relaxed whitespace-pre-wrap max-w-3xl mx-auto ${subtextStyle}`}>
              {settings.aboutHeaderDesc}
            </p>
          </section>
        );

      case 'vision_mission':
        return (
          <section key={b.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className={`p-8 rounded-3xl space-y-4 transition-colors duration-500 ${bgStyles}`}>
              <div className="p-3 bg-rotary-azure/10 text-rotary-azure rounded-2xl w-fit">
                <Compass className="h-6 w-6" />
              </div>
              <span className="inline-block bg-rotary-azure/5 text-rotary-azure text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded leading-none">Directional Guide</span>
              <h3 className={`text-xl font-bold font-display ${textStyle}`}>{settings.aboutVisionTitle}</h3>
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${subtextStyle}`}>
                {settings.aboutVisionBody}
              </p>
            </div>

            <div className={`p-8 rounded-3xl space-y-4 transition-colors duration-500 ${getBgStyles(b.bgColor === 'light' ? 'gold' : b.bgColor)}`}>
              <div className="p-3 bg-rotary-gold/15 text-rotary-gold rounded-2xl w-fit border border-rotary-gold/25">
                <Heart className="h-6 w-6" />
              </div>
              <span className="inline-block bg-rotary-gold/5 text-rotary-gold text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-display leading-none">Service Standard</span>
              <h3 className={`text-xl font-bold font-display ${textStyle}`}>{settings.aboutMissionTitle}</h3>
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${subtextStyle}`}>
                {settings.aboutMissionBody}
              </p>
            </div>
          </section>
        );

      case 'four_way_test':
        return (
          <section key={b.id} className={`p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl relative overflow-hidden transition-colors duration-500 ${
            b.bgColor === 'dark' ? 'bg-slate-900 border border-slate-800 text-white' : bgStyles
          }`}>
            {/* Glow ambient bubble */}
            <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 bg-rotary-azure/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-rotary-gold/5 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

            <div className="lg:col-span-5 space-y-4 relative z-10">
              <div className="inline-flex bg-rotary-gold/20 text-rotary-gold border border-rotary-gold/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
                Ethical Guardrails
              </div>
              <h2 className={`text-3xl font-extrabold font-display tracking-tight leading-tight ${b.bgColor === 'dark' ? 'text-white' : textStyle}`}>
                The Four-Way Test
              </h2>
              <p className={`text-xs leading-relaxed ${b.bgColor === 'dark' ? 'text-slate-400' : subtextStyle}`}>
                Of the things we think, say or do, Rotarians apply this ethical crucible. It governs every project commitment, budget vote, and community discussion.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-3 relative z-10">
              {fourWayTest.map((test, index) => {
                const isOpen = activeTest === index;
                const headingColor = b.bgColor === 'dark' 
                  ? 'text-white' 
                  : isOpen ? 'text-indigo-950' : 'text-slate-800';

                return (
                  <div 
                    key={test.num}
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                      isOpen 
                        ? b.bgColor === 'dark' ? 'bg-slate-800 border-rotary-gold/50 shadow-md' : 'bg-slate-100 border-indigo-200 shadow-xs'
                        : b.bgColor === 'dark' ? 'bg-slate-950/40 border-slate-850 hover:border-slate-800' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setActiveTest(isOpen ? null : index)}
                  >
                    <div className="p-4 sm:p-5 flex justify-between items-center select-none">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-slate-850 text-rotary-gold font-bold font-display flex items-center justify-center border border-slate-700/50">
                          {test.num}
                        </span>
                        <span className={`font-extrabold font-display text-xs sm:text-sm ${headingColor}`}>
                          {test.q}
                        </span>
                      </div>
                      <span className="text-xl text-rotary-gold">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    
                    {isOpen && (
                      <div className={`px-5 pb-5 pt-1 text-xs leading-relaxed border-t font-light ${
                        b.bgColor === 'dark' 
                          ? 'text-slate-300 border-slate-800 bg-slate-800/30' 
                          : 'text-slate-600 border-slate-150 bg-slate-50/50'
                      }`}>
                        {test.desc}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case 'leadership':
        return (
          <section key={b.id} className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-rotary-azure font-display">Board of Directors</div>
              <h2 className="text-3xl font-bold font-display text-rotary-dark">Club Leadership</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leadership.map((leader, index) => (
                <div 
                  key={index} 
                  className={`border p-6 text-center space-y-4 rounded-3xl transition-colors duration-500 relative overflow-hidden ${bgStyles}`}
                >
                  {/* Gold band accent */}
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
                    <h4 className={`font-extrabold font-display text-sm ${textStyle}`}>{leader.name}</h4>
                    <p className="text-[10px] text-rotary-azure font-bold uppercase tracking-widest leading-none">{leader.role}</p>
                  </div>

                  <p className={`text-xs font-light leading-relaxed ${subtextStyle}`}>
                    {leader.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {layout
        .filter(b => b.visible !== false)
        .map(b => renderBlock(b))}
    </div>
  );
}

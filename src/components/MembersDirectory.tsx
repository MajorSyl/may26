import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INITIAL_MEMBER_DIRECTORY } from '../data';
import { Search, Shield, Award, Calendar, Phone, Mail, Filter, BookOpen, Crown, UserCheck } from 'lucide-react';

interface PastPresident {
  name: string;
  year: string;
  classification: string;
  avatarUrl: string;
}

export default function MembersDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'executives' | 'phfs' | 'past-presidents'>('all');

  // Hardcoded rich lists of Executives, Past Presidents, and extended members for a top-tier authentic experience
  const executives: UserProfile[] = [
    {
      uid: 'exec_sahr_kamanda',
      name: 'Rtn. Sahr Kamanda',
      email: 'rtn.president@freetownsunset.org',
      role: 'President',
      attendanceRate: 98,
      contributionGoals: 2000,
      contributedAmount: 2000,
      committee: 'Executive Board',
      isPaulHarrisFellow: true,
      paulHarrisLevel: 'PHF+3',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      classification: 'Engineering - Infrastructure Consultancy',
      phone: '+232 77 459 321',
      joinedDate: '2021-08-15'
    },
    {
      uid: 'exec_fatmata_sesay',
      name: 'Rtn. Dr. Fatmata Sesay',
      email: 'rtn.officer@freetownsunset.org',
      role: 'Club Officer', // Served as President Elect
      attendanceRate: 95,
      committee: 'Service Projects Committee',
      isPaulHarrisFellow: true,
      paulHarrisLevel: 'PHF+1',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      classification: 'Medicine - Pediatric Consultant',
      phone: '+232 76 882 104',
      joinedDate: '2022-03-10'
    },
    {
      uid: 'exec_dennis_bright',
      name: 'Rtn. Dennis Bright',
      email: 'rtn.secretary@freetownsunset.org',
      role: 'Club Officer', // Club Secretary
      committee: 'Executive & Admin Board',
      isPaulHarrisFellow: true,
      paulHarrisLevel: 'PHF',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      classification: 'Public Administration - Urban Development',
      phone: '+232 76 114 908',
      joinedDate: '2021-11-05'
    },
    {
      uid: 'exec_josephine_sheriff',
      name: 'Rtn. Josephine Sheriff',
      email: 'rtn.treasurer@freetownsunset.org',
      role: 'Club Officer', // Club Treasurer
      committee: 'Finance Committee',
      isPaulHarrisFellow: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      classification: 'Finance - Commercial Banking Director',
      phone: '+232 30 522 194',
      joinedDate: '2022-02-18'
    },
    {
      uid: 'exec_lansana_bangura',
      name: 'Rtn. Lansana Bangura',
      email: 'rtn.membership@freetownsunset.org',
      role: 'Club Officer', // Membership Chair
      committee: 'Membership Committee',
      isPaulHarrisFellow: true,
      paulHarrisLevel: 'PHF',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      classification: 'Education - Vocational Training Advisor',
      phone: '+232 78 514 209',
      joinedDate: '2022-11-20'
    }
  ];

  const pastPresidents: PastPresident[] = [
    {
      name: 'Rtn. Alpha Cham',
      year: '2025 - 2026',
      classification: 'Information Technology Services',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Josephine Sesay',
      year: '2024 - 2025',
      classification: 'Public Health Administration',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Sorieba Daffae',
      year: '2023 - 2024',
      classification: 'Legal Practice - Maritime Law',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Finda Kuyembeh',
      year: '2022 - 2023',
      classification: 'Non-Governmental Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Rtn. Christian George',
      year: '2021 - 2022 (Charter Year)',
      classification: 'Logistics & Supply Chain Management',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  ];

  // Combine & extend general roster of active members, deduplicating with Executives
  const allActiveMembers: UserProfile[] = [
    ...executives,
    // Add additional ones from INITIAL_MEMBER_DIRECTORY not already in executives
    ...INITIAL_MEMBER_DIRECTORY.filter(m => !executives.some(e => e.uid === m.uid && e.name === m.name))
  ];

  // Filtering computational logic
  const filteredActive = allActiveMembers.filter(m => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(term) ||
      (m.classification && m.classification.toLowerCase().includes(term)) ||
      (m.committee && m.committee.toLowerCase().includes(term));
      
    if (activeSubTab === 'executives') {
      return matchesSearch && executives.some(e => e.name === m.name);
    }
    if (activeSubTab === 'phfs') {
      return matchesSearch && m.isPaulHarrisFellow;
    }
    return matchesSearch;
  });

  const filteredPastPresidents = pastPresidents.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.classification.toLowerCase().includes(term) || p.year.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24 font-sans">
      {/* 1. SECTION INTRO */}
      <section className="space-y-2">
        <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-azure/20">
          Sunset Fellowship Roster
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          Members Directory
        </h1>
        <p className="text-slate-500 max-w-2xl font-light text-sm">
          Meet the dedicated business leaders, executives, and professionals who constitute the Rotary Club of Freetown Sunset. Together we advocate for the ultimate civic standards under "Service Above Self".
        </p>
      </section>

      {/* 2. TAB TOGGLES & SEARCH FILTER PANEL */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sub-tabs inside Directory */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 ${
              activeSubTab === 'all'
                ? 'bg-rotary-azure text-white border-rotary-azure shadow-xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Charter & Active
          </button>
          
          <button
            onClick={() => setActiveSubTab('executives')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 ${
              activeSubTab === 'executives'
                ? 'bg-rotary-azure text-white border-rotary-azure shadow-xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Board Executives
          </button>

          <button
            onClick={() => setActiveSubTab('phfs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 ${
              activeSubTab === 'phfs'
                ? 'bg-rotary-azure text-white border-rotary-azure shadow-xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Paul Harris Fellows
          </button>

          <button
            onClick={() => setActiveSubTab('past-presidents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 ${
              activeSubTab === 'past-presidents'
                ? 'bg-rotary-azure text-white border-rotary-azure shadow-xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Past Presidents
          </button>
        </div>

        {/* Global Directory Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search roster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 font-semibold focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </section>

      {/* 3. ROSTER CONTAINER */}
      {activeSubTab === 'past-presidents' ? (
        // Rendering Past Presidents
        filteredPastPresidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-500">
            No past presidents matching "{searchTerm}" were found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPastPresidents.map((p, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between group"
              >
                {/* Visual marker of previous leadership */}
                <div className="h-14 w-full bg-gradient-to-r from-rotary-azure/80 to-rotary-gold/50 relative overflow-hidden shrink-0">
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs p-1.5 rounded-full shadow-xs">
                    <Crown className="w-3.5 h-3.5 text-rotary-gold" />
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 space-y-4 relative flex-1 flex flex-col justify-between">
                  {/* Floating Overlapping Avatar */}
                  <div className="flex items-start gap-4">
                    <img 
                      src={p.avatarUrl} 
                      alt={p.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md -mt-10 bg-slate-100 shrink-0 transform group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="pt-2">
                      <h3 className="font-extrabold text-slate-850 text-sm font-display leading-tight">{p.name}</h3>
                      <p className="text-[9px] text-rotary-azure font-display font-bold leading-none tracking-wider uppercase mt-1">Past President</p>
                    </div>
                  </div>

                  {/* Classification Details */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 flex-1">
                    <div className="flex items-start gap-2">
                      <Shield className="w-3.5 h-3.5 text-rotary-azure/60 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Rotary Classification</span>
                        <span className="font-semibold text-[11px] text-slate-700">{p.classification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Past President Service Year Badge (Footer element inside content card) */}
                  <div className="bg-rotary-gold/10 border border-rotary-gold/25 rounded-2xl p-2.5 text-center flex items-center justify-center gap-1.5 shrink-0">
                    <Award className="w-3.5 h-3.5 text-rotary-gold-dark" />
                    <span className="text-[10px] font-bold text-rotary-gold-dark font-display uppercase tracking-wider">Distinguished Year: {p.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Rendering Active & Extended Members
        filteredActive.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-500">
            No members matching "{searchTerm}" found in this section.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActive.map((m) => {
              const isExec = executives.some(e => e.uid === m.uid || e.name === m.name);
              
              return (
                <div 
                  key={m.uid}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  {/* Decorative Profile Banner */}
                  <div className={`h-16 w-full relative overflow-hidden shrink-0 ${
                    isExec 
                      ? 'bg-gradient-to-r from-rotary-azure to-rotary-gold/85' 
                      : m.isPaulHarrisFellow 
                        ? 'bg-gradient-to-r from-rotary-azure/90 via-slate-700 to-indigo-900/60' 
                        : 'bg-gradient-to-r from-slate-200/80 to-slate-200/30'
                  }`}>
                    {/* Floating Leadership Stamp */}
                    {isExec && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs">
                        <span className="text-[8px] font-extrabold text-amber-800 font-display uppercase tracking-wider">
                          {m.role === 'President' ? 'President' : m.committee === 'Finance Committee' ? 'Treasurer' : m.name.includes('Dennis') ? 'Secretary' : 'Director'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6 pt-2 space-y-4 relative flex-1 flex flex-col justify-between">
                    {/* Floating Circular Avatar overlapping banner */}
                    <div className="flex items-start gap-4">
                      <img 
                        src={m.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'} 
                        alt={m.name}
                        className="w-18 h-18 rounded-full object-cover border-4 border-white shadow-md -mt-11 bg-white shrink-0 transform group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="pt-1.5 flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-850 group-hover:text-rotary-azure transition-colors text-sm font-display leading-tight truncate">{m.name}</h3>
                        <p className="text-[9px] text-slate-400 font-mono font-medium truncate mt-0.5">{m.email}</p>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-3 text-xs text-slate-500 flex-1 leading-snug">
                      {m.classification && (
                        <div className="flex items-start gap-2.5">
                          <Shield className="w-3.5 h-3.5 text-rotary-azure/60 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Roster Classification</span>
                            <span className="font-semibold text-[11px] text-slate-700">{m.classification}</span>
                          </div>
                        </div>
                      )}

                      {m.committee && (
                        <div className="flex items-start gap-2.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500/60 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Active Committee</span>
                            <span className="text-[11px] text-slate-700 font-medium">{m.committee}</span>
                          </div>
                        </div>
                      )}

                      {m.joinedDate && (
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-400">Joined Sunset: {new Date(m.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Paul Harris Fellow or Active Roster Footer */}
                  <div className={`px-6 py-3.5 flex items-center justify-between text-[10px] border-t select-none ${
                    m.isPaulHarrisFellow 
                      ? 'bg-amber-50/55 border-amber-200/60 text-amber-900' 
                      : 'bg-slate-50/65 border-slate-100 text-slate-500'
                  }`}>
                    {m.isPaulHarrisFellow ? (
                      <div className="flex items-center gap-1.5 text-rotary-gold-dark font-extrabold uppercase tracking-wider font-display shrink-0">
                        <Award className="w-4 h-4 fill-rotary-gold text-white animate-pulse" />
                        <span>{m.paulHarrisLevel || 'Paul Harris Fellow'}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-bold uppercase tracking-wider font-display text-[9px]">Active Sunset Member</span>
                    )}

                    {/* Quick Dial & Contact Row */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.phone && (
                        <a 
                          href={`tel:${m.phone}`}
                          title={`Call ${m.name}`}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rotary-azure hover:border-rotary-azure hover:shadow-2xs transition-all active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a 
                        href={`mailto:${m.email}`}
                        title={`Email ${m.name}`}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rotary-azure hover:border-rotary-azure hover:shadow-2xs transition-all active:scale-95"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

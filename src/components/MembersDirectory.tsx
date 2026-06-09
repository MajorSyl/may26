import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_MEMBER_DIRECTORY } from '../data';
import { Search, Shield, Award, Calendar, Phone, Mail, Filter, BookOpen, Crown, UserCheck, Lock, EyeOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { getDbUsers } from '../db-router';

interface PastPresident {
  name: string;
  year: string;
  classification: string;
  avatarUrl: string;
}

const getInitials = (name: string) => {
  const cleaned = name.replace(/Rtn\.\s+/g, '');
  const parts = cleaned.split(' ').filter(p => p.length > 0);
  return parts
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getGradientClass = (name: string) => {
  const cleaned = name.replace(/Rtn\.\s+/g, '');
  const code = cleaned.charCodeAt(0) % 5;
  const gradients = [
    'from-blue-600 to-[#00246B]', // Slate Rotary Blue
    'from-amber-500 to-orange-600', // Gold Sunset
    'from-emerald-600 to-teal-500', // Eco green
    'from-indigo-600 to-violet-700', // Royal purple
    'from-rose-500 to-pink-600'  // Pink charm
  ];
  return gradients[code];
};

export default function MembersDirectory() {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'executives' | 'phfs'>('all');
  const [allActiveMembers, setAllActiveMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const uList = await getDbUsers();
        if (uList && uList.length > 0) {
          setAllActiveMembers(uList);
        } else {
          setAllActiveMembers(INITIAL_MEMBER_DIRECTORY);
        }
      } catch (err) {
        console.error('Failed to load database users:', err);
        setAllActiveMembers(INITIAL_MEMBER_DIRECTORY);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Dynamically filter executives from the membership database
  const executives: UserProfile[] = allActiveMembers.filter(
    m => m.role === 'President' || m.role === 'Club Officer'
  );

  // Filtering computational logic
  const filteredActive = allActiveMembers.filter(m => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(term) ||
      (m.classification && m.classification.toLowerCase().includes(term)) ||
      (m.committee && m.committee.toLowerCase().includes(term));
      
    if (activeSubTab === 'executives') {
      return matchesSearch && executives.some(e => e.name === m.name || e.uid === m.uid);
    }
    if (activeSubTab === 'phfs') {
      return matchesSearch && m.isPaulHarrisFellow;
    }
    return matchesSearch;
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

      {/* Privacy Guard Reassuring Banner */}
      <div className="bg-slate-50 border border-slate-150/80 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-3xs">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-orange-50 text-amber-600 border border-orange-100 shrink-0">
            <Lock className="w-4 h-4 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide leading-none font-display">
              {language === 'krio' ? '🔐 Prativet En Kɔnfidɛnshal Safti' : '🔐 Private & Confidential Protection'}
            </h4>
            <p className="text-[11.5px] text-slate-500 font-medium leading-snug">
              {language === 'krio' 
                ? 'Fɔ mɛmba dɛn yon tin dɛn dey shur, wi dɔn mask/kiba mɛmba dɛn fon nɔmba and imel to di public so nobody go steal am. Ɔl pratik mɛmba dɛn kin luk am na di secure Portal.'
                : 'To prevent unsolicited automated spam or privacy exposure, active members\' emails and phone numbers are securely obfuscated from public directories. Complete profiles remain accessible via the secure Portal.'}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100/60 font-display text-[9px] font-black uppercase tracking-wider rounded-lg shrink-0 select-none">
          <Shield className="w-3.5 h-3.5 fill-emerald-100" />
          {language === 'krio' ? 'Sɛf fɔ Luk' : 'Secure / Protected'}
        </div>
      </div>

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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 space-y-3">
          <RefreshCw className="h-8 w-8 text-rotary-azure animate-spin" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Querying Chapter member profiles...</p>
        </div>
      ) : filteredActive.length === 0 ? (
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
                      {m.avatarUrl ? (
                        <img 
                          src={m.avatarUrl} 
                          alt={m.name}
                          className="w-18 h-18 rounded-full object-cover border-4 border-white shadow-md -mt-11 bg-white shrink-0 transform group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-18 h-18 rounded-full border-4 border-white shadow-md -mt-11 bg-gradient-to-br ${getGradientClass(m.name)} text-white flex items-center justify-center font-bold text-lg shrink-0 transform group-hover:scale-105 transition-transform duration-300 font-display font-sans uppercase`}>
                          {getInitials(m.name)}
                        </div>
                      )}
                      <div className="pt-1.5 flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-850 group-hover:text-rotary-azure transition-colors text-sm font-display leading-tight truncate">{m.name}</h3>
                        <p className="text-[9px] text-slate-400 font-mono font-semibold truncate mt-0.5 flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5 inline text-amber-500/70" /> {m.email}
                        </p>
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

                      {m.birthday && (
                        <div className="flex items-center gap-2.5">
                          <span className="w-3.5 h-3.5 text-xs text-center leading-none">🎂</span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {language === 'krio' ? 'Spɛshal bɔt-de:' : 'Sunset Birthday:'} <span className="text-pink-600 font-extrabold">{m.birthday}</span>
                          </span>
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
                        <button 
                          onClick={() => alert(language === 'krio' ? 'Dis mɛmba in nɔmba dɔn kiba/mask fɔ prɔtɛkt in yon safti.' : 'This member\'s contact phone is securely masked to guarantee privacy protection.')}
                          title={`Call ${m.name}`}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-400 hover:shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => alert(language === 'krio' ? 'Dis mɛmba in imel dɔn kiba/mask fɔ prɔtɛkt in yon safti.' : 'This member\'s contact email is securely masked to guarantee privacy protection.')}
                        title={`Email ${m.name}`}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-400 hover:shadow-2xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
}

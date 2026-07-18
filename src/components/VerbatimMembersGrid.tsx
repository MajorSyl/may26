import React, { useState } from 'react';
import { Shield, Search, Sparkles, Filter, Grid, RefreshCw } from 'lucide-react';
import SafeImage from './SafeImage';
import { FULL_MEMBER_LIST } from '../member-data';

// Derived directly from FULL_MEMBER_LIST (the single source of truth in
// member-data.ts) rather than a separately hand-maintained list, so this
// roster can never drift out of sync with corrected names/classifications.
const VERBATIM_MEMBER_LIST = FULL_MEMBER_LIST.map(m => ({
  name: m.name,
  classification: m.classification || ''
}));

export default function VerbatimMembersGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'first' | 'last'>('none');

  const filteredMembers = VERBATIM_MEMBER_LIST.filter(member => {
    const term = searchTerm.toLowerCase();
    const fullName = member.name.toLowerCase();
    const classification = member.classification.toLowerCase();
    return fullName.includes(term) || classification.includes(term);
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'first') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'last') {
      const aLast = a.name.split(' ').slice(-1)[0];
      const bLast = b.name.split(' ').slice(-1)[0];
      return aLast.localeCompare(bLast);
    }
    return 0; // maintain original roster index
  });

  return (
    <div className="space-y-8 py-6">
      <div className="bg-slate-50/70 border border-slate-200/60 rounded-3xl p-6 space-y-4">
        {/* Statistics & Intro Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rotary-azure" />
              Verbatim Extracted Roster
            </h2>
            <p className="text-xs text-slate-550 mt-1">
              Active Chapter Membership data extracted with verbatim, zero-correction accuracy. Tel No, Email, and birthdays are strictly omitted for privacy defense.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-600 shadow-3xs shrink-0 self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-rotary-gold" />
            <span>Count: <strong className="text-rotary-azure font-extrabold">{VERBATIM_MEMBER_LIST.length} Members</strong></span>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Roster Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by verbatim name or classification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 font-semibold focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure focus:outline-none transition-all"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Sort By:
            </span>
            <div className="flex gap-1.5 w-full">
              <button
                onClick={() => setSortBy('none')}
                className={`flex-1 py-2 px-3 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 border ${
                  sortBy === 'none'
                    ? 'bg-rotary-azure text-white border-rotary-azure'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                No. Order
              </button>
              <button
                onClick={() => setSortBy('first')}
                className={`flex-1 py-2 px-3 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 border ${
                  sortBy === 'first'
                    ? 'bg-rotary-azure text-white border-rotary-azure'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                First Name
              </button>
              <button
                onClick={() => setSortBy('last')}
                className={`flex-1 py-2 px-3 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 border ${
                  sortBy === 'last'
                    ? 'bg-rotary-azure text-white border-rotary-azure'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Last Name
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Profile Cards */}
      {sortedMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-500 text-xs font-semibold">
          No members matches the query "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedMembers.map((member, idx) => {
            const rawIndex = VERBATIM_MEMBER_LIST.findIndex(m => m.name === member.name) + 1;
            const fullName = member.name;

            return (
              <div
                key={`${member.name}-${idx}`}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-rotary-azure/30 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group h-full"
              >
                {/* Fallback avatar preview utilizing SafeImage */}
                <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden shrink-0">
                  <SafeImage
                    src=""
                    alt={fullName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  {/* Absolute positioning index banner */}
                  <div className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 select-none">
                    Roster #{rawIndex}
                  </div>
                </div>

                {/* Profile Data Block */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-rotary-gold font-bold font-sans uppercase tracking-widest block font-medium leading-none">
                      Active Member
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-tight group-hover:text-rotary-azure transition-colors leading-snug line-clamp-2">
                      {fullName}
                    </h3>
                  </div>

                  {/* Classification Area */}
                  <div className="border-t border-slate-100 pt-3 flex items-start gap-2.5">
                    <Shield className="w-3.5 h-3.5 text-rotary-azure/60 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                        Classification
                      </span>
                      <span className="font-semibold text-[11px] text-slate-700 block truncate mt-1" title={member.classification}>
                        {member.classification}
                      </span>
                    </div>
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

import React, { useState } from 'react';
import { Shield, Search, Sparkles, Filter, Grid, RefreshCw } from 'lucide-react';
import SafeImage from './SafeImage';

export interface VerbatimMember {
  firstName: string;
  lastName: string;
  classification: string;
}

export const VERBATIM_MEMBER_LIST: VerbatimMember[] = [
  { firstName: "Abdul Manafi", lastName: "Kemokai", classification: "Child Rights" },
  { firstName: "Adonis", lastName: "Abboud", classification: "External Telecommunications" },
  { firstName: "Afouni", lastName: "Kwaku Ampadu", classification: "Sales& Marketing" },
  { firstName: "Agatha", lastName: "SerikiVandy", classification: "Education" },
  { firstName: "Agnes", lastName: "Ann Wairimu", classification: "HRM & Strategic Management" },
  { firstName: "Ahmad", lastName: "Wurie", classification: "Civil Engineering" },
  { firstName: "Aina", lastName: "Moore", classification: "Commercial Banking & Management" },
  { firstName: "Ajara Marie", lastName: "Bomah", classification: "Social Entrepreneur" },
  { firstName: "Alex", lastName: "Pratt", classification: "Accounting and Finance" },
  { firstName: "Alex", lastName: "NalloJr", classification: "Entrepreneurship" },
  { firstName: "Alison", lastName: "French", classification: "Communications" },
  { firstName: "Amara", lastName: "Oluwole", classification: "Edupreneur" },
  { firstName: "Arnold", lastName: "Dixon", classification: "Banking" },
  { firstName: "Arthur", lastName: "Johnson", classification: "Consultancy" },
  { firstName: "Avril Beduni", lastName: "Renner", classification: "Accounting & Auditing" },
  { firstName: "Balfour", lastName: "Nketiah-Sarpong", classification: "Chartered Insurance (Insurance Broker)" },
  { firstName: "Bridget", lastName: "Mogobo", classification: "Information Technology" },
  { firstName: "Cecil", lastName: "Olo-Williams", classification: "Engineer/Systems Administrator" },
  { firstName: "Cecilia", lastName: "B. Browne", classification: "Education" },
  { firstName: "Davidson", lastName: "PetersJohn", classification: "Finance Consultancy" },
  { firstName: "Emerlin", lastName: "George", classification: "Governance& Administration" },
  { firstName: "Esther", lastName: "Johnson", classification: "Banking" },
  { firstName: "Fatmata", lastName: "Carew", classification: "Tourism Management" },
  { firstName: "Georgette", lastName: "Okyne", classification: "Civil Engineering" },
  { firstName: "Haja", lastName: "Yeroh Bah", classification: "PublicHealth" },
  { firstName: "Ibrahim", lastName: "Bangura", classification: "Law & Governance" },
  { firstName: "Jane", lastName: "Masobu", classification: "Human Resources & Administration" },
  { firstName: "Jestina", lastName: "Betts", classification: "Human Resource Management" },
  { firstName: "Lauratu", lastName: "Johnson", classification: "Accounting" },
  { firstName: "Lawrence", lastName: "Sesay", classification: "Information Technology & Systems" },
  { firstName: "Leslie", lastName: "Gordon-Browne", classification: "BusinessDevelopment" },
  { firstName: "Mudunotu", lastName: "Senesie- Kamara", classification: "International Civil Service" },
  { firstName: "Munya", lastName: "Abdulai", classification: "PublicAdministration" },
  { firstName: "Mariama", lastName: "Sesay", classification: "PharmaceuticalOperations" },
  { firstName: "Mariama Ruth Jacinta", lastName: "Jassik-Sankoh", classification: "Law" },
  { firstName: "Melvina", lastName: "Brocke-Betts", classification: "Education" },
  { firstName: "Miatta", lastName: "French", classification: "Electoral Administration" },
  { firstName: "Michaela", lastName: "Serry", classification: "Corporate Law" },
  { firstName: "Millicent", lastName: "Cole", classification: "Corporate Banking" },
  { firstName: "Myra Bernard", lastName: "Stevens", classification: "Global Public Health" },
  { firstName: "Manyoka", lastName: "E. Mutulya", classification: "Accounting and Finance" },
  { firstName: "Noel", lastName: "Asare-Roberts", classification: "IT&Real Estate Consultancy" },
  { firstName: "Pauline", lastName: "Wanjiru Kibe", classification: "Project management" },
  { firstName: "Sajo", lastName: "Yanku", classification: "Tax and Accounting" },
  { firstName: "Sallieu", lastName: "Kanu", classification: "BusinessDevelopment" },
  { firstName: "Sam", lastName: "Kumbo-Leigh", classification: "BusinessManagement" },
  { firstName: "Stephen", lastName: "Kabba", classification: "Network Technology" },
  { firstName: "Sylvia", lastName: "Fusu-luki", classification: "Medicine" },
  { firstName: "Ulaoma Festus", lastName: "Omo-Obi", classification: "Health Systems & Development Management" },
  { firstName: "Victor", lastName: "Williams", classification: "Banking" },
  { firstName: "Wilhelmina", lastName: "Sho-Cole", classification: "GovernanceProgramme" },
  { firstName: "Yasmine", lastName: "Ibrahim", classification: "Content Creation" },
  { firstName: "Josephine", lastName: "Konia", classification: "Administeration" },
  { firstName: "Musa", lastName: "Mansaray", classification: "Procurement and Supply Chain Management Specialists" },
  { firstName: "George", lastName: "Marke", classification: "Accounting and Finance" },
  { firstName: "Evans Lyndon", lastName: "Baine-Johnson", classification: "Environmental Management" },
  { firstName: "Emeka", lastName: "Okechuwa", classification: "Pharmacist" },
  { firstName: "Crispin", lastName: "M. Kaikai", classification: "Clergy" },
  { firstName: "Elijah", lastName: "Koroma", classification: "Technology Management" }
];

export default function VerbatimMembersGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'first' | 'last'>('none');

  const filteredMembers = VERBATIM_MEMBER_LIST.filter(member => {
    const term = searchTerm.toLowerCase();
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const classification = member.classification.toLowerCase();
    return fullName.includes(term) || classification.includes(term);
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'first') {
      return a.firstName.localeCompare(b.firstName);
    }
    if (sortBy === 'last') {
      return a.lastName.localeCompare(b.lastName);
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
            const rawIndex = VERBATIM_MEMBER_LIST.findIndex(
              m => m.firstName === member.firstName && m.lastName === member.lastName
            ) + 1;
            const fullName = `${member.firstName} ${member.lastName}`;

            return (
              <div
                key={`${member.firstName}-${member.lastName}-${idx}`}
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

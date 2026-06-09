import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Award, Shuffle, MapPin, Calendar, Heart, BadgeCheck, CheckCircle } from 'lucide-react';
import { FULL_MEMBER_LIST } from '../member-data';
import SafeImage from './SafeImage';

// Curated biographies & photos for key members to display rich and authentic spotlights
const MEMBER_SPOTLIGHTS = [
  {
    uid: 'mem_1',
    bio: 'Abdul has spearheaded the expansion of our clean water installations in the outer sectors of Freetown. His devotion to child rights ensures all of our sanitation designs prioritize security and comfort for school-going children.',
    photoUrl: '',
    contribution: 'Led Clean Water Well Expansion'
  },
  {
    uid: 'mem_2',
    bio: 'Adonis leverages over two decades of professional experience to bridge the Sunset Club with international Rotary networks. He oversees our annual charity auction and equipment logistics for regional medical clinics.',
    photoUrl: '',
    contribution: 'Chairs International Supply Logistics'
  },
  {
    uid: 'mem_4',
    bio: 'Agatha has pioneered our community library reading score audits. She energetically drives our weekly secondary school book distributions and local literacy development campaigns across coastal Freetown.',
    photoUrl: '',
    contribution: 'Pioneered Library Reading Score Audits'
  },
  {
    uid: 'mem_5',
    bio: 'Agnes organizes our dynamic vocational programs for youth and girls. She brings immense heart and structure to establishing our specialized training sessions, helping raise financial stability directly in beach communities.',
    photoUrl: '',
    contribution: 'Hosted Vocational Career Initiatives'
  },
  {
    uid: 'mem_8',
    bio: 'Ajara connects our humanitarian projects with local micro-entrepreneurs. She plays a foundational role in planning beachside hygiene advocacy and fostering resilient micro-credit support for Freetown families.',
    photoUrl: '',
    contribution: 'Advocates Beach Hygiene Initiatives'
  },
  {
    uid: 'mem_25',
    bio: 'Haja leverages her public health expertise to audit and refine our local community projects. She coordinates with Freetown clinicians to implement medical kit distributions and child check-up drives.',
    photoUrl: '',
    contribution: 'Coordinated Clinical Health Kits'
  },
  {
    uid: 'mem_26',
    bio: 'Ibrahim advises our executive project boards on regulatory and environmental compliance. He leads our hands-on coastal mangrove reforestation team protecting Aberdeen from severe ocean erosion.',
    photoUrl: '',
    contribution: 'Leads Mangrove Coastline Stabilization'
  }
];

export default function MemberSpotlight() {
  const [selectedSpotlight, setSelectedSpotlight] = useState<any>(null);
  const [index, setIndex] = useState(0);

  // Initialize with a random spotlit member
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * MEMBER_SPOTLIGHTS.length);
    setIndex(randomIdx);
    loadMember(randomIdx);
  }, []);

  const loadMember = (idx: number) => {
    const spot = MEMBER_SPOTLIGHTS[idx];
    const original = FULL_MEMBER_LIST.find(m => m.uid === spot.uid) || {
      name: 'Rotary Partner',
      role: 'Rotarian',
      classification: 'Humantarian Service',
      joinedDate: '2024-07-01'
    };

    setSelectedSpotlight({
      ...spot,
      ...original
    });
  };

  const handleShuffle = () => {
    let nextIdx = index;
    // Make sure we select a different one if possible
    if (MEMBER_SPOTLIGHTS.length > 1) {
      while (nextIdx === index) {
        nextIdx = Math.floor(Math.random() * MEMBER_SPOTLIGHTS.length);
      }
    }
    setIndex(nextIdx);
    loadMember(nextIdx);
  };

  if (!selectedSpotlight) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden border-y border-slate-100">
      {/* Decorative gradient accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-rotary-azure filter blur-3xl"></div>
        <div className="absolute bottom-5 right-10 w-72 h-72 rounded-full bg-rotary-gold filter blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-10">
          <span className="inline-flex items-center gap-1.5 bg-rotary-gold/15 text-rotary-gold-dark border border-rotary-gold/25 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
            <Sparkles className="h-3.5 w-3.5 text-rotary-gold-dark" />
            Spotlight On Service
          </span>
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">
            Meet Our Passionate Leaders
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto font-light leading-relaxed">
            A celebration of individual action. Each week we highlight a member of the Rotary Club of Freetown Sunset whose dedicated devotion drives our local humanitarian success in Sierra Leone.
          </p>
        </div>

        {/* Spotlight Card wrapper */}
        <div className="bg-white rounded-3xl border border-slate-205 shadow-md overflow-hidden relative p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSpotlight.uid}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* Photo component (col-span-5) */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative group max-w-[240px] md:max-w-full w-full">
                  <div className="absolute inset-0 bg-rotary-azure/10 rounded-2xl transform rotate-3 group-hover:rotate-1 transition-transform duration-300"></div>
                  <div className="relative aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-md flex items-center justify-center bg-slate-50">
                    <SafeImage
                      src={selectedSpotlight.photoUrl}
                      alt={selectedSpotlight.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {selectedSpotlight.isPaulHarrisFellow && (
                    <div className="absolute -bottom-2 -right-2 bg-rotary-gold text-white p-1.5 rounded-full shadow-md" title={`Paul Harris Fellow (${selectedSpotlight.paulHarrisLevel})`}>
                      <Award className="h-5 w-5 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & detail details (col-span-7) */}
              <div className="md:col-span-7 space-y-5 text-slate-800">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-850 font-display">
                      {selectedSpotlight.name}
                    </h3>
                    <span className="bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {selectedSpotlight.role}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-light items-center">
                    <p className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-rotary-gold-dark shrink-0" />
                      <span>Classification: <strong>{selectedSpotlight.classification}</strong></span>
                    </p>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Member since {selectedSpotlight.joinedDate ? new Date(selectedSpotlight.joinedDate).getFullYear() : '2024'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                  <span className="text-[9px] font-bold tracking-wider text-rotary-azure uppercase block mb-1">
                    Outstanding Contribution Achievement
                  </span>
                  <p className="text-sm font-semibold text-slate-750 flex items-center gap-1.5 leading-snug">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {selectedSpotlight.contribution}
                  </p>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-light italic">
                  "{selectedSpotlight.bio}"
                </p>

                {selectedSpotlight.committee && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Commitment Area:</span>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-xs font-medium border border-slate-200">
                      {selectedSpotlight.committee}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Trigger inside the card */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[10px] text-slate-400 font-light flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Click Shuffle to cycle and meet our diverse roster of Rotarians.
            </p>
            <button
              id="shuffle-spotlight-button"
              onClick={handleShuffle}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-rotary-azure transition-all duration-300 font-display flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold select-none group border border-slate-900 hover:border-rotary-azure active:scale-95"
            >
              <Shuffle className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              Meet Another Member
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

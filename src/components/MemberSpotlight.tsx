import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Award, Shuffle, Calendar, Heart } from 'lucide-react';
import { FULL_MEMBER_LIST } from '../member-data';

export default function MemberSpotlight() {
  const [selectedMember, setSelectedMember] = useState<typeof FULL_MEMBER_LIST[number] | null>(null);
  const [index, setIndex] = useState(0);

  // Initialize with a random spotlit member
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * FULL_MEMBER_LIST.length);
    setIndex(randomIdx);
    setSelectedMember(FULL_MEMBER_LIST[randomIdx]);
  }, []);

  const handleShuffle = () => {
    let nextIdx = index;
    // Make sure we select a different one if possible
    if (FULL_MEMBER_LIST.length > 1) {
      while (nextIdx === index) {
        nextIdx = Math.floor(Math.random() * FULL_MEMBER_LIST.length);
      }
    }
    setIndex(nextIdx);
    setSelectedMember(FULL_MEMBER_LIST[nextIdx]);
  };

  if (!selectedMember) return null;

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
            <Star className="h-3.5 w-3.5 text-rotary-gold-dark" />
            Spotlight On Service
          </span>
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">
            Meet Our Members
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto font-light leading-relaxed">
            A look at the members of the Rotary Club of Freetown Sunset who make our local humanitarian work possible.
          </p>
        </div>

        {/* Spotlight Card wrapper */}
        <div className="bg-white rounded-3xl border border-slate-205 shadow-md overflow-hidden relative p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMember.uid}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-slate-800"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Large Text Avatar Badge with Initials */}
                <div className="w-16 h-16 rounded-full bg-rotary-azure/10 text-rotary-azure font-extrabold text-xl flex items-center justify-center border border-rotary-azure/20 shrink-0 select-none font-display">
                  {(() => {
                    const cleanName = selectedMember.name.replace('Rtn. ', '');
                    const parts = cleanName.split(' ');
                    if (parts.length >= 2) {
                      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
                    }
                    return parts[0][0].toUpperCase();
                  })()}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-850 font-display">
                      {selectedMember.name}
                    </h3>
                    <span className="bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {selectedMember.role}
                    </span>
                    {selectedMember.isPaulHarrisFellow && (
                      <span className="bg-rotary-gold/10 text-rotary-gold-dark border border-rotary-gold/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="h-3 w-3 shrink-0" />
                        <span>Paul Harris Fellow{selectedMember.paulHarrisLevel && selectedMember.paulHarrisLevel !== 'None' ? ` (${selectedMember.paulHarrisLevel})` : ''}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-light items-center">
                    {selectedMember.classification && (
                      <>
                        <p className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-rotary-gold-dark shrink-0" />
                          <span>Classification: <strong>{selectedMember.classification}</strong></span>
                        </p>
                        {selectedMember.joinedDate && <span className="hidden sm:inline text-slate-300">•</span>}
                      </>
                    )}
                    {selectedMember.joinedDate && (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Member since {new Date(selectedMember.joinedDate).getFullYear()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedMember.committee && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl inline-block">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Commitment Area:</span>
                  <span className="text-xs font-semibold text-slate-750">
                    {selectedMember.committee}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Trigger inside the card */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[10px] text-slate-400 font-light flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Click Shuffle to meet another member of our roster.
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

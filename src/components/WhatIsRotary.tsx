import React from 'react';
import { 
  Heart, 
  ShieldAlert, 
  Droplets, 
  Baby, 
  BookOpen, 
  TrendingUp, 
  Sprout, 
  Award,
  BookMarked
} from 'lucide-react';
import { ROTARY_FOCUS_AREAS } from '../data';

export default function WhatIsRotary() {
  // Map icons to the 7 Areas of Focus for premium visual appeal
  const icons = [
    ShieldAlert, // Peacebuilding & Conflict Prevention
    Heart,       // Disease Prevention & Treatment
    Droplets,    // Water, Sanitation, & Hygiene
    Baby,        // Maternal & Child Health
    BookOpen,    // Basic Education & Literacy
    TrendingUp,  // Community Economic Development
    Sprout,      // Supporting the Environment
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {/* 1. HEADER */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
          Global Movement
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          The 7 Areas of Focus
        </h1>
        <p className="text-slate-600 text-lg sm:text-slate-500 font-light leading-relaxed">
          Rotary International channels support into specific service pathways. Each Sunrise initiative must align directly with one of these critical global sectors.
        </p>
      </section>

      {/* 2. THE 7 AREAS OF FOCUS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ROTARY_FOCUS_AREAS.map((area, index) => {
          const Icon = icons[index] || Award;
          return (
            <div 
              key={index} 
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-2xl w-fit ${
                  index % 2 === 0 
                    ? 'bg-rotary-azure/10 text-rotary-azure' 
                    : 'bg-rotary-gold/10 text-rotary-gold'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-800 leading-tight">
                  {area.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {area.description}
                </p>
              </div>

              {/* Tag style indicator to prevent default look */}
              <div className="pt-6 border-t border-slate-50 mt-4 text-[10px] font-bold text-slate-400 font-display tracking-widest uppercase">
                Sector 0{index + 1} • verified
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. ROTARY OVERVIEW STATEMENTS */}
      <section className="bg-rotary-azure/5 rounded-3xl p-8 border border-rotary-azure/10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex bg-rotary-azure/20 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-display uppercase">
            District 9101 Structure
          </div>
          <h2 className="text-2xl font-extrabold font-display text-rotary-dark leading-tight">
            Connecting Sierra Leone with a Global Network of 1.4 Million Neighbors
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rotary is an international association representing business, trades, and municipal officers. Together, we secure grants, establish scholarship pathways, and coordinate with World Health Organization (WHO) initiatives.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
            <h4 className="text-3xl font-extrabold text-rotary-azure font-display">1.4M</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mt-1">Active Rotarians</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
            <h4 className="text-3xl font-extrabold text-rotary-gold font-display">46,000+</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mt-1">Local Clubs</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center col-span-2">
            <h4 className="text-2xl font-bold text-slate-800 font-display flex justify-center items-center gap-2">
              <BookMarked className="h-4.5 w-4.5 text-rotary-azure" />
              Service Above Self
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mt-1">The Core Universal Motto</p>
          </div>
        </div>
      </section>
    </div>
  );
}

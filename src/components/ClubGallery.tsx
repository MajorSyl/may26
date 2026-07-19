import React, { useState } from 'react';
import { Calendar, MapPin, X, BookOpen } from 'lucide-react';

interface GalleryPhoto {
  id: string;
  title: string;
  category: 'meetings' | 'anniversary' | 'outreach' | 'rotaract';
  categoryLabel: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
}

export default function ClubGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'meetings' | 'anniversary' | 'outreach' | 'rotaract'>('all');

  const photos: GalleryPhoto[] = [];

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24 font-sans">
      {/* 1. VIEW INTRO */}
      <section className="space-y-2">
        <div className="inline-flex bg-rotary-gold/10 text-rotary-gold px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-gold/20">
          Historical Archives
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          Club Archives & Memoirs
        </h1>
        <p className="text-slate-500 max-w-2xl font-light text-sm">
          A photo archive of our club meetings, outreach campaigns, and collaborations with Rotaract. This section is being updated with real photos from our activities.
        </p>
      </section>

      {/* 2. CATEGORY SELECTOR PANEL */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 w-full">
          {[
            { id: 'all', title: 'All Club Moments' },
            { id: 'meetings', title: 'Meetings & Assemblies' },
            { id: 'anniversary', title: 'Anniversaries' },
            { id: 'outreach', title: 'Community Outreach' },
            { id: 'rotaract', title: 'Rotaract Collaborations' }
          ].map(cat => {
            const isSel = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 border ${
                  isSel
                    ? 'bg-rotary-gold text-white border-rotary-gold shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PHOTO GRID */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-500">
          No gallery images available for this selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-rotary-azure/30 transition-all group cursor-pointer flex flex-col justify-between h-full space-y-4"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-rotary-azure/5 text-rotary-azure border border-rotary-azure/10 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider block">
                    {photo.categoryLabel}
                  </span>
                  <BookOpen className="w-3.5 h-3.5 text-slate-350" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-800 text-xs font-display leading-tight group-hover:text-rotary-azure transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-[11px] text-slate-450 leading-normal font-light line-clamp-4">
                    {photo.description}
                  </p>
                </div>
              </div>

              {/* Footer specs */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold font-display uppercase tracking-wider border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rotary-gold" />
                  <span>{photo.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rotary-azure" />
                  <span className="truncate max-w-[90px]">{photo.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. MODAL DETAIL POPUP ZOOM */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in">
          {/* Outer click-to-dismiss zone */}
          <div className="absolute inset-0" onClick={() => setSelectedPhoto(null)}></div>

          {/* Modal box */}
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-slate-800 shadow-2xl relative z-10 animate-scale-up">
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/40 text-white rounded-full hover:bg-slate-905 block transition-colors focus:outline-none focus:ring-2 focus:ring-rotary-gold"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-rotary-azure/10 text-rotary-azure text-[9px] font-bold uppercase px-2.5 py-1 rounded border border-rotary-azure/20 font-display">
                    {selectedPhoto.categoryLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-display">• {selectedPhoto.date}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 leading-tight">
                  {selectedPhoto.title}
                </h2>

                <p className="text-slate-650 font-light text-xs sm:text-sm leading-relaxed">
                  {selectedPhoto.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-slate-450 font-bold text-[10px] font-display uppercase tracking-wider pt-4 border-t border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-rotary-gold" />
                <span>Captured Location: {selectedPhoto.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

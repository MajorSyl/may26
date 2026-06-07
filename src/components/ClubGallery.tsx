import React, { useState } from 'react';
import { Image, Filter, Eye, Calendar, MapPin, X } from 'lucide-react';

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

  const photos: GalleryPhoto[] = [
    {
      id: 'real_photo_toilet_handover',
      title: 'Aberdeen Beach Public Toilet Handover',
      category: 'outreach',
      categoryLabel: 'Community Outreach',
      description: 'The landmark handover ceremony for the newly constructed and fully modernized public hygiene facility on Aberdeen Beach Road, providing essential sanitation services.',
      date: 'June 01, 2026',
      location: 'Aberdeen Beach Road, Freetown',
      imageUrl: '/src/assets/images/rotary_toilet_handover_1780856626145.png'
    },
    {
      id: 'real_photo_fundraising_gala',
      title: 'Annual Fundraising Dinner & Gala',
      category: 'anniversary',
      categoryLabel: 'Anniversary & Banquet',
      description: 'District leaders and club members dressed in elegant evening attire, celebrating and cutting the commemorative cake during our grand Annual Fundraising Dinner Gala.',
      date: 'May 16, 2026',
      location: 'Freetown, Sierra Leone',
      imageUrl: '/src/assets/images/rotary_fundraising_gala_1780856649745.png'
    },
    {
      id: 'real_photo_lobby_goodwill',
      title: 'Goodwill Delegation & African Textiles Showcase',
      category: 'meetings',
      categoryLabel: 'Weekly Meetings',
      description: 'Delegates from the Rotary Club of Freetown-Sunset looking magnificent in customized matching traditional African print garments and holding official Goodwill jute bags.',
      date: 'May 08, 2026',
      location: 'Freetown, Sierra Leone',
      imageUrl: '/src/assets/images/rotary_lobby_goodwill_1780856638364.png'
    },
    {
      id: 'real_photo_meeting_dinner',
      title: 'Fellowship Diner Assembly at Lagoonda Hotel',
      category: 'meetings',
      categoryLabel: 'Weekly Meetings',
      description: 'Capturing moments of high synergy and laughter as local leaders gather for our weekly evening meeting and round-table fellowship at the Lagoonda Hotel.',
      date: 'May 21, 2026',
      location: 'Lagoonda Hotel, Freetown',
      imageUrl: '/src/assets/images/rotary_meeting_dinner_1780856599930.png'
    },
    {
      id: 'real_photo_beach_fellowship',
      title: 'Beachside Coastal Fellowship Social',
      category: 'meetings',
      categoryLabel: 'Weekly Meetings',
      description: 'An informal outdoor social gathering by the coast where members connect under shared ideals of service, sporting vibrant custom-branded yellow Rotary apparel.',
      date: 'April 30, 2026',
      location: 'Aberdeen Beach, Freetown',
      imageUrl: '/src/assets/images/rotary_beach_fellowship_1780856612752.png'
    },
    {
      id: 'photo_outreach_1',
      title: 'Water for Tombo Handover Ceremony',
      category: 'outreach',
      categoryLabel: 'Community Outreach',
      description: 'The ceremonial turning of the clean water tap at the Tombo municipal borehole, completed in cooperation with local headmen.',
      date: 'March 14, 2024',
      location: 'Tombo Fishing Village, SL',
      imageUrl: 'https://images.unsplash.com/photo-1541816521319-ef3d45e5f6e8?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_meetings_1',
      title: 'Digital Literacy Assembly Presentation',
      category: 'meetings',
      categoryLabel: 'Weekly Meetings',
      description: 'Sunset session assembly discussing interactive student textbook configurations with education committee directors at Lagoonda Hotel.',
      date: 'June 04, 2026',
      location: 'Lagoonda Hotel, Freetown',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_rotaract_1',
      title: 'Joint Mangrove Clearing Service Project',
      category: 'rotaract',
      categoryLabel: 'Rotaract Collaboration',
      description: 'An early morning beach sanitation drive organized side-by-side with young civic leaders from the Rotaract Club of Freetown.',
      date: 'November 12, 2025',
      location: 'Lumley Estuary Beach',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_anniversary_1',
      title: 'Rotary Charter Night Banquet Gala',
      category: 'anniversary',
      categoryLabel: 'Anniversary Celebration',
      description: 'RCFS charter members and officers raised direct project funding values during our sunset anniversary dinner meeting.',
      date: 'April 20, 2025',
      location: 'Bintumani Secretariat, Aberdeen',
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_outreach_2',
      title: 'Waterloo Library Refurbishment Team',
      category: 'outreach',
      categoryLabel: 'Community Outreach',
      description: 'Setting up custom mahogany reading tables and shelving units for the Waterloo secondary resource suite.',
      date: 'January 18, 2025',
      location: 'Waterloo Secondary, SL',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_rotaract_2',
      title: 'Youth Leadership & Career Orientation Seminars',
      category: 'rotaract',
      categoryLabel: 'Rotaract Collaboration',
      description: 'Coordinated specialized mentoring workshops to equip prospective youth officers with modern tech and classification tools.',
      date: 'February 24, 2026',
      location: 'Milton Margai Tech Complex',
      imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_outreach_3',
      title: 'Lumley Estuary Mangrove Sapling Drive',
      category: 'outreach',
      categoryLabel: 'Community Outreach',
      description: 'Environmental volunteers planting resilient mangrove root systems to defend Freetown water channels against maritime erosion.',
      date: 'June 13, 2025',
      location: 'Aberdeen Coastal Margin, SL',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 'photo_meetings_2',
      title: 'Sergeant-at-Arms Fellowship Roundtable',
      category: 'meetings',
      categoryLabel: 'Weekly Meetings',
      description: 'Exchanging corporate governance insights during our weekly sunset assembly in Lagoonda Hotel.',
      date: 'May 14, 2026',
      location: 'Lagoonda Hotel, Freetown',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24 font-sans">
      {/* 1. VIEW INTRO */}
      <section className="space-y-2">
        <div className="inline-flex bg-rotary-gold/10 text-rotary-gold px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display border border-rotary-gold/20">
          Visual Memories
        </div>
        <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
          Club Gallery
        </h1>
        <p className="text-slate-500 max-w-2xl font-light text-sm">
          A visual chronicle of our action-packed assemblies, impactful humanitarian outreach campaigns, annual charter milestones, and collaborative projects alongside Freetown Rotaractors.
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
              className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Image box */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden shrink-0">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual lens hover state overlay */}
                <div className="absolute inset-0 bg-rotary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2 rounded-full bg-white text-rotary-dark shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-5 h-5" />
                  </span>
                </div>

                {/* Left Category Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <span className="bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider block">
                    {photo.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Text Card content */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-800 text-xs font-display leading-tight group-hover:text-rotary-azure transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-[11px] text-slate-450 leading-normal font-light line-clamp-2">
                    {photo.description}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold font-display uppercase tracking-wider border-t border-slate-50 pt-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rotary-gold" />
                    <span>{photo.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rotary-azure" />
                    <span className="truncate max-w-[80px]">{photo.location}</span>
                  </div>
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

            <img 
              src={selectedPhoto.imageUrl} 
              alt={selectedPhoto.title}
              className="w-full max-h-[420px] object-cover bg-slate-100"
              referrerPolicy="no-referrer"
            />

            <div className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-rotary-azure/10 text-rotary-azure text-[9px] font-bold uppercase px-2.5 py-0.5 rounded border border-rotary-azure/20 font-display">
                  {selectedPhoto.categoryLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-display">• {selectedPhoto.date}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 leading-tight">
                {selectedPhoto.title}
              </h2>

              <p className="text-slate-500 font-light text-xs sm:text-sm leading-relaxed">
                {selectedPhoto.description}
              </p>

              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] font-display uppercase tracking-wider pt-2 border-t border-slate-100">
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

import React, { useState } from 'react';
import { Project } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  MapPin, 
  DollarSign, 
  Users, 
  Award, 
  Share2, 
  Heart, 
  Check, 
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

export default function ProjectDetails({ project, onBack }: ProjectDetailsProps) {
  // Photos gallery state
  const photos = project.galleryUrls && project.galleryUrls.length > 0 
    ? project.galleryUrls 
    : [project.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800'];
  
  const [activePhoto, setActivePhoto] = useState<string>(photos[0]);
  const [copied, setCopied] = useState(false);
  
  // Quick Inquiry Form State inside details page
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Volunteer');
  const [message, setMessage] = useState('');
  const [loadingInquiry, setLoadingInquiry] = useState(false);
  const [successInquiry, setSuccessInquiry] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) return;
    setLoadingInquiry(true);
    
    // Simulate a successful API submit to Firestore/Supabase
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccessInquiry(true);
      setSenderName('');
      setSenderEmail('');
      setMessage('');
      setTimeout(() => setSuccessInquiry(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInquiry(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 font-sans space-y-8">
      {/* 1. TOP BREADCRUMB / ACTION BAR */}
      <section className="flex items-center justify-between">
        <button 
          id="project-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 group text-xs font-bold font-display uppercase tracking-widest text-slate-500 hover:text-rotary-azure transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Roster
        </button>

        <button
          id="project-share-btn"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold font-display uppercase tracking-wider text-slate-600 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-rotary-azure" />
          {copied ? 'Copied' : 'Share Link'}
        </button>
      </section>

      {/* 2. MAIN HEADER INFO */}
      <section className="space-y-4">
        <span className="bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-display">
          {project.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-800 tracking-tight leading-none mt-1">
          {project.title}
        </h1>
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rotary-azure/60" />
            <span>Rotary Year {project.year} Program</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500/60" />
            <span>{project.locationName || 'Freetown District, Sierra Leone'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              project.status === 'Completed' ? 'bg-emerald-500' :
              project.status === 'Active' ? 'bg-indigo-500' : 'bg-amber-500'
            }`} />
            <span className="font-bold uppercase tracking-wider text-[10px]">
              {project.status} Venture
            </span>
          </div>
        </div>
      </section>

      {/* 3. MULTI-PHOTO INTERACTIVE SLIDER GALLERY */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Large Main Highlighted Image Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video sm:aspect-4/3 md:aspect-video rounded-3.5xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <img 
              src={activePhoto} 
              alt={project.title} 
              className="w-full h-full object-cover select-none transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {/* Ambient indicator */}
            <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white select-none">
              Project Snapshot Gallery
            </div>
          </div>

          {/* Interactive Thumbnails Selector Grid */}
          <div className="grid grid-cols-3 gap-4">
            {photos.map((ph, idx) => {
              const isActive = activePhoto === ph;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(ph)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 bg-slate-50 transition-all ${
                    isActive ? 'border-rotary-azure shadow-sm ring-1 ring-rotary-azure' : 'border-slate-200/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={ph} 
                    alt={`Preview photo ${idx + 1}`}
                    className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform" 
                    referrerPolicy="no-referrer"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* METRICS SIDE PANEL CARD */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3.5xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-rose-100 pb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-display">Target Funding & Budget</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-800 font-display">{project.budget || '$10,000 USD'}</span>
              </div>
              <div className="w-full bg-slate-150 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-rotary-azure to-rotary-azure-dark rounded-full`} 
                  style={{ width: project.status === 'Completed' ? '100%' : project.fundingRaised?.includes('83%') ? '83%' : project.fundingRaised?.includes('56%') ? '56%' : '35%' }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 font-display">
                <span>Raised: {project.fundingRaised || '100%'}</span>
                <span>Goal met</span>
              </div>
            </div>

            {/* Beneficiaries Track */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-display">Community Ingress</span>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Heart className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <span className="text-slate-800 font-black text-md block leading-tight font-display">{project.beneficiariesCount || 'Communities'}</span>
                  <p className="text-[10px] text-slate-500 leading-none">Beneficiaries served directly</p>
                </div>
              </div>
            </div>

            {/* Leadership assignments */}
            {project.teamLeads && project.teamLeads.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-display">Sunset Coordinators</span>
                <div className="flex flex-col gap-2">
                  {project.teamLeads.map((name, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-rotary-azure/10 border border-rotary-azure/25 text-rotary-azure rounded-full flex items-center justify-center font-bold text-xs">
                        {name.replace('Rtn. ', '').charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-rotary-azure/5 border border-rotary-azure/12 rounded-2.5xl p-4 flex items-start gap-3 mt-6">
            <Award className="w-5 h-5 text-rotary-azure shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-550 uppercase font-display block tracking-wider">Rotary Standard Compliant</span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                This service development is coordinated in strict compliance with Rotary International Foundation focus protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DETAILS NARRATIVE & CONTACT INQUIRY SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Long-form narrative details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3.5xl p-6 sm:p-10 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold font-display text-slate-850 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rotary-gold" />
              Detailed Operations Report
            </h2>

            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light space-y-4">
              <p className="font-medium text-slate-750">
                {project.description}
              </p>
              
              {project.details ? (
                project.details.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>
                  No detailed operations logs have been submitted for this program. However, Freetown Sunset auditors review every site bi-monthly to maintain optimal operational efficiency. Please check back next quarter for updated environmental audits or textbook distribution lists.
                </p>
              )}
            </div>

            {project.impact && (
              <div className="bg-[#F8FAFC] border border-slate-200 p-5 rounded-2.5xl space-y-2 mt-4">
                <span className="text-[9px] tracking-widest uppercase font-bold text-slate-400 block font-display">Target Monitoring Output</span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 font-display">
                  {project.impact}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action & Inquiry Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3.5xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-rotary-gold font-bold uppercase tracking-widest block font-display">Get Involved</span>
            <h3 className="text-lg font-bold font-display text-slate-800 leading-tight">Support or Volunteer</h3>
            <p className="text-[11px] text-slate-400 leading-normal font-light">
              Submit your inquiry to join this project team, propose a donor alignment, or ask logistical questions.
            </p>
          </div>

          <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs text-slate-700 font-semibold pt-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-display">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                placeholder="e.g. Sahr Kamanda"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-display">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                placeholder="e.g. sahr@gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-display">Your Role Interest</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
              >
                <option value="Volunteer">Field Volunteer</option>
                <option value="Sponsor">Sponsorship / Financial Support</option>
                <option value="Auditor">Academic Collaboration / Research Partner</option>
                <option value="General">General Question</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-display">Message Description</label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure h-20 resize-none font-medium text-slate-705"
                placeholder="Explain how you would like to participate or what questions you have..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingInquiry}
              className="w-full py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark disabled:bg-slate-300 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 font-display"
            >
              {loadingInquiry ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  Submit Project Inquiry
                </>
              )}
            </button>
          </form>

          {successInquiry && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 select-none">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[10px] font-bold text-emerald-800 font-display uppercase tracking-wider">
                Inquiry saved na database! Thank you.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

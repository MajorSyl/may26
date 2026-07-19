import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle,
  Users,
  ExternalLink,
  Check
} from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, PageBlock, DEFAULT_HOME_LAYOUT } from '../supabase-service';
import { getDbProjects } from '../db-router';
import { Project } from '../types';
import { SOCIAL_LINKS } from '../data';
import MemberSpotlight from './MemberSpotlight';
import SafeImage from './SafeImage';
import heroConnectImage from '../assets/images/hero-connect.jpg';

interface HomeProps {
  onLearnMore: (tabId: string) => void;
}

export default function Home({ onLearnMore }: HomeProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    getSiteSettings().then(res => {
      if (active) {
        setSettings(res);
      }
    });
    getDbProjects().then(res => {
      if (active) {
        setProjects(res);
      }
    });
    return () => { active = false; };
  }, []);


  const getBgStyles = (bgColor: PageBlock['bgColor']) => {
    switch (bgColor) {
      case 'dark':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-900/50 shadow-inner';
      case 'slate':
        return 'bg-slate-50 text-slate-800 border-y border-slate-200/50';
      case 'brand':
        return 'bg-sky-50/40 text-slate-800 border-y border-sky-100/30';
      case 'gold':
        return 'bg-amber-50/30 text-slate-800 border-y border-amber-100/25';
      case 'light':
      default:
        return 'bg-white text-slate-850';
    }
  };

  // Safe parsing block of dynamic sequences
  let layout: PageBlock[] = DEFAULT_HOME_LAYOUT.filter(block => block.id !== 'stats' && block.id !== 'facebook');
  if (settings.homeLayout) {
    try {
      const parsed = JSON.parse(settings.homeLayout).filter((block: any) => block.id !== 'stats' && block.id !== 'facebook');
      const hasAboutUs = parsed.some((b: any) => b.id === 'about_us');
      const hasRecentProjects = parsed.some((b: any) => b.id === 'recent_projects');
      const hasMemberSpotlight = parsed.some((b: any) => b.id === 'member_spotlight');
      
      layout = [...parsed];
      if (!hasAboutUs) {
        const heroIdx = layout.findIndex(b => b.id === 'hero');
        layout.splice(heroIdx !== -1 ? heroIdx + 1 : 1, 0, { id: 'about_us', title: 'About Us & Fellowship', bgColor: 'light', visible: true });
      }
      if (!hasRecentProjects) {
        const aboutIdx = layout.findIndex(b => b.id === 'about_us');
        layout.splice(aboutIdx !== -1 ? aboutIdx + 1 : 2, 0, { id: 'recent_projects', title: 'Recent Completed Projects', bgColor: 'slate', visible: true });
      }
      if (!hasMemberSpotlight) {
        const projectIdx = layout.findIndex(b => b.id === 'recent_projects');
        layout.splice(projectIdx !== -1 ? projectIdx + 1 : 3, 0, { id: 'member_spotlight', title: 'Member Spotlight', bgColor: 'light', visible: true });
      }
    } catch (e) {
      layout = DEFAULT_HOME_LAYOUT.filter(block => block.id !== 'stats' && block.id !== 'facebook');
    }
  }

  // Segment renderer
  const renderBlock = (b: PageBlock) => {
    const bgStyles = getBgStyles(b.bgColor);
    const textStyle = b.bgColor === 'dark' ? 'text-white' : 'text-slate-800';
    const subtextStyle = b.bgColor === 'dark' ? 'text-slate-300' : 'text-slate-600';
    const glowNode = b.bgColor === 'dark' && (
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rotary-azure filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-rotary-gold filter blur-3xl animate-pulse"></div>
      </div>
    );

    switch (b.id) {
      case 'hero':
        return (
          <section 
            key={b.id} 
            id="home-hero" 
            className="relative w-full overflow-hidden bg-white text-slate-800 border-b border-slate-200/50"
          >
            {/* Full-width image row spanning edge-to-edge with solid fill color to prevent cropping */}
            <div className="w-full bg-[#0A1128] flex items-center justify-center">
              <picture className="w-full block">
                <source srcSet={heroConnectImage} type="image/jpeg" />
                <img
                  src={heroConnectImage}
                  alt="Rotary Club of Freetown Sunset - Kerefay Loko MCHP Community Well dedication"
                  className="w-full h-auto max-h-[550px] object-contain object-center mx-auto"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Content section directly below the image */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center space-y-6 md:space-y-8">
              <div className="space-y-3">
                <span className="inline-flex bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                  Welcome to Freetown Sunset
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[#00246B] leading-tight">
                  Fellowship, Integrity, and Direct Local Service
                </h1>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light max-w-2xl mx-auto">
                Founded on Freetown's beautiful shores, the <strong>Rotary Club of Freetown Sunset (RCFS)</strong> gathers a diverse cohort of passionate Sierra Leonean and international professionals. Sharing a deep devotion to community enrichment, we combine energetic fellowship with rigorous, hands-on humanitarian initiatives in local neighborhoods.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <button
                  id="hero-learn-more"
                  onClick={() => onLearnMore('about')}
                  className="px-5 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 font-display"
                >
                  <span>Read Our Core Values</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="hero-contact-officers"
                  onClick={() => onLearnMore('contact')}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl transition-all cursor-pointer font-display font-semibold text-xs uppercase tracking-wider"
                >
                  Contact Our Officers
                </button>
              </div>
            </div>
          </section>
        );

      case 'stats':
        return (
          <section key={b.id} className={`w-full py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-rotary-azure/20 transition-all duration-300 text-center flex flex-col justify-between text-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Residents Served</p>
                  <h3 className="text-4xl font-extrabold text-rotary-azure font-display leading-none">{settings.homeResidentsServed}</h3>
                  <span className="mt-4 inline-block px-2.5 py-1 bg-rotary-azure/10 text-rotary-azure text-[10px] font-bold rounded uppercase">Clean Water</span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-rotary-gold/20 transition-all duration-300 text-center flex flex-col justify-between text-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Resources Shipped</p>
                  <h3 className="text-4xl font-extrabold text-rotary-gold font-display leading-none">{settings.homeResourcesShipped}</h3>
                  <span className="mt-4 inline-block px-2.5 py-1 bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold rounded uppercase">Literacy books</span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 text-center flex flex-col justify-between text-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Maternal Delivery</p>
                  <h3 className="text-4xl font-extrabold text-indigo-600 font-display leading-none">{settings.homeMaternalKits}</h3>
                  <span className="mt-4 inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">Midwife Kits</span>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10 space-y-1">
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Financial Trail</p>
                    <h3 className="text-4xl font-extrabold text-rotary-gold font-display leading-none">{settings.homeFinancingAudit}</h3>
                    <span className="mt-4 inline-block px-2.5 py-1 bg-slate-800 text-rotary-gold text-[10px] font-bold rounded uppercase">Direct Project Funding</span>
                  </div>
                  <div className="absolute bottom-[-30%] right-[-15%] w-32 h-32 bg-rotary-gold/20 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'mission':
        return (
          <section key={b.id} className={`w-full py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 text-slate-800">
                <div className="space-y-4">
                  <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
                    The Sunset Mission
                  </div>
                  <h2 className="text-3xl font-extrabold font-display text-rotary-dark tracking-tight leading-snug whitespace-pre-wrap">
                    {settings.homeMissionTitle}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap font-light">
                    {settings.homeMissionBody1}
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap font-light">
                    {settings.homeMissionBody2}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    id="learn-more-about-btn"
                    onClick={() => onLearnMore('about')}
                    className="inline-flex items-center gap-2 text-rotary-azure hover:text-rotary-gold font-bold font-display text-sm transition-colors cursor-pointer"
                  >
                    Explore Our Story & Ethics
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic decorative widgets resembling Sierra Leone's natural beauty and work */}
              <div className="grid grid-cols-1 gap-4 text-slate-800">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-indigo-550/10 rounded-2xl text-indigo-650 shadow-xs shrink-0">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-750 font-bold px-2 py-0.5 rounded uppercase font-display">OUR APPROACH</span>
                    <h4 className="font-extrabold font-display text-slate-805 mt-1">{settings.homeServiceValueTitle1}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{settings.homeServiceValueBody1}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-xs shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase font-display">THE 4-WAY TEST</span>
                    <h4 className="font-extrabold font-display text-slate-805 mt-1">{settings.homeServiceValueTitle2}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{settings.homeServiceValueBody2}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-[#EAB308] shadow-xs shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded uppercase font-display">OUR VALUES</span>
                    <h4 className="font-extrabold font-display text-slate-805 mt-1">{settings.homeServiceValueTitle3}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{settings.homeServiceValueBody3}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'announcements':
        return (
          <section key={b.id} className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-rotary-azure font-display">Announcements</div>
                <h2 className={`text-3xl font-bold font-display text-rotary-dark ${textStyle}`}>Latest News from Sunset</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden text-slate-800">
                  <span className="inline-block bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">Weekly Meetings</span>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">Join Us at Our Next Meeting</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    We gather every Thursday at the Lagoonda Hotel. Check our events calendar for the latest meeting details and guest speakers.
                  </p>
                  <button onClick={() => onLearnMore('events')} className="text-xs font-bold text-rotary-azure hover:text-rotary-gold flex items-center gap-1 font-display cursor-pointer">
                    View Meeting Calendar <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden text-slate-800">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">Our Projects</span>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">Ask Us About Our Current Projects</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    We're always working on new service initiatives across Freetown. Visit our gallery or reach out to a club officer to learn what we're doing right now.
                  </p>
                  <button onClick={() => onLearnMore('gallery')} className="text-xs font-bold text-rotary-azure hover:text-rotary-gold flex items-center gap-1 font-display cursor-pointer">
                    Examine Gallery <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case 'member_spotlight':
        return <MemberSpotlight key={b.id} />;

      case 'about_us':
        return (
          <section key={b.id} id="home-about" className={`py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-105 relative overflow-hidden transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-2">
                <span className="inline-flex bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                  About Our Club
                </span>
                <h2 className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-snug ${textStyle}`}>
                  Our Vision, Heritage & Global Action
                </h2>
              </div>
              
              <p className={`text-sm leading-relaxed font-light ${subtextStyle}`}>
                As part of Rotary International and our District 9101, we work on community service projects in Freetown, often in partnership with other Rotary clubs and local organizations.
              </p>
              <p className={`text-sm leading-relaxed font-light ${subtextStyle}`}>
                Our club offers a platform for values-driven professionals to connect and collaborate on service projects that benefit our local community.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  id="home-about-learn-more"
                  onClick={() => onLearnMore('about')}
                  className="px-5 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 font-display"
                >
                  <span>Explore Our History</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="home-about-contact"
                  onClick={() => onLearnMore('contact')}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-100/10 text-slate-700 hover:text-slate-900 border border-slate-350 rounded-xl transition-all cursor-pointer font-display font-semibold text-xs uppercase tracking-wider"
                >
                  Contact Our Officers
                </button>
              </div>
            </div>
          </section>
        );

      case 'recent_projects': {
        const completedProjects = projects
          .filter(p => p.status === 'Completed')
          .slice(0, 3);

        return (
          <section key={b.id} id="home-recent-projects" className={`py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-105 relative overflow-hidden transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex bg-rotary-gold/15 text-rotary-gold-dark border border-rotary-gold/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                    Pioneering Action
                  </span>
                  <h2 className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-snug ${textStyle}`}>
                    Recent Completed Projects
                  </h2>
                  <p className={`text-xs max-w-xl font-light ${subtextStyle}`}>
                    A look at our recently completed community service projects. Contact a club officer to learn more about our current work.
                  </p>
                </div>

                <button
                  id="view-all-projects"
                  onClick={() => onLearnMore('gallery')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-2xs font-display"
                >
                  <span>Examine All Projects</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Grid of completed projects */}
              {completedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
                  {completedProjects.map((project) => (
                    <div 
                      key={project.id}
                      id={`project-card-${project.id}`}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-rotary-azure/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full text-slate-850"
                    >
                      {project.imageUrl && (
                        <div className="w-full h-44 overflow-hidden">
                          <SafeImage
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {/* Content Area with date badge inside */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-rotary-azure font-bold font-display uppercase tracking-widest block">
                              {project.category}
                            </span>
                            <span className="bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider shadow-2xs">
                              Completed • {project.year}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-850 leading-snug line-clamp-2 pt-1">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-4">
                            {project.description}
                          </p>
                        </div>

                        {/* Impact Stat Banner */}
                        {project.impact && (
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 space-y-1 mt-auto">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 block">Project Community Impact</span>
                            <p className="text-[11px] leading-relaxed font-light">{project.impact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-12 border border-dashed border-slate-250 text-center text-slate-400">
                  <p className="text-sm">Our project portfolio is being updated. Contact a club officer to learn about our current initiatives.</p>
                </div>
              )}
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      {layout
        .filter(b => b.visible !== false)
        .map(b => renderBlock(b))}
    </div>
  );
}

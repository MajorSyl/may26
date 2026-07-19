import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import WhatIsRotary from './components/WhatIsRotary';
import Gallery from './components/Gallery';
import Events from './components/Events';
import GetInvolved from './components/GetInvolved';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import MembersDirectory from './components/MembersDirectory';
import ClubGallery from './components/ClubGallery';
import Contact from './components/Contact';

import { UserProfile, ContactInquiry } from './types';
import { subscribeToAuth, logOutUser } from './db-router';
import { submitDbInquiry, subscribeToNewsletter } from './db-router';
import { GENERAL_FAQS, SOCIAL_LINKS } from './data';
import { Mail, Phone, MapPin, Send, Check, Heart, Shield, RefreshCw, Facebook, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { t, language } = useLanguage();

  // Bottom FAQ section state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Footer Contact Form states
  const [contName, setContName] = useState('');
  const [contEmail, setContEmail] = useState('');
  const [contMsg, setContMsg] = useState('');
  const [contLoading, setContLoading] = useState(false);
  const [contSuccess, setContSuccess] = useState(false);

  // Newsletter Subscribe states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  useEffect(() => {
    // Subscribe to reactive Auth logic
    const unsub = subscribeToAuth((profile) => {
      setUser(profile);
    }, setAuthLoading);
    return () => unsub();
  }, [refreshKey]);

  useEffect(() => {
    const handleRouteCheck = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (
        hash === '#/admin' || 
        hash === '#admin' || 
        path === '/admin' || 
        path.endsWith('/admin')
      ) {
        setActiveTab('admin');
      }
    };
    
    // Perform initial check
    handleRouteCheck();
    
    window.addEventListener('hashchange', handleRouteCheck);
    window.addEventListener('popstate', handleRouteCheck);
    return () => {
      window.removeEventListener('hashchange', handleRouteCheck);
      window.removeEventListener('popstate', handleRouteCheck);
    };
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (activeTab === 'admin') {
      if (path !== '/admin' && !path.endsWith('/admin')) {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (path === '/admin' || path.endsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await logOutUser();
    setUser(null);
    setActiveTab('home');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contName || !contEmail || !contMsg) return;

    setContLoading(true);
    const inquiry: ContactInquiry = {
      id: 'foot_inq_' + Math.random().toString(36).substr(2, 9),
      name: contName,
      email: contEmail,
      subject: 'Footer Quick Contact Message',
      message: contMsg,
      type: 'General Contact',
      createdAt: new Date().toISOString()
    };

    try {
      await submitDbInquiry(inquiry);
      setContSuccess(true);
      setContName('');
      setContEmail('');
      setContMsg('');
      setTimeout(() => setContSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setContLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;

    setNewsletterLoading(true);
    setNewsletterError('');
    try {
      await subscribeToNewsletter(email);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
      setNewsletterError('Something went wrong. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Render correct tab view dynamically
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onLearnMore={(tabId) => setActiveTab(tabId)} />;
      case 'about':
        return <About />;
      case 'members':
        return <MembersDirectory />;
      case 'club-gallery':
        return <ClubGallery />;
      case 'impact':
        return <Gallery key={refreshKey} />;
      case 'get-involved':
        return <GetInvolved />;
      case 'events':
        return <Events key={refreshKey} />;
      case 'contact':
        return <Contact />;
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onLoginSuccess={(usr) => setUser(usr)} 
            onStateRefresh={() => setRefreshKey(prev => prev + 1)}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            onStateRefresh={() => setRefreshKey(prev => prev + 1)} 
          />
        );
      default:
        return <Home onLearnMore={(tabId) => setActiveTab(tabId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-rotary-light flex flex-col justify-between">
      {/* Dynamic Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Container Workspace */}
      <main className="flex-grow pt-4">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-rotary-azure border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 font-display tracking-widest uppercase">Securing sunset session files...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* FAQs & FREETOWN CONTACT CONTAINER (Sites Architecture: "Contact Us: inquiry form, integrated Freetown map and FAQs") */}
      {activeTab === 'home' && (
        <section className="bg-white border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* FAQ Accordion (6 Spans) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] text-rotary-azure font-bold font-display uppercase tracking-widest">{t('helpCenter')}</span>
                <h2 className="text-2xl font-extrabold font-display text-slate-800">{t('faqTitle')}</h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: language === 'krio' ? 'Wetin a fɔ du fɔ kam join di Rotari Klɔb fɔ Fritɔŋ Sunset?' : 'How can I become a member of the Rotary Club of Freetown Sunset?',
                    a: language === 'krio' 
                      ? 'Wi de invite mɛmba dɛn afta we dɛn dɔn kam na wi miting dɛn dɔn wi nominat dɛn. If yu gɛt pasɛn fɔ sɔpɔt yu kɔmuniti, fit wi profesional standard dɛn, and de want fɔ spɛnd tɛm, wi de sɔpɔt yu fɔ sin wi "Kam Join Wi" (Get Involved) pech fɔ sɔpɔt.'
                      : 'Membership is by invitation following attendance at some of our meetings and a nomination process. If you enjoy serving your community, meet the professional or business standards, and are willing to dedicate time, we encourage you to submit your details on our "Get Involved" page so we can invite you as a guest.'
                  },
                  {
                    q: language === 'krio' ? 'Wetin na di "Four-Way Test" na Rotari?' : 'What is the "Four-Way Test" in Rotary?',
                    a: language === 'krio'
                      ? 'In na ethical gayd fɔ Rotarian dɛn fɔ apply na dɛn kɔmuniti and profesional tɛm: 1) In na di TRUTH? 2) In de treat evribodi FAIR? 3) In de build GOODWILL and tin di bɛtɛ friendship dɛn? 4) In de help EVRIBODI?'
                      : 'It is a nonpartisan ethical guide for Rotarians to apply in their personal and professional relationships: 1) Is it the TRUTH? 2) Is it FAIR to all concerned? 3) Will it build GOODWILL and BETTER FRIENDSHIPS? 4) Will it be BENEFICIAL to all concerned?'
                  },
                  {
                    q: language === 'krio' ? 'Ustaym di mɔni we mɛmba dɛn de giv and public donations de go?' : 'Where do membership dues and public donations go?',
                    a: language === 'krio'
                      ? '100% fɔ di sɔpɔt we di public de giv de go fɔ di mɔni projects dɛn (lɛk clean borehole wells, maternal health kits and skul library dɛn). Di mɛmba dɛn de de sɔpɔt klɔb expenses wit dɛn yon annual dues.'
                      : '100% of public donations go directly to funding our local service projects (like clean water wells, health kits, and school libraries). General club administrative fees are covered exclusively by members through annual subscription dues.'
                  },
                  {
                    q: language === 'krio' ? 'Ɔlman kin kam na di Sunset miting dɛn?' : 'Are your meetings open to the public?',
                    a: language === 'krio'
                      ? 'Yes! Ɔl mɛmba we kɔmɔt bifo de waka, bɔku guests dɛn we de want fɔ join wi kɔmuniti projects dɛn, can join wi Sunset miting. We ask say make make una contact wi bifo tɛm so wi go arrange proper hospitality for una.'
                      : 'Yes, visiting Rotarians from other clubs worldwide and guests interested in our work or service programs are always welcome to join our weekly Sunset meetings. We do ask that local guests contact us ahead of time so we can arrange proper hospitality.'
                  }
                ].map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-2xl overflow-hidden cursor-pointer transition-colors ${
                        isOpen ? 'border-rotary-azure bg-rotary-azure/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'
                      }`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <div className="p-4 flex justify-between items-center select-none">
                        <span className="font-bold text-slate-700 font-display text-xs sm:text-sm">
                          {faq.q}
                        </span>
                        <span className="text-rotary-azure font-black tracking-tight shrink-0 ml-4">
                          {isOpen ? '−' : '+'}
                        </span>
                      </div>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CONTACT INQUIRY & INTEGRATED MAP PREVIEW (6 Spans) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] text-rotary-gold font-bold font-display uppercase tracking-widest">{t('getInTouch')}</span>
                <h2 className="text-2xl font-extrabold font-display text-slate-800">{t('contactUs')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Get in Touch CTA Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display">{t('messageBoard')}</span>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {language === 'krio' ? 'Send Wi Wan Mɛsij Tɔde' : 'Send Us a Message Today'}
                    </h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      {language === 'krio' 
                        ? 'If yu gɛt ɛni kwɛstyɔŋ, de want fɔ join mɛmba, ɔ fɔ giv dɔneshɔŋ, tɔk to wi mɛmba dɛn bway wi main kɔntakt fɔm.'
                        : 'If you have any questions, want to inquire about membership, or wish to support our projects, reach out to our club officers through our main contact form.'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="w-full py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold font-display uppercase text-[10px] rounded-lg tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{language === 'krio' ? 'Kɔntakt Wi Fɔm' : 'Open Contact Form'}</span>
                  </button>
                </div>

                {/* Freetown Map visual representation card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="block text:[10px] text-slate-500 font-bold uppercase tracking-wider font-display">{t('meetingLocation')}</span>
                    
                    <div className="rounded-xl overflow-hidden h-28 border border-slate-200 relative">
                      {/* Generates a stylized material-designed map preview layout for Freetown sunset coastal branch */}
                      <div className="absolute inset-0 bg-sky-50 flex items-center justify-center text-center p-2">
                         <div className="space-y-1">
                          <MapPin className="h-5 w-5 text-rose-500 mx-auto animate-bounce" />
                          <span className="text-[9px] font-bold text-slate-700 block font-display leading-tight">{t('lagoondaHotel')}</span>
                          <span className="text-[8px] text-slate-400 block font-display leading-none">{t('lagoondaAddress')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-500 font-medium text-[10px] mt-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-rotary-gold" />
                      <span>{t('lagoondaHotel')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-rotary-gold" />
                      <span>076827035</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. BRAND FOOTER BAR */}
      <footer className="bg-rotary-dark text-white py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-850">
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto pb-8 mb-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-white">Subscribe to Updates</h3>
                <p className="text-[11px] text-slate-400 max-w-sm">Get occasional news about our projects, events, and fellowship activities.</p>
              </div>

              {newsletterSuccess ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 border border-emerald-400/20 px-4 py-2.5 rounded-xl shrink-0">
                  <Check className="h-4 w-4" />
                  <span>Thanks for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex w-full sm:w-auto gap-2">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 sm:w-64 bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rotary-azure"
                  />
                  <button
                    id="newsletter-submit"
                    type="submit"
                    disabled={newsletterLoading}
                    className="px-4 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{newsletterLoading ? 'Submitting...' : 'Subscribe'}</span>
                  </button>
                </form>
              )}
            </div>
            {newsletterError && (
              <p className="text-[10px] text-rose-400 mt-2 text-center sm:text-left">{newsletterError}</p>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="flex items-center text-[12px] font-bold uppercase tracking-widest font-display text-slate-450 hover:text-slate-350 select-none">
            {t('serviceAboveSelf')}
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              title="Facebook"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram profile"
              title="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[10px] text-slate-400 text-center sm:text-right select-none">
            © {new Date().getFullYear()} {t('rightsReserved')}
          </p>
        </div>
        
        {/* Safe spacing pad for mobile touch bars */}
        <div className="h-6 lg:hidden"></div>
      </footer>
    </div>
  );
}

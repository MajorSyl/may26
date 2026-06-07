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
import { subscribeToAuth, logOutUser } from './firebase-service';
import { submitDbInquiry } from './db-router';
import { GENERAL_FAQS } from './data';
import { Mail, Phone, MapPin, Send, Check, Heart, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Bottom FAQ section state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Footer Contact Form states
  const [contName, setContName] = useState('');
  const [contEmail, setContEmail] = useState('');
  const [contMsg, setContMsg] = useState('');
  const [contLoading, setContLoading] = useState(false);
  const [contSuccess, setContSuccess] = useState(false);

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
                <span className="text-[10px] text-rotary-azure font-bold font-display uppercase tracking-widest">Help Center</span>
                <h2 className="text-2xl font-extrabold font-display text-slate-800">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-3">
                {GENERAL_FAQS.map((faq, index) => {
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
                <span className="text-[10px] text-rotary-gold font-bold font-display uppercase tracking-widest font-bold">Contact Us</span>
                <h2 className="text-2xl font-extrabold font-display text-slate-800">Aberdeen Headquarters</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Form Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display">Message Board</span>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-3 text-xs font-medium text-slate-700">
                    <input
                      id="foot-name-input"
                      type="text"
                      placeholder="Full Name"
                      value={contName}
                      onChange={(e) => setContName(e.target.value)}
                      className="w-full bg-white border border-slate-150 rounded-lg px-3 py-2 focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                      required
                    />

                    <input
                      id="foot-email-input"
                      type="email"
                      placeholder="Email Address"
                      value={contEmail}
                      onChange={(e) => setContEmail(e.target.value)}
                      className="w-full bg-white border border-slate-150 rounded-lg px-3 py-2 focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                      required
                    />

                    <textarea
                      id="foot-msg-input"
                      placeholder="Write message..."
                      value={contMsg}
                      onChange={(e) => setContMsg(e.target.value)}
                      className="w-full bg-white border border-slate-150 rounded-lg px-3 py-2 h-16 focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure resize-none"
                      required
                    />

                    <button
                      id="foot-submit-btn"
                      type="submit"
                      disabled={contLoading}
                      className="w-full py-2 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold font-display uppercase text-[10px] rounded-lg tracking-wider shadow-xs"
                    >
                      {contLoading ? 'Sending...' : 'Transmit Inquiry'}
                    </button>
                  </form>

                  {contSuccess && (
                    <div className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-bold text-center rounded-lg uppercase tracking-wider font-display select-none">
                      ✔ Written to logs!
                    </div>
                  )}
                </div>

                {/* Freetown Map visual representation card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="block text:[10px] text-slate-500 font-bold uppercase tracking-wider font-display">Sunset Meeting Location</span>
                    
                    <div className="rounded-xl overflow-hidden h-28 border border-slate-200 relative">
                      {/* Generates a stylized material-designed map preview layout for Freetown sunset coastal branch */}
                      <div className="absolute inset-0 bg-sky-50 flex items-center justify-center text-center p-2">
                         <div className="space-y-1">
                          <MapPin className="h-5 w-5 text-rose-500 mx-auto animate-bounce" />
                          <span className="text-[9px] font-bold text-slate-700 block font-display leading-tight">Lagoonda Hotel</span>
                          <span className="text-[8px] text-slate-400 block font-display leading-none">Cape Road, Aberdeen, Freetown</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-500 font-medium text-[10px] mt-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-rotary-gold" />
                      <span>Lagoonda Hotel</span>
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
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-[12px] font-bold uppercase tracking-widest font-display text-slate-450 hover:text-slate-350 select-none">
            Service Above Self
          </div>

          <p className="text-[10px] text-slate-400 text-center sm:text-right select-none">
            © {new Date().getFullYear()} Rotary Sunset. All Rights Reserved.
          </p>
        </div>
        
        {/* Safe spacing pad for mobile touch bars */}
        <div className="h-6 lg:hidden"></div>
      </footer>
    </div>
  );
}

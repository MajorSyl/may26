import React, { useState } from 'react';
import { Compass, Users, BookOpen, Image, Calendar, Heart, LayoutDashboard, LogOut, Sun, Facebook, Menu, X, Mail, Globe } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const tabTranslationKeys: Record<string, 'home' | 'about' | 'members' | 'clubGallery' | 'impact' | 'getInvolved' | 'events' | 'contact' | 'portal'> = {
  'home': 'home',
  'about': 'about',
  'members': 'members',
  'club-gallery': 'clubGallery',
  'impact': 'impact',
  'get-involved': 'getInvolved',
  'events': 'events',
  'contact': 'contact',
  'dashboard': 'portal'
};

export default function Navbar({ activeTab, setActiveTab, user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const tabs = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'about', label: 'About Us', icon: Users },
    { id: 'members', label: 'Members Directory', icon: Users },
    { id: 'club-gallery', label: 'Club Gallery', icon: Image },
    { id: 'impact', label: 'Our Impact', icon: BookOpen },
    { id: 'get-involved', label: 'Get Involved', icon: Heart },
    { id: 'events', label: 'Meetings & Events', icon: Calendar },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'dashboard', label: 'Sign In', icon: LayoutDashboard, isDash: true }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-light shadow-sm">
      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DESKTOP HEADER (widths lg and up) */}
        <div className="hidden lg:flex justify-between h-16">
          {/* Brand title */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <div className="flex flex-col">
              <span className="text-2xl xl:text-3xl font-bold text-[#00246B] tracking-tight leading-none font-sans" style={{ fontFamily: '"Georgia", serif', fontStyle: 'normal' }}>
                {t('rotary')}
              </span>
              <span className="text-[10px] xl:text-[12px] font-bold text-[#00246B] tracking-wide mt-1.5 leading-none font-sans whitespace-nowrap">
                {t('clubName')}
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="flex items-center space-x-0.5 xl:space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`nav-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-1.5 py-1.5 xl:px-2.5 xl:py-2 rounded-lg text-[10px] xl:text-xs font-bold transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-rotary-azure text-white shadow-sm'
                      : tab.isDash && user
                      ? 'bg-rotary-gold/10 text-rotary-gold hover:bg-rotary-gold/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-rotary-dark'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-display leading-none">{t(tabTranslationKeys[tab.id] || 'home')}</span>
                </button>
              );
            })}

            {/* Desktop Language Selector Toggle with Globe Icon */}
            <div className="flex items-center gap-1.5 border-l border-slate-150 pl-3 ml-2 lg:ml-3 mr-1 shrink-0">
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <div className="flex items-center bg-slate-50 hover:bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 transition-colors">
                <button
                  id="lang-btn-en"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-1 text-[9px] font-extrabold rounded-md cursor-pointer transition-all ${
                    language === 'en' 
                      ? 'bg-rotary-azure text-white shadow-2xs font-black' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="English"
                >
                  EN
                </button>
                <button
                  id="lang-btn-krio"
                  onClick={() => setLanguage('krio')}
                  className={`px-1.5 py-1 text-[9px] font-extrabold rounded-md cursor-pointer transition-all ${
                    language === 'krio' 
                      ? 'bg-rotary-azure text-white shadow-2xs font-black' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Krio"
                >
                  Krio
                </button>
              </div>
            </div>

            {user && (
              <button
                id="logout-btn"
                onClick={onLogout}
                className="ml-4 flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors"
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
                <span className="font-display hidden xl:inline">{t('logout')}</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE HEADER (widths below lg) matching screenshots */}
        <div className="flex lg:hidden justify-between items-center h-16 select-none bg-white">
          <div className="flex items-center cursor-pointer font-display" onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-[#00246B] tracking-tight leading-none" style={{ fontFamily: '"Georgia", serif', fontStyle: 'normal' }}>
                {t('rotary')}
              </span>
              <span className="text-[9px] font-bold text-[#00246B] tracking-wide mt-1.5 leading-none whitespace-nowrap">
                {t('clubName')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick dashboard shortcut button for mobile logged-in members */}
            {user && (
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                className={`p-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600'
                }`}
                title="Member Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
            )}

            {/* Custom square blue-bordered hamburger action button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-[38px] h-[38px] border-2 border-rotary-azure text-rotary-azure bg-white flex items-center justify-center cursor-pointer transition-all active:scale-95 text-center focus:outline-none shrink-0"
              style={{ borderRadius: '4px' }}
              title={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 stroke-[2.2px]" />
              ) : (
                <Menu className="h-5 w-5 stroke-[2.2px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN LIST AND PANEL exactly matching screenshot list divider aesthetics */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-150 font-sans select-none shadow-sm animate-fade-in relative z-50">
          <div className="flex flex-col">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-[14px] font-semibold tracking-wide border-b border-slate-100 transition-colors duration-155 hover:bg-slate-50/50 cursor-pointer ${
                    isActive ? 'text-rotary-azure' : 'text-slate-600 hover:text-rotary-azure'
                  }`}
                >
                  {t(tabTranslationKeys[tab.id] || 'home')}
                </button>
              );
            })}

            {/* Mobile Language Selector */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/55 shadow-2xs">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-rotary-azure/75 shrink-0" />
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider font-display">Tɔk / Language</span>
              </div>
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  id="mobile-lang-btn-en"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    language === 'en' 
                      ? 'bg-rotary-azure text-white shadow-2xs font-extrabold' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  id="mobile-lang-btn-krio"
                  onClick={() => setLanguage('krio')}
                  className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    language === 'krio' 
                      ? 'bg-rotary-azure text-white shadow-2xs font-extrabold' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Krio
                </button>
              </div>
            </div>

            {user && (
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-6 py-4 text-[14px] font-semibold tracking-wide border-b border-rose-100 text-rose-600 hover:bg-rose-50/30 transition-colors cursor-pointer"
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

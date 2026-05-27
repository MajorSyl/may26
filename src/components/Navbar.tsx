import React, { useState } from 'react';
import { Compass, Users, BookOpen, Image, Calendar, Heart, LayoutDashboard, LogOut, Sun, Facebook, ShieldAlert, Menu, X } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tabs = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'about', label: 'About Us', icon: Users },
    { id: 'rotary', label: 'What is Rotary?', icon: BookOpen },
    { id: 'gallery', label: 'Impact Gallery', icon: Image },
    { id: 'events', label: 'Meetings & Events', icon: Calendar },
    { id: 'get-involved', label: 'Get Involved', icon: Heart },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, isDash: true },
    { id: 'admin', label: 'Admin CMS', icon: ShieldAlert, isAdmin: true }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-light shadow-sm">
      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DESKTOP HEADER (widths lg and up) */}
        <div className="hidden lg:flex justify-between h-16">
          {/* Logo & Brand title */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            {/* Minimal SVG emblem that matches Rotary professional colors */}
            <div className="w-10 h-10 rounded-full bg-rotary-gold flex items-center justify-center mr-3 shadow-md border-2 border-rotary-azure">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold font-display text-rotary-dark tracking-tight leading-none">
                ROTARY CLUB OF
              </h1>
              <p className="text-xs font-semibold tracking-widest text-rotary-azure uppercase">
                Freetown Sunset
              </p>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-rotary-azure text-white shadow-sm'
                      : tab.isAdmin
                      ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25'
                      : tab.isDash && user
                      ? 'bg-rotary-gold/10 text-rotary-gold hover:bg-rotary-gold/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-rotary-dark'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-display">{tab.label}</span>
                </button>
              );
            })}

            {user && (
              <button
                id="logout-btn"
                onClick={onLogout}
                className="ml-4 flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-display hidden xl:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE HEADER (widths below lg) matching screenshots */}
        <div className="flex lg:hidden justify-between items-center h-16 select-none bg-white">
          <div className="flex items-center cursor-pointer font-display" onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}>
            <div className="w-8 h-8 rounded-full bg-rotary-gold flex items-center justify-center mr-2 shadow-sm border border-rotary-azure font-black text-white text-[13px]">R</div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-xs block uppercase leading-none">
                ROTARY CLUB OF
              </span>
              <span className="text-[10px] font-bold text-rotary-azure uppercase tracking-wider block leading-none mt-0.5">
                Freetown Sunset
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
              className="w-[38px] h-[38px] border-2 border-[#0056e3] text-[#0056e3] bg-white flex items-center justify-center cursor-pointer transition-all active:scale-95 text-center focus:outline-none shrink-0"
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
              
              // Only display specialized tabs if authenticated/admin
              if (tab.isAdmin && (!user || (user.role !== 'President' && user.role !== 'Club Officer'))) return null;
              if (tab.isDash && !user) return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-[14px] font-semibold tracking-wide border-b border-slate-100 transition-colors duration-155 hover:bg-slate-50/50 cursor-pointer ${
                    isActive ? 'text-[#0056e3]' : 'text-slate-600 hover:text-[#0056e3]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
            {user && (
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-6 py-4 text-[14px] font-semibold tracking-wide border-b border-rose-100 text-rose-600 hover:bg-rose-50/30 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

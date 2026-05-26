import React from 'react';
import { Compass, Users, BookOpen, Image, Calendar, Heart, LayoutDashboard, LogOut, Sun, Facebook, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, user, onLogout }: NavbarProps) {
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
      {/* Top Bar for Brand Identity & Social Shortcuts */}
      <div className="bg-rotary-dark text-white text-xs py-2 px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 select-none">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-rotary-gold animate-spin-slow animate-pulse" />
          <span className="font-semibold tracking-wider uppercase font-display">Rotary Club of Freetown Sunset</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="text-gray-300 hidden md:inline">Sierra Leone | District 9101</span>
          <a 
            href="https://www.facebook.com/profile.php?id=100071187714639" 
            target="_blank" 
            rel="noopener noreferrer"
            id="nav-facebook-link"
            className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#1565C0] text-white font-bold py-1 px-3 rounded-full text-[10px] uppercase tracking-wider shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <Facebook className="h-3 w-3 fill-current" />
            <span>Visit Facebook Feed</span>
          </a>
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-0.5 rounded text-rotary-gold font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{user.name} ({user.role})</span>
            </div>
          ) : (
            <span className="text-rotary-gold font-bold tracking-wide uppercase text-[10px]">Service Above Self</span>
          )}
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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
          <div className="hidden lg:flex items-center space-x-1">
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

          {/* Mobile indicator layout */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              id="mobile-dash"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold uppercase ${
                activeTab === 'dashboard'
                  ? 'bg-rotary-gold text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <LayoutDashboard className="h-3 w-3" />
              <span>Portal</span>
            </button>
            <button
              id="mobile-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold uppercase ${
                activeTab === 'admin'
                  ? 'bg-rotary-azure text-white font-bold'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              <span>CMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab rail bottom for excellent touch targets on compact screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg px-2 py-1 flex justify-around">
        {tabs.slice(0, 6).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-rotary-azure font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

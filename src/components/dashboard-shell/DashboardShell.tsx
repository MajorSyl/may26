import React, { useState } from 'react';
import { LucideIcon, Menu, X, LogOut, ArrowLeft, Search } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick: () => void;
}

interface DashboardShellProps {
  brandLabel: string;
  sidebarItems: SidebarItem[];
  activeItemId: string;
  userName: string;
  userSubtitle?: string;
  userAvatarUrl?: string;
  greetingTitle: string;
  greetingSubtitle?: string;
  onExitToSite: () => void;
  onLogout: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  headerAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
}

// Shared chrome for both the member and admin dashboards: left sidebar nav,
// a header with an optional search box + action button + avatar, and a
// greeting banner. Pure layout -- the tab bodies passed as `children` keep
// their own state/handlers, this component owns none of that.
export default function DashboardShell({
  brandLabel,
  sidebarItems,
  activeItemId,
  userName,
  userSubtitle,
  userAvatarUrl,
  greetingTitle,
  greetingSubtitle,
  onExitToSite,
  onLogout,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  headerAction,
  rightPanel,
  children
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const navContent = (
    <>
      <div className="px-5 py-6">
        <div className="flex flex-col">
          <span
            className="text-xl font-bold text-[#00246B] tracking-tight leading-none"
            style={{ fontFamily: '"Georgia", serif' }}
          >
            Rotary
          </span>
          <span className="text-[10px] font-bold text-rotary-azure tracking-wide mt-1 uppercase font-display">
            {brandLabel}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItemId;
          return (
            <button
              key={item.id}
              id={`shell-nav-${item.id}`}
              onClick={() => {
                item.onClick();
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold font-display transition-all ${
                isActive
                  ? 'bg-rotary-azure text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-rotary-gold/20 text-rotary-gold'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-slate-100 space-y-1">
        <button
          id="shell-exit-to-site"
          onClick={onExitToSite}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold font-display text-slate-500 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Exit to Site
        </button>
        <button
          id="shell-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold font-display text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-150 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[80vw] bg-white flex flex-col shadow-2xl animate-fade-in">{navContent}</div>
          <div className="flex-1 bg-slate-900/40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-150 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 shrink-0"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {onSearchChange && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-150 rounded-full px-4 py-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                id="shell-header-search"
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || 'Search...'}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>
          )}

          <div className="flex-1" />

          {headerAction && (
            <button
              id="shell-header-action"
              onClick={headerAction.onClick}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-rotary-azure hover:bg-rotary-azure/90 text-white text-xs font-bold font-display uppercase rounded-xl shadow-sm transition-all shrink-0"
            >
              {headerAction.icon && <headerAction.icon className="h-3.5 w-3.5" />}
              {headerAction.label}
            </button>
          )}

          <div className="flex items-center gap-2.5 shrink-0 pl-2">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userName} className="w-9 h-9 rounded-full object-cover border border-slate-150" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-rotary-azure/10 text-rotary-azure font-extrabold text-xs flex items-center justify-center border border-rotary-azure/20 font-display">
                {initials}
              </div>
            )}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-xs font-bold text-slate-800">{userName}</span>
              {userSubtitle && <span className="text-[10px] text-slate-400">{userSubtitle}</span>}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className={`grid grid-cols-1 ${rightPanel ? 'xl:grid-cols-[1fr_320px]' : ''} gap-6 items-start`}>
            <div className="min-w-0 space-y-6">
              {/* Greeting banner */}
              <section className="bg-gradient-to-r from-rotary-azure to-rotary-azure-dark rounded-3xl px-6 sm:px-8 py-6 sm:py-7 text-white shadow-sm">
                <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">{greetingTitle}</h1>
                {greetingSubtitle && <p className="text-xs sm:text-sm text-white/80 mt-1.5 font-medium">{greetingSubtitle}</p>}
              </section>

              {children}
            </div>

            {rightPanel && <div className="space-y-6">{rightPanel}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

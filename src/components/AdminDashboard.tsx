import React, { useState, useEffect } from 'react';
import {
  Lock, AlertTriangle, RefreshCw, Check, Globe, Calendar, Users, Mail, Settings, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, Submission } from '../types';
import {
  getSupabaseProjects, getSupabaseEvents, getSupabaseUsers,
  getSupabaseInquiries, isSupabaseConfigured,
  getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS,
  supabase, checkIsAdmin,
  getSupabaseRSVPs, getSupabaseApplications,
  getSupabaseSubmissions,
  getSupabaseAdminUserIds, getSupabaseAdminRole
} from '../supabase-service';
import { motion, AnimatePresence } from 'motion/react';
import { safeStorage } from '../lib/safe-storage';
import DashboardShell, { SidebarItem } from './dashboard-shell/DashboardShell';
import StatCard from './dashboard-shell/StatCard';
import ProjectsSection from './admin/ProjectsSection';
import EventsSection from './admin/EventsSection';
import MembersSection from './admin/MembersSection';
import InquiriesSection from './admin/InquiriesSection';
import ApprovalsSection from './admin/ApprovalsSection';
import SettingsSection from './admin/SettingsSection';
import RolesSection from './admin/RolesSection';

type AdminTab = 'approvals' | 'projects' | 'events' | 'members' | 'inquiries' | 'settings' | 'roles';

interface AdminDashboardProps {
  onStateRefresh?: () => void;
  onExitToSite: () => void;
}

export default function AdminDashboard({ onStateRefresh, onExitToSite }: AdminDashboardProps) {
  // Auth verification states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');

  // Data lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [currentAdminAuthId, setCurrentAdminAuthId] = useState<string | null>(null);
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null);
  const [currentAdminRole, setCurrentAdminRole] = useState<'admin' | 'reviewer' | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [revealedCredential, setRevealedCredential] = useState<{ name: string; rotaryId: string; pin: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check auth storage on load -- always re-verified against a real Supabase
  // admin session; a stale/tampered local flag with no valid session grants
  // nothing.
  useEffect(() => {
    const checkSession = async () => {
      const isAuthed = safeStorage.getItem('sunset_admin_authorized') === 'true';
      if (isAuthed && isSupabaseConfigured && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const isAdmin = await checkIsAdmin(sessionData.session.user.id);
          if (isAdmin) {
            const role = await getSupabaseAdminRole(sessionData.session.user.id);
            setCurrentAdminAuthId(sessionData.session.user.id);
            setCurrentAdminEmail(sessionData.session.user.email ?? null);
            setCurrentAdminRole(role);
            if (role === 'reviewer') setActiveTab('approvals');
            setIsAuthorized(true);
            fetchData();
            return;
          }
          await supabase.auth.signOut().catch(() => {});
        }
      }
      safeStorage.removeItem('sunset_admin_authorized');
      setIsAuthorized(false);
    };
    checkSession();
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all Supabase & simulated datasets
  const fetchData = async () => {
    setLoading(true);
    try {
      const [projs, evs, mems, inqs, pSettings, fetchedRsvps, fetchedApps, fetchedSubs, fetchedAdminIds] = await Promise.all([
        getSupabaseProjects(),
        getSupabaseEvents(),
        getSupabaseUsers(),
        getSupabaseInquiries(),
        getSiteSettings(),
        getSupabaseRSVPs(),
        getSupabaseApplications(),
        getSupabaseSubmissions(),
        getSupabaseAdminUserIds()
      ]);
      setProjects(projs);
      setEvents(evs);
      setMembers(mems);
      setInquiries(inqs);
      setSiteSettings(pSettings);
      setRsvps(fetchedRsvps);
      setApplications(fetchedApps);
      setSubmissions(fetchedSubs);
      setAdminUserIds(new Set(fetchedAdminIds));
    } catch (err: any) {
      console.error(err);
      triggerToast('Error loading records: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    if (onStateRefresh) onStateRefresh();
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAuthError('');
    try {
      if (!supabase) {
        throw new Error('Supabase Client is not configured. Please supply valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables in Settings first.');
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error) throw error;
      if (data?.user) {
        const isAdmin = await checkIsAdmin(data.user.id);
        if (!isAdmin) {
          await supabase.auth.signOut().catch(() => {});
          throw new Error('Access Denied: This account is not registered in the database admins table.');
        }
        const role = await getSupabaseAdminRole(data.user.id);
        setCurrentAdminAuthId(data.user.id);
        setCurrentAdminEmail(data.user.email ?? null);
        setCurrentAdminRole(role);
        if (role === 'reviewer') setActiveTab('approvals');
        setIsAuthorized(true);
        setAuthError('');
        safeStorage.setItem('sunset_admin_authorized', 'true');
        triggerToast(`Access granted. Authenticated as: ${data.user.email}`, 'success');
        fetchData();
      } else {
        throw new Error('No user data returned from authentication service.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Supabase authentication failed. Please confirm email & password.');
      triggerToast('Authentication Failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeauthorize = async () => {
    setIsAuthorized(false);
    safeStorage.removeItem('sunset_admin_authorized');
    setCurrentAdminEmail(null);
    setCurrentAdminRole(null);
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    triggerToast('Authorized session terminated.');
  };

  // Calculate statistics summary cards
  const stats = {
    projects: projects.length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    events: events.length,
    inquiries: inquiries.length,
    rotarians: members.filter(m => m.role === 'Rotarian' || m.role === 'President' || m.role === 'Club Officer').length
  };

  // PASSWORD GATE COMPONENT
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rotary-azure/10 flex items-center justify-center text-rotary-azure mb-4 border border-rotary-azure/20">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold font-display text-slate-800">Rotary CMS Access Gate</h1>
            <p className="text-xs text-slate-400 capitalize">Authorized Officers of Freetown Sunset Sunset Chapter</p>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="admin-email-field" className="block text-xs font-semibold text-slate-500 font-display">Admin Email</label>
                  <input
                    id="admin-email-field"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoFocus
                    required
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rotary-azure/50 focus:border-rotary-azure text-sm text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="admin-password-field" className="block text-xs font-semibold text-slate-500 font-display">Password</label>
                  <input
                    id="admin-password-field"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rotary-azure/50 focus:border-rotary-azure text-sm text-slate-800"
                  />
                </div>

                <p className="text-[9px] text-slate-400 font-normal leading-relaxed bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                  🔒 Authenticates via secure database JWT. To lock sign-up down, ensure public signup is disabled under your **Supabase Dashboard &gt; Auth &gt; Providers &gt; Email**.
                </p>
              </div>

              {authError && (
                <div className="p-3 border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-[11px] rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                id="supabase-auth-submit-btn"
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rotary-azure disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                <span>Sign In with Supabase</span>
              </button>
            </form>
          ) : (
            <div className="p-3 border border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[11px] rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Admin access requires a configured Supabase project (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).</span>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center select-none">
            Rotary Dist. 9101 Security Protocol Compliance Grid
          </p>

          <button
            id="admin-gate-back-to-site"
            type="button"
            onClick={onExitToSite}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </button>
        </motion.div>
      </div>
    );
  }

  const isFullAdmin = currentAdminRole === 'admin';

  // A reviewer only sees Approvals (their core job) and a login-management
  // view of Members -- MembersSection itself hides roster-edit/promote/
  // revoke controls when currentAdminRole !== 'admin'. Every other tab
  // touches something reviewers aren't scoped for (projects, events,
  // inquiries, settings, other admins' access).
  const sidebarItems: SidebarItem[] = [
    { id: 'approvals', label: 'Approvals', icon: Check, badge: submissions.filter(s => s.status === 'pending').length, onClick: () => setActiveTab('approvals') },
    ...(isFullAdmin ? [
      { id: 'projects', label: 'Projects', icon: Globe, onClick: () => setActiveTab('projects') },
      { id: 'events', label: 'Events', icon: Calendar, onClick: () => setActiveTab('events') }
    ] as SidebarItem[] : []),
    { id: 'members', label: isFullAdmin ? 'Members' : 'Member Logins', icon: Users, onClick: () => setActiveTab('members') },
    ...(isFullAdmin ? [
      { id: 'inquiries', label: 'Inquiries', icon: Mail, onClick: () => setActiveTab('inquiries') },
      { id: 'settings', label: 'Settings', icon: Settings, onClick: () => setActiveTab('settings') },
      { id: 'roles', label: 'Roles', icon: ShieldCheck, onClick: () => setActiveTab('roles') }
    ] as SidebarItem[] : [])
  ];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <DashboardShell
      brandLabel="Admin Console"
      sidebarItems={sidebarItems}
      activeItemId={activeTab}
      userName={currentAdminEmail || 'Admin'}
      userSubtitle={isFullAdmin ? 'Rotary Club of Freetown Sunset' : 'Reviewer · Rotary Club of Freetown Sunset'}
      greetingTitle={`${greeting}, ${isFullAdmin ? 'Admin' : 'Reviewer'}`}
      greetingSubtitle={isFullAdmin ? 'Manage live projects, events, member records, and website content.' : 'Review member submissions and manage member logins.'}
      onExitToSite={onExitToSite}
      onLogout={handleDeauthorize}
      headerAction={{
        label: 'Reload',
        icon: RefreshCw,
        onClick: fetchData
      }}
    >
      {/* FEEDBACK TOAST / ALERT -- global, not tab-specific */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between border select-none mb-6 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100'
                : 'bg-sky-50 border-sky-200 text-sky-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'}`}></span>
              <span>💾 {toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 font-black cursor-pointer ml-4">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Impact Projects" value={stats.projects} icon={Globe} color="azure" sublabel={`${stats.activeProjects} Active Now`} />
        <StatCard label="Live Events" value={stats.events} icon={Calendar} color="gold" sublabel="Scheduled of D9101" />
        <StatCard label="RCFS Fellows" value={stats.rotarians} icon={Users} color="emerald" sublabel="Core Rotarians Listed" />
        <StatCard label="Inquiries Inbox" value={stats.inquiries} icon={Mail} color="rose" sublabel="General Contact Forms" />
      </div>

      {/* CREDENTIAL REVEAL -- shown once after creating a login or resetting a
          PIN. Does not auto-dismiss (unlike the toast) since the admin needs
          time to copy/write this down; it is never retrievable again. Stays
          visible regardless of which tab is active. */}
      {revealedCredential && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-rotary-gold/40 flex items-start justify-between gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-rotary-gold">New Login Credentials -- share these now</p>
            <p className="text-sm">
              <strong>{revealedCredential.name}</strong>: Rotary ID <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{revealedCredential.rotaryId}</span>, PIN <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{revealedCredential.pin}</span>
            </p>
            <p className="text-[10px] text-slate-400">This won't be shown again -- tell the member directly (in person, phone, etc).</p>
          </div>
          <button
            onClick={() => setRevealedCredential(null)}
            className="text-slate-400 hover:text-white font-black cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 space-y-3">
          <RefreshCw className="h-8 w-8 text-rotary-azure animate-spin" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Querying Postgres Schema tables...</p>
        </div>
      ) : (
        <>
          {activeTab === 'approvals' && (
            <ApprovalsSection
              submissions={submissions}
              members={members}
              currentAdminAuthId={currentAdminAuthId}
              onRefresh={handleRefresh}
              triggerToast={triggerToast}
            />
          )}
          {activeTab === 'projects' && isFullAdmin && (
            <ProjectsSection projects={projects} onRefresh={handleRefresh} triggerToast={triggerToast} />
          )}
          {activeTab === 'events' && isFullAdmin && (
            <EventsSection events={events} onRefresh={handleRefresh} triggerToast={triggerToast} />
          )}
          {activeTab === 'members' && (
            <MembersSection
              members={members}
              onRefresh={handleRefresh}
              triggerToast={triggerToast}
              adminUserIds={adminUserIds}
              currentAdminAuthId={currentAdminAuthId}
              revealedCredential={revealedCredential}
              setRevealedCredential={setRevealedCredential}
              currentAdminRole={currentAdminRole}
            />
          )}
          {activeTab === 'inquiries' && isFullAdmin && (
            <InquiriesSection
              inquiries={inquiries}
              rsvps={rsvps}
              applications={applications}
              events={events}
              projects={projects}
              onRefresh={handleRefresh}
              triggerToast={triggerToast}
            />
          )}
          {activeTab === 'settings' && isFullAdmin && (
            <SettingsSection siteSettings={siteSettings} onRefresh={handleRefresh} triggerToast={triggerToast} />
          )}
          {activeTab === 'roles' && isFullAdmin && (
            <RolesSection members={members} currentAdminAuthId={currentAdminAuthId} onRefresh={handleRefresh} triggerToast={triggerToast} />
          )}
        </>
      )}
    </DashboardShell>
  );
}

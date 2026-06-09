import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, Database, Trash2, Edit, Plus, Search, Check, X, 
  Calendar, MapPin, Users, Mail, AlertTriangle, ShieldCheck, 
  RefreshCw, Filter, Sparkles, Info, Eye, FileText, Globe,
  UploadCloud, Image, Link,
  ArrowUp, ArrowDown, EyeOff, Layout, Palette, Sliders, Settings
} from 'lucide-react';
import { Project, ClubEvent, UserProfile, ContactInquiry } from '../types';
import { INITIAL_MEMBER_DIRECTORY } from '../data';
import { 
  getSupabaseProjects, saveSupabaseProject, deleteSupabaseProject,
  getSupabaseEvents, saveSupabaseEvent, deleteSupabaseEvent,
  getSupabaseUsers, upsertSupabaseUser, deleteSupabaseUser,
  getSupabaseInquiries, deleteSupabaseInquiry, isSupabaseConfigured,
  getSiteSettings, updateSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS,
  PageBlock, DEFAULT_HOME_LAYOUT, DEFAULT_ABOUT_LAYOUT
} from '../supabase-service';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onStateRefresh?: () => void;
}

export default function AdminDashboard({ onStateRefresh }: AdminDashboardProps) {
  // Passcode verification states
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Data lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  
  // UI and Loading states
  const [activeTab, setActiveTab] = useState<'projects' | 'events' | 'members' | 'inquiries' | 'pages' | 'design'>('projects');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Site-wide Page CMS Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [cmsSubTab, setCmsSubTab] = useState<'home' | 'about' | 'involved'>('home');
  const [designSubTab, setDesignSubTab] = useState<'home' | 'about'>('home');

  // Block based layout visual editor lists
  const [homeBlocks, setHomeBlocks] = useState<PageBlock[]>([]);
  const [aboutBlocks, setAboutBlocks] = useState<PageBlock[]>([]);

  // Sync block configs whenever remote/siteSettings is fetched
  useEffect(() => {
    if (siteSettings) {
      try {
        const hb = (siteSettings.homeLayout ? JSON.parse(siteSettings.homeLayout) : DEFAULT_HOME_LAYOUT).filter((b: any) => b.id !== 'stats');
        setHomeBlocks(hb);
      } catch (e) {
        setHomeBlocks(DEFAULT_HOME_LAYOUT.filter(block => block.id !== 'stats'));
      }
      try {
        const ab = siteSettings.aboutLayout ? JSON.parse(siteSettings.aboutLayout) : DEFAULT_ABOUT_LAYOUT;
        setAboutBlocks(ab);
      } catch (e) {
        setAboutBlocks(DEFAULT_ABOUT_LAYOUT);
      }
    }
  }, [siteSettings]);

  // Section Block Reordering and Layout Helpers
  const moveBlockUp = (page: 'home' | 'about', index: number) => {
    const list = page === 'home' ? [...homeBlocks] : [...aboutBlocks];
    if (index === 0) return;
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    if (page === 'home') {
      setHomeBlocks(list);
    } else {
      setAboutBlocks(list);
    }
  };

  const moveBlockDown = (page: 'home' | 'about', index: number) => {
    const list = page === 'home' ? [...homeBlocks] : [...aboutBlocks];
    if (index === list.length - 1) return;
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    if (page === 'home') {
      setHomeBlocks(list);
    } else {
      setAboutBlocks(list);
    }
  };

  const toggleBlockVisibility = (page: 'home' | 'about', index: number) => {
    const list = page === 'home' ? [...homeBlocks] : [...aboutBlocks];
    list[index] = { ...list[index], visible: !list[index].visible };
    if (page === 'home') {
      setHomeBlocks(list);
    } else {
      setAboutBlocks(list);
    }
  };

  const changeBlockBgColor = (page: 'home' | 'about', index: number, bgColor: PageBlock['bgColor']) => {
    const list = page === 'home' ? [...homeBlocks] : [...aboutBlocks];
    list[index] = { ...list[index], bgColor };
    if (page === 'home') {
      setHomeBlocks(list);
    } else {
      setAboutBlocks(list);
    }
  };
  
  // Status feedback / Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Individual record states for form
  // Project Form Fields
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projYear, setProjYear] = useState<number>(new Date().getFullYear());
  const [projImpact, setProjImpact] = useState('');
  const [projStatus, setProjStatus] = useState<'Completed' | 'Active' | 'Planning'>('Active');
  const [projImageUrl, setProjImageUrl] = useState('');
  const [imageSourceTab, setImageSourceTab] = useState<'preset' | 'upload' | 'url'>('preset');

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('Please upload an image file (PNG, JPG, WebP, etc.)', 'error');
      return;
    }
    // Limit to 1.5MB to keep state serialization clean and fast in Postgres
    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('Image resolution is too high; please use an image under 1.5 MB for database efficiency.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProjImageUrl(event.target.result as string);
        triggerToast('Image loaded and optimized successfully!', 'success');
      }
    };
    reader.onerror = () => {
      triggerToast('Could not parse local file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Event Form Fields
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evSpeaker, setEvSpeaker] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evType, setEvType] = useState<'Weekly Meeting' | 'Service Project' | 'Social' | 'Fundraiser'>('Weekly Meeting');

  // Member (UserProfile) Form Fields
  const [memName, setMemName] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memRole, setMemRole] = useState<'Rotarian' | 'Club Officer' | 'Guest' | 'President'>('Rotarian');
  const [memAttendance, setMemAttendance] = useState<number>(95);
  const [memContributionGoal, setMemContributionGoal] = useState<number>(500);
  const [memContributed, setMemContributed] = useState<number>(150);
  const [memCommittee, setMemCommittee] = useState('Service Projects');
  const [memTasks, setMemTasks] = useState('');
  const [memClassification, setMemClassification] = useState('');
  const [memIsPaulHarrisFellow, setMemIsPaulHarrisFellow] = useState(false);
  const [memPaulHarrisLevel, setMemPaulHarrisLevel] = useState<'PHF' | 'PHF+1' | 'PHF+2' | 'PHF+3' | 'PHF+4' | 'PHF+8' | 'Major Donor' | 'None'>('None');
  const [memPhone, setMemPhone] = useState('');
  const [memJoinedDate, setMemJoinedDate] = useState('');
  const [memBirthday, setMemBirthday] = useState('');
  const [memAvatarUrl, setMemAvatarUrl] = useState('');

  // Show Inquiry Info Modal state
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  // Check auth storage on load
  useEffect(() => {
    const isAuthed = localStorage.getItem('sunset_admin_authorized') === 'true';
    if (isAuthed) {
      setIsAuthorized(true);
      fetchData();
    }
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all Supabase & simulated datasets
  const fetchData = async () => {
    setLoading(true);
    try {
      const [projs, evs, mems, inqs, pSettings] = await Promise.all([
        getSupabaseProjects(),
        getSupabaseEvents(),
        getSupabaseUsers(),
        getSupabaseInquiries(),
        getSiteSettings()
      ]);
      setProjects(projs);
      setEvents(evs);
      setMembers(mems);
      setInquiries(inqs);
      setSiteSettings(pSettings);
    } catch (err: any) {
      console.error(err);
      triggerToast('Error loading records: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = passcode.trim();
    if (normalized === 'freetown-sunset' || normalized === 'rotary2026' || normalized === 'admin') {
      setIsAuthorized(true);
      setAuthError('');
      localStorage.setItem('sunset_admin_authorized', 'true');
      triggerToast('Access granted. Welcome to WordPress-style Content Manager!', 'success');
      fetchData();
    } else {
      setAuthError('Invalid administrator passcode. Hint: freetown-sunset');
      triggerToast('Access Denied', 'error');
    }
  };

  const handleDeauthorize = () => {
    setIsAuthorized(false);
    localStorage.removeItem('sunset_admin_authorized');
    triggerToast('Authorized session terminated.');
  };

  // Reset and open form helpers
  const openNewRecordForm = () => {
    setEditingId(null);
    clearFormFields();
    setIsFormOpen(true);
  };

  const clearFormFields = () => {
    // Project Init
    setProjTitle('');
    setProjCategory('');
    setProjDescription('');
    setProjYear(new Date().getFullYear());
    setProjImpact('');
    setProjStatus('Active');
    setProjImageUrl('');
    setImageSourceTab('preset');

    // Event Init
    setEvTitle('');
    setEvDate('');
    setEvTime('18:30 - 20:00');
    setEvLocation('Lagoonda Hotel, Freetown');
    setEvSpeaker('');
    setEvDescription('');
    setEvType('Weekly Meeting');

    // Member Init
    setMemName('');
    setMemEmail('');
    setMemRole('Rotarian');
    setMemAttendance(95);
    setMemContributionGoal(500);
    setMemContributed(150);
    setMemCommittee('Service Projects');
    setMemTasks('');
    setMemClassification('');
    setMemIsPaulHarrisFellow(false);
    setMemPaulHarrisLevel('None');
    setMemPhone('');
    setMemJoinedDate('');
    setMemBirthday('');
    setMemAvatarUrl('');
  };

  // Load selected record for editing
  const loadRecordForEdit = (record: any) => {
    setEditingId(record.id || record.uid);
    setIsFormOpen(true);
    
    if (activeTab === 'projects') {
      const p = record as Project;
      setProjTitle(p.title);
      setProjCategory(p.category);
      setProjDescription(p.description);
      setProjYear(p.year);
      setProjImpact(p.impact || '');
      setProjStatus(p.status);
      setProjImageUrl(p.imageUrl || '');
    } else if (activeTab === 'events') {
      const e = record as ClubEvent;
      setEvTitle(e.title);
      setEvDate(e.date);
      setEvTime(e.time);
      setEvLocation(e.location);
      setEvSpeaker(e.speaker || '');
      setEvDescription(e.description || '');
      setEvType(e.type);
    } else if (activeTab === 'members') {
      const m = record as UserProfile;
      setMemName(m.name);
      setMemEmail(m.email);
      setMemRole(m.role);
      setMemAttendance(m.attendanceRate ?? 95);
      setMemContributionGoal(m.contributionGoals ?? 500);
      setMemContributed(m.contributedAmount ?? 150);
      setMemCommittee(m.committee || 'General Fellowship');
      setMemTasks(m.tasks ? m.tasks.join(', ') : '');
      setMemClassification(m.classification || '');
      setMemIsPaulHarrisFellow(!!m.isPaulHarrisFellow);
      setMemPaulHarrisLevel(m.paulHarrisLevel || 'None');
      setMemPhone(m.phone || '');
      setMemJoinedDate(m.joinedDate || '');
      setMemBirthday(m.birthday || '');
      setMemAvatarUrl(m.avatarUrl || '');
    }
  };

  // Handle Form Submit
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (activeTab === 'projects') {
        const payload: Project = {
          id: editingId || 'proj_' + Math.random().toString(36).substr(2, 9),
          title: projTitle,
          category: projCategory || 'General Service',
          description: projDescription,
          year: Number(projYear),
          impact: projImpact,
          status: projStatus,
          imageUrl: projImageUrl || 'https://images.unsplash.com/photo-1541816521319-ef3d45e5f6e8?auto=format&fit=crop&q=80&w=800'
        };
        await saveSupabaseProject(payload);
        triggerToast(`Project "${projTitle}" successfully saved to live database.`, 'success');
      } else if (activeTab === 'events') {
        const payload: ClubEvent = {
          id: editingId || 'ev_' + Math.random().toString(36).substr(2, 9),
          title: evTitle,
          date: evDate,
          time: evTime || '18:30 - 20:00',
          location: evLocation || 'Lagoonda Hotel, Freetown',
          speaker: evSpeaker || undefined,
          description: evDescription || undefined,
          type: evType
        };
        await saveSupabaseEvent(payload);
        triggerToast(`Event "${evTitle}" successfully published.`, 'success');
      } else if (activeTab === 'members') {
        const payload: UserProfile = {
          uid: editingId || 'usr_' + Math.random().toString(36).substr(2, 9),
          name: memName,
          email: memEmail,
          role: memRole,
          attendanceRate: Number(memAttendance),
          contributionGoals: Number(memContributionGoal),
          contributedAmount: Number(memContributed),
          committee: memCommittee,
          tasks: memTasks ? memTasks.split(',').map(t => t.trim()).filter(Boolean) : [],
          classification: memClassification,
          isPaulHarrisFellow: memIsPaulHarrisFellow,
          paulHarrisLevel: memPaulHarrisLevel,
          phone: memPhone,
          joinedDate: memJoinedDate,
          birthday: memBirthday,
          avatarUrl: memAvatarUrl
        };
        await upsertSupabaseUser(payload);
        triggerToast(`Rotary Profile for "${memName}" updated.`, 'success');
      }

      // Close Form and Refresh
      setIsFormOpen(false);
      clearFormFields();
      setEditingId(null);
      fetchData();
      if (onStateRefresh) onStateRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Database submit error: ' + (err.message || String(err)), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Record Delete
  const handleRecordDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from your Postgres tables?`)) {
      return;
    }

    setActionLoading(true);
    try {
      if (activeTab === 'projects') {
        await deleteSupabaseProject(id);
      } else if (activeTab === 'events') {
        await deleteSupabaseEvent(id);
      } else if (activeTab === 'members') {
        await deleteSupabaseUser(id);
      } else if (activeTab === 'inquiries') {
        await deleteSupabaseInquiry(id);
      }

      triggerToast(`Permanently deleted "${name}" from database.`, 'info');
      fetchData();
      if (onStateRefresh) onStateRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Delete transaction failed: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filters and search mapping
  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredEvents = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.speaker && e.speaker.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'All' || e.type === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredMembers = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.committee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || m.role === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredInquiries = inquiries.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        i.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        i.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || i.type === statusFilter;
    return matchSearch && matchStatus;
  });

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

          <form onSubmit={handleAuthorize} className="space-y-4">
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <label htmlFor="admin-passcode-field" className="block text-slate-500 font-display">Administrator Password</label>
              <div className="relative">
                <input
                  id="admin-passcode-field"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter access code..."
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rotary-azure/50 focus:border-rotary-azure text-sm text-slate-800"
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed text-center bg-slate-50 p-2 rounded-lg mt-2 border border-dashed border-slate-200">
                ⚠️ Hint for local test review: <code className="font-bold bg-slate-200 text-slate-700 px-1 py-0.5 rounded text-[11px] select-all">freetown-sunset</code> or <code className="font-bold bg-slate-200 text-slate-700 px-1 py-0.5 rounded text-[11px] select-all">rotary2026</code>
              </p>
            </div>

            {authError && (
              <div className="p-3 border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-[11px] rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              id="admin-auth-submit-btn"
              type="submit"
              className="w-full py-3 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rotary-azure"
            >
              Unlock Dashboard
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center select-none">
            Rotary Dist. 9101 Security Protocol Compliance Grid
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Visual Header Grid & Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full select-none flex items-center gap-1.5 border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>Visual CMS Live</span>
            </span>
            {isSupabaseConfigured ? (
              <span className="bg-sky-100 text-sky-800 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-sky-200 select-none">
                <Globe className="h-3 w-3" />
                <span>Live Supabase Cloud</span>
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 select-none">
                <Database className="h-3 w-3" />
                <span>Sandbox Simulated Cache</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black font-display text-slate-800 tracking-tight flex items-center gap-2">
            Rotary Website CMS <Sparkles className="h-5 w-5 text-rotary-gold" />
          </h1>
          <p className="text-xs text-slate-400">
            Welcome to your visual admin content manager. Update live projects, schedule board meetings, review club inquiries, and manage member statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-refresh-btn"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold font-display shadow-xs"
            title="Reload Database Tables"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          <button
            id="admin-logout-btn"
            onClick={handleDeauthorize}
            className="p-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all text-xs font-bold font-display cursor-pointer flex items-center gap-1.5"
          >
            <Unlock className="h-4 w-4 text-rose-500" />
            <span>Lock Panel</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW BENTO BOXES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-rotary-azure/10 text-rotary-azure flex items-center justify-center shrink-0 border border-rotary-azure/20">
            <Globe className="h-5 w-5" />
          </div>
          <div className="select-none leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Impact Projects</span>
            <span className="text-2xl font-black text-slate-700 font-display">{stats.projects}</span>
            <span className="text-[9px] text-emerald-600 block mt-0.5">({stats.activeProjects} Active Now)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-rotary-gold/15 text-rotary-gold flex items-center justify-center shrink-0 border border-rotary-gold/25">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="select-none leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Live Events</span>
            <span className="text-2xl font-black text-slate-700 font-display">{stats.events}</span>
            <span className="text-[9px] text-slate-400 block mt-1">Scheduled of D9101</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/10 text-[#2ECC71] flex items-center justify-center shrink-0 border border-[#2ECC71]/20">
            <Users className="h-5 w-5" />
          </div>
          <div className="select-none leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">RCFS Fellows</span>
            <span className="text-2xl font-black text-slate-700 font-display">{stats.rotarians}</span>
            <span className="text-[9px] text-[#2ECC71] block mt-1">Core Rotarians Listed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
            <Mail className="h-5 w-5" />
          </div>
          <div className="select-none leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Inquiries Inbox</span>
            <span className="text-2xl font-black text-slate-700 font-display">{stats.inquiries}</span>
            <span className="text-[9px] text-purple-600 block mt-1">General Contact Forms</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST / ALERT */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between border select-none ${
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

      {/* MAIN LAYOUT CONTROLS (SEARCH & TABS ROW) */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Visual Tab Selection header block */}
        <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['projects', 'events', 'members', 'inquiries', 'pages', 'design'] as const).map((tab) => (
              <button
                key={tab}
                id={`admin-tab-btn-${tab}`}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm('');
                  setStatusFilter('All');
                  setIsFormOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold leading-none uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-805 hover:bg-slate-200/20'
                }`}
              >
                {tab === 'projects' ? '📂 Projects' : tab === 'events' ? '📅 Events' : tab === 'members' ? '👥 Members' : tab === 'inquiries' ? '📥 Inquiries' : tab === 'pages' ? '📝 Page Copy' : '🎨 Design & Layout'}
              </button>
            ))}
          </div>

          {activeTab !== 'pages' && activeTab !== 'design' ? (
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* SEARCH BOX */}
              <div className="relative w-full md:w-48 xl:w-64">
                <input
                  id="admin-search-input"
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-350 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure placeholder-slate-400"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* STATUS SELECTOR FILTER */}
              <div className="relative shrink-0 text-xs">
                <select
                  id="admin-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-350 rounded-xl px-2.5 py-1.5 font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-rotary-azure"
                >
                  <option value="All">All statuses/types</option>
                  {activeTab === 'projects' && (
                    <>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Planning">Planning</option>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <option value="Weekly Meeting">Weekly Meetings</option>
                      <option value="Service Project">Service Projects</option>
                      <option value="Social">Social</option>
                      <option value="Fundraiser">Fundraisers</option>
                    </>
                  )}
                  {activeTab === 'members' && (
                    <>
                      <option value="Rotarian">Rotarians</option>
                      <option value="Club Officer">Club Officers</option>
                      <option value="President">Presidents</option>
                      <option value="Guest">Guests</option>
                    </>
                  )}
                  {activeTab === 'inquiries' && (
                    <>
                      <option value="General Contact">General Contact</option>
                      <option value="Membership Inquiry">Membership Inquiry</option>
                      <option value="Donation Inquiry">Donation Inquiry</option>
                    </>
                  )}
                </select>
              </div>

              {/* CREATE / ADD DIRECT RECORD (Only for manageable collections) */}
              {activeTab !== 'inquiries' && (
                <button
                  id="admin-new-record-btn"
                  onClick={openNewRecordForm}
                  className="bg-rotary-azure hover:bg-rotary-azure-dark text-white p-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold leading-none shrink-0 border border-transparent shadow-xs hover:shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Publish New</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 select-none self-stretch shrink-0">
              <span className="text-[10px] bg-rotary-gold/25 text-amber-800 border border-rotary-gold/40 px-3 py-1.5 rounded-xl font-bold font-display uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Live visual WordPress-Style Editor
              </span>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* EDITING FORM SECTION (COLLAPSIBLE SCREEN) */}
        {/* ========================================== */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-50/50 border-b border-slate-150 p-6 overflow-hidden"
            >
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-rotary-gold rounded-full"></span>
                    <h3 className="font-extrabold font-display text-base text-slate-800">
                      {editingId ? `📝 Edit ${activeTab.slice(0, -1)} Record: "${editingId}"` : `✨ Publish New ${activeTab.slice(0, -1)}`}
                    </h3>
                  </div>
                  <button
                    id="admin-form-close"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  {/* FOR TAB: PROJECTS */}
                  {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-500">Project Title</label>
                        <input
                          id="proj-form-title"
                          type="text"
                          required
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          placeholder="e.g., Rural Wells Restoration Campaign"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Category Area of Focus</label>
                        <select
                          id="proj-form-category"
                          value={projCategory}
                          onChange={(e) => setProjCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        >
                          <option value="Water, Sanitation, and Hygiene">Water, Sanitation, and Hygiene</option>
                          <option value="Basic Education and Literacy">Basic Education and Literacy</option>
                          <option value="Maternal and Child Health">Maternal and Child Health</option>
                          <option value="Disease Prevention and Treatment">Disease Prevention and Treatment</option>
                          <option value="Supporting the Environment">Supporting the Environment</option>
                          <option value="Peacebuilding and Conflict Prevention">Peacebuilding and Conflict Prevention</option>
                          <option value="Community Economic Development">Community Economic Development</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Project Status</label>
                        <select
                          id="proj-form-status"
                          value={projStatus}
                          onChange={(e) => setProjStatus(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        >
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Planning">Planning</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Calendar Fiscal Year</label>
                        <input
                          id="proj-form-year"
                          type="number"
                          required
                          value={projYear}
                          onChange={(e) => setProjYear(Number(e.target.value))}
                          placeholder="e.g., 2026"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white"
                        />
                      </div>

                      <div className="md:col-span-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
                          <div>
                            <label className="text-slate-800 font-bold block text-xs">Project Gallery Banner</label>
                            <span className="text-[10px] text-slate-400 block font-normal uppercase tracking-wider mt-0.5">Define a visual image representing this club service action</span>
                          </div>
                          
                          {/* Tab buttons */}
                          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[10px] font-bold select-none shrink-0">
                            {(['preset', 'upload', 'url'] as const).map(tab => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setImageSourceTab(tab)}
                                className={`px-2.5 py-1 rounded transition-colors uppercase tracking-wider ${
                                  imageSourceTab === tab
                                    ? 'bg-white text-slate-800 shadow-3xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {tab === 'preset' ? '✨ Presets' : tab === 'upload' ? '📤 Upload' : '🔗 URL'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Main input option tab panels */}
                          <div className="lg:col-span-2 space-y-3">
                            
                            {imageSourceTab === 'preset' && (
                              <div className="space-y-2">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Select a premium curated focal preset:</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    {
                                      name: 'Safe Water Well',
                                      url: 'https://images.unsplash.com/photo-1541816521319-ef3d45e5f6e8?auto=format&fit=crop&q=80&w=800',
                                      tag: 'WASH'
                                    },
                                    {
                                      name: 'Youth Education',
                                      url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
                                      tag: 'Literacy'
                                    },
                                    {
                                      name: 'Midwife Kits',
                                      url: 'https://images.unsplash.com/photo-1584515901367-f70ca351a021?auto=format&fit=crop&q=80&w=800',
                                      tag: 'Pediatrics'
                                    },
                                    {
                                      name: 'Peacebuilding Support',
                                      url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800',
                                      tag: 'Peace'
                                    },
                                    {
                                      name: 'Green Climate Support',
                                      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
                                      tag: 'Environment'
                                    },
                                    {
                                      name: 'Professional Syndicate',
                                      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
                                      tag: 'Fellowship'
                                    }
                                  ].map((p, idx) => (
                                    <button
                                      key={p.url}
                                      type="button"
                                      onClick={() => setProjImageUrl(p.url)}
                                      className={`group relative text-left rounded-xl overflow-hidden aspect-video border transition-all ${
                                        projImageUrl === p.url
                                          ? 'ring-2 ring-rotary-azure border-transparent scale-98 shadow-xs'
                                          : 'border-slate-200 hover:border-slate-400'
                                      }`}
                                    >
                                      <img
                                        src={p.url}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 p-1 text-center text-[8px] font-black uppercase text-white truncate">
                                        {p.name}
                                      </div>
                                      {projImageUrl === p.url && (
                                        <div className="absolute top-1 right-1 bg-rotary-azure text-white p-0.5 rounded-full">
                                          <Check className="h-2.5 w-2.5" />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {imageSourceTab === 'upload' && (
                              <div className="space-y-2">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Drag or select a local image file:</span>
                                <div 
                                  className="border-2 border-dashed border-slate-300 hover:border-rotary-azure transition-colors rounded-2xl p-4 text-center cursor-pointer relative bg-white flex flex-col items-center justify-center min-h-[140px]"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleImageFile(file);
                                  }}
                                  onClick={() => {
                                    document.getElementById('proj-image-file-input')?.click();
                                  }}
                                >
                                  <input
                                    id="proj-image-file-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageFile(file);
                                    }}
                                  />
                                  <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                  <p className="text-[11px] font-bold text-slate-700">Click to browse or drop image here</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">Supports PNG, JPG, WebP (Converted to Postgres-safe Base64 inline)</p>
                                </div>
                              </div>
                            )}

                            {imageSourceTab === 'url' && (
                              <div className="space-y-3">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Provide a secure remote image URL:</span>
                                <div className="space-y-1">
                                  <input
                                    id="proj-form-image"
                                    type="url"
                                    value={projImageUrl}
                                    onChange={(e) => setProjImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/... or other secure HTTPS links"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-rotary-azure text-[11px]"
                                  />
                                </div>
                                <div className="bg-slate-100/50 p-2.5 rounded-xl border border-slate-150 text-[10px] text-slate-500 font-medium space-y-1">
                                  <p className="font-bold uppercase text-slate-600 text-[8px] tracking-wider">💡 Remote Image Tip</p>
                                  <p>Ensure the image URL starts with <span className="font-semibold text-slate-700">https://</span> to guarantee modern browser sandbox requests execute without mixed-content protocol errors.</p>
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Live Render Preview Section */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                            <div className="space-y-1.5 flex-1 flex flex-col">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Live Banner Preview:</span>
                              
                              {projImageUrl ? (
                                <div className="relative group flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[100px] flex items-center justify-center">
                                  <img
                                    src={projImageUrl}
                                    alt="Live Gallery Project preview"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover absolute inset-0"
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      img.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=800';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => setProjImageUrl('')}
                                      className="p-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer select-none"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-4 min-h-[100px]">
                                  <Image className="h-6 w-6 text-slate-350 mb-1" />
                                  <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-wider">No layout image selected</p>
                                  <p className="text-[8px] text-slate-400/80 text-center font-normal mt-0.5">Will resolve to global theme fallback image banner</p>
                                </div>
                              )}
                            </div>

                            {projImageUrl && (
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] font-black uppercase text-slate-450 tracking-wider">
                                <span>Output Type:</span>
                                <span className="bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
                                  {projImageUrl.startsWith('data:') ? 'Base64 Local' : 'Secure Web URL'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-550 block">Description (Scope and background details)</label>
                        <textarea
                          id="proj-form-desc"
                          required
                          value={projDescription}
                          onChange={(e) => setProjDescription(e.target.value)}
                          placeholder="Describe the initiative, locations, goals achieved, and community demographics..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 h-24 text-slate-800 focus:bg-white resize-y"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-550 block">Impact Statement (Accomplishment stats)</label>
                        <input
                          id="proj-form-impact"
                          type="text"
                          value={projImpact}
                          onChange={(e) => setProjImpact(e.target.value)}
                          placeholder="e.g., Delivered drinkable water to over 5,000 residents and reduced water pandemics by 85%."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* FOR TAB: EVENTS */}
                  {activeTab === 'events' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-500">Event/Meeting Title</label>
                        <input
                          id="ev-form-title"
                          type="text"
                          required
                          value={evTitle}
                          onChange={(e) => setEvTitle(e.target.value)}
                          placeholder="e.g., Aberdeen Mangrove Plantation Service Day"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Meeting Date</label>
                        <input
                          id="ev-form-date"
                          type="date"
                          required
                          value={evDate}
                          onChange={(e) => setEvDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Scheduled Time / Segment</label>
                        <input
                          id="ev-form-time"
                          type="text"
                          required
                          value={evTime}
                          onChange={(e) => setEvTime(e.target.value)}
                          placeholder="e.g., 18:30 - 20:00 or GMT-hours"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-850"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Venue Location Address</label>
                        <input
                          id="ev-form-location"
                          type="text"
                          required
                          value={evLocation}
                          onChange={(e) => setEvLocation(e.target.value)}
                          placeholder="e.g., Lagoonda Hotel, Freetown"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Invited Guest Keynote Speaker</label>
                        <input
                          id="ev-form-speaker"
                          type="text"
                          value={evSpeaker}
                          onChange={(e) => setEvSpeaker(e.target.value)}
                          placeholder="e.g., Dr. Priscilla Massally (MD)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-500">Category Activity Type</label>
                        <select
                          id="ev-form-type"
                          value={evType}
                          onChange={(e) => setEvType(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        >
                          <option value="Weekly Meeting">Weekly Meeting</option>
                          <option value="Service Project">Service Project</option>
                          <option value="Social">Social</option>
                          <option value="Fundraiser">Fundraiser</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-500 block">Explanatory Agenda / Description</label>
                        <textarea
                          id="ev-form-desc"
                          value={evDescription}
                          onChange={(e) => setEvDescription(e.target.value)}
                          placeholder="Enter a brief background, registration specifications, or meeting protocols..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 h-20 text-slate-800 focus:bg-white resize-y"
                        />
                      </div>
                    </div>
                  )}

                  {/* FOR TAB: MEMBERS */}
                  {activeTab === 'members' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-500">Full Name</label>
                        <input
                          id="mem-form-name"
                          type="text"
                          required
                          value={memName}
                          onChange={(e) => setMemName(e.target.value)}
                          placeholder="e.g., Dr. Sahr Tommy-Kobi"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Official Role Title</label>
                        <select
                          id="mem-form-role"
                          value={memRole}
                          onChange={(e) => setMemRole(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        >
                          <option value="Rotarian">Rotarian</option>
                          <option value="Club Officer">Club Officer</option>
                          <option value="President">President</option>
                          <option value="Guest">Guest</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Email Address (Login Anchor)</label>
                        <input
                          id="mem-form-email"
                          type="email"
                          required
                          value={memEmail}
                          onChange={(e) => setMemEmail(e.target.value)}
                          placeholder="e.g., sahr@sunset.org"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Rotary Committee Seat</label>
                        <input
                          id="mem-form-committee"
                          type="text"
                          value={memCommittee}
                          onChange={(e) => setMemCommittee(e.target.value)}
                          placeholder="e.g., Water & Health Committee"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Attendance Rate (%)</label>
                        <input
                          id="mem-form-attendance"
                          type="number"
                          max="100"
                          min="0"
                          value={memAttendance}
                          onChange={(e) => setMemAttendance(Number(e.target.value))}
                          placeholder="95"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Contribution Goal ($ USD)</label>
                        <input
                          id="mem-form-contrib-goal"
                          type="number"
                          value={memContributionGoal}
                          onChange={(e) => setMemContributionGoal(Number(e.target.value))}
                          placeholder="500"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Contributed Amount ($ USD)</label>
                        <input
                          id="mem-form-contributed"
                          type="number"
                          value={memContributed}
                          onChange={(e) => setMemContributed(Number(e.target.value))}
                          placeholder="350"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Roster Classification</label>
                        <input
                          id="mem-form-classification"
                          type="text"
                          value={memClassification}
                          onChange={(e) => setMemClassification(e.target.value)}
                          placeholder="e.g., Medicine - Pediatrics"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Phone Contact</label>
                        <input
                          id="mem-form-phone"
                          type="text"
                          value={memPhone}
                          onChange={(e) => setMemPhone(e.target.value)}
                          placeholder="e.g., +232 76 543 210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Joined Date</label>
                        <input
                          id="mem-form-joined"
                          type="text"
                          value={memJoinedDate}
                          onChange={(e) => setMemJoinedDate(e.target.value)}
                          placeholder="e.g., 2026-04-12"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Birthday (e.g. October 12)</label>
                        <input
                          id="mem-form-birthday"
                          type="text"
                          value={memBirthday}
                          onChange={(e) => setMemBirthday(e.target.value)}
                          placeholder="e.g. October 12"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-500">Profile Photo / Avatar URL</label>
                        <input
                          id="mem-form-avatar"
                          type="text"
                          value={memAvatarUrl}
                          onChange={(e) => setMemAvatarUrl(e.target.value)}
                          placeholder="e.g., https://images.unsplash.com/photo-..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                        />
                      </div>

                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <input
                            id="mem-form-is-phf"
                            type="checkbox"
                            checked={memIsPaulHarrisFellow}
                            onChange={(e) => setMemIsPaulHarrisFellow(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-rotary-azure focus:ring-rotary-azure cursor-pointer"
                          />
                          <label htmlFor="mem-form-is-phf" className="text-slate-700 font-bold select-none cursor-pointer">
                            Is Paul Harris Fellow (PHF)?
                          </label>
                        </div>

                        {memIsPaulHarrisFellow && (
                          <div className="space-y-1">
                            <label className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider leading-none">Paul Harris Recognition level</label>
                            <select
                              id="mem-form-phf-level"
                              value={memPaulHarrisLevel}
                              onChange={(e) => setMemPaulHarrisLevel(e.target.value as any)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 text-[11px]"
                            >
                              <option value="PHF">PHF (Honorary Fellow)</option>
                              <option value="PHF+1">PHF + 1</option>
                              <option value="PHF+2">PHF + 2</option>
                              <option value="PHF+3">PHF + 3</option>
                              <option value="PHF+4">PHF + 4</option>
                              <option value="PHF+8">PHF + 8</option>
                              <option value="Major Donor">Major Donor (Level 1)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-slate-500">Assigned Tasks (Comma-separated)</label>
                        <input
                          id="mem-form-tasks"
                          type="text"
                          value={memTasks}
                          onChange={(e) => setMemTasks(e.target.value)}
                          placeholder="e.g., Well installation audit, Setup gala tickets, Greet high-table speaker"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* FORM ACTION CONTROLS */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      id="admin-form-cancel"
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingId(null);
                        clearFormFields();
                      }}
                      className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl font-bold font-display uppercase tracking-wider text-[10px] text-slate-600 hover:text-slate-800 cursor-pointer transition-colors focus:outline-none"
                    >
                      Clear & Dismiss
                    </button>
                    <button
                      id="admin-form-submit"
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 bg-rotary-azure hover:bg-rotary-azure-dark rounded-xl font-extrabold font-display uppercase tracking-wider text-[10px] text-white cursor-pointer shadow-xs transition-all flex items-center gap-1.5 focus:outline-none"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Writing Transaction...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Commit To Postgres Database</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================== */}
        {/* DATA GRID & INTERACTION LISTING SECTION */}
        {/* ========================================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 space-y-3">
            <RefreshCw className="h-8 w-8 text-rotary-azure animate-spin" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Querying Postgres Schema tables...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            {/* TAB: PROJECTS TABLE VIEW */}
            {activeTab === 'projects' && (
              <div className="min-w-[850px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                      <th className="py-3 px-4">Workspace Preview</th>
                      <th className="py-3 px-4">Project Summary Info</th>
                      <th className="py-3 px-4">Area Priority Focus</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Year</th>
                      <th className="py-3 px-4 text-right">Database Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-600">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No matching active projects found inside the database table.
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 w-28">
                            <img
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1541816521319-ef3d45e5f6e8?auto=format&fit=crop&q=80&w=800'}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-20 h-12 object-cover rounded-lg border border-slate-200 shadow-3xs hover:scale-105 transition-transform"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <span className="font-extrabold text-slate-800 text-xs block truncate leading-snug" title={p.title}>{p.title}</span>
                            <p className="text-[10px] text-slate-450 leading-relaxed font-medium line-clamp-2 mt-0.5" title={p.description}>
                              {p.description}
                            </p>
                            {p.impact && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 rounded p-1 block mt-1 shrink-0 font-medium limit-line">
                                🌟 <b>Impact:</b> {p.impact}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-500">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 text-center select-none">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              p.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : p.status === 'Active' 
                                ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-500 text-center text-xs">
                            {p.year}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                id={`edit-proj-${p.id}`}
                                onClick={() => loadRecordForEdit(p)}
                                className="p-1 px-2.5 border border-slate-200 text-slate-600 hover:text-rotary-azure hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-bold"
                              >
                                Edit
                              </button>
                              <button
                                id={`delete-proj-${p.id}`}
                                onClick={() => handleRecordDelete(p.id, p.title)}
                                className="p-1 px-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: EVENTS TABLE VIEW */}
            {activeTab === 'events' && (
              <div className="min-w-[850px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                      <th className="py-3 px-4">Event Date & Schedule</th>
                      <th className="py-3 px-4">Meeting Title & Scope</th>
                      <th className="py-3 px-4">Venue Address</th>
                      <th className="py-3 px-4">Guest Speaker</th>
                      <th className="py-3 px-4 text-center">Type Group</th>
                      <th className="py-3 px-4 text-right">Database Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-600">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No scheduled meetings or events listed in the events table yet.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 w-44 select-none">
                            <div className="flex items-center gap-1.5 font-bold text-slate-850">
                              <Calendar className="h-3.5 w-3.5 text-rotary-azure shrink-0" />
                              <span>{e.date}</span>
                            </div>
                            <span className="block text-[10px] text-slate-400 font-medium ml-5 leading-none mt-1">{e.time || 'General schedule'}</span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="font-extrabold text-slate-800 text-xs block leading-snug">{e.title}</span>
                            {e.description && (
                              <p className="text-[10px] text-slate-450 leading-relaxed font-medium line-clamp-1 mt-0.5">
                                {e.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 w-48 font-medium">
                            <div className="flex items-center gap-1 text-[11px]">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate" title={e.location}>{e.location}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 w-36 italic font-bold text-slate-500">
                            {e.speaker ? `🎙️ ${e.speaker}` : 'No guest announced'}
                          </td>
                          <td className="py-3 px-4 text-center select-none">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              e.type === 'Weekly Meeting' 
                                ? 'bg-rotary-gold/20 text-rotary-gold border border-rotary-gold/30' 
                                : e.type === 'Service Project' 
                                ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                                : e.type === 'Fundraiser' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {e.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                id={`edit-ev-${e.id}`}
                                onClick={() => loadRecordForEdit(e)}
                                className="p-1 px-2.5 border border-slate-200 text-slate-600 hover:text-rotary-azure hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-bold"
                              >
                                Edit
                              </button>
                              <button
                                id={`delete-ev-${e.id}`}
                                onClick={() => handleRecordDelete(e.id, e.title)}
                                className="p-1 px-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: MEMBERS TABLE VIEW */}
            {activeTab === 'members' && (
              <div className="min-w-[850px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                      <th className="py-3 px-4">Member Name / Email</th>
                      <th className="py-3 px-4">Role Title</th>
                      <th className="py-3 px-4">Rotary Committee</th>
                      <th className="py-3 px-4 text-center">Attendance %</th>
                      <th className="py-3 px-4 text-center">Charity Contribution</th>
                      <th className="py-3 px-4 text-right">Database Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-600">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Users className="h-10 w-10 text-slate-300 animate-bounce" />
                            <p className="text-xs font-bold text-slate-550 max-w-sm leading-relaxed">
                              No Rotarian members or registered club logs found in your active database.
                            </p>
                            <button
                              id="seed-members-btn"
                              type="button"
                              onClick={async () => {
                                setActionLoading(true);
                                try {
                                  let count = 0;
                                  for (const member of INITIAL_MEMBER_DIRECTORY) {
                                    await upsertSupabaseUser(member);
                                    count++;
                                  }
                                  triggerToast(`Successfully seeded/imported ${count} default Rotarian member profiles into your database!`, 'success');
                                  await fetchData();
                                  if (onStateRefresh) onStateRefresh();
                                } catch (err: any) {
                                  console.error(err);
                                  triggerToast('Failed to seed directory: ' + (err.message || String(err)), 'error');
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              className="px-5 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark rounded-xl text-white font-black font-display uppercase tracking-wider text-[10px] cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 focus:outline-none"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Seed & Map Standard Chapter Roster ({INITIAL_MEMBER_DIRECTORY.length} Members)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.uid} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-rotary-azure/10 text-rotary-azure flex items-center justify-center font-bold text-xs select-none">
                                {m.name ? m.name.charAt(0) : 'U'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-800 text-xs block leading-tight">{m.name}</span>
                                <span className="text-[10px] text-slate-450 block font-semibold leading-none mt-0.5 font-mono">{m.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 select-none">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none block w-max ${
                              m.role === 'President' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : m.role === 'Club Officer' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                : m.role === 'Rotarian' 
                                ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-bold">
                            {m.committee || 'General Fellowship'}
                          </td>
                          <td className="py-3 px-4 text-center select-none font-mono">
                            <div className="w-16 mx-auto leading-none">
                              <span className="font-bold text-xs text-slate-700">{m.attendanceRate || 92}%</span>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1 flex">
                                <div 
                                  className={`h-full ${Number(m.attendanceRate || 0) > 85 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                  style={{ width: `${m.attendanceRate || 92}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className="font-black text-slate-700">${m.contributedAmount || 0}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">Goal: ${m.contributionGoals || 500}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                id={`edit-mem-${m.uid}`}
                                onClick={() => loadRecordForEdit(m)}
                                className="p-1 px-2.5 border border-slate-200 text-slate-600 hover:text-rotary-azure hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-bold"
                              >
                                Edit
                              </button>
                              <button
                                id={`delete-mem-${m.uid}`}
                                onClick={() => handleRecordDelete(m.uid, m.name)}
                                className="p-1 px-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: INQUIRIES VIEW (INBOX READER MODE) */}
            {activeTab === 'inquiries' && (
              <div className="min-w-[850px]">
                <table className="w-full text-left text-xs border-collapse font-semibold text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                      <th className="py-3 px-4">Contact Information</th>
                      <th className="py-3 px-4">Inquiry Category</th>
                      <th className="py-3 px-4">Subject Flag</th>
                      <th className="py-3 px-4">Message Snippet</th>
                      <th className="py-3 px-4 text-center">Inquiry Date</th>
                      <th className="py-3 px-4 text-right">Inquiry Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No visitor contact inquiries received in your inbox database.
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-800 text-xs block leading-tight">{i.name}</span>
                            <span className="text-[10px] text-slate-450 block font-semibold leading-none mt-0.5 font-mono">{i.email}</span>
                          </td>
                          <td className="py-3 px-4 select-none">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block w-max ${
                              i.type === 'Membership Inquiry' 
                                ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                : i.type === 'Donation Inquiry' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {i.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-850 max-w-[150px] truncate">
                            {i.subject || 'No Subject'}
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <p className="text-[10px] text-slate-450 font-medium leading-relaxed line-clamp-1 italic">
                              "{i.message}"
                            </p>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400 w-32 select-none">
                            {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                id={`read-inq-${i.id}`}
                                onClick={() => setSelectedInquiry(i)}
                                className="p-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-[10px] uppercase font-bold flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Read</span>
                              </button>
                              <button
                                id={`delete-inq-${i.id}`}
                                onClick={() => handleRecordDelete(i.id, i.name)}
                                className="p-1 px-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors text-[10px] uppercase font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: PAGES COPY CMS WRITER VIEW */}
            {activeTab === 'pages' && (
              <div className="bg-slate-50 p-6 select-text text-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <FileText className="h-4 w-4 text-rotary-azure" />
                      Visual Website Copy Builder
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                      Edit any text, stat, or header across the Rotary Sunsets landing pages instantly
                    </p>
                  </div>
                  <button
                    id="submit-cms-settings-btn"
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        await updateSiteSettings(siteSettings);
                        triggerToast('Website layout settings successfully saved to Supabase Postgres!', 'success');
                        if (onStateRefresh) onStateRefresh();
                      } catch (err: any) {
                        console.error(err);
                        triggerToast('Failed to save settings: ' + (err.message || String(err)), 'error');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer focus:outline-none"
                  >
                    {actionLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4.5 w-4.5" />
                    )}
                    <span>Save Website Layout changes</span>
                  </button>
                </div>

                {/* Sub tabs inside copy builder */}
                <div className="flex gap-2 border-b border-slate-200 pb-2 select-none overflow-x-auto text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => setCmsSubTab('home')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      cmsSubTab === 'home'
                        ? 'bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 font-black'
                        : 'hover:text-slate-700'
                    }`}
                  >
                    🏠 Homepage Copy
                  </button>
                  <button
                    onClick={() => setCmsSubTab('about')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      cmsSubTab === 'about'
                        ? 'bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 font-black'
                        : 'hover:text-slate-705'
                    }`}
                  >
                    ℹ️ About Page Copy
                  </button>
                  <button
                    onClick={() => setCmsSubTab('involved')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      cmsSubTab === 'involved'
                        ? 'bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 font-black'
                        : 'hover:text-slate-705'
                    }`}
                  >
                    🤝 Get Involved Copy
                  </button>
                </div>

                {/* Content form fields based on subsection */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  {cmsSubTab === 'home' && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>🚀</span> Hero Head Copy
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550 leading-relaxed">
                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Hero Top Badge</label>
                          <input
                            type="text"
                            value={siteSettings.homeHeroBadge || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeHeroBadge: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Hero Main Headline</label>
                          <input
                            type="text"
                            value={siteSettings.homeHeroTitle || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeHeroTitle: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Hero Subtitle Paragraph</label>
                          <textarea
                            rows={3}
                            value={siteSettings.homeHeroSubtitle || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeHeroSubtitle: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 font-medium focus:bg-white resize-y"
                          />
                        </div>
                      </div>

                      <div className="border-b border-slate-100 pb-3 pt-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>📊</span> Landing Performance Statistics
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-slate-550 leading-relaxed">
                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Residents Served Stat Text</label>
                          <input
                            type="text"
                            value={siteSettings.homeResidentsServed || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeResidentsServed: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Resources Shipped Stat Text</label>
                          <input
                            type="text"
                            value={siteSettings.homeResourcesShipped || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeResourcesShipped: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Maternal Midwife Kits Stat Text</label>
                          <input
                            type="text"
                            value={siteSettings.homeMaternalKits || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeMaternalKits: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Financial Audit Trail Text</label>
                          <input
                            type="text"
                            value={siteSettings.homeFinancingAudit || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeFinancingAudit: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="border-b border-slate-100 pb-3 pt-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>📜</span> Sunset Mission & Wholeness
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550 leading-relaxed">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Sunset Mission Headline</label>
                          <input
                            type="text"
                            value={siteSettings.homeMissionTitle || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeMissionTitle: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Mission Description Paragraph 1</label>
                          <textarea
                            rows={3}
                            value={siteSettings.homeMissionBody1 || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeMissionBody1: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Mission Description Paragraph 2</label>
                          <textarea
                            rows={3}
                            value={siteSettings.homeMissionBody2 || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, homeMissionBody2: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="border-b border-slate-100 pb-3 pt-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>✨</span> Core Values & Highlights (Three Columns)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-semibold text-slate-550 leading-relaxed">
                        {/* Highlight 1 */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] font-black uppercase text-indigo-600 block bg-indigo-50 px-2 py-1 rounded w-fit">Valuable Insight 1</span>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={siteSettings.homeServiceValueTitle1 || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, homeServiceValueTitle1: e.target.value }))}
                              className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Body Summary Description</label>
                            <textarea
                              rows={3}
                              value={siteSettings.homeServiceValueBody1 || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, homeServiceValueBody1: e.target.value }))}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-slate-850"
                            />
                          </div>
                        </div>

                        {/* Highlight 2 */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] font-black uppercase text-emerald-600 block bg-emerald-50 px-2 py-1 rounded w-fit">Valuable Insight 2</span>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={siteSettings.homeServiceValueTitle2 || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, homeServiceValueTitle2: e.target.value }))}
                              className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Body Summary Description</label>
                            <textarea
                              rows={3}
                              value={siteSettings.homeServiceValueBody2 || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, homeServiceValueBody2: e.target.value }))}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-slate-850"
                            />
                          </div>
                        </div>

                        {/* Highlight 3 */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] font-black uppercase text-amber-600 block bg-amber-50 px-2 py-1 rounded w-fit">Valuable Insight 3</span>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={siteSettings.homeServiceValueTitle3 || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, homeServiceValueTitle3: e.target.value }))}
                              className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Body Summary Description</label>
                            <textarea
                              rows={3}
                              value={siteSettings.homeServiceValueBody3 || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, homeServiceValueBody3: e.target.value }))}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-slate-850"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'about' && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>ℹ️</span> About Page Introductory Header
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550 leading-relaxed">
                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">About Page Top Badge</label>
                          <input
                            type="text"
                            value={siteSettings.aboutHeaderBadge || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutHeaderBadge: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Intro Head Heading</label>
                          <input
                            type="text"
                            value={siteSettings.aboutHeaderTitle || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutHeaderTitle: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Intro Paragraph Description Text</label>
                          <textarea
                            rows={3}
                            value={siteSettings.aboutHeaderDesc || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutHeaderDesc: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-855 font-medium focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="border-b border-slate-100 pb-3 pt-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>🧭</span> Vision & Mission Card Elements
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-550 leading-relaxed">
                        {/* Vision Card */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] font-black uppercase text-rotary-azure block bg-sky-50 px-2 py-1 rounded w-fit">Vision Statement Card Settings</span>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={siteSettings.aboutVisionTitle || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutVisionTitle: e.target.value }))}
                              className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Core Message Description Text</label>
                            <textarea
                              rows={4}
                              value={siteSettings.aboutVisionBody || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutVisionBody: e.target.value }))}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-slate-855 resize-y"
                            />
                          </div>
                        </div>

                        {/* Mission Card */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] font-black uppercase text-rotary-gold block bg-amber-50 px-2 py-1 rounded w-fit font-display">Mission Statement Card Settings</span>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={siteSettings.aboutMissionTitle || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutMissionTitle: e.target.value }))}
                              className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-widest font-bold">Core Message Description Text</label>
                            <textarea
                              rows={4}
                              value={siteSettings.aboutMissionBody || ''}
                              onChange={(e) => setSiteSettings(prev => ({ ...prev, aboutMissionBody: e.target.value }))}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-slate-855 resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsSubTab === 'involved' && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-1">
                          <span>🤝</span> Get Involved header and Intro Settings
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550 leading-relaxed">
                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Get Involved Page Badge</label>
                          <input
                            type="text"
                            value={siteSettings.involvedBadge || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, involvedBadge: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Involved Page Main Headline</label>
                          <input
                            type="text"
                            value={siteSettings.involvedTitle || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, involvedTitle: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Intro Quote or Description paragraph</label>
                          <textarea
                            rows={4}
                            value={siteSettings.involvedSubtitle || ''}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, involvedSubtitle: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-855 font-medium focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs select-none">
                  <button
                    id="reset-cms-form-btn"
                    onClick={async () => {
                      if (window.confirm('Reset local changes? Unsaved edits will be reverted.')) {
                        setLoading(true);
                        try {
                          const res = await getSiteSettings();
                          setSiteSettings(res);
                          triggerToast('Form refreshed successfully.', 'info');
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="px-4 py-2 border border-slate-350 hover:border-slate-500 rounded-xl uppercase text-[10px] font-bold tracking-wider text-slate-600 transition-colors cursor-pointer"
                  >
                    Reset Visual Form
                  </button>
                  <button
                    id="submit-cms-settings-btn-bottom"
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        await updateSiteSettings(siteSettings);
                        triggerToast('Website layout copy successfully applied to live site!', 'success');
                        if (onStateRefresh) onStateRefresh();
                      } catch (err: any) {
                        console.error(err);
                        triggerToast('Failed to save settings: ' + (err.message || String(err)), 'error');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white uppercase text-[10px] font-extrabold font-display tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer focus:outline-none"
                  >
                    {actionLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Apply Settings to Live Website</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: DESIGN & LAYOUT ELEMENTOR PANEL */}
            {activeTab === 'design' && (
              <div className="bg-slate-50 p-6 select-none text-slate-800 space-y-6">
                
                {/* Header controls box */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <Sliders className="h-4 w-4 text-rotary-azure" />
                      Visual Page Section Manager
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                      Control section stacking order, view state visibility, and background themes instantly
                    </p>
                  </div>
                  <button
                    id="submit-design-settings-btn"
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const updated = {
                          ...siteSettings,
                          homeLayout: JSON.stringify(homeBlocks),
                          aboutLayout: JSON.stringify(aboutBlocks)
                        };
                        await updateSiteSettings(updated);
                        // Make sure we update our local siteSettings so everything stays in sync
                        setSiteSettings(updated);
                        triggerToast('Page sequence and background themes successfully committed to Supabase Postgres!', 'success');
                        if (onStateRefresh) onStateRefresh();
                      } catch (err: any) {
                        console.error(err);
                        triggerToast('Failed to save layout: ' + (err.message || String(err)), 'error');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer focus:outline-none"
                  >
                    {actionLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4.5 w-4.5" />
                    )}
                    <span>Apply Custom Stacks & Backgrounds</span>
                  </button>
                </div>

                {/* Sub tabs inside design manager */}
                <div className="flex gap-2 border-b border-slate-200 pb-2 select-none overflow-x-auto text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <button
                    onClick={() => setDesignSubTab('home')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      designSubTab === 'home'
                        ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-600/20 font-black'
                        : 'hover:text-slate-700 font-bold'
                    }`}
                  >
                    🏠 Homepage Stack Editor
                  </button>
                  <button
                    onClick={() => setDesignSubTab('about')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      designSubTab === 'about'
                        ? 'bg-indigo-600/10 text-indigo-700 border border-indigo-600/20 font-black'
                        : 'hover:text-slate-700 font-bold'
                    }`}
                  >
                    ℹ️ About Page Section List
                  </button>
                </div>

                {/* Main Visual Drag & Stack editor splitting */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* LEFT SIDE: Dynamic blocks lists controls (7 Spans) */}
                  <div className="xl:col-span-7 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                      
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Active Section Blocks list ({designSubTab === 'home' ? homeBlocks.length : aboutBlocks.length} sections)
                          </h4>
                          <span className="text-[9px] text-slate-400 font-normal">Use arrows to visually reorder blocks and click sliders to adjust background appearance styles.</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(designSubTab === 'home' ? homeBlocks : aboutBlocks).map((b, idx, arr) => {
                          const isFirst = idx === 0;
                          const isLast = idx === arr.length - 1;

                          return (
                            <div 
                              key={b.id}
                              className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                b.visible 
                                  ? 'bg-white border-slate-200 shadow-3xs'
                                  : 'bg-slate-50/50 border-slate-150 border-dashed opacity-60'
                              }`}
                            >
                              
                              {/* Reorder actions & Text Label */}
                              <div className="flex items-center gap-3">
                                
                                {/* Movement arrows */}
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveBlockUp(designSubTab, idx)}
                                    disabled={isFirst}
                                    title="Move section up"
                                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
                                      isFirst 
                                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:scale-90 cursor-pointer'
                                    }`}
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveBlockDown(designSubTab, idx)}
                                    disabled={isLast}
                                    title="Move section down"
                                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
                                      isLast 
                                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:scale-90 cursor-pointer'
                                    }`}
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-650 font-extrabold text-[10px] flex items-center justify-center border border-indigo-100 font-mono">
                                      {idx + 1}
                                    </span>
                                    <h5 className={`text-xs font-extrabold font-display leading-tight ${b.visible ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                      {b.title}
                                    </h5>
                                  </div>
                                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">
                                    Identifier Tag: {b.id}
                                  </p>
                                </div>

                              </div>

                              {/* Interactive controllers: Background and Toggle visibility */}
                              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                
                                {/* Background palette selector */}
                                <div className="space-y-1">
                                  <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Section Theme Canvas:</label>
                                  <div className="flex items-center gap-1">
                                    {[
                                      { key: 'light', name: 'Standard White', style: 'bg-white border-slate-350' },
                                      { key: 'slate', name: 'Cool Slate', style: 'bg-slate-100 border-slate-350' },
                                      { key: 'brand', name: 'Rotary Azure Tint', style: 'bg-sky-100/70 border-sky-350' },
                                      { key: 'gold', name: 'Warm Gold Tint', style: 'bg-amber-100/70 border-amber-350' },
                                      { key: 'dark', name: 'Sunset Navy/Dark', style: 'bg-slate-800 border-slate-900' }
                                    ].map((palette) => (
                                      <button
                                        key={palette.key}
                                        type="button"
                                        onClick={() => changeBlockBgColor(designSubTab, idx, palette.key as any)}
                                        title={palette.name}
                                        className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer ${palette.style} ${
                                          b.bgColor === palette.key 
                                            ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-xs' 
                                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Visibility Eye toggles */}
                                <button
                                  type="button"
                                  onClick={() => toggleBlockVisibility(designSubTab, idx)}
                                  className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer select-none font-bold text-[9px] uppercase tracking-wider ${
                                    b.visible
                                      ? 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100/75'
                                      : 'bg-slate-100 border-slate-205 text-slate-450 hover:bg-slate-200'
                                  }`}
                                >
                                  {b.visible ? (
                                    <>
                                      <Eye className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Hidden</span>
                                    </>
                                  )}
                                </button>

                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* RIGHT SIDE: Interactive stack render preview mockup (5 Spans) */}
                  <div className="xl:col-span-5 space-y-4">
                    <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md relative overflow-hidden">
                      
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-450 animate-pulse" />
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-350">Page Assembler Preview</h4>
                            <p className="text-[8px] text-slate-500 font-normal">Real-time modular stacking architecture</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-slate-800 text-rotary-gold border border-slate-700 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {designSubTab === 'home' ? 'Homepage Stack' : 'About Legacy Stack'}
                        </span>
                      </div>

                      {/* Mockup blocks render lists */}
                      <div className="space-y-2 py-2 min-h-[300px] flex flex-col justify-start">
                        {(designSubTab === 'home' ? homeBlocks : aboutBlocks).map((b, idx) => {
                          const bgStyles = 
                            b.bgColor === 'dark' 
                              ? 'bg-slate-800 text-slate-100 border-slate-700' 
                              : b.bgColor === 'slate'
                              ? 'bg-slate-100 text-slate-700 border-slate-350'
                              : b.bgColor === 'brand'
                              ? 'bg-sky-50 text-slate-700 border-sky-200'
                              : b.bgColor === 'gold'
                              ? 'bg-amber-50 text-slate-700 border-amber-200'
                              : 'bg-white text-slate-800 border-slate-350';

                          return (
                            <div 
                              key={b.id}
                              className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-300 ${bgStyles} ${
                                b.visible ? 'shadow-3xs opacity-100 animate-fade-in' : 'border-dashed border-slate-800 opacity-25 scale-98 bg-transparent text-slate-600'
                              }`}
                            >
                              <div className="flex justify-between items-center select-none">
                                <div className="flex items-center gap-1.5 leading-none">
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${
                                    b.visible ? 'bg-indigo-650 text-white' : 'bg-slate-800 text-slate-500'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="text-[10px] font-extrabold uppercase font-display tracking-tight truncate max-w-[130px]">{b.title}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-[7px] py-[1px] px-1.5 rounded uppercase font-black tracking-widest bg-slate-400/20 text-slate-500">
                                    {b.bgColor}
                                  </span>
                                  {!b.visible && (
                                    <span className="text-[7px] font-bold text-red-500 uppercase bg-red-50 px-1 rounded">Hidden</span>
                                  )}
                                </div>
                              </div>

                              {/* Subtle graphic wireframe mock layout inside cards to denote section features */}
                              <div className="mt-2.5 pt-2.5 border-t border-slate-400/10 space-y-1 flex flex-col items-start select-none text-[8px] opacity-75">
                                {b.id === 'hero' && (
                                  <>
                                    <div className="w-1/2 h-2.5 bg-slate-400/20 rounded"></div>
                                    <div className="w-3/4 h-2 bg-slate-400/10 rounded"></div>
                                    <div className="flex gap-1.5 pt-1">
                                      <div className="w-12 h-3 bg-indigo-550 rounded-md"></div>
                                      <div className="w-12 h-3 bg-slate-500/10 rounded-md border border-slate-400/10"></div>
                                    </div>
                                  </>
                                )}
                                {b.id === 'stats' && (
                                  <div className="grid grid-cols-4 gap-1 w-full pt-1">
                                    <div className="bg-slate-400/10 p-1.5 rounded text-center font-bold">5K+</div>
                                    <div className="bg-slate-400/10 p-1.5 rounded text-center font-bold">4.5K+</div>
                                    <div className="bg-slate-400/10 p-1.5 rounded text-center font-bold">1.5K</div>
                                    <div className="bg-slate-400/10 p-1.5 rounded text-center font-bold">100%</div>
                                  </div>
                                )}
                                {b.id === 'mission' && (
                                  <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                                    <div className="space-y-1">
                                      <div className="w-full h-2 bg-slate-400/20 rounded"></div>
                                      <div className="w-5/6 h-2 bg-slate-400/10 rounded"></div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="w-full h-2 bg-slate-400/20 rounded"></div>
                                      <div className="w-5/6 h-2 bg-slate-400/10 rounded"></div>
                                    </div>
                                  </div>
                                )}
                                {b.id === 'facebook' && (
                                  <div className="w-full space-y-1.5 pt-1">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                                      <div className="w-12 h-1.5 bg-slate-400/20 rounded"></div>
                                    </div>
                                    <div className="w-full h-10 bg-slate-400/10 rounded-lg flex items-center justify-center font-bold text-[8px] text-slate-400 border border-slate-400/10">
                                      Facebook Media Player Layout
                                    </div>
                                  </div>
                                )}
                                {b.id === 'announcements' && (
                                  <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                                    <div className="p-1 px-1.5 bg-slate-400/10 rounded-lg space-y-1">
                                      <div className="w-2/3 h-1.5 bg-slate-400/20 rounded"></div>
                                      <div className="w-full h-1 bg-slate-400/10 rounded"></div>
                                    </div>
                                    <div className="p-1 px-1.5 bg-slate-400/10 rounded-lg space-y-1">
                                      <div className="w-2/3 h-1.5 bg-slate-400/20 rounded"></div>
                                      <div className="w-full h-1 bg-slate-400/10 rounded"></div>
                                    </div>
                                  </div>
                                )}
                                {b.id === 'header' && (
                                  <div className="w-full text-center space-y-1 py-1">
                                    <div className="w-16 h-2 bg-slate-400/20 rounded mx-auto"></div>
                                    <div className="w-24 h-1.5 bg-slate-400/10 rounded mx-auto"></div>
                                  </div>
                                )}
                                {b.id === 'vision_mission' && (
                                  <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                                    <div className="bg-slate-400/10 p-2 rounded-lg text-center font-bold">Our Vision</div>
                                    <div className="bg-slate-400/10 p-2 rounded-lg text-center font-bold">Our Mission</div>
                                  </div>
                                )}
                                {b.id === 'four_way_test' && (
                                  <div className="w-full space-y-1 pt-1">
                                    <div className="w-full h-3 bg-slate-650 p-1 rounded font-bold leading-none flex justify-between">
                                      <span>1. Is it the TRUTH?</span> <span>+</span>
                                    </div>
                                    <div className="w-full h-3 bg-indigo-650/40 border border-slate-600/30 p-1 rounded font-bold leading-none flex justify-between text-slate-100">
                                      <span>2. Is it FAIR to all concerned?</span> <span>−</span>
                                    </div>
                                  </div>
                                )}
                                {b.id === 'leadership' && (
                                  <div className="grid grid-cols-3 gap-1 w-full pt-1">
                                    <div className="p-2 bg-slate-400/10 rounded-lg flex flex-col items-center">
                                      <div className="w-4 h-4 bg-slate-400/20 rounded-full mb-1"></div>
                                      <div className="w-6 h-1 bg-slate-400/20 rounded"></div>
                                    </div>
                                    <div className="p-2 bg-slate-400/10 rounded-lg flex flex-col items-center">
                                      <div className="w-4 h-4 bg-slate-400/20 rounded-full mb-1"></div>
                                      <div className="w-6 h-1 bg-slate-400/20 rounded"></div>
                                    </div>
                                    <div className="p-2 bg-slate-400/10 rounded-lg flex flex-col items-center">
                                      <div className="w-4 h-4 bg-slate-400/20 rounded-full mb-1"></div>
                                      <div className="w-6 h-1 bg-slate-400/20 rounded"></div>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                </div>

                {/* Apply Design visual changes bottom buttons row */}
                <div className="flex justify-end gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs select-none">
                  <button
                    id="reset-design-form-btn"
                    onClick={async () => {
                      if (window.confirm('Reset Layout sequences? Unapplied sequence sorting/styling changes will be lost.')) {
                        setLoading(true);
                        try {
                          const res = await getSiteSettings();
                          setSiteSettings(res);
                          triggerToast('Layout configurations successfully loaded from persistent store.', 'info');
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="px-4 py-2 border border-slate-350 hover:border-slate-500 rounded-xl uppercase text-[10px] font-bold tracking-wider text-slate-600 transition-colors cursor-pointer"
                  >
                    Discard Layout changes
                  </button>
                  <button
                    id="submit-design-settings-btn-bottom"
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const updated = {
                          ...siteSettings,
                          homeLayout: JSON.stringify(homeBlocks),
                          aboutLayout: JSON.stringify(aboutBlocks)
                        };
                        await updateSiteSettings(updated);
                        setSiteSettings(updated);
                        triggerToast('Dynamic Page Template stack saved successfully!', 'success');
                        if (onStateRefresh) onStateRefresh();
                      } catch (err: any) {
                        console.error(err);
                        triggerToast('Failed to save layout configuration: ' + (err.message || String(err)), 'error');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white uppercase text-[10px] font-extrabold font-display tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer focus:outline-none"
                  >
                    {actionLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Apply Section Sequences & Blocks</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* ============================================== */}
      {/* INQUIRIES DETAIL MODAL POPUP (INBOX VIEW MORE) */}
      {/* ============================================== */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 max-w-lg w-full space-y-4 shadow-xl select-text"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full uppercase font-black tracking-widest">{selectedInquiry.type}</span>
                <h3 className="font-extrabold font-display text-slate-800 text-base leading-snug pt-1">🗣️ {selectedInquiry.subject || 'Incoming Visitor message'}</h3>
              </div>
              <button
                id="inq-modal-close"
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 text-[11px] font-semibold text-slate-550 border border-slate-100">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest leading-none">Sender Name</span>
                <span className="text-slate-800 text-xs block mt-1 font-bold">{selectedInquiry.name}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest leading-none">Sender Email</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-rotary-azure text-xs block mt-1 font-mono font-bold leading-none truncate underline">{selectedInquiry.email}</a>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="block text-[9px] text-slate-400 uppercase tracking-widest leading-none font-bold">Inquiry Message Body</span>
              <p className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                "{selectedInquiry.message}"
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 select-none">
              <a
                href={`mailto:${selectedInquiry.email}?subject=RE: ${selectedInquiry.subject || 'Rotary Sunset Contact'}`}
                className="px-4 py-2 bg-rotary-azure hover:bg-rotary-azure-dark rounded-xl text-white text-[10px] uppercase font-bold font-display tracking-wider cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Reply via Mail</span>
              </a>
              <button
                id="inq-modal-close-btn"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-350 rounded-xl text-slate-600 text-[10px] uppercase font-bold font-display tracking-wider cursor-pointer hover:bg-slate-50 transition-colors focus:outline-none"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

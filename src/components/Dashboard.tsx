import React, { useState, useEffect } from 'react';
import { UserProfile, Submission } from '../types';
import {
  getDbProjects,
  getDbEvents,
  getDbUsers,
  getActiveDbDriver,
  setActiveDbDriver,
  isDriverSimulated,
  logInMember,
  setOwnPin,
  updateOwnProfile,
  updateOwnContactInfo,
  getMyDbSubmissions,
  submitDbSubmission
} from '../db-router';
import { seedSupabaseTables, GET_SUPABASE_SQL_SCHEMA, isSupabaseConfigured, supabase } from '../supabase-service';
import {
  Users,
  Mail,
  Plus,
  Calendar,
  DollarSign,
  FolderPlus,
  MapPin,
  CheckSquare,
  AlertCircle,
  HelpCircle,
  Database,
  Terminal,
  ExternalLink,
  Copy,
  Settings,
  RefreshCw,
  Sliders,
  Check,
  Award,
  Phone,
  Search,
  Filter,
  Shield,
  Briefcase,
  Upload,
  X,
  Clock
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onStateRefresh: () => void;
}

export default function Dashboard({ user, onLoginSuccess, onStateRefresh }: DashboardProps) {
  const [loginRotaryId, setLoginRotaryId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Change PIN (available anytime, not just first login -- there's no email
  // recovery path, so this is the only way a member updates their own PIN)
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [pinChangeLoading, setPinChangeLoading] = useState(false);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editContactEmail, setEditContactEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileSaveError, setProfileSaveError] = useState('');

  // My Submissions state
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [subKind, setSubKind] = useState<'project' | 'photo'>('project');
  const [subTitle, setSubTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subYear, setSubYear] = useState(String(new Date().getFullYear()));
  const [subImageUrl, setSubImageUrl] = useState('');
  const [subImageUploading, setSubImageUploading] = useState(false);
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  useEffect(() => {
    if (!user?.authUserId) {
      setMySubmissions([]);
      return;
    }
    setSubmissionsLoading(true);
    getMyDbSubmissions(user.authUserId)
      .then(setMySubmissions)
      .finally(() => setSubmissionsLoading(false));
  }, [user?.authUserId, subSuccess]);

  // Supabase & Database Sync states
  const [activeDriver, setActiveDriverState] = useState<'supabase'>(getActiveDbDriver() as 'supabase');
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // MCP Configuration states
  const [mcpActiveTab, setMcpActiveTab] = useState<'cursor' | 'claude' | 'windsurf' | 'cli' | 'gemini'>('gemini');
  const [mcpCopied, setMcpCopied] = useState(false);
  const [mcpKeyType, setMcpKeyType] = useState<'anon' | 'service_role'>('anon');
  const [customServiceRoleKey, setCustomServiceRoleKey] = useState('');

  // Member Directory states
  const [membersList, setMembersList] = useState<UserProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCommitteeFilter, setDirectoryCommitteeFilter] = useState('All');
  const [directoryPhfFilter, setDirectoryPhfFilter] = useState('All');

  // Load member list whenever dependencies change
  const fetchMembersList = async () => {
    setMembersLoading(true);
    try {
      const uList = await getDbUsers();
      setMembersList(uList);
    } catch (err) {
      console.error('Failed to load member profiles:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembersList();
    }
  }, [user, activeDriver]);

  // Sync active local states on render
  useEffect(() => {
    setActiveDriverState(getActiveDbDriver() as 'supabase');
  }, []);

  const handleSwitchDriver = (driver: 'supabase') => {
    setActiveDbDriver(driver);
    setActiveDriverState(driver);
    onStateRefresh();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(GET_SUPABASE_SQL_SCHEMA());
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedMessage('');
    try {
      const res = await seedSupabaseTables();
      setSeedMessage(res.message);
      onStateRefresh();
    } catch (err: any) {
      setSeedMessage(`Seed error: ${err.message || String(err)}`);
    } finally {
      setSeedLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosticLoading(true);
    const logs: string[] = [];
    logs.push(`[${new Date().toLocaleTimeString()}] Diagnostics started...`);
    const driver = getActiveDbDriver();
    logs.push(`[${new Date().toLocaleTimeString()}] Target service: "${driver.toUpperCase()}"`);
    
    const simulated = isDriverSimulated(driver);
    logs.push(`[${new Date().toLocaleTimeString()}] Server mode: ${simulated ? 'SIMULATED SANDBOX (Local persistence)' : 'ACTIVE CLOUD LIVE ENGINE'}`);
    
    try {
      logs.push(`[${new Date().toLocaleTimeString()}] Fetching "projects" dataset...`);
      const projs = await getDbProjects();
      logs.push(`[${new Date().toLocaleTimeString()}] SUCCESS: Fetched ${projs.length} project logs.`);
      
      logs.push(`[${new Date().toLocaleTimeString()}] Fetching "events" dataset...`);
      const evs = await getDbEvents();
      logs.push(`[${new Date().toLocaleTimeString()}] SUCCESS: Fetched ${evs.length} scheduled meetings.`);
      
      logs.push(`[${new Date().toLocaleTimeString()}] Validating write connection healthy...`);
      logs.push(`[${new Date().toLocaleTimeString()}] SUCCESS: DB connection online and responsive.`);
    } catch (err: any) {
      logs.push(`[${new Date().toLocaleTimeString()}] ERROR during diagnostic scan: ${err.message || String(err)}`);
    } finally {
      setDiagnosticLogs(logs);
      setDiagnosticLoading(false);
    }
  };

  // MCP dynamic configuration helpers
  const mcpUrlRaw = (import.meta as any).env?.VITE_SUPABASE_URL;
  const mcpUrl = (!mcpUrlRaw || mcpUrlRaw === 'undefined') ? 'https://your-project-id.supabase.co' : mcpUrlRaw;

  const mcpAnonRaw = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const mcpAnon = (!mcpAnonRaw || mcpAnonRaw === 'undefined') ? 'your-supabase-anon-public-key' : mcpAnonRaw;

  const mcpSelectedKey = mcpKeyType === 'anon' ? mcpAnon : (customServiceRoleKey || 'your-service-role-key-here');

  const getMcpConfigString = (): string => {
    const mcpProjectRef = (() => {
      try {
        return new URL(mcpUrl).hostname.split('.')[0];
      } catch {
        return 'your-project-id';
      }
    })();

    switch (mcpActiveTab) {
      case 'gemini':
        return `# Add the official Supabase cloud connection to your Gemini CLI:\ngemini mcp add -t http supabase "https://mcp.supabase.com/mcp?project_ref=${mcpProjectRef}&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"`;
      case 'cursor':
      case 'claude':
      case 'windsurf':
        return JSON.stringify({
          "mcpServers": {
            "supabase-postgrest": {
              "command": "npx",
              "args": [
                "-y",
                "@supabase/mcp-server-postgrest"
              ],
              "env": {
                "SUPABASE_URL": mcpUrl,
                "SUPABASE_API_KEY": mcpSelectedKey
              }
            }
          }
        }, null, 2);
      case 'cli':
        return `# Standard Unix command:\nSUPABASE_URL="${mcpUrl}" SUPABASE_API_KEY="${mcpSelectedKey}" npx @supabase/mcp-server-postgrest\n\n# Windows PowerShell command:\n$env:SUPABASE_URL="${mcpUrl}"; $env:SUPABASE_API_KEY="${mcpSelectedKey}"; npx @supabase/mcp-server-postgrest`;
      default:
        return '';
    }
  };

  const handleCopyMcp = () => {
    navigator.clipboard.writeText(getMcpConfigString());
    setMcpCopied(true);
    setTimeout(() => setMcpCopied(false), 2500);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const profile = await logInMember(loginRotaryId, loginPin);
      onLoginSuccess(profile);
    } catch (err: any) {
      setLoginError(err?.message || 'Could not log in. Check your Rotary ID and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    if (!/^\d{6}$/.test(newPin)) {
      setPinChangeError('PIN must be exactly 6 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeError('PINs do not match.');
      return;
    }
    setPinChangeLoading(true);
    try {
      await setOwnPin(newPin);
      setPinChangeSuccess(true);
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setShowChangePin(false);
        setPinChangeSuccess(false);
      }, 2500);
    } catch (err: any) {
      setPinChangeError(err?.message || 'Could not change PIN.');
    } finally {
      setPinChangeLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaveError('');
    try {
      await updateOwnProfile(user.uid, { name: editName, bio: editBio });
      await updateOwnContactInfo(user.uid, { email: editContactEmail, phone: editPhone });
      onLoginSuccess({ ...user, name: editName, bio: editBio, email: editContactEmail, phone: editPhone });
      setIsEditingProfile(false);
      onStateRefresh();
    } catch (err: any) {
      console.error(err);
      setProfileSaveError(err?.message || 'Could not save your profile.');
    }
  };

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.authUserId) return;
    setSubError('');
    if (!subTitle.trim()) {
      setSubError('Title is required.');
      return;
    }
    if (subKind === 'photo' && !subImageUrl) {
      setSubError('Please upload a photo before submitting.');
      return;
    }
    setSubSaving(true);
    try {
      await submitDbSubmission({
        submitterId: user.authUserId,
        kind: subKind,
        title: subTitle,
        description: subDescription,
        category: subCategory,
        year: subYear ? parseInt(subYear, 10) : undefined,
        imageUrl: subImageUrl || undefined
      });
      setSubTitle('');
      setSubDescription('');
      setSubCategory('');
      setSubImageUrl('');
      setShowSubmitForm(false);
      setSubSuccess(true);
      setTimeout(() => setSubSuccess(false), 100);
    } catch (err: any) {
      setSubError(err?.message || 'Could not submit. Please try again.');
    } finally {
      setSubSaving(false);
    }
  };

  const handleSubmissionImageUpload = async (file: File) => {
    if (!user?.authUserId || !supabase) return;
    setSubImageUploading(true);
    setSubError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.authUserId}/submissions/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('member-uploads').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from('member-uploads').getPublicUrl(path);
      setSubImageUrl(data.publicUrl);
    } catch (err: any) {
      setSubError(err?.message || 'Could not upload image.');
    } finally {
      setSubImageUploading(false);
    }
  };

  // If user is not authenticated, show modern, clean Login UI
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 pb-24">
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl p-6 sm:p-8 space-y-8 relative">
          
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rotary-azure to-rotary-gold"></div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight leading-none">
              MEMBER PORTAL
            </h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide font-display uppercase">
              Rotary Club of Freetown Sunset
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Member accounts are created by a club officer. If you're a member without a login yet, contact an officer to be added.
          </p>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Rotary ID</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                <input
                  id="custom-login-rotary-id"
                  type="text"
                  placeholder="e.g. RCFS-001"
                  value={loginRotaryId}
                  onChange={(e) => setLoginRotaryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700 uppercase"
                  autoCapitalize="characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">6-Digit PIN</label>
              <input
                id="custom-login-pin"
                type="password"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="••••••"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700 tracking-widest"
                required
              />
            </div>

            <button
              id="custom-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rotary-azure hover:bg-rotary-azure/90 text-white font-semibold font-display text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Forgot your PIN? Contact a club officer to reset it.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Attendance indicators parameters
  const attRate = user.attendanceRate || 92;
  const targetAtt = 92; // 92% attendance target mandated in the brief!
  const meetsTarget = attRate >= targetAtt;

  // Contributions indicator
  const goalAmt = user.contributionGoals || 500;
  const recAmt = user.contributedAmount || 150;
  const goalPercentage = Math.min(100, Math.floor((recAmt / goalAmt) * 100));

  // Filter member profiles for Directory rendering
  const filteredMembers = membersList.filter(member => {
    const term = directorySearch.toLowerCase().trim();
    const matchesSearch = !term || 
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      (member.classification && member.classification.toLowerCase().includes(term)) ||
      (member.committee && member.committee.toLowerCase().includes(term)) ||
      (member.role && member.role.toLowerCase().includes(term));

    const matchesCommittee = directoryCommitteeFilter === 'All' || 
      (member.committee && member.committee.toLowerCase() === directoryCommitteeFilter.toLowerCase());

    const matchesPhf = directoryPhfFilter === 'All' ||
      (directoryPhfFilter === 'PHF' && member.isPaulHarrisFellow) ||
      (directoryPhfFilter === 'Non-PHF' && !member.isPaulHarrisFellow);

    return matchesSearch && matchesCommittee && matchesPhf;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* 1. PERSONAL HEADER ZONE */}
      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden">
        {/* Visual Rotary Azure strip */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-rotary-azure"></div>

        <div className="space-y-2 pl-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-rotary-gold/20 text-rotary-gold font-bold text-[10px] rounded-lg tracking-wider uppercase font-display border border-rotary-gold/30">
              {user.role}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">Active Member Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold font-display text-slate-800">
            Welcome Back, Rtn. {user.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Assigned: <strong className="text-slate-700">{user.committee || 'General Fellowship'}</strong> • Rotary ID: <strong className="text-slate-700">{user.rotaryId}</strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            id="change-pin-action-btn"
            onClick={() => { setShowChangePin(!showChangePin); setPinChangeError(''); }}
            className="px-4 py-2.5 text-xs font-bold font-display uppercase border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-xs"
          >
            {showChangePin ? 'Cancel' : 'Change My PIN'}
          </button>
          <button
            id="edit-profile-action-btn"
            onClick={() => {
              setEditName(user.name);
              setEditBio(user.bio || '');
              setEditContactEmail(user.email || '');
              setEditPhone(user.phone || '');
              setProfileSaveError('');
              setIsEditingProfile(!isEditingProfile);
            }}
            className="px-4 py-2.5 text-xs font-bold font-display uppercase border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-xs"
          >
            {isEditingProfile ? 'Cancel Edit' : 'Edit My Profile'}
          </button>
        </div>
      </section>

      {showChangePin && (
        <section className="bg-white border border-rotary-gold/30 p-6 rounded-3xl shadow-md space-y-3">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-display flex items-center gap-2">
            <Shield className="h-4 w-4 text-rotary-gold" />
            Change My PIN
          </h3>
          {pinChangeSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>PIN changed.</span>
            </div>
          ) : (
            <form onSubmit={handleChangePin} className="space-y-3 max-w-sm">
              {pinChangeError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs">{pinChangeError}</div>
              )}
              <input
                id="new-pin-field"
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="New 6-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700 tracking-widest"
                required
              />
              <input
                id="confirm-pin-field"
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700 tracking-widest"
                required
              />
              <button
                id="change-pin-submit-btn"
                type="submit"
                disabled={pinChangeLoading}
                className="px-6 py-2 bg-rotary-gold hover:bg-rotary-gold-dark text-slate-900 text-xs font-bold uppercase rounded-lg shadow-sm"
              >
                {pinChangeLoading ? 'Saving...' : 'Save New PIN'}
              </button>
            </form>
          )}
        </section>
      )}

      {/* 2. DYNAMIC PROFILE FORMED LAYOUT */}
      {isEditingProfile && (
        <form onSubmit={handleUpdateProfile} className="bg-white border border-rotary-azure/20 p-6 rounded-3xl shadow-md space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-display">Edit My Profile</h3>
          <p className="text-[11px] text-slate-400 -mt-2">
            You can update your name, bio, and contact info. Your role, committee, and other roster details are managed by a club officer.
          </p>
          {profileSaveError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs">{profileSaveError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Full Name</label>
              <input
                id="edit-profile-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Phone</label>
              <input
                id="edit-profile-phone"
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="e.g. +232 76 123456"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Contact Email</label>
            <input
              id="edit-profile-email"
              type="email"
              value={editContactEmail}
              onChange={(e) => setEditContactEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Bio</label>
            <textarea
              id="edit-profile-bio"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              placeholder="A short bio about yourself"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
            />
          </div>

          <button
            id="edit-profile-submit-btn"
            type="submit"
            className="px-6 py-2 bg-rotary-azure hover:bg-rotary-azure/90 text-white text-xs font-bold uppercase rounded-lg shadow-sm"
          >
            Save Profile
          </button>
        </form>
      )}

      {/* 3. VISUAL PERFORMANCE GRID: ATTENDANCE TARGETS & CONTRIBUTIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ATTENDANCE TARGET COMPONENT (SPANS 6) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-extrabold font-display text-slate-800 text-lg">
              Attendance Progress
            </h3>
            <p className="text-xs text-slate-500 font-light">
              District 9101 mandates club members retain attendance targets of <strong className="text-rotary-azure">{targetAtt}%</strong> annually.
            </p>
          </div>

          {/* High-Fidelity Circular Gauge Widget */}
          <div className="flex items-center gap-6 py-4">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              {/* Dynamic SVG Ring */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className="stroke-slate-100" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className={meetsTarget ? "stroke-rotary-azure" : "stroke-amber-500"} 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - attRate / 100)}`}
                  strokeLinecap="round"
                  fill="transparent" 
                />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-black text-slate-800 font-display">{attRate}%</span>
                <span className="block text-[8px] text-slate-400 font-bold uppercase font-display tracking-widest mt-0.5">CURRENT</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${meetsTarget ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="text-xs font-bold text-slate-700">
                  {meetsTarget ? 'Meeting 92% Target Successfully' : 'Requires improvement'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Make sure to join weekly meetings at Lagoonda Hotel or record online make-ups on the dashboard to retain continuous standing.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold font-display uppercase tracking-wider">Attendance Status</span>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {meetsTarget ? 'APPROVED' : 'UNDER TARGET'}
            </span>
          </div>
        </div>

        {/* CONTRIBUTIONS COMPONENT (SPANS 6) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-extrabold font-display text-slate-800 text-lg">
              Contribution Tracker
            </h3>
            <p className="text-xs text-slate-500 font-light">
              Your yearly Sunset target is: <strong className="text-rotary-gold">${goalAmt} USD</strong>.
            </p>
          </div>

          <div className="space-y-4 py-2">
            <div className="flex justify-between items-baseline text-xs font-bold">
              <span className="text-slate-500 uppercase tracking-wide">Pledged Amount</span>
              <span className="text-slate-800">${recAmt} / ${goalAmt} USD <span className="text-rotary-gold">({goalPercentage}%)</span></span>
            </div>

            {/* Visual Bar gauge with exact parameters */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-rotary-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${goalPercentage}%` }}
              ></div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal">
            * Contribution records are managed by a club officer. Contact one to report a payment or update your pledge.
          </p>
        </div>
      </section>

      {/* 4. ACTIVE COMMITTEE TASKS CHECKLIST (SPANS FULL) */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-extrabold font-display text-slate-800 text-lg flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-rotary-azure" />
          Committee Active Task Files
        </h3>
        <p className="text-xs text-slate-500 font-light">
          Tasks assigned to you by a club officer:
        </p>

        {user.tasks && user.tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {user.tasks.map((task, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">Task File 0{idx + 1}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">{task}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No active tasks are assigned. Enjoy Sunset fellowship circles!</p>
        )}
      </section>

      {/* 4.1 SECURE MEMBER DIRECTORY (EXCLUSIVE TO ACCESS-AUTHENTICATED MEMBERS) */}
      <section id="member-directory-section" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-5 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-rotary-azure/10 text-rotary-azure font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-display border border-rotary-azure/20 font-sans">
            <Users className="w-3.5 h-3.5" />
            <span>Fellowship Register</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold font-display text-slate-800 text-xl tracking-tight">
                Sunset Member Directory
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Authenticated member registry containing Paul Harris Fellows, Sunset committees, active task assignments, and contact channels.
              </p>
            </div>
            
            <div className="text-[10px] bg-slate-50 text-slate-500 border border-slate-150 px-3 py-2 rounded-xl shrink-0 self-start md:self-center font-display space-y-1">
              <span className="block font-bold uppercase tracking-wider">Access Clearance Granted:</span>
              <span className="block text-slate-700 font-medium">✔️ Full Registry decrypt online ({membersList.length} members loaded)</span>
            </div>
          </div>
        </div>

        {/* CONTROLS (SEARCH & FILTERS) WITH SCROLLABLE PILLS ADAPTING THE UPLOADED STYLE */}
        <div className="space-y-4">
          {/* iOS Style Search Pill Bar */}
          <div className="flex items-center gap-2 bg-[#f3f4f6] rounded-full px-4 py-2.5">
            <Search className="text-slate-400 h-4.5 w-4.5 shrink-0" />
            <input
              id="directory-search-input"
              type="text"
              placeholder="Search by name, role, classification..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-semibold"
            />
            {directorySearch && (
              <button 
                onClick={() => setDirectorySearch('')} 
                className="text-[11px] text-[#0056e3] font-semibold tracking-tight hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Horizontal Scrollable Pills Layout */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none select-none">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {/* Committee Filters */}
              {[
                { id: 'All', label: 'All Committees' },
                { id: 'Executive Board', label: 'Board' },
                { id: 'Service Projects Committee', label: 'Projects' },
                { id: 'Membership Committee', label: 'Membership' },
                { id: 'Water, Sanitation, & Environmental Care', label: 'Water & Environment' },
                { id: 'Public Relations & Communication', label: 'PR' }
              ].map((pill) => {
                const isActive = directoryCommitteeFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setDirectoryCommitteeFilter(pill.id)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-tight whitespace-nowrap transition-all duration-150 active:scale-95 ${
                      isActive 
                        ? 'bg-[#0056e3] text-white shadow-xs' 
                        : 'bg-[#f3f4f6] text-slate-705 hover:bg-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}

              {/* PHF Filter Pill */}
              <button
                onClick={() => setDirectoryPhfFilter(directoryPhfFilter === 'PHF' ? 'All' : 'PHF')}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-tight whitespace-nowrap transition-all duration-150 active:scale-95 flex items-center gap-1 ${
                  directoryPhfFilter === 'PHF' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-[#f3f4f6] text-slate-705 hover:bg-slate-200'
                }`}
              >
                <span>🎖️ Paul Harris Fellows</span>
                {directoryPhfFilter === 'PHF' && <span className="text-[10px] bg-white/20 px-1 rounded">On</span>}
              </button>
            </div>

            {/* Advanced Filters Settings Slider Button */}
            <button 
              onClick={() => {
                setDirectoryCommitteeFilter('All');
                setDirectoryPhfFilter('All');
                setDirectorySearch('');
              }}
              title="Reset Filters"
              className="p-2 bg-[#f3f4f6] hover:bg-slate-200 rounded-full text-slate-605 transition-colors shrink-0"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* LOADING & RENDER SECTION */}
        {membersLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-[#0056e3] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold font-display tracking-wider">SECURE DIRECTORY HANDSHAKE...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          /* HIGH-FIDELITY INTERACTIVE LIST DESIGN ADAPTED TO FIND PEOPLE SCREENSHOT */
          <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden divide-y divide-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            {filteredMembers.map((member) => {
              const matchesProfileSelf = member.email === user.email;
              return (
                <div 
                  key={member.uid} 
                  id={`member-item-${member.uid}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors duration-150"
                >
                  {/* Left Column: Avatar & Contact Taglines */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Circle Profile Avatar sphere */}
                    <div className="relative shrink-0 w-11 h-11">
                      {member.avatarUrl ? (
                        <img 
                          src={member.avatarUrl} 
                          alt={member.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-inner"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-705 font-extrabold text-[13px] tracking-tight flex items-center justify-center border border-slate-250/50 shadow-xs uppercase font-display">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                      )}
                      {/* Active green status active dot like in iOS mockups */}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Active sunset status"></span>
                    </div>

                    {/* Detailed Name / Title taglines */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-extrabold text-[14px] text-[#0f172a] tracking-tight leading-none font-sans">
                          Rtn. {member.name}
                        </h4>
                        {/* Blue verification checkmark element matching Harry Stebbings design */}
                        <div className="w-3.5 h-3.5 bg-[#0056e3] rounded-full text-white flex items-center justify-center text-[8px] font-black pointer-events-none" title="Verified Sunset Rotarian">
                          ✓
                        </div>
                        {matchesProfileSelf && (
                          <span className="text-[8px] font-black text-white bg-[#0056e3] px-1 py-0.5 rounded uppercase leading-none font-display">
                            You
                          </span>
                        )}
                      </div>

                      {/* Professional Title statement */}
                      <p className="text-xs text-slate-505 leading-tight font-medium font-sans truncate">
                        {member.classification ? member.classification : 'Sunset Service Representative'} at {member.committee || 'Freetown General Committee'}
                      </p>

                      {/* Location metadata pin exactly like "Find People" screenshot */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium font-sans">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>Freetown, Sierra Leone</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider">{member.role || 'Rotarian'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key performance markers & actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Attendance status badge */}
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none font-display">Attendance</span>
                      <span className={`text-[13px] font-black font-display leading-normal mt-0.5 ${
                        member.attendanceRate == null ? 'text-slate-350' : member.attendanceRate >= 92 ? 'text-emerald-600' : 'text-amber-500'
                      }`}>
                        {member.attendanceRate != null ? `${member.attendanceRate}%` : '—'}
                      </span>
                    </div>

                    {/* Pledged financials status */}
                    <div className="flex flex-col text-left sm:text-right font-sans">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none font-display">Financials</span>
                      <span className="text-[13px] font-extrabold text-[#0f172a] font-display mt-0.5">
                        {member.contributedAmount != null || member.contributionGoals != null
                          ? <>${member.contributedAmount || 0} <span className="text-[10px] font-normal text-slate-400">/ ${member.contributionGoals || 0}</span></>
                          : <span className="text-slate-350">—</span>}
                      </span>
                    </div>

                    {/* Paul Harris star badge or direct link button */}
                    <div className="shrink-0">
                      {member.isPaulHarrisFellow ? (
                        <div className="bg-amber-50 text-amber-800 border border-amber-200/50 rounded-full px-3 py-1 flex items-center gap-1 select-none">
                          <Award className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider font-display">{member.paulHarrisLevel || 'PHF'}</span>
                        </div>
                      ) : (
                        <a 
                          href={`mailto:${member.email}`} 
                          className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-3xs"
                        >
                          CONTACT
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No Rotarians Match Your Filters</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Try refining your search text or choosing another Sunset committee lookup.</p>
          </div>
        )}
      </section>

      {/* 4.5 SUPABASE CONNECTION & SYNC CONTROL PANEL */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-display border border-emerald-100">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database Connection Monitor</span>
            </div>
            <h3 className="font-extrabold font-display text-slate-800 text-lg">
              Supabase Postgres Manager
            </h3>
            <p className="text-xs text-slate-500 font-light max-w-2xl">
              Monitor active connections to your Supabase cloud database, execute SQL seeding scripts, and view health status logs. Runs in local Sandbox mode if keys are unconfigured.
            </p>
          </div>

          {/* ACTIVE PROTOCOL BADGE */}
          <div className="flex gap-2 p-2 px-4 bg-slate-100 rounded-2xl border border-slate-150 shrink-0 select-none items-center text-xs font-black uppercase tracking-wider text-slate-700">
            <div className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            <span>Supabase Active Client</span>
          </div>
        </div>

        {/* STATUS BRIEF */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* DRIVER TARGET STATUS CARD */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest font-display">ACTIVE PROTOCOL</span>
              <h4 className="font-extrabold text-xs text-slate-700 mt-1 uppercase">
                Supabase Postgres Client
              </h4>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Environment:</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${
                isDriverSimulated('supabase')
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {isDriverSimulated('supabase') ? 'Sandbox Simulated' : 'Cloud Live'}
              </span>
            </div>
          </div>

          {/* CREDENTIAL VERDICT CARD */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest font-display">SUPABASE SETTING</span>
              <h4 className="font-extrabold text-xs text-slate-700 mt-1">
                {isSupabaseConfigured ? 'Keys Configured' : 'No Secret Keys Detected'}
              </h4>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Keys Status:</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${
                isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {isSupabaseConfigured ? 'CONNECTED' : 'NOT DETECTED'}
              </span>
            </div>
          </div>

          {/* SEED CONSOLE QUICK TRIGGER */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest font-display">DATABASE SEEDER</span>
              <h4 className="font-extrabold text-xs text-slate-700 mt-1">Default Rotary Seed Files</h4>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                id="seed-supabase-btn"
                type="button"
                onClick={handleSeedDatabase}
                disabled={seedLoading || !isSupabaseConfigured}
                className="w-full py-1.5 text-[10px] uppercase tracking-wide font-extrabold text-emerald-800 bg-emerald-150/40 hover:bg-emerald-150/55 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title={isSupabaseConfigured ? "Seed database with default events and projects" : "Connect keys to enable seeding"}
              >
                {seedLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Database className="h-3 w-3" />
                )}
                <span>Seed Supabase Tables</span>
              </button>
            </div>
          </div>
        </div>

        {/* GUIDEFOLDER (IF SUPABASE NOT CONFIGURED OR EXPLICITLY SHOWING SCHEMA) */}
        {!isSupabaseConfigured && activeDriver === 'supabase' && (
          <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-amber-900">Configuring Supabase credentials sandbox</h4>
                <p className="text-amber-800 text-[11px] leading-relaxed font-light">
                  The application is currently operating in <strong>Simulated Sandbox mode</strong> for Supabase storage because environment secrets are not yet fully supplied. To connect your live Supabase database for free:
                </p>
              </div>
            </div>

            <ol className="list-decimal pl-5 space-y-2 text-[11px] text-amber-800 font-light rounded-lg">
              <li>
                Create a free project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline text-amber-900 inline-flex items-center gap-0.5">supabase.com<ExternalLink className="w-2.5 h-2.5" /></a>.
              </li>
              <li>
                Go to <strong>Project Settings ➔ Environment Variables</strong> on your hosting platform (e.g. Vercel), or add these keys to your local `.env` file:
                <div className="mt-2 bg-slate-900 text-slate-300 font-mono p-3 rounded-lg text-[10px] overflow-x-auto space-y-1">
                  <div>VITE_SUPABASE_URL="https://your-proj-id.supabase.co"</div>
                  <div>VITE_SUPABASE_ANON_KEY="your-anon-key-string"</div>
                </div>
              </li>
              <li>
                In your Supabase SQL Editor, paste the SQL schema script below to build tables, then click the <strong>"Seed Supabase Tables"</strong> button above to populate default values!
              </li>
            </ol>
          </div>
        )}

        {/* SEED MESSAGE FEEDBACK */}
        {seedMessage && (
          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center text-xs font-semibold text-slate-700">
            {seedMessage}
          </div>
        )}

        {/* SYSTEM DIAGNOSTICS LOG CONTAINER */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <button
              id="run-db-diagnostics-btn"
              type="button"
              onClick={runDiagnostics}
              disabled={diagnosticLoading}
              className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {diagnosticLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-505" />
              ) : (
                <Settings className="h-3.5 w-3.5 text-slate-505" />
              )}
              <span>Run Database Diagnostic Audit</span>
            </button>

            <button
              id="toggle-sql-schema-btn"
              type="button"
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="text-xs font-bold text-rotary-azure hover:text-rotary-azure/80 cursor-pointer"
            >
              {showSqlSchema ? 'Hide SQL Provisioning Schema' : 'View SQL Provisioning Schema'}
            </button>
          </div>

          {diagnosticLogs.length > 0 && (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-[10px] font-mono text-slate-300 select-text overflow-x-auto max-h-48 space-y-1">
              <span className="text-slate-500 block">rtn@fs-sunset-console % audit --scan</span>
              {diagnosticLogs.map((log, idx) => (
                <div key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400 mt-1' : log.includes('ERROR') ? 'text-rose-400 mt-1' : 'text-slate-300 mt-1'}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPANDABLE COLLAPSIBLE SQL VIEWER */}
        {showSqlSchema && (
          <div className="border border-slate-200 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-extrabold text-[10px] tracking-wider uppercase text-slate-400 font-display">Rotary Supabase Schema Script (.sql)</span>
              <button
                id="copy-sql-schema-btn"
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition cursor-pointer"
              >
                {sqlCopied ? <Check className="w-3 h-3 text-emerald-600 font-semibold" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{sqlCopied ? 'Copied script!' : 'Copy Schema'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 text-[10px] font-mono text-emerald-400/90 overflow-x-auto select-text max-h-71">
              <code>{GET_SUPABASE_SQL_SCHEMA()}</code>
            </pre>
          </div>
        )}
      </section>

      {/* 4.6 SUPABASE MODEL CONTEXT PROTOCOL (MCP) INTERACTIVE PORTAL */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-display border border-indigo-100">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Developer Tools Integration</span>
          </div>
          <h3 className="font-extrabold font-display text-slate-800 text-lg">
            Model Context Protocol (MCP) Portal
          </h3>
          <p className="text-xs text-slate-500 font-light max-w-2xl">
            Give your AI Coding assistants (Cursor, Claude Desktop, Windsurf, Cody) direct, autonomous query intelligence over your Supabase tables.
          </p>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light text-slate-600">
          <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-1.5">
            <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wide">🔍 Schema Discovery</span>
            <p className="text-[11px] leading-relaxed text-indigo-950">AI automatically crawls and discovers your database structures, types, rules, and relationships instantenously.</p>
          </div>
          <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-1.5">
            <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wide">📦 Dev Script</span>
            <p className="text-[11px] leading-relaxed text-indigo-950">Runs a local server-process in your workspace mapping authorization tokens seamlessly in cross-platform scripts.</p>
          </div>
          <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-1.5">
            <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wide">🤖 Native Agent Control</span>
            <p className="text-[11px] leading-relaxed text-indigo-950">Empowers LLMs to select, filter, update, or sync database parameters securely with instant status reports.</p>
          </div>
        </div>

        {/* PARAMETERS CONFIGURATION ENGINE */}
        <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-display">
            1. Configure Security Credentials
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* KEY TYPE CHOOSER */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display">Credential Scope</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMcpKeyType('anon')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    mcpKeyType === 'anon'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  Limited Client (Anon Key)
                </button>
                <button
                  type="button"
                  onClick={() => setMcpKeyType('service_role')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    mcpKeyType === 'service_role'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  Full Admin (Service Role)
                </button>
              </div>
            </div>

            {/* CONDITIONAL INPUT FOR SERVICE KEY */}
            {mcpKeyType === 'service_role' ? (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display">SUPABASE_SERVICE_ROLE_KEY</label>
                <input
                  type="password"
                  placeholder="Paste your service_role key here..."
                  value={customServiceRoleKey}
                  onChange={(e) => setCustomServiceRoleKey(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display">MAPPED ANON PUBLIC API KEY</label>
                <div className="w-full px-3.5 py-1.5 text-xs font-mono bg-slate-100 border border-slate-200 rounded-xl select-all select-none truncate text-slate-500">
                  {mcpAnon.slice(0, 36)}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CLIENT EDITOR TABS */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-display">
              2. Select IDE / AI Client
            </h4>
            
            <div className="flex flex-wrap gap-1 bg-slate-105 p-1 rounded-xl border border-slate-150 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMcpActiveTab('gemini')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  mcpActiveTab === 'gemini' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setMcpActiveTab('cursor')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  mcpActiveTab === 'cursor' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Cursor
              </button>
              <button
                type="button"
                onClick={() => setMcpActiveTab('claude')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  mcpActiveTab === 'claude' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Claude App
              </button>
              <button
                type="button"
                onClick={() => setMcpActiveTab('windsurf')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  mcpActiveTab === 'windsurf' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Windsurf
              </button>
              <button
                type="button"
                onClick={() => setMcpActiveTab('cli')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  mcpActiveTab === 'cli' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Standard CLI
              </button>
            </div>
          </div>

          {/* CODE HIGHLIGHT CONTAINER */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-[11px]">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                {mcpActiveTab === 'gemini' && 'Gemini CLI integration command'}
                {mcpActiveTab === 'cursor' && '.cursor/mcp.json or Global MCP Configuration'}
                {mcpActiveTab === 'claude' && '%APPDATA%/Claude/claude_desktop_config.json'}
                {mcpActiveTab === 'windsurf' && '~/.codeium/windsurf/mcp_config.json'}
                {mcpActiveTab === 'cli' && 'Terminal Command instructions'}
              </span>
              <button
                type="button"
                onClick={handleCopyMcp}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 transition cursor-pointer font-bold text-[10px]"
              >
                {mcpCopied ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{mcpCopied ? 'Configuration Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto select-text max-h-56">
              <code>{getMcpConfigString()}</code>
            </pre>
          </div>
        </div>

        {/* Standalone dev command alert box */}
        <div className="bg-indigo-50/30 border border-indigo-150 p-5 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-indigo-605" />
            <h5 className="font-bold text-indigo-950">Preconfigured Workspace automation script ready!</h5>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            We have created a ready-to-run execution launcher at <code className="font-mono bg-slate-200/60 text-slate-800 px-1 rounded">/scripts/supabase-mcp-launcher.js</code> inside your workspace. You can immediately launch the PostgREST server pointing to your actual configurations:
          </p>
          <div className="bg-slate-950 text-slate-300 font-mono p-3 rounded-xl text-[10px] select-all">
            npm run supabase-mcp
          </div>
        </div>
      </section>

      {/* 5. MY SUBMISSIONS -- projects/photos I've submitted for admin approval */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold font-display text-slate-800 text-lg flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-rotary-azure" />
              My Submissions
            </h3>
            <p className="text-xs text-slate-500 font-light">
              Submit a project or photo for the club to feature. An admin reviews it before it goes live -- nothing you submit is published automatically.
            </p>
          </div>
          <button
            id="show-submit-form-btn"
            onClick={() => { setShowSubmitForm(!showSubmitForm); setSubError(''); }}
            className="px-4 py-2.5 text-xs font-bold font-display uppercase bg-rotary-azure hover:bg-rotary-azure/90 text-white rounded-xl transition-all shadow-xs shrink-0"
          >
            {showSubmitForm ? 'Cancel' : '+ New Submission'}
          </button>
        </div>

        {showSubmitForm && (
          <form onSubmit={handleSubmitContribution} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
            {subError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs">{subError}</div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSubKind('project')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase font-display border ${subKind === 'project' ? 'bg-rotary-azure text-white border-rotary-azure' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                Project
              </button>
              <button
                type="button"
                onClick={() => setSubKind('photo')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase font-display border ${subKind === 'photo' ? 'bg-rotary-azure text-white border-rotary-azure' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                Photo
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Title</label>
              <input
                id="submission-title"
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Category</label>
                <input
                  id="submission-category"
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder={subKind === 'project' ? 'e.g. Water & Sanitation' : 'e.g. outreach'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                />
              </div>
              {subKind === 'project' && (
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Year</label>
                  <input
                    id="submission-year"
                    type="number"
                    value={subYear}
                    onChange={(e) => setSubYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">Description</label>
              <textarea
                id="submission-description"
                value={subDescription}
                onChange={(e) => setSubDescription(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1.5">
                Photo {subKind === 'photo' ? '(required)' : '(optional)'}
              </label>
              {subImageUrl ? (
                <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200">
                  <img src={subImageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setSubImageUrl('')}
                    className="absolute top-1 right-1 bg-slate-900/70 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 w-fit px-3.5 py-2 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer hover:border-rotary-azure">
                  <Upload className="h-3.5 w-3.5" />
                  {subImageUploading ? 'Uploading...' : 'Upload photo'}
                  <input
                    id="submission-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={subImageUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSubmissionImageUpload(file);
                    }}
                  />
                </label>
              )}
            </div>

            <button
              id="submission-submit-btn"
              type="submit"
              disabled={subSaving || subImageUploading}
              className="px-6 py-2 bg-rotary-azure hover:bg-rotary-azure/90 text-white text-xs font-bold uppercase rounded-lg shadow-sm disabled:opacity-60"
            >
              {subSaving ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        )}

        {submissionsLoading ? (
          <p className="text-xs text-slate-400">Loading your submissions...</p>
        ) : mySubmissions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">You haven't submitted anything yet.</p>
        ) : (
          <div className="space-y-3">
            {mySubmissions.map((sub) => (
              <div key={sub.id} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  sub.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {sub.status === 'approved' ? <Check className="h-4 w-4" /> : sub.status === 'rejected' ? <X className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-800">{sub.title}</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{sub.kind}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      sub.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>{sub.status}</span>
                  </div>
                  {sub.description && <p className="text-xs text-slate-500 mt-1">{sub.description}</p>}
                  {sub.status === 'rejected' && sub.rejectReason && (
                    <p className="text-[11px] text-rose-600 mt-1"><strong>Reason:</strong> {sub.rejectReason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

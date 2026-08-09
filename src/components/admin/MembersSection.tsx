import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Check, X, Users } from 'lucide-react';
import { UserProfile } from '../../types';
import { INITIAL_MEMBER_DIRECTORY } from '../../data';
import {
  upsertSupabaseUser, deleteSupabaseUser,
  promoteSupabaseAdmin, demoteSupabaseAdmin,
  createLoginSupabaseMember, resetSupabasePin, revokeSupabaseMemberAccount
} from '../../supabase-service';
import { motion, AnimatePresence } from 'motion/react';

interface MembersSectionProps {
  members: UserProfile[];
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  adminUserIds: Set<string>;
  currentAdminAuthId: string | null;
  revealedCredential: { name: string; rotaryId: string; pin: string } | null;
  setRevealedCredential: (cred: { name: string; rotaryId: string; pin: string } | null) => void;
  // 'reviewer' can only create/reset member logins here -- roster edit,
  // promote/demote, and revoke are admin-only (also enforced server-side:
  // RLS on `users`/`admins` and the member-accounts Edge Function's role
  // check on the revoke action).
  currentAdminRole: 'admin' | 'reviewer' | null;
}

export default function MembersSection({
  members,
  onRefresh,
  triggerToast,
  adminUserIds,
  currentAdminAuthId,
  setRevealedCredential,
  currentAdminRole
}: MembersSectionProps) {
  const isFullAdmin = currentAdminRole === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [pinInputByUid, setPinInputByUid] = useState<Record<string, string>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const clearFormFields = () => {
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

  const openNewRecordForm = () => {
    setEditingId(null);
    clearFormFields();
    setIsFormOpen(true);
  };

  const loadRecordForEdit = (m: UserProfile) => {
    setEditingId(m.uid);
    setIsFormOpen(true);
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
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
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

      setIsFormOpen(false);
      clearFormFields();
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Database submit error: ' + (err.message || String(err)), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from your Postgres tables?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const member = members.find(m => m.uid === id);
      if (member?.authUserId) {
        await revokeSupabaseMemberAccount(id);
      }
      await deleteSupabaseUser(id);
      triggerToast(`Permanently deleted "${name}" from database.`, 'info');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Delete transaction failed: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteAdmin = async (member: UserProfile) => {
    if (!member.authUserId) return;
    if (!window.confirm(`Give ${member.name} full admin access?`)) return;
    setActionLoading(true);
    try {
      await promoteSupabaseAdmin(member.authUserId);
      triggerToast(`${member.name} is now an admin.`, 'success');
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not promote: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteAdmin = async (member: UserProfile) => {
    if (!member.authUserId) return;
    if (member.authUserId === currentAdminAuthId) {
      triggerToast('You cannot remove your own admin access.', 'error');
      return;
    }
    if (!window.confirm(`Remove admin access from ${member.name}?`)) return;
    setActionLoading(true);
    try {
      await demoteSupabaseAdmin(member.authUserId);
      triggerToast(`Admin access removed from ${member.name}.`, 'info');
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not demote: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const generatePin = (): string => String(Math.floor(100000 + Math.random() * 900000));

  const handleCreateLogin = async (member: UserProfile) => {
    const pin = (pinInputByUid[member.uid] || '').trim() || generatePin();
    if (!/^\d{6}$/.test(pin)) {
      triggerToast('PIN must be exactly 6 digits.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const rotaryId = await createLoginSupabaseMember(member.uid, pin);
      setRevealedCredential({ name: member.name, rotaryId, pin });
      setPinInputByUid(prev => ({ ...prev, [member.uid]: '' }));
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not create login: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPin = async (member: UserProfile) => {
    const pin = (pinInputByUid[member.uid] || '').trim() || generatePin();
    if (!/^\d{6}$/.test(pin)) {
      triggerToast('PIN must be exactly 6 digits.', 'error');
      return;
    }
    if (!window.confirm(`Reset ${member.name}'s PIN? Their current PIN will stop working immediately.`)) return;
    setActionLoading(true);
    try {
      await resetSupabasePin(member.uid, pin);
      setRevealedCredential({ name: member.name, rotaryId: member.rotaryId || '', pin });
      setPinInputByUid(prev => ({ ...prev, [member.uid]: '' }));
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not reset PIN: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeMemberAccount = async (member: UserProfile) => {
    if (!member.authUserId) return;
    if (member.authUserId === currentAdminAuthId) {
      triggerToast('You cannot revoke your own account this way.', 'error');
      return;
    }
    if (!window.confirm(`Revoke ${member.name}'s login? They will no longer be able to sign in.`)) return;
    setActionLoading(true);
    try {
      await revokeSupabaseMemberAccount(member.uid);
      triggerToast(`Revoked login access for ${member.name}.`, 'info');
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not revoke account: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.committee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || m.role === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
      {/* HEADER: SEARCH & TABS ROW */}
      <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider">
          {isFullAdmin ? '👥 Members' : '🔑 Member Logins'}
        </h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48 xl:w-64">
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-350 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure placeholder-slate-400"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {isFullAdmin && (
            <div className="relative shrink-0 text-xs">
              <select
                id="admin-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-350 rounded-xl px-2.5 py-1.5 font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-rotary-azure"
              >
                <option value="All">All statuses/types</option>
                <option value="Rotarian">Rotarians</option>
                <option value="Club Officer">Club Officers</option>
                <option value="President">Presidents</option>
                <option value="Guest">Guests</option>
              </select>
            </div>
          )}

          {isFullAdmin && (
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
      </div>

      {/* EDITING FORM SECTION (COLLAPSIBLE SCREEN) */}
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
                    {editingId ? `📝 Edit member Record: "${editingId}"` : `✨ Publish New member`}
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
                      placeholder="e.g., Enter custom image HTTPS URL"
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

      {/* DATA GRID */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                <th className="py-3 px-4">Member Name / Email</th>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Rotary Committee</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4 text-center">Charity Contribution</th>
                <th className="py-3 px-4">Account Access</th>
                <th className="py-3 px-4 text-right">Database Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-600">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Users className="h-10 w-10 text-slate-300 animate-bounce" />
                      <p className="text-xs font-bold text-slate-550 max-w-sm leading-relaxed">
                        No Rotarian members or registered club logs found in your active database.
                      </p>
                      {isFullAdmin && (
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
                            onRefresh();
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
                      )}
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
                      {m.attendanceRate != null ? (
                        <div className="w-16 mx-auto leading-none">
                          <span className="font-bold text-xs text-slate-700">{m.attendanceRate}%</span>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1 flex">
                            <div
                              className={`h-full ${Number(m.attendanceRate) > 85 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                              style={{ width: `${m.attendanceRate}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-350 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {m.contributedAmount != null || m.contributionGoals != null ? (
                        <>
                          <span className="font-black text-slate-700">${m.contributedAmount || 0}</span>
                          {m.contributionGoals != null && (
                            <span className="text-[9px] text-slate-400 block font-semibold">Goal: ${m.contributionGoals}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-350 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono font-bold text-slate-600 block mb-1.5">{m.rotaryId || '—'}</span>
                      {m.authUserId ? (
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Login Active
                          </span>
                          {isFullAdmin && (
                          <div className="flex gap-1.5 flex-wrap">
                            {adminUserIds.has(m.authUserId) ? (
                              <button
                                onClick={() => handleDemoteAdmin(m)}
                                className="px-2 py-1 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-md text-[9px] uppercase font-bold"
                              >
                                Remove Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromoteAdmin(m)}
                                className="px-2 py-1 border border-rotary-gold/40 text-rotary-gold-dark hover:bg-rotary-gold/10 rounded-md text-[9px] uppercase font-bold"
                              >
                                Make Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleRevokeMemberAccount(m)}
                              className="px-2 py-1 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-md text-[9px] uppercase font-bold"
                            >
                              Revoke
                            </button>
                          </div>
                          )}
                          {adminUserIds.has(m.authUserId) && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rotary-gold/10 text-rotary-gold-dark">Admin</span>
                          )}
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="new 6-digit PIN"
                              value={pinInputByUid[m.uid] ?? ''}
                              onChange={(e) => setPinInputByUid(prev => ({ ...prev, [m.uid]: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                              className="w-28 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] font-mono tracking-widest"
                            />
                            <button
                              onClick={() => handleResetPin(m)}
                              className="px-2 py-1 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-md text-[9px] uppercase font-bold whitespace-nowrap"
                            >
                              Reset PIN
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="leave blank to auto-generate"
                            value={pinInputByUid[m.uid] ?? ''}
                            onChange={(e) => setPinInputByUid(prev => ({ ...prev, [m.uid]: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                            className="w-40 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] font-mono tracking-widest"
                          />
                          <button
                            onClick={() => handleCreateLogin(m)}
                            className="px-2 py-1 bg-rotary-azure text-white rounded-md text-[9px] uppercase font-bold w-fit"
                          >
                            Create Login
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFullAdmin ? (
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
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, RefreshCw, Info } from 'lucide-react';
import { UserProfile } from '../../types';
import { getSupabaseAdmins, AdminRow, changeSupabaseAdminRole, demoteSupabaseAdmin, promoteSupabaseAdmin } from '../../supabase-service';

interface RolesSectionProps {
  members: UserProfile[];
  currentAdminAuthId: string | null;
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function RolesSection({ members, currentAdminAuthId, onRefresh, triggerToast }: RolesSectionProps) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [grantCandidateUid, setGrantCandidateUid] = useState('');

  const loadAdmins = async () => {
    setLoading(true);
    try {
      setAdmins(await getSupabaseAdmins());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const memberFor = (authUserId: string) => members.find((m) => m.authUserId === authUserId);

  const handleChangeRole = async (row: AdminRow, role: 'admin' | 'reviewer') => {
    setActionLoading(true);
    try {
      await changeSupabaseAdminRole(row.userId, role);
      triggerToast(`Access tier updated to ${role}.`, 'success');
      await loadAdmins();
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not change role: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAccess = async (row: AdminRow) => {
    if (row.userId === currentAdminAuthId) {
      triggerToast('You cannot remove your own admin access.', 'error');
      return;
    }
    const m = memberFor(row.userId);
    if (!window.confirm(`Remove all admin/reviewer access for ${m?.name || 'this user'}?`)) return;
    setActionLoading(true);
    try {
      await demoteSupabaseAdmin(row.userId);
      triggerToast('Access removed.', 'info');
      await loadAdmins();
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not remove access: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const candidateMembers = members.filter((m) => m.authUserId && !admins.some((a) => a.userId === m.authUserId));

  const handleGrantReviewer = async () => {
    const m = members.find((mm) => mm.uid === grantCandidateUid);
    if (!m?.authUserId) return;
    setActionLoading(true);
    try {
      await promoteSupabaseAdmin(m.authUserId, 'reviewer');
      triggerToast(`${m.name} granted reviewer access.`, 'success');
      setGrantCandidateUid('');
      await loadAdmins();
      onRefresh();
    } catch (err: any) {
      triggerToast('Could not grant access: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-rotary-azure/5 border border-rotary-azure/20 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-rotary-azure shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Admins</strong> have full control of the site. <strong className="text-slate-800">Reviewers</strong> can only approve/reject
          member submissions and create or reset member logins -- they cannot revoke logins, manage other admins, or edit projects, events, inquiries, or site settings.
        </p>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rotary-azure" />
            Admins & Reviewers
          </h2>
          <button
            onClick={loadAdmins}
            disabled={loading}
            className="p-1.5 border border-slate-200 hover:border-slate-300 text-slate-500 rounded-lg transition-colors"
            title="Reload"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                <th className="py-3 px-4">Name / Email</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-600">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400">
                    {loading ? 'Loading...' : 'No admins or reviewers found.'}
                  </td>
                </tr>
              ) : (
                admins.map((row) => {
                  const m = memberFor(row.userId);
                  const isSelf = row.userId === currentAdminAuthId;
                  return (
                    <tr key={row.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-800 text-xs block leading-tight">{m?.name || 'Unlinked account'}</span>
                        <span className="text-[10px] text-slate-450 block font-semibold leading-none mt-0.5 font-mono">{m?.email || row.userId}</span>
                        {isSelf && <span className="text-[9px] text-rotary-azure font-bold uppercase">You</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none inline-block ${
                            row.role === 'admin'
                              ? 'bg-rotary-gold/15 text-rotary-gold-dark border border-rotary-gold/30'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {row.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {row.role === 'admin' ? (
                            <button
                              onClick={() => handleChangeRole(row, 'reviewer')}
                              disabled={actionLoading || isSelf}
                              className="px-2.5 py-1 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-md text-[9px] uppercase font-bold disabled:opacity-40"
                              title={isSelf ? "You can't change your own tier" : undefined}
                            >
                              Make Reviewer
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeRole(row, 'admin')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 border border-rotary-gold/40 text-rotary-gold-dark hover:bg-rotary-gold/10 rounded-md text-[9px] uppercase font-bold disabled:opacity-40"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveAccess(row)}
                            disabled={actionLoading || isSelf}
                            className="px-2.5 py-1 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-md text-[9px] uppercase font-bold disabled:opacity-40"
                            title={isSelf ? "You can't remove your own access" : undefined}
                          >
                            Remove Access
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-5 space-y-3">
        <h3 className="text-xs font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-rotary-azure" />
          Grant Reviewer Access
        </h3>
        <p className="text-[11px] text-slate-500">Choose a member who already has a login to grant them reviewer access.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={grantCandidateUid}
            onChange={(e) => setGrantCandidateUid(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
          >
            <option value="">Select a member with a login...</option>
            {candidateMembers.map((m) => (
              <option key={m.uid} value={m.uid}>{m.name} ({m.email})</option>
            ))}
          </select>
          <button
            onClick={handleGrantReviewer}
            disabled={!grantCandidateUid || actionLoading}
            className="px-4 py-2 bg-rotary-azure hover:bg-rotary-azure-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 shrink-0"
          >
            Grant Reviewer Access
          </button>
        </div>
        {candidateMembers.length === 0 && (
          <p className="text-[10px] text-slate-400 italic">Every member with a login already has admin or reviewer access.</p>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Submission, UserProfile } from '../../types';
import { reviewSupabaseSubmission } from '../../supabase-service';
import SafeImage from '../SafeImage';

interface ApprovalsSectionProps {
  submissions: Submission[];
  members: UserProfile[];
  currentAdminAuthId: string | null;
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ApprovalsSection({ submissions, members, currentAdminAuthId, onRefresh, triggerToast }: ApprovalsSectionProps) {
  const [approvalsFilter, setApprovalsFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');

  const handleReviewSubmission = async (submissionId: string, decision: 'approved' | 'rejected', reason?: string) => {
    if (!currentAdminAuthId) {
      triggerToast('Sign in again to review submissions.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await reviewSupabaseSubmission(submissionId, decision, currentAdminAuthId, reason);
      triggerToast(decision === 'approved' ? 'Submission approved and published.' : 'Submission rejected.', 'success');
      setRejectingId(null);
      setRejectReasonText('');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Review failed: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider">✅ Approvals</h2>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[700px] space-y-4">
          <div className="flex gap-2 border-b border-slate-150 pb-3 mb-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setApprovalsFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  approvalsFilter === f ? 'bg-rotary-azure text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f} {f !== 'all' && `(${submissions.filter(s => s.status === f).length})`}
              </button>
            ))}
          </div>

          {submissions.filter(s => approvalsFilter === 'all' || s.status === approvalsFilter).length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">No {approvalsFilter !== 'all' ? approvalsFilter : ''} submissions.</div>
          ) : (
            <div className="space-y-3">
              {submissions
                .filter(s => approvalsFilter === 'all' || s.status === approvalsFilter)
                .map((sub) => {
                  const submitter = members.find(m => m.authUserId === sub.submitterId);
                  return (
                    <div key={sub.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          {sub.imageUrl && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                              <SafeImage src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-800 text-sm">{sub.title}</h4>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{sub.kind}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                sub.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>{sub.status}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Submitted by <strong>{submitter?.name || 'Unknown member'}</strong>
                              {sub.category && <> • {sub.category}</>}
                              {sub.year && <> • {sub.year}</>}
                            </p>
                            {sub.description && <p className="text-xs text-slate-600 mt-2 max-w-xl">{sub.description}</p>}
                            {sub.status === 'rejected' && sub.rejectReason && (
                              <p className="text-[11px] text-rose-600 mt-2"><strong>Rejection reason:</strong> {sub.rejectReason}</p>
                            )}
                          </div>
                        </div>

                        {sub.status === 'pending' && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleReviewSubmission(sub.id, 'approved')}
                              disabled={actionLoading}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setRejectingId(rejectingId === sub.id ? null : sub.id); setRejectReasonText(''); }}
                              disabled={actionLoading}
                              className="px-4 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 text-[10px] font-bold uppercase tracking-wider rounded-lg disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {rejectingId === sub.id && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            placeholder="Reason (optional)"
                            value={rejectReasonText}
                            onChange={(e) => setRejectReasonText(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                          />
                          <button
                            onClick={() => handleReviewSubmission(sub.id, 'rejected', rejectReasonText)}
                            disabled={actionLoading}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg disabled:opacity-60"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

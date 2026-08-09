import React, { useState } from 'react';
import { Search, Eye, Mail, X } from 'lucide-react';
import { ContactInquiry, EventRSVP, ProjectApplication, ClubEvent, Project } from '../../types';
import { deleteSupabaseInquiry } from '../../supabase-service';
import { motion } from 'motion/react';

interface InquiriesSectionProps {
  inquiries: ContactInquiry[];
  rsvps: EventRSVP[];
  applications: ProjectApplication[];
  events: ClubEvent[];
  projects: Project[];
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function InquiriesSection({
  inquiries,
  rsvps,
  applications,
  events,
  projects,
  onRefresh,
  triggerToast
}: InquiriesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [inquirySubTab, setInquirySubTab] = useState<'messages' | 'rsvps' | 'applications'>('messages');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  const handleRecordDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from your Postgres tables?`)) {
      return;
    }
    try {
      await deleteSupabaseInquiry(id);
      triggerToast(`Permanently deleted "${name}" from database.`, 'info');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Delete transaction failed: ' + (err.message || err), 'error');
    }
  };

  const filteredInquiries = inquiries.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || i.type === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredRsvps = rsvps.filter(r => {
    const eventName = events.find(e => e.id === r.event_id)?.title || '';
    return r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           eventName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredApplications = applications.filter(a => {
    const projName = projects.find(p => p.id === a.project_id)?.title || '';
    return a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           a.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
           projName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
      {/* HEADER: SEARCH ROW */}
      <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider">📥 Inquiries</h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48 xl:w-64">
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-350 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure placeholder-slate-400"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="relative shrink-0 text-xs">
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-350 rounded-xl px-2.5 py-1.5 font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-rotary-azure"
            >
              <option value="All">All statuses/types</option>
              <option value="General Contact">General Contact</option>
              <option value="Membership Inquiry">Membership Inquiry</option>
              <option value="Donation Inquiry">Donation Inquiry</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-0">
        <div className="min-w-[850px] space-y-4 p-4">
          {/* Sub-Tabs Selector */}
          <div className="flex gap-2 border-b border-slate-150 pb-2 mb-4">
            <button
              onClick={() => setInquirySubTab('messages')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                inquirySubTab === 'messages'
                  ? 'bg-rotary-gold text-slate-900 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Contact Messages ({filteredInquiries.length})
            </button>
            <button
              onClick={() => setInquirySubTab('rsvps')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                inquirySubTab === 'rsvps'
                  ? 'bg-rotary-gold text-slate-900 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Event RSVPs ({filteredRsvps.length})
            </button>
            <button
              onClick={() => setInquirySubTab('applications')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                inquirySubTab === 'applications'
                  ? 'bg-rotary-gold text-slate-900 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Project Applications ({filteredApplications.length})
            </button>
          </div>

          {/* Sub-Tab 1: Messages */}
          {inquirySubTab === 'messages' && (
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
          )}

          {/* Sub-Tab 2: RSVPs */}
          {inquirySubTab === 'rsvps' && (
            <table className="w-full text-left text-xs border-collapse font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                  <th className="py-3 px-4">Attendee Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4 text-center">RSVP Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      No event RSVPs received in your database.
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((r) => {
                    const matchedEvent = events.find(e => e.id === r.event_id)?.title || r.event_id;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-800 text-xs">
                          {r.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                          {r.email}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {matchedEvent}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400 select-none">
                          {new Date(r.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Sub-Tab 3: Applications */}
          {inquirySubTab === 'applications' && (
            <table className="w-full text-left text-xs border-collapse font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-450 uppercase font-black tracking-widest text-[10px] border-b border-slate-150 select-none">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Target Project</th>
                  <th className="py-3 px-4">Motivation & Experience Statement</th>
                  <th className="py-3 px-4 text-center">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No project applications received in your database.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((a) => {
                    const matchedProject = projects.find(p => p.id === a.project_id)?.title || a.project_id;
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-800 text-xs">
                          {a.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                          {a.email}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {matchedProject}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-sm font-medium italic line-clamp-2">
                          "{a.statement}"
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400 select-none">
                          {new Date(a.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* INQUIRIES DETAIL MODAL POPUP (INBOX VIEW MORE) */}
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

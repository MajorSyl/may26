import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Check, X, Calendar, MapPin } from 'lucide-react';
import { ClubEvent } from '../../types';
import { saveSupabaseEvent, deleteSupabaseEvent } from '../../supabase-service';
import { motion, AnimatePresence } from 'motion/react';

interface EventsSectionProps {
  events: ClubEvent[];
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function EventsSection({ events, onRefresh, triggerToast }: EventsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evSpeaker, setEvSpeaker] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evType, setEvType] = useState<'Weekly Meeting' | 'Service Project' | 'Social' | 'Fundraiser'>('Weekly Meeting');

  const clearFormFields = () => {
    setEvTitle('');
    setEvDate('');
    setEvTime('18:30 - 20:00');
    setEvLocation('Lagoonda Hotel, Freetown');
    setEvSpeaker('');
    setEvDescription('');
    setEvType('Weekly Meeting');
  };

  const openNewRecordForm = () => {
    setEditingId(null);
    clearFormFields();
    setIsFormOpen(true);
  };

  const loadRecordForEdit = (e: ClubEvent) => {
    setEditingId(e.id);
    setIsFormOpen(true);
    setEvTitle(e.title);
    setEvDate(e.date);
    setEvTime(e.time);
    setEvLocation(e.location);
    setEvSpeaker(e.speaker || '');
    setEvDescription(e.description || '');
    setEvType(e.type);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
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
      await deleteSupabaseEvent(id);
      triggerToast(`Permanently deleted "${name}" from database.`, 'info');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Delete transaction failed: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.speaker && e.speaker.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'All' || e.type === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
      {/* HEADER: SEARCH & TABS ROW */}
      <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider">📅 Events</h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48 xl:w-64">
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search events..."
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
              <option value="Weekly Meeting">Weekly Meetings</option>
              <option value="Service Project">Service Projects</option>
              <option value="Social">Social</option>
              <option value="Fundraiser">Fundraisers</option>
            </select>
          </div>

          <button
            id="admin-new-record-btn"
            onClick={openNewRecordForm}
            className="bg-rotary-azure hover:bg-rotary-azure-dark text-white p-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold leading-none shrink-0 border border-transparent shadow-xs hover:shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Publish New</span>
          </button>
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
                    {editingId ? `📝 Edit event Record: "${editingId}"` : `✨ Publish New event`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-slate-500">Event/Meeting Title</label>
                    <input
                      id="ev-form-title"
                      type="text"
                      required
                      value={evTitle}
                      onChange={(e) => setEvTitle(e.target.value)}
                      placeholder="e.g., Weekly Club Meeting"
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
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Plus, RefreshCw, UploadCloud, Image, Trash2, Check, X } from 'lucide-react';
import { Project } from '../../types';
import { saveSupabaseProject, deleteSupabaseProject } from '../../supabase-service';
import { motion, AnimatePresence } from 'motion/react';
import SafeImage from '../SafeImage';

interface ProjectsSectionProps {
  projects: Project[];
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ProjectsSection({ projects, onRefresh, triggerToast }: ProjectsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projYear, setProjYear] = useState<number>(new Date().getFullYear());
  const [projImpact, setProjImpact] = useState('');
  const [projStatus, setProjStatus] = useState<'Completed' | 'Active' | 'Planning'>('Active');
  const [projImageUrl, setProjImageUrl] = useState('');
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'url'>('upload');

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

  const clearFormFields = () => {
    setProjTitle('');
    setProjCategory('');
    setProjDescription('');
    setProjYear(new Date().getFullYear());
    setProjImpact('');
    setProjStatus('Active');
    setProjImageUrl('');
    setImageSourceTab('upload');
  };

  const openNewRecordForm = () => {
    setEditingId(null);
    clearFormFields();
    setIsFormOpen(true);
  };

  const loadRecordForEdit = (p: Project) => {
    setEditingId(p.id);
    setIsFormOpen(true);
    setProjTitle(p.title);
    setProjCategory(p.category);
    setProjDescription(p.description);
    setProjYear(p.year);
    setProjImpact(p.impact || '');
    setProjStatus(p.status);
    setProjImageUrl(p.imageUrl || '');
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload: Project = {
        id: editingId || 'proj_' + Math.random().toString(36).substr(2, 9),
        title: projTitle,
        category: projCategory || 'General Service',
        description: projDescription,
        year: Number(projYear),
        impact: projImpact,
        status: projStatus,
        imageUrl: projImageUrl || ''
      };
      await saveSupabaseProject(payload);
      triggerToast(`Project "${projTitle}" successfully saved to live database.`, 'success');

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
      await deleteSupabaseProject(id);
      triggerToast(`Permanently deleted "${name}" from database.`, 'info');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Delete transaction failed: ' + (err.message || err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
      {/* HEADER: SEARCH & TABS ROW */}
      <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider">📂 Projects</h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48 xl:w-64">
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search projects..."
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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Planning">Planning</option>
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
                    {editingId ? `📝 Edit project Record: "${editingId}"` : `✨ Publish New project`}
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

                      <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[10px] font-bold select-none shrink-0">
                        {(['upload', 'url'] as const).map(tab => (
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
                            {tab === 'upload' ? '📤 Upload' : '🔗 URL'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-3">

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
                                placeholder="Enter custom image HTTPS URL"
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

                      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Live Banner Preview:</span>

                          {projImageUrl ? (
                            <div className="relative group flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[100px] flex items-center justify-center">
                              <SafeImage
                                src={projImageUrl}
                                alt="Live Gallery Project preview"
                                className="w-full h-full object-cover absolute inset-0"
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
                      <div className="w-20 h-12 flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-3xs ">
                        <SafeImage
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
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
      </div>
    </div>
  );
}

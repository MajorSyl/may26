import React, { useState, useEffect } from 'react';
import { FileText, Sliders, RefreshCw, Check, ArrowUp, ArrowDown, Eye, EyeOff, Mail, Phone, Facebook, Instagram } from 'lucide-react';
import {
  getSiteSettings, updateSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS,
  PageBlock, DEFAULT_HOME_LAYOUT, DEFAULT_ABOUT_LAYOUT
} from '../../supabase-service';

interface SettingsSectionProps {
  siteSettings: SiteSettings;
  onRefresh: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SETTINGS_SUBTABS: { id: 'copy' | 'design' | 'contact'; label: string; icon: string }[] = [
  { id: 'copy', label: 'Page Copy', icon: '📝' },
  { id: 'design', label: 'Design & Layout', icon: '🎨' },
  { id: 'contact', label: 'Contact & Social', icon: '📇' }
];

export default function SettingsSection({ siteSettings, onRefresh, triggerToast }: SettingsSectionProps) {
  const [settingsSubTab, setSettingsSubTab] = useState<'copy' | 'design' | 'contact'>('copy');
  const [draft, setDraft] = useState<SiteSettings>(siteSettings || DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [cmsSubTab, setCmsSubTab] = useState<'home' | 'about' | 'involved'>('home');
  const [designSubTab, setDesignSubTab] = useState<'home' | 'about'>('home');

  const [homeBlocks, setHomeBlocks] = useState<PageBlock[]>([]);
  const [aboutBlocks, setAboutBlocks] = useState<PageBlock[]>([]);

  // Sync block configs whenever the local draft settings change
  useEffect(() => {
    if (draft) {
      try {
        const hb = (draft.homeLayout ? JSON.parse(draft.homeLayout) : DEFAULT_HOME_LAYOUT).filter((b: any) => b.id !== 'stats' && b.id !== 'facebook');
        setHomeBlocks(hb);
      } catch (e) {
        setHomeBlocks(DEFAULT_HOME_LAYOUT.filter(block => block.id !== 'stats' && block.id !== 'facebook'));
      }
      try {
        const ab = draft.aboutLayout ? JSON.parse(draft.aboutLayout) : DEFAULT_ABOUT_LAYOUT;
        setAboutBlocks(ab);
      } catch (e) {
        setAboutBlocks(DEFAULT_ABOUT_LAYOUT);
      }
    }
  }, [draft]);

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

  const handleSaveCopy = async () => {
    setActionLoading(true);
    try {
      await updateSiteSettings(draft);
      triggerToast('Website layout settings successfully saved to Supabase Postgres!', 'success');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Failed to save settings: ' + (err.message || String(err)), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetCopy = async () => {
    if (!window.confirm('Reset local changes? Unsaved edits will be reverted.')) return;
    setLoading(true);
    try {
      const res = await getSiteSettings();
      setDraft(res);
      triggerToast('Form refreshed successfully.', 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    setActionLoading(true);
    try {
      const updated = {
        ...draft,
        homeLayout: JSON.stringify(homeBlocks),
        aboutLayout: JSON.stringify(aboutBlocks)
      };
      await updateSiteSettings(updated);
      // Make sure we update our local draft so everything stays in sync
      setDraft(updated);
      triggerToast('Page sequence and background themes successfully committed to Supabase Postgres!', 'success');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Failed to save layout: ' + (err.message || String(err)), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDesign = async () => {
    if (!window.confirm('Reset Layout sequences? Unapplied sequence sorting/styling changes will be lost.')) return;
    setLoading(true);
    try {
      const res = await getSiteSettings();
      setDraft(res);
      triggerToast('Layout configurations successfully loaded from persistent store.', 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider">⚙️ Settings</h2>
      </div>

      {/* Outer sub-tab nav -- array-driven so a future "Contact & Social" entry
          is a one-line addition, not a rewrite of this bar. */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {SETTINGS_SUBTABS.map((tab) => (
            <button
              key={tab.id}
              id={`settings-subtab-btn-${tab.id}`}
              onClick={() => setSettingsSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold leading-none uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                settingsSubTab === tab.id
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200 font-black'
                  : 'text-slate-500 hover:text-slate-805 hover:bg-slate-200/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 space-y-3">
          <RefreshCw className="h-8 w-8 text-rotary-azure animate-spin" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Querying Postgres Schema tables...</p>
        </div>
      ) : (
        <>
          {/* PAGE COPY PANEL */}
          {settingsSubTab === 'copy' && (
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
                  onClick={handleSaveCopy}
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
                          value={draft.homeHeroBadge || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeHeroBadge: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Hero Main Headline</label>
                        <input
                          type="text"
                          value={draft.homeHeroTitle || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeHeroTitle: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Hero Subtitle Paragraph</label>
                        <textarea
                          rows={3}
                          value={draft.homeHeroSubtitle || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeHeroSubtitle: e.target.value }))}
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
                          value={draft.homeResidentsServed || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeResidentsServed: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Resources Shipped Stat Text</label>
                        <input
                          type="text"
                          value={draft.homeResourcesShipped || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeResourcesShipped: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Maternal Midwife Kits Stat Text</label>
                        <input
                          type="text"
                          value={draft.homeMaternalKits || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeMaternalKits: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Financial Audit Trail Text</label>
                        <input
                          type="text"
                          value={draft.homeFinancingAudit || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeFinancingAudit: e.target.value }))}
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
                          value={draft.homeMissionTitle || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeMissionTitle: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Mission Description Paragraph 1</label>
                        <textarea
                          rows={3}
                          value={draft.homeMissionBody1 || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeMissionBody1: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Mission Description Paragraph 2</label>
                        <textarea
                          rows={3}
                          value={draft.homeMissionBody2 || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, homeMissionBody2: e.target.value }))}
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
                            value={draft.homeServiceValueTitle1 || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, homeServiceValueTitle1: e.target.value }))}
                            className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest font-bold">Body Summary Description</label>
                          <textarea
                            rows={3}
                            value={draft.homeServiceValueBody1 || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, homeServiceValueBody1: e.target.value }))}
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
                            value={draft.homeServiceValueTitle2 || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, homeServiceValueTitle2: e.target.value }))}
                            className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest font-bold">Body Summary Description</label>
                          <textarea
                            rows={3}
                            value={draft.homeServiceValueBody2 || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, homeServiceValueBody2: e.target.value }))}
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
                            value={draft.homeServiceValueTitle3 || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, homeServiceValueTitle3: e.target.value }))}
                            className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest font-bold">Body Summary Description</label>
                          <textarea
                            rows={3}
                            value={draft.homeServiceValueBody3 || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, homeServiceValueBody3: e.target.value }))}
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
                          value={draft.aboutHeaderBadge || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, aboutHeaderBadge: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Intro Head Heading</label>
                        <input
                          type="text"
                          value={draft.aboutHeaderTitle || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, aboutHeaderTitle: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Intro Paragraph Description Text</label>
                        <textarea
                          rows={3}
                          value={draft.aboutHeaderDesc || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, aboutHeaderDesc: e.target.value }))}
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
                            value={draft.aboutVisionTitle || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, aboutVisionTitle: e.target.value }))}
                            className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest font-bold">Core Message Description Text</label>
                          <textarea
                            rows={4}
                            value={draft.aboutVisionBody || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, aboutVisionBody: e.target.value }))}
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
                            value={draft.aboutMissionTitle || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, aboutMissionTitle: e.target.value }))}
                            className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest font-bold">Core Message Description Text</label>
                          <textarea
                            rows={4}
                            value={draft.aboutMissionBody || ''}
                            onChange={(e) => setDraft(prev => ({ ...prev, aboutMissionBody: e.target.value }))}
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
                          value={draft.involvedBadge || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, involvedBadge: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Involved Page Main Headline</label>
                        <input
                          type="text"
                          value={draft.involvedTitle || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, involvedTitle: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-slate-455 uppercase text-[9px] tracking-wider block font-bold">Intro Quote or Description paragraph</label>
                        <textarea
                          rows={4}
                          value={draft.involvedSubtitle || ''}
                          onChange={(e) => setDraft(prev => ({ ...prev, involvedSubtitle: e.target.value }))}
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
                  onClick={handleResetCopy}
                  className="px-4 py-2 border border-slate-350 hover:border-slate-500 rounded-xl uppercase text-[10px] font-bold tracking-wider text-slate-600 transition-colors cursor-pointer"
                >
                  Reset Visual Form
                </button>
                <button
                  id="submit-cms-settings-btn-bottom"
                  onClick={handleSaveCopy}
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

          {/* DESIGN & LAYOUT PANEL */}
          {settingsSubTab === 'design' && (
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
                  onClick={handleSaveDesign}
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
                  onClick={handleResetDesign}
                  className="px-4 py-2 border border-slate-350 hover:border-slate-500 rounded-xl uppercase text-[10px] font-bold tracking-wider text-slate-600 transition-colors cursor-pointer"
                >
                  Discard Layout changes
                </button>
                <button
                  id="submit-design-settings-btn-bottom"
                  onClick={handleSaveDesign}
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

          {/* CONTACT & SOCIAL PANEL */}
          {settingsSubTab === 'contact' && (
            <div className="bg-slate-50 p-6 select-text text-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-display uppercase tracking-wider">
                    <Mail className="h-4 w-4 text-rotary-azure" />
                    Contact & Social Links
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                    Shown site-wide: footer, Contact page, and Get Involved page
                  </p>
                </div>
                <button
                  id="submit-contact-settings-btn"
                  onClick={handleSaveCopy}
                  disabled={actionLoading}
                  className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer focus:outline-none"
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4.5 w-4.5" />
                  )}
                  <span>Save Contact & Social changes</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550">
                <div className="space-y-1">
                  <label className="text-slate-455 uppercase text-[9px] tracking-wider flex items-center gap-1 font-bold">
                    <Mail className="h-3 w-3" /> Contact Email
                  </label>
                  <input
                    id="settings-contact-email"
                    type="email"
                    value={draft.contactEmail || ''}
                    onChange={(e) => setDraft(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 uppercase text-[9px] tracking-wider flex items-center gap-1 font-bold">
                    <Phone className="h-3 w-3" /> Contact Phone
                  </label>
                  <input
                    id="settings-contact-phone"
                    type="text"
                    value={draft.contactPhone || ''}
                    onChange={(e) => setDraft(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 uppercase text-[9px] tracking-wider flex items-center gap-1 font-bold">
                    <Facebook className="h-3 w-3" /> Facebook URL
                  </label>
                  <input
                    id="settings-social-facebook"
                    type="url"
                    value={draft.socialFacebookUrl || ''}
                    onChange={(e) => setDraft(prev => ({ ...prev, socialFacebookUrl: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-455 uppercase text-[9px] tracking-wider flex items-center gap-1 font-bold">
                    <Instagram className="h-3 w-3" /> Instagram URL
                  </label>
                  <input
                    id="settings-social-instagram"
                    type="url"
                    value={draft.socialInstagramUrl || ''}
                    onChange={(e) => setDraft(prev => ({ ...prev, socialInstagramUrl: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-rotary-azure"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

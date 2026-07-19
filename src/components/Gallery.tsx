import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { getDbProjects, getActiveDbDriver } from '../db-router';
import { Info, Filter, Clock, MapPin, RefreshCw, ArrowRight } from 'lucide-react';
import ProjectDetails from './ProjectDetails';

export default function Gallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [currentDriver, setCurrentDriver] = useState(getActiveDbDriver());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Filtering states
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const fetchProjectsData = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const data = await getDbProjects();
      setProjects(data);
    } catch (err) {
      setErrorText(`Failed to pull projects. Please make sure ${getActiveDbDriver()} rules or credentials allow access.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();

    // Listen to changes in db-driver
    const handleDriverChanged = () => {
      setCurrentDriver(getActiveDbDriver());
      fetchProjectsData();
    };

    window.addEventListener('db-driver-changed', handleDriverChanged);
    return () => window.removeEventListener('db-driver-changed', handleDriverChanged);
  }, []);


  // Filter computations
  const years = ['All', ...new Set(projects.map(p => String(p.year)))].sort().reverse();
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const statuses = ['All', 'Completed', 'Active', 'Planning'];

  const filteredProjects = projects.filter(p => {
    const matchesYear = selectedYear === 'All' || String(p.year) === selectedYear;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesYear && matchesCategory && matchesStatus;
  });

  if (selectedProject) {
    return (
      <ProjectDetails 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24">
      {/* 1. HEADER */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex bg-rotary-gold/10 text-rotary-gold px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
            On-The-Ground Impact
          </div>
          <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
            Service Gallery
          </h1>
          <p className="text-slate-500 max-w-2xl font-light">
            A look at our club's community service projects — completed, active, and planned.
          </p>
        </div>

        <button 
          id="refresh-gallery-btn"
          onClick={fetchProjectsData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 w-fit transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Fetch Updated
        </button>
      </section>

      {/* 2. FILTER CONTROLS BAR */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="h-4 w-4 text-rotary-azure" />
          <h3 className="font-bold text-sm tracking-wide font-display">Filter Active Projects</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text:[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-display">Focus Sector</label>
            <select 
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Focus Sectors' : cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text:[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-display">Year</label>
            <select 
              id="filter-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
            >
              {years.map(yr => <option key={yr} value={yr}>{yr === 'All' ? 'All Years' : yr}</option>)}
            </select>
          </div>

          <div>
            <label className="block text:[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-display">Implementation Status</label>
            <div className="flex gap-2">
              {statuses.map(st => {
                const isSel = selectedStatus === st;
                return (
                  <button
                    key={st}
                    id={`filter-status-${st}`}
                    onClick={() => setSelectedStatus(st)}
                    className={`flex-1 px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-lg border transition-all ${
                      isSel 
                        ? 'bg-rotary-dark text-white border-rotary-dark' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. GALLERY LISTING */}
      {loading ? (
        <div className="text-center py-20 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 border-4 border-rotary-azure border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium uppercase font-display">Retrieving Club ventures...</p>
        </div>
      ) : errorText ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center text-sm">
          {errorText}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-500">
          {projects.length === 0
            ? 'Our project portfolio is being updated. Contact a club officer to learn about our current initiatives.'
            : 'No projects found matching the active filters. Turn off some filters to inspect other projects.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const isCompleted = project.status === 'Completed';
            const isActive = project.status === 'Active';
            const isPlanning = project.status === 'Planning';

            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className="bg-white border border-slate-205 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-rotary-azure/40 transition-all cursor-pointer flex flex-col justify-between group p-6 space-y-4"
              >
                <div className="space-y-4">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide truncate max-w-[70%]">
                      {project.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-lg tracking-wider border text-white ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-500/50' 
                        : isActive 
                        ? 'bg-indigo-600 border-indigo-500/50' 
                        : 'bg-amber-600 border-amber-500/50'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-rotary-gold" />
                      <span>{project.year} Program</span>
                    </div>

                    <h3 className="font-extrabold font-display text-slate-800 text-md leading-tight">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed font-light line-clamp-5">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Impact Statement & View Action footer */}
                <div className="space-y-4">
                  {project.impact && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rotary-gold"></span>
                        <p className="text-[9px] font-bold uppercase text-slate-400 font-display tracking-widest">Sunset Impact Metric</p>
                      </div>
                      <p className="text-[11px] text-slate-700 font-bold leading-normal">
                        {project.impact}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-rotary-azure font-display uppercase tracking-wider group-hover:text-rotary-azure-dark transition-colors">
                    <span>Explore Project Details</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

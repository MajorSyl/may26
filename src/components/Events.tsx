import React, { useState, useEffect } from 'react';
import { ClubEvent, ContactInquiry, EventRSVP } from '../types';
import { getDbEvents, submitDbInquiry, getActiveDbDriver, submitDbRSVP } from '../db-router';
import { Calendar, Clock, MapPin, User, Mail, Send, Check, RefreshCw } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpErrorText, setRsvpErrorText] = useState('');
  const [currentDriver, setCurrentDriver] = useState(getActiveDbDriver());
  
  // Form states
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNote, setGuestNote] = useState('');

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const data = await getDbEvents();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();

    // Listen to changes in db-driver
    const handleDriverChanged = () => {
      setCurrentDriver(getActiveDbDriver());
      fetchEventsData();
    };

    window.addEventListener('db-driver-changed', handleDriverChanged);
    return () => window.removeEventListener('db-driver-changed', handleDriverChanged);
  }, []);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !selectedEventId) return;

    setRsvpLoading(true);
    setRsvpErrorText('');
    setRsvpSuccess(false);
    
    const rsvpData: EventRSVP = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'rsvp_' + Math.random().toString(36).substring(2, 11),
      event_id: selectedEventId,
      name: guestName,
      email: guestEmail,
      submitted_at: new Date().toISOString()
    };

    try {
      await submitDbRSVP(rsvpData);
      setRsvpSuccess(true);
      setGuestName('');
      setGuestEmail('');
      setGuestNote('');
      // Show success briefly
      setTimeout(() => setRsvpSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed submitting RSVP", err);
      setRsvpErrorText(err?.message || 'Could not register RSVP. Please try again later.');
    } finally {
      setRsvpLoading(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {/* 1. HEADER */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
            Fellowship Circles
          </div>
          <h1 className="text-4xl font-extrabold font-display text-rotary-dark tracking-tight">
            Meetings & RSVP
          </h1>
          <p className="text-slate-500 max-w-2xl font-light">
            We meet weekly in Freetown. Visiting Rotarians, family guests, and prospective service leaders are always welcome to join. Let us know you are coming!
          </p>
        </div>

        <button 
          id="refresh-meetings-btn"
          onClick={fetchEventsData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 w-fit transition-colors animate-fade-in"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Fetch Meetings
        </button>
      </section>

      {/* 2. DYNAMIC SPLIT: EVENTS LIST & RSVP FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* EVENT CARDS COLUMN (7 SPANS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-2 text-slate-800">
            <Calendar className="h-5 w-5 text-rotary-azure" />
            <span className="font-extrabold font-display text-base uppercase tracking-wider">Upcoming Calendar</span>
          </div>

          {loading ? (
            <div className="text-center py-20 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 border-4 border-rotary-azure border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-semibold font-display uppercase tracking-wider">Loading weekly programs...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-500 font-light">
              No meetings are currently listed. Please check back shortly or feel free to contact a club officer.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => {
                const isWeekly = ev.type === 'Weekly Meeting';
                const isSocial = ev.type === 'Social';
                const isProject = ev.type === 'Service Project';
                const isGala = ev.type === 'Fundraiser';

                return (
                  <div 
                    key={ev.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow relative overflow-hidden space-y-4"
                  >
                    {/* Visual indicator corner */}
                    <div className={`absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full opacity-10 ${
                      isWeekly ? 'bg-rotary-azure' : isGala ? 'bg-rotary-gold' : 'bg-emerald-600'
                    }`}></div>

                    <div className="flex flex-wrap items-center gap-2">
                       <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                        isWeekly 
                          ? 'bg-rotary-azure/10 text-rotary-azure border-rotary-azure/20' 
                          : isGala 
                          ? 'bg-rotary-gold/10 text-rotary-gold border-rotary-gold/20' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-display uppercase tracking-widest">D9101 SUNSET</span>
                    </div>

                    <h3 className="text-xl font-extrabold font-display text-slate-805 text-slate-800 leading-snug">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="text-xs text-slate-500 font-light leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    {ev.speaker && (
                      <div className="bg-[#F1F5F9] px-4 py-2.5 rounded-2xl border border-slate-200 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 font-display uppercase tracking-widest block">Featured Guest Speaker</span>
                        <span className="text-xs font-bold text-slate-700">{ev.speaker}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{ev.date} @ {ev.time}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="truncate" title={ev.location}>{ev.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RSVP FORM COLUMN (5 SPANS) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 sticky top-24">
            <div className="space-y-1">
              <span className="inline-block bg-rotary-gold/10 text-rotary-gold text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-lg mb-1.5 font-display">Hospitality Desk</span>
              <h3 className="text-xl font-bold font-display text-slate-800">
                Lodge Guest RSVP
              </h3>
              <p className="text-xs text-slate-500 font-light">
                Submit your visitor details so our hospitality director can welcome you with beverages at our Lumley beach venue.
              </p>
            </div>

            <form onSubmit={handleRSVPSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mb-1.5">Selected Club Event</label>
                <select
                  id="rsvp-event-select"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure"
                  required
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mb-1.5">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                  <input
                    id="rsvp-name-input"
                    type="text"
                    placeholder="e.g. Samuel Jalloh"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mb-1.5">Your Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                  <input
                    id="rsvp-email-input"
                    type="email"
                    placeholder="e.g. sam@gmail.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-display mb-1.5">Special Requirements</label>
                <textarea
                  id="rsvp-note-input"
                  placeholder="e.g. represent another club or have food allergies..."
                  value={guestNote}
                  onChange={(e) => setGuestNote(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-slate-200 rounded-xl px-3.5 py-3 text-xs h-20 focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure font-semibold text-slate-700 resize-none"
                />
              </div>

              <button
                id="rsvp-submit-btn"
                type="submit"
                disabled={rsvpLoading || events.length === 0}
                className={`w-full py-3.5 font-bold font-display text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  rsvpSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-rotary-azure hover:bg-rotary-azure/90 text-white hover:shadow'
                }`}
              >
                {rsvpLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : rsvpSuccess ? (
                  <>
                    <Check className="h-5 w-5" />
                    RSVP Registered!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Register My RSVP
                  </>
                )}
              </button>
            </form>

            {rsvpSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-[11px] text-emerald-800 font-semibold uppercase font-display select-none">
                Thank you! Your information is catalogued.
              </div>
            )}

            {rsvpErrorText && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-center text-[11px] text-rose-700 font-semibold uppercase font-display select-none">
                {rsvpErrorText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, ClubEvent, UserProfile, ContactInquiry } from './types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from './data';

// Read configuration from Vite environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined');

// Real Supabase Client Instance (if variables exist)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// LocalStorage Persistence helper for Simulator
const getLocalData = <T>(key: string, defaultVal: T): T => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(val);
};

const setLocalData = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// -------------------------------------------------------------
// SUPABASE OPERATIONS ENGINE (AUTONOMOUS SWITCHOVER)
// -------------------------------------------------------------

export interface PageBlock {
  id: string;
  title: string;
  bgColor: 'dark' | 'light' | 'slate' | 'brand' | 'gold';
  visible: boolean;
}

export interface SiteSettings {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroBadge: string;
  homeResidentsServed: string;
  homeResourcesShipped: string;
  homeMaternalKits: string;
  homeFinancingAudit: string;
  homeMissionTitle: string;
  homeMissionBody1: string;
  homeMissionBody2: string;
  homeServiceValueTitle1: string;
  homeServiceValueBody1: string;
  homeServiceValueTitle2: string;
  homeServiceValueBody2: string;
  homeServiceValueTitle3: string;
  homeServiceValueBody3: string;

  aboutHeaderBadge: string;
  aboutHeaderTitle: string;
  aboutHeaderDesc: string;
  aboutVisionTitle: string;
  aboutVisionBody: string;
  aboutMissionTitle: string;
  aboutMissionBody: string;

  involvedBadge: string;
  involvedTitle: string;
  involvedSubtitle: string;
  involvedContactEmail: string;
  involvedContactPhone: string;

  homeLayout?: string;
  aboutLayout?: string;
}

export const DEFAULT_HOME_LAYOUT: PageBlock[] = [
  { id: 'hero', title: 'Hero Banner', bgColor: 'dark', visible: true },
  { id: 'about_us', title: 'About Us & Fellowship', bgColor: 'light', visible: true },
  { id: 'recent_projects', title: 'Recent Completed Projects', bgColor: 'slate', visible: true },
  { id: 'mission', title: 'Sunset Mission Details', bgColor: 'light', visible: true },
  { id: 'facebook', title: 'Facebook Media Hub', bgColor: 'slate', visible: true },
  { id: 'announcements', title: 'Latest Announcements', bgColor: 'light', visible: true }
];

export const DEFAULT_ABOUT_LAYOUT: PageBlock[] = [
  { id: 'header', title: 'Introductory Header', bgColor: 'light', visible: true },
  { id: 'vision_mission', title: 'Vision & Mission', bgColor: 'light', visible: true },
  { id: 'four_way_test', title: 'Four-Way Test Accordion', bgColor: 'dark', visible: true },
  { id: 'leadership', title: 'Club Leadership Grid', bgColor: 'light', visible: true }
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  homeHeroTitle: "Service Above Self",
  homeHeroSubtitle: "We are a community of dedicated local and international professionals taking action in Freetown to pioneer sustainable clean water access, secondary education, and healthcare.",
  homeHeroBadge: "",
  homeResidentsServed: "5,000+",
  homeResourcesShipped: "4,500+",
  homeMaternalKits: "1,500+",
  homeFinancingAudit: "100%",
  homeMissionTitle: "Pioneering Grassroots Development on Freetown’s Beautiful coastline",
  homeMissionBody1: "The Rotary Club of Freetown Sunset (RCFS) consists of highly motivated, values-driven professionals meeting weekly in Freetown. Applying the core Rotary tenets, we build localized public solutions with a deep focus on water sanitation, youth educational resources, and pediatric security.",
  homeMissionBody2: "Every project we deploy is backed by extensive multi-year community collaboration. We ensure that rural well operations, solar clinic grids, and libraries are locally maintained and self-sustaining.",
  homeServiceValueTitle1: "Sustainable Solutions",
  homeServiceValueBody1: "We do not do short-term hand-outs. We build solar-powered boreholes and train local community committees to operate them.",
  homeServiceValueTitle2: "The 4-Way Test",
  homeServiceValueBody2: "We follow the ethical Four-Way Test. All resources are secured and accounted for by safe procedures.",
  homeServiceValueTitle3: "Community Cooperation",
  homeServiceValueBody3: "Every project is designed, refined, and monitored alongside village leaders and hospital administrations in Sierra Leone.",

  aboutHeaderBadge: "Our Foundation",
  aboutHeaderTitle: "The Sunset Legacy",
  aboutHeaderDesc: "Formed to bring a vibrant, forward-looking twist to service in Freetown, the Rotary Club of Freetown Sunset merges professional fellowship with transformative local action.",
  aboutVisionTitle: "Our Vision",
  aboutVisionBody: "To build a vibrant, diverse, and tightly cohesive network of leaders who deploy sustainable infrastructure solutions in Sierra Leone, encouraging community resilience and setting the benchmark for ethical service.",
  aboutMissionTitle: "Our Mission",
  aboutMissionBody: "Through weekly intellectual fellowship, professional synergy, and direct hands-on collaboration, we secure resources, initiate infrastructure designs, and train local community leaders to preserve health, clean water, and literacy.",

  involvedBadge: "Take Action Today",
  involvedTitle: "Help Us Empower Freetown Communities",
  involvedSubtitle: "Whether you are a local professional looking to give back or an international partner ready to fund systemic change, there are multiple avenues to work with Freetown Sunset.",
  involvedContactEmail: "freetownsunset@gmail.com",
  involvedContactPhone: "+232 76 987654",

  homeLayout: JSON.stringify(DEFAULT_HOME_LAYOUT),
  aboutLayout: JSON.stringify(DEFAULT_ABOUT_LAYOUT)
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', 'settings_site_config')
        .single();

      if (error || !data) {
        return getLocalData<SiteSettings>('sb_site_settings', DEFAULT_SITE_SETTINGS);
      }
      
      const parsed = JSON.parse(data.description);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    } catch (err) {
      console.error('Failed to load site settings from Supabase, returning local state:', err);
      return getLocalData<SiteSettings>('sb_site_settings', DEFAULT_SITE_SETTINGS);
    }
  } else {
    return getLocalData<SiteSettings>('sb_site_settings', DEFAULT_SITE_SETTINGS);
  }
};

export const updateSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  setLocalData('sb_site_settings', settings);
  
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('projects')
        .upsert({
          id: 'settings_site_config',
          title: 'Site Settings Configuration Data File',
          category: 'System Config',
          description: JSON.stringify(settings),
          year: 2026,
          impact: 'Applied directly to website text panels',
          status: 'Active',
          imageurl: ''
        });
    } catch (err) {
      console.error('Failed to save settings to live Supabase Postgres:', err);
    }
  }
  return settings;
};

// 1. Projects Operations
export const getSupabaseProjects = async (): Promise<Project[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        // Map database lowercase key "imageurl" back to react interface's camelCase "imageUrl"
        return data
          .filter((d: any) => d.id !== 'settings_site_config')
          .map((d: any) => ({
            ...d,
            imageUrl: d.imageUrl || d.imageurl
          })) as Project[];
      }
      
      // If table exists but has no data, return initially loaded values
      return INITIAL_PROJECTS;
    } catch (err) {
      console.error('Supabase query error (Projects), falling back:', err);
      return INITIAL_PROJECTS;
    }
  } else {
    // Simulated Sandbox Mode
    return getLocalData<Project[]>('sb_supabase_projects', INITIAL_PROJECTS)
      .filter((p) => p.id !== 'settings_site_config');
  }
};

export const saveSupabaseProject = async (project: Project): Promise<Project> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        title: project.title,
        category: project.category,
        description: project.description,
        year: project.year,
        impact: project.impact || '',
        status: project.status,
        imageurl: project.imageUrl || '' // Save into the database's lowercase field 
      });

    if (error) {
      console.error('Failed to upsert to real Supabase database:', error);
      throw error;
    }
    return project;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<Project[]>('sb_supabase_projects', INITIAL_PROJECTS);
    const idx = list.findIndex(p => p.id === project.id);
    if (idx > -1) {
      list[idx] = project;
    } else {
      list.push(project);
    }
    setLocalData('sb_supabase_projects', list);
    return project;
  }
};

// 2. Events Operations
export const getSupabaseEvents = async (): Promise<ClubEvent[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data as ClubEvent[];
      }
      return INITIAL_EVENTS;
    } catch (err) {
      console.error('Supabase query error (Events), falling back:', err);
      return INITIAL_EVENTS;
    }
  } else {
    // Simulated Sandbox Mode
    return getLocalData<ClubEvent[]>('sb_supabase_events', INITIAL_EVENTS);
  }
};

export const saveSupabaseEvent = async (event: ClubEvent): Promise<ClubEvent> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('events')
      .upsert({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        speaker: event.speaker || '',
        description: event.description || '',
        type: event.type
      });

    if (error) {
      console.error('Failed to upsert Event to real Supabase database:', error);
      throw error;
    }
    return event;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<ClubEvent[]>('sb_supabase_events', INITIAL_EVENTS);
    const idx = list.findIndex(e => e.id === event.id);
    if (idx > -1) {
      list[idx] = event;
    } else {
      list.push(event);
    }
    setLocalData('sb_supabase_events', list);
    return event;
  }
};

// 3. Profiles Operations
export const getSupabaseUser = async (uid: string): Promise<UserProfile | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      // Map PostgreSQL lowercased fields back to camelCase React fields
      if (data) {
        return {
          uid: data.uid,
          name: data.name,
          email: data.email,
          role: data.role,
          attendanceRate: data.attendanceRate !== undefined ? data.attendanceRate : data.attendancerate,
          contributionGoals: data.contributionGoals !== undefined ? data.contributionGoals : data.contributiongoals,
          contributedAmount: data.contributedAmount !== undefined ? data.contributedAmount : data.contributedamount,
          committee: data.committee,
          tasks: data.tasks || []
        } as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Supabase query error (UserProfile):', err);
      return null;
    }
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    return list.find(u => u.uid === uid) || null;
  }
};

export const upsertSupabaseUser = async (profile: UserProfile): Promise<UserProfile> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('users')
      .upsert({
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        attendancerate: profile.attendanceRate || 92,
        contributiongoals: profile.contributionGoals || 500,
        contributedamount: profile.contributedAmount || 150,
        committee: profile.committee || 'General Fellowship',
        tasks: profile.tasks || []
      });

    if (error) {
      console.error('Failed to upsert User to real Supabase database:', error);
      throw error;
    }
    return profile;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    const idx = list.findIndex(u => u.uid === profile.uid);
    if (idx > -1) {
      list[idx] = profile;
    } else {
      list.push(profile);
    }
    setLocalData('sb_supabase_users', list);
    return profile;
  }
};

// 4. Contact Inquiries
export const submitSupabaseInquiry = async (inquiry: ContactInquiry): Promise<ContactInquiry> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('inquiries')
      .insert({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        subject: inquiry.subject || '',
        message: inquiry.message,
        type: inquiry.type,
        created_at: inquiry.createdAt || new Date().toISOString()
      });

    if (error) {
      console.error('Failed to insert Inquiry to real Supabase database:', error);
      throw error;
    }
    return inquiry;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<ContactInquiry[]>('sb_supabase_inquiries', []);
    list.push(inquiry);
    setLocalData('sb_supabase_inquiries', list);
    return inquiry;
  }
};

// 4.1 Delete Project
export const deleteSupabaseProject = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete Project in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<Project[]>('sb_supabase_projects', INITIAL_PROJECTS);
    const updated = list.filter(p => p.id !== id);
    setLocalData('sb_supabase_projects', updated);
    return true;
  }
};

// 4.2 Delete Event
export const deleteSupabaseEvent = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete Event in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<ClubEvent[]>('sb_supabase_events', INITIAL_EVENTS);
    const updated = list.filter(e => e.id !== id);
    setLocalData('sb_supabase_events', updated);
    return true;
  }
};

// 4.3 Get All Users / Members
export const getSupabaseUsers = async (): Promise<UserProfile[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        return data.map((d: any) => ({
          uid: d.uid,
          name: d.name,
          email: d.email,
          role: d.role,
          attendanceRate: d.attendanceRate !== undefined ? d.attendanceRate : d.attendancerate,
          contributionGoals: d.contributionGoals !== undefined ? d.contributionGoals : d.contributiongoals,
          contributedAmount: d.contributedAmount !== undefined ? d.contributedAmount : d.contributedamount,
          committee: d.committee,
          tasks: d.tasks || []
        })) as UserProfile[];
      }
      return [];
    } catch (err) {
      console.error('Supabase query error (all Users):', err);
      return [];
    }
  } else {
    return getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
  }
};

// 4.4 Delete User / Member
export const deleteSupabaseUser = async (uid: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('uid', uid);
    if (error) {
      console.error('Failed to delete User in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    const updated = list.filter(u => u.uid !== uid);
    setLocalData('sb_supabase_users', updated);
    return true;
  }
};

// 4.5 Get All Contact Inquiries
export const getSupabaseInquiries = async (): Promise<ContactInquiry[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          subject: d.subject,
          message: d.message,
          type: d.type,
          createdAt: d.created_at || d.createdAt
        })) as ContactInquiry[];
      }
      return [];
    } catch (err) {
      console.error('Supabase query error (all Inquiries):', err);
      return [];
    }
  } else {
    return getLocalData<ContactInquiry[]>('sb_supabase_inquiries', []);
  }
};

// 4.6 Delete Contact Inquiry
export const deleteSupabaseInquiry = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete inquiry in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<ContactInquiry[]>('sb_supabase_inquiries', []);
    const updated = list.filter(i => i.id !== id);
    setLocalData('sb_supabase_inquiries', updated);
    return true;
  }
};

// 5. Seed Database Script
export const seedSupabaseTables = async (): Promise<{ success: boolean; message: string; seededCount: number }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase URL/Anon key are missing.', seededCount: 0 };
  }

  let count = 0;
  try {
    // Seed projects
    for (const p of INITIAL_PROJECTS) {
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          year: p.year,
          impact: p.impact || '',
          status: p.status,
          imageurl: p.imageUrl || '' // Use lowercase field name to match PG
        });
      if (error) throw error;
      count++;
    }

    // Seed events
    for (const ev of INITIAL_EVENTS) {
      const { error } = await supabase
        .from('events')
        .upsert({
          id: ev.id,
          title: ev.title,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          speaker: ev.speaker || null, // Ensure is always present (even as null) to satisfy PostgREST batch constraints
          description: ev.description || '',
          type: ev.type
        });
      if (error) throw error;
      count++;
    }

    return { 
      success: true, 
      message: 'Successfully seeded default Rotary Sunset projects and events into your live Supabase database!',
      seededCount: count 
    };
  } catch (err: any) {
    console.error('Error seeding Supabase data:', err);
    return { 
      success: false, 
      message: `Failed during seed: ${err.message || String(err)}. Make sure tables exist in your Supabase schema!`, 
      seededCount: count 
    };
  }
};

// 6. SQL Schema Script code Block (for presentation inside instructions)
export const GET_SUPABASE_SQL_SCHEMA = () => `
-- Copy and run this script in your Supabase SQL Editor:

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  year INTEGER NOT NULL,
  impact TEXT,
  status TEXT NOT NULL CHECK (status IN ('Completed', 'Active', 'Planning')),
  imageUrl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  speaker TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Weekly Meeting', 'Service Project', 'Social', 'Fundraiser')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Rotarian', 'Club Officer', 'Guest', 'President')),
  attendanceRate INTEGER,
  contributionGoals INTEGER,
  contributedAmount INTEGER,
  committee TEXT,
  tasks TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 4. Create Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Membership Inquiry', 'Donation Inquiry', 'General Contact')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable Realtime for automatic updates (Optional but recommended)
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table events;
`;

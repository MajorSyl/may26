import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, NewsletterSubscriber } from './types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from './data';
import { safeStorage } from './lib/safe-storage';

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
  const val = safeStorage.getItem(key);
  if (!val) {
    safeStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(val);
};

const setLocalData = <T>(key: string, data: T) => {
  safeStorage.setItem(key, JSON.stringify(data));
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
  homeResidentsServed: "",
  homeResourcesShipped: "",
  homeMaternalKits: "",
  homeFinancingAudit: "",
  homeMissionTitle: "Serving Freetown Through Fellowship and Action",
  homeMissionBody1: "The Rotary Club of Freetown Sunset (RCFS) is a community of professionals meeting weekly in Freetown, applying Rotary's core principle of Service Above Self to local needs.",
  homeMissionBody2: "Since 2014, we have carried out projects across water and sanitation, education, maternal and child health, and other areas of local need. Explore our recent projects below, or visit our official Facebook and Instagram pages for our latest work.",
  homeServiceValueTitle1: "Service Above Self",
  homeServiceValueBody1: "We work to identify real community needs and respond with practical, locally-supported solutions.",
  homeServiceValueTitle2: "The 4-Way Test",
  homeServiceValueBody2: "We follow Rotary's ethical Four-Way Test in all of our decisions and activities.",
  homeServiceValueTitle3: "Community Cooperation",
  homeServiceValueBody3: "We aim to work alongside local leaders and community members on the projects we undertake.",

  aboutHeaderBadge: "Our Foundation",
  aboutHeaderTitle: "The Sunset Legacy",
  aboutHeaderDesc: "The Rotary Club of Freetown Sunset brings together professionals in Freetown for fellowship and community service.",
  aboutVisionTitle: "Our Vision",
  aboutVisionBody: "To build a diverse, engaged network of leaders serving the Freetown community and upholding Rotary's standard of ethical service.",
  aboutMissionTitle: "Our Mission",
  aboutMissionBody: "Through weekly fellowship, professional collaboration, and hands-on community service, we work toward Rotary's mission of Service Above Self.",

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
      // Direct query on users (now safe and public with no sensitive columns)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Try to query member_contact_info for sensitive fields (only returns data if authorized / admin)
      let contactInfo: any = null;
      try {
        const { data: contactData } = await supabase
          .from('member_contact_info')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();
        contactInfo = contactData;
      } catch (cErr) {
        console.warn('Could not read member contact info (non-admin access or table missing):', cErr);
      }
      
      return {
        uid: data.uid,
        name: data.name,
        email: contactInfo?.email || '',
        role: data.role,
        attendanceRate: data.attendanceRate !== undefined ? data.attendanceRate : data.attendancerate,
        contributionGoals: data.contributionGoals !== undefined ? data.contributionGoals : data.contributiongoals,
        contributedAmount: data.contributedAmount !== undefined ? data.contributedAmount : data.contributedamount,
        committee: data.committee,
        tasks: data.tasks || [],
        classification: data.classification || '',
        isPaulHarrisFellow: data.ispaulharrisfellow !== undefined ? data.ispaulharrisfellow : false,
        paulHarrisLevel: data.paulharrislevel || 'None',
        phone: contactInfo?.phone || '',
        joinedDate: data.joineddate || '',
        birthday: contactInfo?.birthday || '',
        avatarUrl: data.avatarurl || ''
      } as UserProfile;
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
    try {
      // 1. Upsert public fields to users table (without email, phone, birthday)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          uid: profile.uid,
          name: profile.name,
          role: profile.role,
          attendancerate: profile.attendanceRate !== undefined ? profile.attendanceRate : 92,
          contributiongoals: profile.contributionGoals !== undefined ? profile.contributionGoals : 500,
          contributedamount: profile.contributedAmount !== undefined ? profile.contributedAmount : 150,
          committee: profile.committee || 'General Fellowship',
          tasks: profile.tasks || [],
          classification: profile.classification || '',
          ispaulharrisfellow: !!profile.isPaulHarrisFellow,
          paulharrislevel: profile.paulHarrisLevel || 'None',
          joineddate: profile.joinedDate || '',
          avatarurl: profile.avatarUrl || ''
        });

      if (userError) throw userError;

      // 2. Upsert sensitive fields to member_contact_info table (if values are present)
      if (profile.email || profile.phone || profile.birthday) {
        const { error: contactError } = await supabase
          .from('member_contact_info')
          .upsert({
            uid: profile.uid,
            email: profile.email || '',
            phone: profile.phone || '',
            birthday: profile.birthday || ''
          });
        if (contactError) {
          console.warn('Could not save member contact info (this is normal if non-admin or no contact permission):', contactError.message);
        }
      }
      return profile;
    } catch (err: any) {
      console.error('Failed to upsert User to real Supabase database:', err);
      throw err;
    }
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
  let list: UserProfile[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      // Query users table (now public with no sensitive columns)
      const { data: usersData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (userError) throw userError;

      if (usersData) {
        // Try to query member_contact_info (only returns rows if role is authorized / admin)
        let contactsMap = new Map<string, any>();
        try {
          const { data: contactsData } = await supabase
            .from('member_contact_info')
            .select('*');
          if (contactsData) {
            contactsData.forEach((c: any) => {
              contactsMap.set(c.uid, c);
            });
          }
        } catch (cErr) {
          console.warn('Could not read member_contact_info (this is expected for non-admins):', cErr);
        }

        list = usersData.map((d: any) => {
          const contact = contactsMap.get(d.uid);
          return {
            uid: d.uid,
            name: d.name,
            email: contact?.email || '',
            role: d.role,
            attendanceRate: d.attendanceRate !== undefined ? d.attendanceRate : (d.attendancerate !== undefined ? d.attendancerate : 92),
            contributionGoals: d.contributionGoals !== undefined ? d.contributionGoals : (d.contributiongoals !== undefined ? d.contributiongoals : 500),
            contributedAmount: d.contributedAmount !== undefined ? d.contributedAmount : (d.contributedamount !== undefined ? d.contributedamount : 150),
            committee: d.committee,
            tasks: d.tasks || [],
            classification: d.classification || '',
            isPaulHarrisFellow: d.isPaulHarrisFellow !== undefined ? d.isPaulHarrisFellow : (d.ispaulharrisfellow !== undefined ? d.ispaulharrisfellow : false),
            paulHarrisLevel: d.paulHarrisLevel !== undefined ? d.paulHarrisLevel : (d.paulharrislevel || 'None'),
            phone: contact?.phone || '',
            joinedDate: d.joinedDate !== undefined ? d.joinedDate : (d.joineddate || ''),
            birthday: contact?.birthday || '',
            avatarUrl: d.avatarUrl !== undefined ? d.avatarUrl : (d.avatarurl || '')
          };
        }) as UserProfile[];
      }
    } catch (err) {
      console.error('Supabase query error (all Users):', err);
      list = [];
    }
  } else {
    list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
  }

  // Merge the latest hardcoded core roster information into the returned list.
  // This guarantees that any updates made to names, roles, titles, or avatar URLs in FULL_MEMBER_LIST
  // are immediately active and correct in the user's interface, bypassing any stale database or localStorage data.
  const syncedList = list.map(item => {
    const coreMatch = INITIAL_MEMBER_DIRECTORY.find(core => core.uid === item.uid);
    if (coreMatch) {
      return {
        ...item,
        name: coreMatch.name,
        role: coreMatch.role,
        title: coreMatch.title || item.title || '',
        committee: coreMatch.committee,
        avatarUrl: coreMatch.avatarUrl || item.avatarUrl || '',
        classification: coreMatch.classification || item.classification || '',
        isPaulHarrisFellow: coreMatch.isPaulHarrisFellow !== undefined ? coreMatch.isPaulHarrisFellow : item.isPaulHarrisFellow,
        paulHarrisLevel: coreMatch.paulHarrisLevel || item.paulHarrisLevel || 'None',
        tasks: coreMatch.tasks && coreMatch.tasks.length > 0 ? coreMatch.tasks : item.tasks
      } as UserProfile;
    }
    return item;
  });

  // Save the synchronized list back to local storage if not using live Supabase
  if (!isSupabaseConfigured || !supabase) {
    setLocalData('sb_supabase_users', syncedList);
  }

  return syncedList;
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

// 4.7 RSVPs Operations
export const getSupabaseRSVPs = async (): Promise<EventRSVP[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        event_id: d.event_id,
        name: d.name,
        email: d.email,
        submitted_at: d.submitted_at || new Date().toISOString()
      }));
    } catch (err) {
      console.error('Supabase query error (all RSVPs):', err);
      return [];
    }
  } else {
    return getLocalData<EventRSVP[]>('sb_supabase_event_rsvps', []);
  }
};

export const submitSupabaseRSVP = async (rsvp: EventRSVP): Promise<EventRSVP> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('event_rsvps')
      .insert({
        id: rsvp.id,
        event_id: rsvp.event_id,
        name: rsvp.name,
        email: rsvp.email,
        submitted_at: rsvp.submitted_at || new Date().toISOString()
      });
    if (error) {
      console.error('Failed to insert RSVP to real Supabase database:', error);
      throw error;
    }
    return rsvp;
  } else {
    const list = getLocalData<EventRSVP[]>('sb_supabase_event_rsvps', []);
    list.push(rsvp);
    setLocalData('sb_supabase_event_rsvps', list);
    return rsvp;
  }
};

// 4.8 Project Applications Operations
export const getSupabaseApplications = async (): Promise<ProjectApplication[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('project_applications')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        project_id: d.project_id,
        name: d.name,
        email: d.email,
        statement: d.statement,
        submitted_at: d.submitted_at || new Date().toISOString()
      }));
    } catch (err) {
      console.error('Supabase query error (all Applications):', err);
      return [];
    }
  } else {
    return getLocalData<ProjectApplication[]>('sb_supabase_project_applications', []);
  }
};

export const submitSupabaseApplication = async (app: ProjectApplication): Promise<ProjectApplication> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('project_applications')
      .insert({
        id: app.id,
        project_id: app.project_id,
        name: app.name,
        email: app.email,
        statement: app.statement,
        submitted_at: app.submitted_at || new Date().toISOString()
      });
    if (error) {
      console.error('Failed to insert Project Application to real Supabase database:', error);
      throw error;
    }
    return app;
  } else {
    const list = getLocalData<ProjectApplication[]>('sb_supabase_project_applications', []);
    list.push(app);
    setLocalData('sb_supabase_project_applications', list);
    return app;
  }
};

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error('Error querying admins table:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }
  return false;
};

// 4.8 Newsletter Subscription
export const submitSupabaseNewsletterSignup = async (email: string): Promise<NewsletterSubscriber> => {
  const subscriber: NewsletterSubscriber = {
    id: 'news_' + Math.random().toString(36).substr(2, 9),
    email,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        id: subscriber.id,
        email: subscriber.email,
        created_at: subscriber.createdAt
      });

    if (error) {
      console.error('Failed to insert newsletter subscriber to real Supabase database:', error);
      throw error;
    }
    return subscriber;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<NewsletterSubscriber[]>('sb_supabase_newsletter_subscribers', []);
    list.push(subscriber);
    setLocalData('sb_supabase_newsletter_subscribers', list);
    return subscriber;
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

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Create is_admin() helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$;

-- 3. Create Projects Table
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

-- 4. Create Events Table
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

-- 5. Create Users Table (Now completely safe and public - email, phone, birthday relocated)
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Rotarian', 'Club Officer', 'Guest', 'President')),
  attendancerate INTEGER,
  contributiongoals INTEGER,
  contributedamount INTEGER,
  committee TEXT,
  tasks TEXT[],
  classification TEXT,
  ispaulharrisfellow BOOLEAN DEFAULT false,
  paulharrislevel TEXT,
  joineddate TEXT,
  avatarurl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 6. Create Member Contact Info Table (Relocated sensitive data)
CREATE TABLE IF NOT EXISTS member_contact_info (
  uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  birthday TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 7. Create Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Membership Inquiry', 'Donation Inquiry', 'General Contact')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 8. Create Event RSVPs Table (Relocated guest mutations)
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 9. Create Project Applications Table (Relocated volunteer mutations)
CREATE TABLE IF NOT EXISTS project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 10. Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'admins' Table
-- No public SELECT policy exists on 'admins', making it completely private.
-- Only the SECURITY DEFINER is_admin() function can query it, and admins can manage it.
CREATE POLICY "Allow admin read and write on admins" ON admins
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 2. Policies for 'projects' Table
DROP POLICY IF EXISTS "Allow anyone to read projects" ON projects;
DROP POLICY IF EXISTS "Allow admin full access to projects" ON projects;

CREATE POLICY "Allow anyone to read projects" ON projects 
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to projects" ON projects 
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3. Policies for 'events' Table
DROP POLICY IF EXISTS "Allow anyone to read events" ON events;
DROP POLICY IF EXISTS "Allow admin full access to events" ON events;

CREATE POLICY "Allow anyone to read events" ON events 
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to events" ON events 
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 4. Policies for 'users' Table
DROP POLICY IF EXISTS "Allow anyone to select on users" ON users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON users;

CREATE POLICY "Allow anyone to select on users" ON users 
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to users" ON users 
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Reset users permissions (removing custom CLS revokes, since users table has no sensitive columns)
REVOKE ALL PRIVILEGES ON users FROM public, anon, authenticated;
GRANT SELECT ON users TO public, anon, authenticated;

-- 5. Policies for 'member_contact_info' Table (Strictly Admin-only)
CREATE POLICY "Allow admin select on member_contact_info" ON member_contact_info
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Allow admin write on member_contact_info" ON member_contact_info
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 6. Policies for 'inquiries' Table
DROP POLICY IF EXISTS "Allow anyone to insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON inquiries;

CREATE POLICY "Allow anyone to insert inquiries" ON inquiries 
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to inquiries" ON inquiries 
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 7. Policies for 'event_rsvps' Table
CREATE POLICY "Allow public insert to event_rsvps" ON event_rsvps
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to event_rsvps" ON event_rsvps
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 8. Policies for 'project_applications' Table
CREATE POLICY "Allow public insert to project_applications" ON project_applications
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to project_applications" ON project_applications
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 9. Policies for 'newsletter_subscribers' Table
CREATE POLICY "Allow anyone to insert newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ==========================================
-- SEED INITIAL ADMIN USER
-- ==========================================
-- Insert the admin account 'bigsyl19@gmail.com' dynamically into the admins table
-- (Will work automatically once the user signs up/in via Supabase Auth)
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'bigsyl19@gmail.com'
ON CONFLICT DO NOTHING;

-- Enable Realtime for automatic updates
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table event_rsvps;
alter publication supabase_realtime add table project_applications;
`;

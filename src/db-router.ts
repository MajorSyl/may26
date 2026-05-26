import { Project, ClubEvent, UserProfile, ContactInquiry } from './types';
import { 
  getProjects as getFirebaseProjects, 
  saveProject as saveFirebaseProject,
  getEvents as getFirebaseEvents,
  saveEvent as saveFirebaseEvent,
  submitInquiry as submitFirebaseInquiry,
  updateUserProfile as updateFirebaseProfile
} from './firebase-service';
import { 
  getSupabaseProjects, 
  saveSupabaseProject, 
  getSupabaseEvents, 
  saveSupabaseEvent, 
  submitSupabaseInquiry, 
  upsertSupabaseUser,
  isSupabaseConfigured
} from './supabase-service';
import { isFirebaseSimulated } from './firebase-service';

export type DbDriver = 'firebase' | 'supabase';

// Get and set active client configurations
export const getActiveDbDriver = (): DbDriver => {
  const stored = localStorage.getItem('rcfs_active_db_driver');
  if (stored === 'supabase' || stored === 'firebase') {
    return stored;
  }
  // Default to Supabase if config exists, otherwise Firebase
  return isSupabaseConfigured ? 'supabase' : 'firebase';
};

export const setActiveDbDriver = (driver: DbDriver) => {
  localStorage.setItem('rcfs_active_db_driver', driver);
  // Fire dispatch event to propagate state
  window.dispatchEvent(new Event('db-driver-changed'));
};

// -------------------------------------------------------------
// UNIFIED ARCHITECTURAL WRAPPERS
// -------------------------------------------------------------

export const getDbProjects = async (): Promise<Project[]> => {
  const driver = getActiveDbDriver();
  if (driver === 'supabase') {
    console.log('Routing Projects query via Supabase');
    return getSupabaseProjects();
  } else {
    console.log('Routing Projects query via Firebase');
    return getFirebaseProjects();
  }
};

export const saveDbProject = async (project: Project): Promise<Project> => {
  const driver = getActiveDbDriver();
  if (driver === 'supabase') {
    console.log('Routing project insert via Supabase');
    return saveSupabaseProject(project);
  } else {
    console.log('Routing project insert via Firebase');
    return saveFirebaseProject(project);
  }
};

export const getDbEvents = async (): Promise<ClubEvent[]> => {
  const driver = getActiveDbDriver();
  if (driver === 'supabase') {
    console.log('Routing Events query via Supabase');
    return getSupabaseEvents();
  } else {
    console.log('Routing Events query via Firebase');
    return getFirebaseEvents();
  }
};

export const saveDbEvent = async (event: ClubEvent): Promise<ClubEvent> => {
  const driver = getActiveDbDriver();
  if (driver === 'supabase') {
    console.log('Routing event schedule via Supabase');
    return saveSupabaseEvent(event);
  } else {
    console.log('Routing event schedule via Firebase');
    return saveFirebaseEvent(event);
  }
};

export const submitDbInquiry = async (inquiry: ContactInquiry): Promise<ContactInquiry> => {
  const driver = getActiveDbDriver();
  if (driver === 'supabase') {
    return submitSupabaseInquiry(inquiry);
  } else {
    return submitFirebaseInquiry(inquiry);
  }
};

export const updateDbProfile = async (profile: UserProfile): Promise<UserProfile> => {
  const driver = getActiveDbDriver();
  if (driver === 'supabase') {
    console.log('Synchronizing user profile to Supabase');
    return upsertSupabaseUser(profile);
  } else {
    console.log('Synchronizing user profile to Firebase');
    return updateFirebaseProfile(profile);
  }
};

export const isDriverSimulated = (driver: DbDriver): boolean => {
  if (driver === 'supabase') {
    return !isSupabaseConfigured;
  }
  return isFirebaseSimulated;
};

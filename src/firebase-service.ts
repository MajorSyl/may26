import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  User as FirebaseUser, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  addDoc, 
  getDocFromServer,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { UserProfile, Project, ClubEvent, ContactInquiry } from './types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from './data';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

// Check if we are running in a real or simulated Firebase environment
const IS_MOCK_CONFIG = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('mock-api-key-placeholder');

let app: FirebaseApp | null = null;
let rawAuth: Auth | null = null;
let rawDb: Firestore | null = null;

if (!IS_MOCK_CONFIG) {
  try {
    app = initializeApp(firebaseConfig);
    rawDb = getFirestore(app);
    rawAuth = getAuth(app);
    
    // Validate connection offline guard as required in the SKILL.md
    const testConnection = async () => {
      try {
        if (rawDb) {
          await getDocFromServer(doc(rawDb, 'test', 'connection'));
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration or internet connection.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Failed to initialize Firebase SDK. Operating in simulation mode instead.", err);
  }
}

// Error handler specified by the SKILL.md
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentFirebaseUser = rawAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentFirebaseUser?.uid,
      email: currentFirebaseUser?.email,
      emailVerified: currentFirebaseUser?.emailVerified,
      isAnonymous: currentFirebaseUser?.isAnonymous,
      tenantId: currentFirebaseUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Simulation Local Storage Key-Value engine
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

// Simulated State structure
interface SimulatedAuthUser {
  uid: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
}

// -------------------------------------------------------------
// EXPORTED SERVICES
// -------------------------------------------------------------
export const isFirebaseSimulated = IS_MOCK_CONFIG;

// Reactive auth subscriber
export const subscribeToAuth = (
  onStateChange: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void
) => {
  if (!IS_MOCK_CONFIG && rawAuth && rawDb) {
    return onAuthStateChanged(rawAuth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        const userRef = doc(rawDb!, 'users', fbUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            onStateChange(docSnap.data() as UserProfile);
          } else {
            // Document does not exist, create profile in database
            const profile: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Rotary Member',
              email: fbUser.email || '',
              role: 'Rotarian',
              attendanceRate: 92, // default mock attendance target
              contributionGoals: 500,
              contributedAmount: 150,
              committee: 'Service Projects Committee',
              tasks: ['Identify Tombo maintenance issues', 'Promote clean water awareness']
            };
            await setDoc(userRef, profile);
            onStateChange(profile);
          }
        } catch (err) {
          console.error("Error retrieving user profile, falling back", err);
          // Standard mock fallback if security rules bloque profiles
          onStateChange({
            uid: fbUser.uid,
            name: fbUser.displayName || 'Rotary Member',
            email: fbUser.email || '',
            role: 'Rotarian',
            attendanceRate: 92,
            contributionGoals: 500,
            contributedAmount: 150,
          });
        }
      } else {
        onStateChange(null);
      }
      setLoading(false);
    });
  } else {
    // Simulated auth changed
    setLoading(true);
    const activeSession = getLocalData<SimulatedAuthUser | null>('rcfs_auth_session', null);
    if (activeSession) {
      // Get associated user profile
      const profiles = getLocalData<UserProfile[]>('rcfs_user_profiles', INITIAL_MEMBER_DIRECTORY);
      let profile = profiles.find(p => p.uid === activeSession.uid);
      if (!profile) {
        profile = {
          uid: activeSession.uid,
          name: activeSession.displayName,
          email: activeSession.email,
          role: activeSession.email.includes('president') ? 'President' : activeSession.email.includes('officer') ? 'Club Officer' : 'Rotarian',
          attendanceRate: 94,
          contributionGoals: 1000,
          contributedAmount: 850,
          committee: 'Vocational Service Committee',
          tasks: ['Prepare Literacy First Waterloo presentation', 'Organize next coffee hour']
        };
        profiles.push(profile);
        setLocalData('rcfs_user_profiles', profiles);
      }
      onStateChange(profile);
    } else {
      onStateChange(null);
    }
    setLoading(false);
    // Return dummy unsubscribable
    return () => {};
  }
};

// Sign in with Google Popup (for Firebase) / Custom Login (for Simulator)
export const logInUser = async (emailText?: string, nameText?: string): Promise<UserProfile> => {
  if (!IS_MOCK_CONFIG && rawAuth && rawDb) {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(rawAuth, provider);
      const fbUser = result.user;
      const userRef = doc(rawDb, 'users', fbUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        const profile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Rotary Member',
          email: fbUser.email || '',
          role: 'Rotarian',
          attendanceRate: 92,
          contributionGoals: 500,
          contributedAmount: 150,
          committee: 'Youth Service Committee',
          tasks: ['Mentor Rotaract leaders']
        };
        await setDoc(userRef, profile);
        return profile;
      }
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  } else {
    // Simulated sign-in
    const email = emailText || 'member@freetownsunset.org';
    const name = nameText || 'Freetown Rotarian';
    const fakeUid = 'sim_' + Math.random().toString(36).substr(2, 9);
    
    const activeSession: SimulatedAuthUser = {
      uid: fakeUid,
      displayName: name,
      email,
      emailVerified: true
    };
    setLocalData('rcfs_auth_session', activeSession);

    const profiles = getLocalData<UserProfile[]>('rcfs_user_profiles', INITIAL_MEMBER_DIRECTORY);
    let profile = profiles.find(p => p.email === email);
    if (!profile) {
      profile = {
        uid: fakeUid,
        name,
        email,
        role: email.includes('president') ? 'President' : email.includes('officer') ? 'Club Officer' : 'Rotarian',
        attendanceRate: 94,
        contributionGoals: 1000,
        contributedAmount: 850,
        committee: 'Community Service Committee',
        tasks: ['Coordinate Water for Tombo filter distribution', 'Check Lumley coastal cleanup inventory']
      };
      profiles.push(profile);
      setLocalData('rcfs_user_profiles', profiles);
    }
    return profile;
  }
};

// Sign Out Routine
export const logOutUser = async () => {
  if (!IS_MOCK_CONFIG && rawAuth) {
    await signOut(rawAuth);
  } else {
    localStorage.removeItem('rcfs_auth_session');
  }
};

// Fetch Projects
export const getProjects = async (): Promise<Project[]> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    const colRef = collection(rawDb, 'projects');
    try {
      const snapshot = await getDocs(colRef);
      const list: Project[] = [];
      snapshot.forEach(doc => {
        list.push({ ...doc.data() as Project, id: doc.id });
      });
      if (list.length === 0) {
        // Bootstrap in cloud if empty (using direct setDocs to avoid issues)
        for (const p of INITIAL_PROJECTS) {
          await setDoc(doc(rawDb, 'projects', p.id), p);
          list.push(p);
        }
      }
      return list;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, 'projects');
    }
  } else {
    return getLocalData<Project[]>('rcfs_projects', INITIAL_PROJECTS);
  }
};

// Add/Update project
export const saveProject = async (project: Project): Promise<Project> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    try {
      await setDoc(doc(rawDb, 'projects', project.id), project);
      return project;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, `projects/${project.id}`);
    }
  } else {
    const list = getLocalData<Project[]>('rcfs_projects', INITIAL_PROJECTS);
    const existingIdx = list.findIndex(p => p.id === project.id);
    if (existingIdx > -1) {
      list[existingIdx] = project;
    } else {
      list.push(project);
    }
    setLocalData('rcfs_projects', list);
    return project;
  }
};

// Fetch Events
export const getEvents = async (): Promise<ClubEvent[]> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    const colRef = collection(rawDb, 'events');
    try {
      const snapshot = await getDocs(colRef);
      const list: ClubEvent[] = [];
      snapshot.forEach(doc => {
        list.push({ ...doc.data() as ClubEvent, id: doc.id });
      });
      if (list.length === 0) {
        for (const ev of INITIAL_EVENTS) {
          await setDoc(doc(rawDb, 'events', ev.id), ev);
          list.push(ev);
        }
      }
      return list;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, 'events');
    }
  } else {
    return getLocalData<ClubEvent[]>('rcfs_events', INITIAL_EVENTS);
  }
};

// Add/Update Event
export const saveEvent = async (event: ClubEvent): Promise<ClubEvent> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    try {
      await setDoc(doc(rawDb, 'events', event.id), event);
      return event;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, `events/${event.id}`);
    }
  } else {
    const list = getLocalData<ClubEvent[]>('rcfs_events', INITIAL_EVENTS);
    const existingIdx = list.findIndex(e => e.id === event.id);
    if (existingIdx > -1) {
      list[existingIdx] = event;
    } else {
      list.push(event);
    }
    setLocalData('rcfs_events', list);
    return event;
  }
};

// Submit Support or Membership Inquiry
export const submitInquiry = async (inquiry: ContactInquiry): Promise<ContactInquiry> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    try {
      const colRef = collection(rawDb, 'inquiries');
      await setDoc(doc(colRef, inquiry.id), inquiry);
      return inquiry;
    } catch (err) {
      return handleFirestoreError(err, OperationType.CREATE, `inquiries/${inquiry.id}`);
    }
  } else {
    const list = getLocalData<ContactInquiry[]>('rcfs_inquiries', []);
    list.push(inquiry);
    setLocalData('rcfs_inquiries', list);
    return inquiry;
  }
};

// Fetch All User Profiles (Authorized Only)
export const getFirebaseUsers = async (): Promise<UserProfile[]> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    try {
      const colRef = collection(rawDb, 'users');
      const snapshot = await getDocs(colRef);
      const profiles: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        profiles.push(docSnap.data() as UserProfile);
      });
      return profiles;
    } catch (err) {
      console.error("Firebase error listing users:", err);
      return [];
    }
  } else {
    return getLocalData<UserProfile[]>('rcfs_user_profiles', INITIAL_MEMBER_DIRECTORY);
  }
};

// Update User Profile
export const updateUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
  if (!IS_MOCK_CONFIG && rawDb) {
    try {
      await setDoc(doc(rawDb, 'users', profile.uid), profile);
      return profile;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
    }
  } else {
    const list = getLocalData<UserProfile[]>('rcfs_user_profiles', INITIAL_MEMBER_DIRECTORY);
    const existingIdx = list.findIndex(p => p.uid === profile.uid);
    if (existingIdx > -1) {
      list[existingIdx] = profile;
    } else {
      list.push(profile);
    }
    setLocalData('rcfs_user_profiles', list);

    // Also sync the current simulated session with updated name
    const activeSession = getLocalData<SimulatedAuthUser | null>('rcfs_auth_session', null);
    if (activeSession && activeSession.uid === profile.uid) {
      activeSession.displayName = profile.name;
      setLocalData('rcfs_auth_session', activeSession);
    }
    
    return profile;
  }
};

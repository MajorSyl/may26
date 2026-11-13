import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingModal from './src/components/OnboardingModal';
import UpdateAvailableBanner from './src/components/UpdateAvailableBanner';
import { RootStackParamList } from './src/navigation/types';
import { CLUB_NAME } from './src/theme';
import './global.css';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Web has no URL-based routing config, so Google's full-page OAuth redirect
// back to the site root would otherwise strand a signed-in user on the Home
// tab instead of back on Member Dashboard where the "member or guest"
// choose-kind step lives (email/password sign-in never leaves this screen,
// so it doesn't need this). Supabase leaves the session tokens in the URL
// hash on that landing load -- use that as the signal to route back.
function useRestoreMemberAccountAfterGoogleRedirect() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!window.location.hash.includes('access_token')) return;
    const tryNavigate = () => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('MemberAccount');
      } else {
        setTimeout(tryNavigate, 50);
      }
    };
    tryNavigate();
  }, []);
}

// Each public page has its own address, and the browser's address bar
// always shows the page being viewed. Opening an address directly (a typed
// link, the newsletter's QR code, an email) lands on that page.
// Admin sign-in is not linked anywhere on the public site; it opens only
// from its private path. Access is still enforced by Supabase auth plus the
// admins table, not by the path.
const ADMIN_PATH = '/rcfs-backend';

type StartPoint = { tab: string; routes: { name: string }[] } | { root: string };

const PAGES: Record<string, StartPoint> = {
  '/about': { tab: 'HomeTab', routes: [{ name: 'Home' }, { name: 'About' }] },
  '/projects': { tab: 'ProjectsTab', routes: [{ name: 'Gallery' }] },
  '/events': { tab: 'EventsTab', routes: [{ name: 'Events' }] },
  '/members': { tab: 'MembersTab', routes: [{ name: 'MembersDirectory' }] },
  '/newsletter': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'Newsletter' }] },
  '/support': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'Support' }] },
  '/contact': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'Contact' }] },
  '/gallery': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'ClubGallery' }] },
  '/get-involved': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'GetInvolved' }] },
  '/what-is-rotary': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'WhatIsRotary' }] },
  '/privacy': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'PrivacyPolicy' }] },
  '/social': { tab: 'MoreTab', routes: [{ name: 'More' }, { name: 'SocialFeed' }] },
  '/member': { root: 'MemberAccount' },
  [ADMIN_PATH]: { root: 'AdminLogin' }
};

// Screen name -> the address shown while it is open. Admin screens all show
// the private admin path; a project story shows /projects.
const SCREEN_PATHS: Record<string, string> = {
  Home: '/',
  More: '/',
  ProjectDetails: '/projects',
  MemberCheckIn: '/member'
};
for (const [path, start] of Object.entries(PAGES)) {
  const name = 'root' in start ? start.root : start.routes[start.routes.length - 1].name;
  SCREEN_PATHS[name] = path;
}
const pathForScreen = (name?: string) => (!name ? '/' : SCREEN_PATHS[name] ?? (name.startsWith('Admin') ? ADMIN_PATH : '/'));

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
const startPoint = isWeb ? PAGES[window.location.pathname.replace(/\/+$/, '').toLowerCase()] : undefined;

const initialNavState = !startPoint
  ? undefined
  : 'root' in startPoint
    ? { index: 1, routes: [{ name: 'Tabs' }, { name: startPoint.root }] }
    : {
        routes: [
          {
            name: 'Tabs',
            state: { routes: [{ name: startPoint.tab, state: { index: startPoint.routes.length - 1, routes: startPoint.routes } }] }
          }
        ]
      };

// replaceState (not pushState): the app's own Back buttons handle in-app
// history, so the address bar is only kept truthful, never stacked. Skipped
// while Supabase is reading OAuth tokens from the URL hash.
function syncAddressBar() {
  if (!isWeb || /access_token|error_description/.test(window.location.hash)) return;
  const path = pathForScreen(navigationRef.getCurrentRoute()?.name);
  if (window.location.pathname !== path || window.location.search) window.history.replaceState(window.history.state, '', path);
}

export default function App() {
  useRestoreMemberAccountAfterGoogleRedirect();
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer
        ref={navigationRef}
        initialState={initialNavState as any}
        onReady={syncAddressBar}
        onStateChange={syncAddressBar}
        documentTitle={{
          formatter: (options, route) => {
            const title = options?.title ?? route?.name;
            return !title || title === CLUB_NAME ? CLUB_NAME : `${title} · ${CLUB_NAME}`;
          }
        }}
      >
        <RootNavigator />
      </NavigationContainer>
      {Platform.OS !== 'web' && <OnboardingModal />}
      <UpdateAvailableBanner />
    </SafeAreaProvider>
  );
}

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

// Admin sign-in is not linked anywhere on the public site; it opens only
// from this private path, straight onto the sign-in screen (Back returns to
// the homepage). Access is still enforced by Supabase auth plus the admins
// table, not by this path.
const ADMIN_PATH = '/rcfs-backend';

const opensAdminLogin =
  Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === ADMIN_PATH;

const adminLoginInitialState = opensAdminLogin
  ? { index: 1, routes: [{ name: 'Tabs' as const }, { name: 'AdminLogin' as const }] }
  : undefined;

export default function App() {
  useRestoreMemberAccountAfterGoogleRedirect();
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer
        ref={navigationRef}
        initialState={adminLoginInitialState}
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

import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import SiteHeader from './SiteHeader';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

// Web gets the shared public SiteHeader (logo + nav links) instead of the
// plain native-stack title bar -- native keeps that title bar as-is, a
// standard mobile-app pattern that was never part of the "sidebar on
// desktop" problem this replaces.
export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'web'
          ? { header: () => <SiteHeader /> }
          : { headerTintColor: colors.rotaryAzure, headerTitleStyle: { fontWeight: '700' } }
      }
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RCFS' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Us' }} />
    </Stack.Navigator>
  );
}

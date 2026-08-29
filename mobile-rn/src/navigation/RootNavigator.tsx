import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import MemberLoginScreen from '../screens/MemberLoginScreen';
import MemberHomeScreen from '../screens/MemberHomeScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root stack: hosts the public bottom-tab experience plus the two auth
// flows and their post-login placeholder screens as sibling routes, so
// login can be presented as a modal over whichever tab the user is on.
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Group screenOptions={{ presentation: 'modal', headerShown: true, headerTintColor: colors.rotaryAzure }}>
        <Stack.Screen name="MemberLogin" component={MemberLoginScreen} options={{ title: 'Member Sign In' }} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Sign In' }} />
      </Stack.Group>
      <Stack.Screen name="MemberHome" component={MemberHomeScreen} options={{ headerShown: true, title: 'Member Portal' }} />
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: true, title: 'Admin' }} />
    </Stack.Navigator>
  );
}

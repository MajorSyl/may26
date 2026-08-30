import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import MemberLoginScreen from '../screens/MemberLoginScreen';
import MemberHomeScreen from '../screens/MemberHomeScreen';
import MemberProfileScreen from '../screens/MemberProfileScreen';
import MemberSubmissionsScreen from '../screens/MemberSubmissionsScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminProjectsScreen from '../screens/AdminProjectsScreen';
import AdminEventsScreen from '../screens/AdminEventsScreen';
import AdminMembersScreen from '../screens/AdminMembersScreen';
import AdminInquiriesScreen from '../screens/AdminInquiriesScreen';
import AdminApprovalsScreen from '../screens/AdminApprovalsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminRolesScreen from '../screens/AdminRolesScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root stack: hosts the public bottom-tab experience plus the two auth
// flows and their post-login screens as sibling routes, so login can be
// presented as a modal over whichever tab the user is on.
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: colors.rotaryDark },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' }
        }}
      >
        <Stack.Screen name="MemberLogin" component={MemberLoginScreen} options={{ title: 'Member Sign In' }} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Sign In' }} />
      </Stack.Group>
      <Stack.Group screenOptions={{ headerShown: true, headerTintColor: colors.rotaryAzure }}>
        <Stack.Screen name="MemberHome" component={MemberHomeScreen} options={{ title: 'Member Portal' }} />
        <Stack.Screen name="MemberProfile" component={MemberProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="MemberSubmissions" component={MemberSubmissionsScreen} options={{ title: 'My Submissions' }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
        <Stack.Screen name="AdminProjects" component={AdminProjectsScreen} options={{ title: 'Projects' }} />
        <Stack.Screen name="AdminEvents" component={AdminEventsScreen} options={{ title: 'Events' }} />
        <Stack.Screen name="AdminMembers" component={AdminMembersScreen} options={{ title: 'Members' }} />
        <Stack.Screen name="AdminInquiries" component={AdminInquiriesScreen} options={{ title: 'Inquiries' }} />
        <Stack.Screen name="AdminApprovals" component={AdminApprovalsScreen} options={{ title: 'Approvals' }} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="AdminRoles" component={AdminRolesScreen} options={{ title: 'Roles' }} />
        <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} options={{ title: 'Analytics' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

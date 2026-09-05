import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import MemberAccountScreen from '../screens/MemberAccountScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminProjectsScreen from '../screens/AdminProjectsScreen';
import AdminEventsScreen from '../screens/AdminEventsScreen';
import AdminEventAttendeesScreen from '../screens/AdminEventAttendeesScreen';
import AdminEventCheckInScreen from '../screens/AdminEventCheckInScreen';
import AdminRoleRequestsScreen from '../screens/AdminRoleRequestsScreen';
import MemberCheckInScreen from '../screens/MemberCheckInScreen';
import AdminMembersScreen from '../screens/AdminMembersScreen';
import AdminInquiriesScreen from '../screens/AdminInquiriesScreen';
import AdminApprovalsScreen from '../screens/AdminApprovalsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminRolesScreen from '../screens/AdminRolesScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
import AdminPendingMembersScreen from '../screens/AdminPendingMembersScreen';
import AdminContentBlocksScreen from '../screens/AdminContentBlocksScreen';
import AdminGalleryScreen from '../screens/AdminGalleryScreen';
import AdminVisitorLogScreen from '../screens/AdminVisitorLogScreen';
import AdminSocialFeedScreen from '../screens/AdminSocialFeedScreen';
import AdminNewsletterScreen from '../screens/AdminNewsletterScreen';
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
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Sign In' }} />
      </Stack.Group>
      <Stack.Group screenOptions={{ headerShown: true, headerTintColor: colors.rotaryAzure }}>
        <Stack.Screen name="MemberAccount" component={MemberAccountScreen} options={{ title: 'Member Dashboard' }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
        <Stack.Screen name="AdminProjects" component={AdminProjectsScreen} options={{ title: 'Projects' }} />
        <Stack.Screen name="AdminEvents" component={AdminEventsScreen} options={{ title: 'Events' }} />
        <Stack.Screen name="AdminEventAttendees" component={AdminEventAttendeesScreen} options={{ title: 'Attendees' }} />
        <Stack.Screen name="AdminEventCheckIn" component={AdminEventCheckInScreen} options={{ title: 'Check-In Code' }} />
        <Stack.Screen name="AdminRoleRequests" component={AdminRoleRequestsScreen} options={{ title: 'Access Requests' }} />
        <Stack.Screen name="MemberCheckIn" component={MemberCheckInScreen} options={{ title: 'Check In' }} />
        <Stack.Screen name="AdminMembers" component={AdminMembersScreen} options={{ title: 'Members' }} />
        <Stack.Screen name="AdminInquiries" component={AdminInquiriesScreen} options={{ title: 'Inquiries' }} />
        <Stack.Screen name="AdminApprovals" component={AdminApprovalsScreen} options={{ title: 'Approvals' }} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="AdminRoles" component={AdminRolesScreen} options={{ title: 'Roles' }} />
        <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} options={{ title: 'Analytics' }} />
        <Stack.Screen name="AdminPendingMembers" component={AdminPendingMembersScreen} options={{ title: 'Pending Members' }} />
        <Stack.Screen name="AdminContentBlocks" component={AdminContentBlocksScreen} options={{ title: 'Page Content' }} />
        <Stack.Screen name="AdminGallery" component={AdminGalleryScreen} options={{ title: 'Gallery' }} />
        <Stack.Screen name="AdminVisitorLog" component={AdminVisitorLogScreen} options={{ title: 'Visitor Log' }} />
        <Stack.Screen name="AdminSocialFeed" component={AdminSocialFeedScreen} options={{ title: 'Social Feed' }} />
        <Stack.Screen name="AdminNewsletter" component={AdminNewsletterScreen} options={{ title: 'Newsletter' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

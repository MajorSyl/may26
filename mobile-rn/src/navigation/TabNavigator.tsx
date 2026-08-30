import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FolderKanban, Calendar, Users, MoreHorizontal } from 'lucide-react-native';
import { TabParamList } from './types';
import HomeStackNavigator from './HomeStackNavigator';
import ProjectsStackNavigator from './ProjectsStackNavigator';
import EventsStackNavigator from './EventsStackNavigator';
import MembersStackNavigator from './MembersStackNavigator';
import MoreStackNavigator from './MoreStackNavigator';
import ResponsiveTabBar from './ResponsiveTabBar';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

// Mobile: unchanged bottom tabs. Tablet/desktop: a persistent left side
// rail (icon-only on tablet, icon+label on desktop) -- see
// ResponsiveTabBar.tsx. Scene content gets left padding matching the
// rail's width so it sits beside the rail rather than underneath it.
export default function TabNavigator() {
  const breakpoint = useBreakpoint();
  const isWide = breakpoint !== 'mobile';
  const sidebarWidth = breakpoint === 'desktop' ? 220 : 84;

  return (
    <Tab.Navigator
      tabBar={(props) => <ResponsiveTabBar {...props} breakpoint={breakpoint} sidebarWidth={sidebarWidth} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rotaryAzure,
        tabBarInactiveTintColor: colors.slate400,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        sceneStyle: isWide ? { paddingLeft: sidebarWidth } : undefined
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{ title: 'Projects', tabBarIcon: ({ color, size }) => <FolderKanban color={color} size={size} /> }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStackNavigator}
        options={{ title: 'Events', tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MembersTab"
        component={MembersStackNavigator}
        options={{ title: 'Members', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{ title: 'More', tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectsStackParamList } from './types';
import GalleryScreen from '../screens/GalleryScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

export default function ProjectsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.rotaryAzure, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: 'Service Gallery' }} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ title: 'Project Details' }} />
    </Stack.Navigator>
  );
}

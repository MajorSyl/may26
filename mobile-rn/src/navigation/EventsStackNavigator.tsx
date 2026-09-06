import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from './types';
import EventsScreen from '../screens/EventsScreen';
import SiteHeader from './SiteHeader';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'web'
          ? { header: () => <SiteHeader /> }
          : { headerTintColor: colors.rotaryAzure, headerTitleStyle: { fontWeight: '700' } }
      }
    >
      <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'Meetings & Events' }} />
    </Stack.Navigator>
  );
}

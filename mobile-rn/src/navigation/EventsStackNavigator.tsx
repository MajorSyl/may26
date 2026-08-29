import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from './types';
import EventsScreen from '../screens/EventsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.rotaryAzure, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'Meetings & Events' }} />
    </Stack.Navigator>
  );
}

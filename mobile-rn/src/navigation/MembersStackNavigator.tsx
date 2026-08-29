import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MembersStackParamList } from './types';
import MembersDirectoryScreen from '../screens/MembersDirectoryScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<MembersStackParamList>();

export default function MembersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.rotaryAzure, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="MembersDirectory" component={MembersDirectoryScreen} options={{ title: 'Members Directory' }} />
    </Stack.Navigator>
  );
}

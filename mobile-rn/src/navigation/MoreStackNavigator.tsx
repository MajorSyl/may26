import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreStackParamList } from './types';
import MoreScreen from '../screens/MoreScreen';
import ClubGalleryScreen from '../screens/ClubGalleryScreen';
import GetInvolvedScreen from '../screens/GetInvolvedScreen';
import ContactScreen from '../screens/ContactScreen';
import WhatIsRotaryScreen from '../screens/WhatIsRotaryScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.rotaryAzure, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="More" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="ClubGallery" component={ClubGalleryScreen} options={{ title: 'Club Gallery' }} />
      <Stack.Screen name="GetInvolved" component={GetInvolvedScreen} options={{ title: 'Get Involved' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact' }} />
      <Stack.Screen name="WhatIsRotary" component={WhatIsRotaryScreen} options={{ title: 'What is Rotary' }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
    </Stack.Navigator>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../navigation/types';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { SitePage, Section, TextLink } from '../components/site';
import SupportClub from '../components/SupportClub';
import { logPageView } from '../lib/analytics';

type Props = NativeStackScreenProps<MoreStackParamList, 'Support'>;

// rcfsunset.org/support: the page the printed newsletter's QR code opens.
export default function SupportScreen({ navigation }: Props) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    logPageView('support');
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <SitePage>
      <Section tone="cream">
        <View className="rcfs-rise">
          <SupportClub contactEmail={settings.contactEmail} />
        </View>
      </Section>
      <Section tight>
        <View className="gap-2 md:flex-row md:items-center md:justify-between">
          <View className="gap-1 md:flex-1">
            <Text className="font-display text-xl font-bold text-rotary-royal-deep">Haven't read it yet?</Text>
            <Text className="text-base leading-7 text-slate-600">Read or download the latest edition of Sunset Impact, our club newsletter.</Text>
          </View>
          <TextLink label="Read the newsletter" onPress={() => navigation.navigate('Newsletter')} />
        </View>
      </Section>
    </SitePage>
  );
}

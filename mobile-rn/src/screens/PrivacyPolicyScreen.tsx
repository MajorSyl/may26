import React, { useEffect, useState } from 'react';
import LegalDocument from '../components/LegalDocument';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { PRIVACY_INTRO, PRIVACY_LAST_UPDATED, privacySections } from '../content/privacyPolicy';
import { logPageView } from '../lib/analytics';

export default function PrivacyPolicyScreen() {
  const [email, setEmail] = useState(DEFAULT_SITE_SETTINGS.contactEmail);

  useEffect(() => {
    logPageView('privacy_policy');
    getSiteSettings().then((s) => s.contactEmail && setEmail(s.contactEmail));
  }, []);

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      updated={PRIVACY_LAST_UPDATED}
      intro={PRIVACY_INTRO}
      sections={privacySections(email)}
      contactEmail={email}
    />
  );
}

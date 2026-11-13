import React, { useEffect, useState } from 'react';
import LegalDocument from '../components/LegalDocument';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/service';
import { TERMS_INTRO, TERMS_LAST_UPDATED, termsSections } from '../content/termsOfUse';
import { logPageView } from '../lib/analytics';

export default function TermsScreen() {
  const [email, setEmail] = useState(DEFAULT_SITE_SETTINGS.contactEmail);

  useEffect(() => {
    logPageView('terms');
    getSiteSettings().then((s) => s.contactEmail && setEmail(s.contactEmail));
  }, []);

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Use"
      updated={TERMS_LAST_UPDATED}
      intro={TERMS_INTRO}
      sections={termsSections(email)}
      contactEmail={email}
    />
  );
}

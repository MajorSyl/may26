import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeStorage } from './lib/safe-storage';

export type Language = 'en' | 'krio';

export const translations = {
  en: {
    // Navigation / Tabs
    home: 'Home',
    about: 'About Us',
    members: 'Members Directory',
    clubGallery: 'Club Gallery',
    impact: 'Our Impact',
    getInvolved: 'Get Involved',
    events: 'Meetings & Events',
    contact: 'Contact',
    portal: 'Portal',
    logout: 'Log Out',
    
    // Header & Brand
    rotary: 'Rotary',
    clubName: 'Club of Freetown-Sunset',
    serviceAboveSelf: 'Service Above Self',
    rightsReserved: 'Rotary Club of Freetown-Sunset. All Rights Reserved.',
    
    // Home/General UI
    attendNextMeeting: 'Attend Next Meeting',
    partnerSponsor: 'Partner or Sponsor',
    helpCenter: 'Help Center',
    faqTitle: 'Frequently Asked Questions',
    getInTouch: 'Get In Touch',
    contactUs: 'Contact Us',
    messageBoard: 'Message Board',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    writeMessage: 'Write message...',
    transmitInquiry: 'Transmit Inquiry',
    sending: 'Sending...',
    successLog: '✔ Written to logs!',
    meetingLocation: 'Sunset Meeting Location',
    lagoondaHotel: 'Lagoonda Hotel',
    lagoondaAddress: 'Cape Road, Aberdeen, Freetown',
    sunsetMember: 'Active Sunset Member',
    district: 'District',
    direct: 'Direct',
    audited: 'Audited',
    volunteers: '100% Volunteers',
    grassroots: 'Grassroots',
    
    // About Section
    whoWeAre: 'Who We Are',
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    
    // Member Details / Directory
    rosterClassification: 'Roster Classification',
    activeCommittee: 'Active Committee',
    joinedSunset: 'Joined Sunset',
    pastPresident: 'Past President',
    distinguishedYear: 'Distinguished Year'
  },
  krio: {
    // Navigation / Tabs
    home: 'Om',
    about: 'Bɔt Wi',
    members: 'Di Mɛmba Dɛn',
    clubGallery: 'Wi Pikchɔ Dɛn',
    impact: 'Wi Wɔk Dɛn',
    getInvolved: 'Kam Join Wi',
    events: 'Miting & Program dɛn',
    contact: 'Tɔk to Wi',
    portal: 'Pot_al',
    logout: 'Kɔmɔt na di Portal',
    
    // Header & Brand
    rotary: 'Rotari',
    clubName: 'Klɔb fɔ Fritɔŋ-Sunset',
    serviceAboveSelf: 'Savis Pas Sɛf',
    rightsReserved: 'Rotari Klɔb fɔ Fritɔŋ-Sunset. Ɔl di rayts fɔ dɛn tin dɛn dey shur.',
    
    // Home/General UI
    attendNextMeeting: 'Kam wi nɛks miting',
    partnerSponsor: 'Kam Join fɔ Giv Sɔpɔt',
    helpCenter: 'Ɛlp Sɛnta',
    faqTitle: 'Kwɛstyɔn dɛn we pipul de aks bɔku tɛm',
    getInTouch: 'Tɔk to Wi',
    contactUs: 'Kɔntakt Wi',
    messageBoard: 'Mɛsech Bɔd',
    fullName: 'Yɔ Ful Nem',
    emailAddress: 'Imel Adrɛs',
    writeMessage: 'Rayt yu mɛsech na ya...',
    transmitInquiry: 'Sɛnd di Mɛsech',
    sending: 'De sɛnd...',
    successLog: '✔ Wi dɔn rayt am na logs!',
    meetingLocation: 'Ples we Sunset de Ol Miting',
    lagoondaHotel: 'Lagoonda Otɛl',
    lagoondaAddress: 'Kep Rod, Abadin, Fritɔŋ',
    sunsetMember: 'Mɛmba we de wok tranga wan',
    district: 'Distrikt',
    direct: 'Pratikal',
    audited: 'Audit Klia',
    volunteers: '100% Volɔntiɔ fɔ fribent',
    grassroots: 'Grassrut dɛn',
    
    // About Section
    whoWeAre: 'Uba Wi Bi',
    ourMission: 'Wetin Wi Set fɔ Du',
    ourVision: 'Wi Drim fɔ di Tumara',
    
    // Member Details / Directory
    rosterClassification: 'Rɔstɔ Klasifikeshɔn',
    activeCommittee: 'Aktiv Kɔmiti',
    joinedSunset: 'Join Sunset',
    pastPresident: 'Pas Prɛsidɛnt',
    distinguishedYear: 'Spɛshal Mɛmba Yia'
  }
};

type KeyOfTranslations = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: KeyOfTranslations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeStorage.getItem('app_language');
    return (saved === 'en' || saved === 'krio') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeStorage.setItem('app_language', lang);
  };

  const t = (key: KeyOfTranslations): string => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

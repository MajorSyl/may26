import { Project } from '../types';

export type HomeStackParamList = {
  Home: undefined;
  About: undefined;
};

export type ProjectsStackParamList = {
  Gallery: undefined;
  ProjectDetails: { project: Project };
};

export type EventsStackParamList = {
  Events: undefined;
};

export type MembersStackParamList = {
  MembersDirectory: undefined;
};

export type MoreStackParamList = {
  More: undefined;
  ClubGallery: undefined;
  GetInvolved: undefined;
  Contact: undefined;
  WhatIsRotary: undefined;
  PrivacyPolicy: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ProjectsTab: undefined;
  EventsTab: undefined;
  MembersTab: undefined;
  MoreTab: undefined;
};

// Root-level stack: hosts the tab navigator plus the two auth flows and
// their post-login placeholder screens, so login can be pushed as a modal
// on top of the tabs regardless of which tab/stack the user is in.
export type RootStackParamList = {
  Tabs: undefined;
  MemberLogin: undefined;
  MemberHome: undefined;
  AdminLogin: undefined;
  AdminHome: undefined;
};

import { LegalSection } from '../components/LegalDocument';

// Keep this in step with what the site actually does. Anything that changes
// how personal data is collected, stored or shared must be reflected here,
// and LAST_UPDATED moved forward.
export const PRIVACY_LAST_UPDATED = '13 November 2026';

export const PRIVACY_INTRO =
  'The Rotary Club of Freetown-Sunset respects your privacy. This policy explains what personal information we collect through rcfsunset.org and our mobile app, why we collect it, who we share it with, how long we keep it and the choices you have.';

export const privacySections = (email: string): LegalSection[] => [
  {
    id: 'who-we-are',
    title: 'Who we are',
    blocks: [
      {
        p: 'The Rotary Club of Freetown-Sunset ("the Club", "we", "us") is a Rotary club based in Freetown, Sierra Leone, and part of Rotary District 9101. The Club operates this website and app and is responsible for the personal information described in this policy.'
      },
      { p: `You can contact us about anything in this policy at ${email}.` }
    ]
  },
  {
    id: 'what-we-collect',
    title: 'Information we collect',
    blocks: [
      { p: 'We only collect information you choose to give us, or that is needed to run the website securely:' },
      {
        list: [
          ['Enquiries', 'your name, email address, subject and message when you use the contact or Get Involved forms.'],
          ['Event RSVPs and project applications', 'your name, email address and anything you write in your application.'],
          ['Newsletter subscription', 'your email address.'],
          [
            'Support receipts (optional)',
            'if you choose to send us confirmation of a contribution: your name, phone number or email address, the amount, a short note and the receipt image or PDF you upload.'
          ],
          [
            'Member accounts',
            'your email address and the profile details you add (name, photo, bio and phone number). If you sign in with Google, Google shares your name, email address and profile picture with us. Passwords are handled by our sign-in provider and are never visible to the Club.'
          ],
          [
            'Club membership records',
            'kept by Club officers to administer membership: name, club position, committee, classification, Rotary ID, attendance, contribution records and Paul Harris recognitions.'
          ],
          [
            'Meeting check-in',
            "when you check in to a meeting with the app, your device's location at that moment, used only to confirm you are at the venue. Location is not collected at any other time."
          ],
          ['Submissions', 'projects and photos you submit for publication, with their descriptions.'],
          [
            'Website usage',
            'the pages you visit, a random visitor identifier stored in your browser, your device type and browser details, and your approximate city and country, which are looked up from your IP address at the time of the visit. We do not store your IP address.'
          ]
        ]
      }
    ]
  },
  {
    id: 'how-we-use',
    title: 'How we use your information',
    blocks: [
      {
        list: [
          'To reply to your enquiries and manage RSVPs and applications.',
          'To send the newsletter you asked for, and Club announcements to members.',
          'To confirm, record and acknowledge contributions.',
          'To administer Club membership, record attendance and recognise service.',
          'To publish projects, photos and news that have been approved for publication.',
          'To understand, in aggregate, how the website is used so we can improve it.',
          'To keep the website, member accounts and Club records secure.'
        ]
      },
      { p: 'We do not sell or rent your personal information, and we do not use it for advertising. The website has no advertising trackers.' }
    ]
  },
  {
    id: 'what-is-public',
    title: 'What is shown publicly',
    blocks: [
      {
        list: [
          "The public member directory includes each member's name, role and committee, and, for the Board of Directors and Committee Chairs, their club position and photo.",
          'Project stories, gallery photos, newsletters and approved submissions are public.'
        ]
      },
      {
        p: 'Everything else, including contact details, contribution and attendance records, receipts and enquiries, is visible only to authorised Club officers. Members who sign in can see their own record.'
      }
    ]
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    blocks: [
      { p: 'We use trusted service providers to run the website. They process information only on our behalf and under their own security and privacy commitments:' },
      {
        list: [
          ['Hosting and database providers', 'securely host the website, its database, member sign-in and file storage.'],
          ['Network and domain services', 'deliver the website and manage its domain name.'],
          ['Google', 'sign-in, only if you choose "Sign in with Google".'],
          ['Location lookup service', 'converts the IP address of a visit into an approximate city and country.'],
          ['Email delivery provider', 'sends newsletters and announcements to subscribers and members, when email sending is enabled.'],
          [
            'Payment providers',
            'contributions made through a mobile money or card payment service are processed by that provider under its own terms. The Club never sees your PIN or full card details.'
          ],
          [
            'Embedded content',
            'when you view embedded Instagram or Facebook posts, YouTube videos or Google Drive files, those companies may collect information and set cookies under their own privacy policies.'
          ]
        ]
      },
      {
        p: 'We may also share membership information with Rotary International or Rotary District 9101 where needed for Rotary membership administration, and we will disclose information if required by law.'
      },
      {
        p: 'Some of these providers store data outside Sierra Leone, for example in the European Union or the United States. We choose established providers that protect data with encryption and access controls.'
      },
      { p: `If you would like details of the providers we use, write to ${email}.` }
    ]
  },
  {
    id: 'cookies',
    title: 'Cookies and browser storage',
    blocks: [
      { p: 'We do not use advertising cookies. The website stores a small amount of information in your browser so it can work properly:' },
      {
        list: [
          'Your sign-in session, if you have a member account.',
          'A random visitor identifier for anonymous usage statistics.',
          'A note that you have already seen the welcome message.',
          'Cached copies of website files, so pages load faster and work with a weak connection.'
        ]
      },
      { p: "You can clear this information at any time in your browser's settings. Embedded social media and video content may set its own cookies." }
    ]
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    blocks: [
      {
        list: [
          ['Enquiries, RSVPs and applications', 'for as long as needed to deal with them. We review and delete old records at least once a year.'],
          ['Newsletter subscriptions', 'until you unsubscribe.'],
          ['Support receipts and contribution records', "for as long as needed for the Club's financial records."],
          ['Member accounts and membership records', 'while you are a member, and afterwards only as needed for Club records.'],
          ['Meeting check-in location', 'stored with the attendance record it confirms.'],
          ['Website usage records', 'for as long as they are useful for understanding how the site is used.']
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'How we protect it',
    blocks: [
      {
        p: 'All connections to the website are encrypted (HTTPS). Database access rules limit each person to the information they are allowed to see; receipts are kept in private storage; and administrative access is restricted to authorised Club officers. We review the website’s security regularly.'
      },
      { p: 'No system can be guaranteed completely secure. If a breach affecting your information occurs, we will act promptly to contain it and inform you where appropriate.' }
    ]
  },
  {
    id: 'your-rights',
    title: 'Your rights and choices',
    blocks: [
      { p: 'You can ask us at any time to:' },
      {
        list: [
          'tell you what personal information we hold about you and give you a copy;',
          'correct information that is wrong or incomplete;',
          'delete your information or your member account;',
          'stop sending you the newsletter (every email includes a way to unsubscribe);',
          'stop using your information for a particular purpose, or withdraw consent you have given.'
        ]
      },
      {
        p: `Write to ${email}. We will reply within 30 days and may need to confirm your identity first. If you ask us to delete a member account, your basic entry in the Club roster (name and position) may remain, because Club membership is administered separately; tell us if you would like that removed too.`
      },
      { p: 'If you live in the European Union or the United Kingdom, you also have the right to complain to your local data protection authority.' }
    ]
  },
  {
    id: 'children',
    title: 'Children',
    blocks: [
      {
        p: 'The website is intended for adults, and we do not knowingly collect personal information from children. Our project stories may include photos taken at community events, such as school programmes. If you would like a photo of yourself or your child removed, please contact us and we will remove it.'
      }
    ]
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    blocks: [{ p: 'We may update this policy from time to time. The date at the top shows when it was last changed. Significant changes will be highlighted on the website.' }]
  },
  {
    id: 'contact',
    title: 'Contact us',
    blocks: [{ p: `For questions or requests about your personal information, write to the Rotary Club of Freetown-Sunset at ${email}.` }]
  }
];

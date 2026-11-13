import { LegalSection } from '../components/LegalDocument';

export const TERMS_LAST_UPDATED = '13 November 2026';

export const TERMS_INTRO =
  'These terms explain the rules for using rcfsunset.org and the Rotary Club of Freetown-Sunset app. By using the website or app, you agree to them. Please read them together with our Privacy Policy.';

export const termsSections = (email: string): LegalSection[] => [
  {
    id: 'about',
    title: 'About these terms',
    blocks: [
      {
        p: 'The website and app are operated by the Rotary Club of Freetown-Sunset ("the Club", "we", "us"), a Rotary club in Freetown, Sierra Leone, part of Rotary District 9101. They are not operated by Rotary International.'
      },
      { p: 'If you do not agree with these terms, please do not use the website or app.' }
    ]
  },
  {
    id: 'using-the-site',
    title: 'Using the website',
    blocks: [
      { p: 'You may use the website to learn about the Club, its projects and members, to contact us, and to take part in Club activities. When using it, you must not:' },
      {
        list: [
          'break any law, or use the website for fraud, harassment or to harm others;',
          'try to gain access to accounts, administrative areas, data or systems you are not authorised to use;',
          'interfere with or disrupt the website, or upload viruses or other harmful code;',
          'collect member names, photos or contact details for marketing, spam or any purpose unrelated to the Club;',
          'pretend to be another person or organisation, or give false information in forms, applications or receipts;',
          'copy or reuse members’ personal information or photos without permission.'
        ]
      },
      { p: `If you believe you have found a security weakness, please report it privately to ${email} rather than testing it further.` }
    ]
  },
  {
    id: 'accounts',
    title: 'Member and officer accounts',
    blocks: [
      {
        list: [
          'Give accurate information when you create an account, and keep it up to date.',
          'Keep your sign-in details secure and do not share your account. Each account is for one person.',
          'Tell us straight away if you think someone else has used your account.',
          'Membership requests are reviewed by Club officers. The Club may approve, suspend or remove an account, particularly if these terms are broken or membership ends.',
          'Administrative access is only for officers authorised by the Club, and only for Club business.'
        ]
      }
    ]
  },
  {
    id: 'your-content',
    title: 'Content you send us',
    blocks: [
      { p: 'When you submit text, photos, project stories, receipts or other material, you confirm that:' },
      {
        list: [
          'you created it or have the right to share it;',
          'people who can be identified in photos have agreed to them being shared, and a parent or guardian has agreed for any child shown;',
          'it is accurate and not offensive, defamatory or unlawful.'
        ]
      },
      {
        p: "You keep ownership of what you submit. You give the Club a free, non-exclusive permission to publish material you submitted for publication (such as projects and photos) on the Club's website, newsletter and social media, for Club purposes. We may edit, decline or remove any submission. Receipts and contact details are never published."
      }
    ]
  },
  {
    id: 'contributions',
    title: 'Contributions and support',
    blocks: [
      {
        list: [
          'Contributions to the Club, including support for the newsletter through Orange Money, are voluntary.',
          'Before confirming any payment, check that the name shown is the Rotary Club of Freetown Sunset. The Club is not responsible for payments sent to the wrong number or merchant code.',
          'Orange Money payments are processed by Orange under its own terms. Uploading a receipt is optional and only helps us confirm and acknowledge your contribution.',
          `Contributions are not normally refundable. If you made a mistake, such as paying the wrong amount, contact ${email} within 14 days and we will look into it.`,
          'Membership dues are separate from voluntary contributions and are communicated to members directly.'
        ]
      }
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    blocks: [
      {
        p: 'The text, photos, newsletter and design of the website belong to the Club or are used with permission. "Rotary", the Rotary wheel emblem and related marks are trademarks of Rotary International and are used by the Club in accordance with Rotary International’s guidelines.'
      },
      {
        p: "You may share links to our pages, and share the Sunset Impact newsletter in full and unchanged. You may quote short extracts for non-commercial purposes if you credit the Club. Any other use, especially of members' photos and personal information, needs our written permission."
      }
    ]
  },
  {
    id: 'third-parties',
    title: 'Links and embedded content',
    blocks: [
      {
        p: 'The website links to, and embeds content from, other services such as Instagram, Facebook, YouTube, Google and Orange. We are not responsible for those services, their content or their privacy practices, and your use of them is governed by their own terms.'
      }
    ]
  },
  {
    id: 'accuracy',
    title: 'Accuracy and availability',
    blocks: [
      {
        p: 'We publish information in good faith and try to keep it accurate and up to date, but meeting times, venues, project details and other information can change. The website is provided "as is", and we do not guarantee that it will always be available, uninterrupted or free from errors.'
      }
    ]
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    blocks: [
      {
        p: 'To the extent allowed by law, the Club and its officers, members and volunteers are not liable for any indirect or consequential loss arising from use of the website or app, or from relying on its content. Nothing in these terms limits any liability that cannot be limited by law.'
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy',
    blocks: [{ p: 'How we collect and use personal information is explained in our Privacy Policy, which forms part of these terms.' }]
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    blocks: [{ p: 'We may update these terms from time to time. The date at the top shows when they were last changed. By continuing to use the website after a change, you accept the updated terms.' }]
  },
  {
    id: 'law',
    title: 'Governing law',
    blocks: [{ p: 'These terms are governed by the laws of Sierra Leone, and any dispute will be dealt with by the courts of Sierra Leone.' }]
  },
  {
    id: 'contact',
    title: 'Contact us',
    blocks: [{ p: `If you have questions about these terms, write to the Rotary Club of Freetown-Sunset at ${email}.` }]
  }
];

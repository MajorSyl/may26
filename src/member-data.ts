import { UserProfile } from './types';

import abdulPhoto from './assets/images/member_abdul_manafe_1783806739015.jpg';
import millicentPhoto from './assets/images/member_millicent_cole_1783806748849.jpg';
import victorPhoto from './assets/images/member_victor_williams_1783806759314.jpg';
import musaPhoto from './assets/images/member_musa_komeh_1783806767366.jpg';
import josephinePhoto from './assets/images/member_josephine_kosia_1783806778446.jpg';
import saioPhoto from './assets/images/member_saio_yanka_1783806789121.jpg';
import ericPhoto from './assets/images/member_eric_mutulya_1783806797638.jpg';
import yasminePhoto from './assets/images/member_yasmine_ibrahim_1783806809698.jpg';
import georgePhoto from './assets/images/member_george_marke_1783806818919.jpg';
import alisonPhoto from './assets/images/member_alison_french_1783806826773.jpg';
import agathaPhoto from './assets/images/member_agatha_vandy_1783806836273.jpg';
import melphinaPhoto from './assets/images/member_melphina_betts_1783806846432.jpg';
import jestinaPhoto from './assets/images/member_jestina_betts_1783806855527.jpg';
import lyndonPhoto from './assets/images/member_lyndon_johnson_1783806863939.jpg';

export const FULL_MEMBER_LIST: UserProfile[] = [
  {
    uid: 'mem_1',
    name: 'Abdul Manaff Kemokai',
    email: 'manafikemokai@yahoo.co.uk',
    phone: '+232 76 240 610',
    role: 'President',
    classification: 'Child Rights',
    joinedDate: '2021-08-15',
    birthday: '13th December',
    attendanceRate: 98,
    contributionGoals: 2000,
    contributedAmount: 2000,
    committee: 'Executive Board',
    isPaulHarrisFellow: true,
    paulHarrisLevel: 'PHF+3',
    tasks: ['Chair weekly board synergy meetings', 'Coordinate clean water well expansion'],
    title: 'President',
    avatarUrl: abdulPhoto
  },
  {
    uid: 'mem_2',
    name: 'Adonis Abboud',
    email: 'dony_sl@yahoo.com',
    phone: '+232 77 603 176',
    role: 'Club Officer',
    classification: 'External Telecommunications',
    joinedDate: '2022-03-10',
    birthday: '5th March',
    attendanceRate: 95,
    contributionGoals: 1500,
    contributedAmount: 1200,
    committee: 'Executive Board',
    isPaulHarrisFellow: true,
    paulHarrisLevel: 'PHF+1',
    tasks: ['Manage international telecommunication relations', 'Oversee Bintumani Charity auction list']
  },
  {
    uid: 'mem_3',
    name: 'Kwaku Ampadu Afouni',
    email: 'kayampadu01@gmail.com',
    phone: '+232 79 196 784',
    role: 'Club Officer',
    classification: 'Sales&Marketing',
    joinedDate: '2024-07-01',
    birthday: '29th May',
    attendanceRate: 91,
    contributionGoals: 1000,
    contributedAmount: 800,
    committee: 'Membership Committee',
    isPaulHarrisFellow: true,
    paulHarrisLevel: 'PHF',
    tasks: ['Organize weekly beachside fellowship hours', 'Run guest orientations for prospective leaders']
  },
  {
    uid: 'mem_4',
    name: 'Agatha Seriki Vandy',
    email: 'serikiyandie@gmail.com',
    phone: '+232 76 603 449',
    role: 'Club Officer',
    classification: 'Education',
    joinedDate: '2024-07-01',
    birthday: '18th May',
    attendanceRate: 94,
    contributionGoals: 1000,
    contributedAmount: 1000,
    committee: 'Club Administration Committee',
    isPaulHarrisFellow: true,
    paulHarrisLevel: 'PHF',
    tasks: ['Supervise secondary literacy library programs', 'Manage school leading scores audit'],
    title: 'Club Administration Chair',
    avatarUrl: agathaPhoto
  },
  {
    uid: 'mem_5',
    name: 'Agnes Ann Wairimu',
    email: 'agnesmugi@gmail.com',
    phone: '+232 78 050 586',
    role: 'Club Officer',
    classification: 'HRM&Strategic Management',
    joinedDate: '2024-07-01',
    birthday: '29th June',
    attendanceRate: 92,
    contributionGoals: 1000,
    contributedAmount: 900,
    committee: 'HR & Personnel Committee',
    isPaulHarrisFellow: false,
    tasks: ['Support vocational training coordinator sessions', 'Coordinate annual committee resources']
  },
  {
    uid: 'mem_6',
    name: 'Ahmad Wurie',
    email: 'ahmad.wurie@shiac.ltd; ahmadm823042@gmail.com',
    phone: '+232 76 269 477',
    role: 'Rotarian',
    classification: 'Civil Engineering',
    joinedDate: '2024-07-01',
    birthday: '30th May'
  },
  {
    uid: 'mem_7',
    name: 'Aina Moore',
    email: 'jogol@yahoo.com',
    phone: '+232 88 141 340',
    role: 'Rotarian',
    classification: 'Commercial Banking & Management',
    joinedDate: '2024-07-01',
    birthday: '28th June'
  },
  {
    uid: 'mem_8',
    name: 'Ajara Marie Bomah',
    email: 'ajarabomah@gmail.com',
    phone: '+232 79 555 485',
    role: 'Rotarian',
    classification: 'Social Entrepreneur',
    joinedDate: '2024-07-01',
    birthday: '20th January'
  },
  {
    uid: 'mem_9',
    name: 'Alex Pratt',
    email: 'chriex501@yahoo.com',
    phone: '+232 76 765 540',
    role: 'Rotarian',
    classification: 'Accounting & Finance',
    joinedDate: '2024-07-01',
    birthday: '15th May'
  },
  {
    uid: 'mem_10',
    name: 'Alex NalloJnr',
    email: 'alexnallojr@yahoo.com',
    phone: '+232 79 940 303',
    role: 'Rotarian',
    classification: 'Enterprenuership',
    joinedDate: '2024-07-01',
    birthday: '22nd October'
  },
  {
    uid: 'mem_11',
    name: 'Alison French',
    email: 'alison_french001@yahoo.com',
    phone: '+232 76 244 112',
    role: 'Club Officer',
    classification: 'Communications',
    joinedDate: '2024-07-01',
    birthday: '21st May',
    committee: 'New Generation Committee',
    title: 'New Generation Chair',
    avatarUrl: alisonPhoto
  },
  {
    uid: 'mem_12',
    name: 'Amara Oluwole',
    email: 'amaraoluwole@gmail.com',
    phone: '+232 76 330 548',
    role: 'Rotarian',
    classification: 'Edupreneur',
    joinedDate: '2024-07-01',
    birthday: '17th February'
  },
  {
    uid: 'mem_13',
    name: 'Arnold Dixon',
    email: 'dixonarnold494@gmail.com',
    phone: '+232 77 260 697',
    role: 'Rotarian',
    classification: 'Banking',
    joinedDate: '2024-07-01',
    birthday: '18th September'
  },
  {
    uid: 'mem_14',
    name: 'Arthur Johnson',
    email: 'rotaractfreetown@gmail.com',
    phone: '+232 76 715 589',
    role: 'Rotarian',
    classification: 'Consultancy',
    joinedDate: '2024-07-01',
    birthday: '6th November'
  },
  {
    uid: 'mem_15',
    name: 'Avril Beduni Renner',
    email: 'sirenner@yahoo.com',
    phone: '+232 76 611 471',
    role: 'Rotarian',
    classification: 'Accounting & Auditing',
    joinedDate: '2024-07-01',
    birthday: '27th April'
  },
  {
    uid: 'mem_16',
    name: 'Balfour Nketiah-Sarpong',
    email: 'b.nsarpong@glicgroup.net',
    phone: '+232 78 024 384',
    role: 'Rotarian',
    classification: 'Chartered Insurance (Insurance Broker)',
    joinedDate: '2024-07-01',
    birthday: '15th June'
  },
  {
    uid: 'mem_17',
    name: 'Bridget Mogobo',
    email: 'bridget.mogobo@gmail.com',
    phone: '+232 70 059 534',
    role: 'Rotarian',
    classification: 'Information Technology',
    joinedDate: '2024-07-01',
    birthday: '17th October'
  },
  {
    uid: 'mem_18',
    name: 'Cecil Olo-Williams',
    email: 'ceciloluj@gmail.com',
    phone: '+232 76 602 305',
    role: 'Rotarian',
    classification: 'Engineer/Systems Administrator',
    joinedDate: '2024-07-01',
    birthday: '26th December'
  },
  {
    uid: 'mem_19',
    name: 'Cecilia B. Browne',
    email: 'cbrownesannah04@gmail.com',
    phone: '+232 76 369 616',
    role: 'Rotarian',
    classification: 'Education',
    joinedDate: '2024-07-01',
    birthday: '14th September'
  },
  {
    uid: 'mem_20',
    name: 'Crispin M. Kaikai',
    email: 'fatheryomkitch@icloud.com',
    phone: '+232 76 706 006',
    role: 'Rotarian',
    classification: 'Clergy',
    joinedDate: '2024-07-01',
    birthday: '17th November'
  },
  {
    uid: 'mem_21',
    name: 'Davidson Peters-John',
    email: 'dlept@yahoo.com',
    phone: '+232 80 248 543',
    role: 'Rotarian',
    classification: 'Finance Consultancy',
    joinedDate: '2024-07-01',
    birthday: '8th July'
  },
  {
    uid: 'mem_22',
    name: 'Emerlin George',
    email: 'dututojigeorge@gmail.com',
    phone: '+232 76 202 927',
    role: 'Rotarian',
    classification: 'Governance& Administration',
    joinedDate: '2024-07-01',
    birthday: '17th July'
  },
  {
    uid: 'mem_23',
    name: 'Esther Johnson',
    email: 'ejohnson@fsb.gov.sl',
    phone: '+232 76 600 591',
    role: 'Rotarian',
    classification: 'Banking',
    joinedDate: '2024-07-01',
    birthday: '1st October'
  },
  {
    uid: 'mem_24',
    name: 'Lyndon Baines-Johnson',
    email: 'evlynbaine@yahoo.com',
    phone: '+232 78 222 303',
    role: 'Club Officer',
    classification: 'Environmental Management',
    joinedDate: '2024-07-01',
    birthday: '25th September',
    committee: 'Rotary Foundation Committee',
    title: 'Rotary Foundation Chair',
    avatarUrl: lyndonPhoto
  },
  {
    uid: 'mem_25',
    name: 'Emeka Okechukwu',
    email: 'emeka.okechukwu45@gmail.com',
    phone: '+232 33 401 537',
    role: 'Rotarian',
    classification: 'Pharmacist',
    joinedDate: '2024-07-01',
    birthday: '27th February'
  },
  {
    uid: 'mem_26',
    name: 'Fatmata Carew',
    email: 'fcarew1@yahoo.com',
    phone: '+232 76 245 445',
    role: 'Rotarian',
    classification: 'Tourism Management',
    joinedDate: '2024-07-01',
    birthday: '11th May'
  },
  {
    uid: 'mem_27',
    name: 'Georgette Okyne',
    email: 'georgette.george@yahoo.com',
    phone: '+232 76 391 281',
    role: 'Rotarian',
    classification: 'Civil Engineering',
    joinedDate: '2024-07-01',
    birthday: '17th April'
  },
  {
    uid: 'mem_28',
    name: 'George Marke',
    email: 'fmarke23@gmail.com',
    phone: '+232 78 537 067',
    role: 'Club Officer',
    classification: 'Accounting & Finance',
    joinedDate: '2024-07-01',
    birthday: '21st January',
    committee: 'Service Projects & Fundraising Committee',
    title: 'Service Projects & Fundraising Chair',
    avatarUrl: georgePhoto
  },
  {
    uid: 'mem_29',
    name: 'Christopher Cole',
    email: 'georgegregoryc12@gmail.com',
    phone: '+232 76 827 035',
    role: 'Rotarian',
    classification: 'Cargo Development',
    joinedDate: '2024-07-01',
    birthday: '5th March'
  },
  {
    uid: 'mem_30',
    name: 'Elijah Koroma',
    email: 'eliash_77@hotmail.com',
    phone: '+232 79 131 322',
    role: 'Rotarian',
    classification: 'Technology Management',
    joinedDate: '2024-07-01',
    birthday: '12th March'
  },
  {
    uid: 'mem_31',
    name: 'Haja Yeroh Bah',
    email: 'hajarabah257@gmail.com',
    phone: '+232 75 511 868',
    role: 'Rotarian',
    classification: 'PublicHealth',
    joinedDate: '2024-07-01',
    birthday: '25th July'
  },
  {
    uid: 'mem_32',
    name: 'Ibrahim Bangura',
    email: 'ibrahimbangura03@gmail.com',
    phone: '+232 78 566 116',
    role: 'Rotarian',
    classification: 'Law & Governance',
    joinedDate: '2024-07-01',
    birthday: '1st May'
  },
  {
    uid: 'mem_33',
    name: 'Jane Masoba',
    email: 'masoba.jane@gmail.com',
    phone: '+232 79 247 155',
    role: 'Rotarian',
    classification: 'Human Resources & Administration',
    joinedDate: '2024-07-01',
    birthday: '20th March'
  },
  {
    uid: 'mem_34',
    name: 'Jestina Betts',
    email: 'jestina.betts@orange-sonatel.com',
    phone: '+232 76 450 191',
    role: 'Club Officer',
    classification: 'Human Resource Management',
    joinedDate: '2024-07-01',
    birthday: '6th November',
    committee: 'Diaspora Committee',
    title: 'Diaspora Chair',
    avatarUrl: jestinaPhoto
  },
  {
    uid: 'mem_35',
    name: 'Josephine Kosia',
    email: 'koniaj@gmail.com',
    phone: '+232 79 555 485',
    role: 'Club Officer',
    classification: 'Administeration',
    joinedDate: '2024-07-01',
    birthday: '20th March',
    committee: 'Executive Board',
    title: 'Secretary',
    avatarUrl: josephinePhoto
  },
  {
    uid: 'mem_36',
    name: 'Lauratu Johnson',
    email: 'ljohn@hotmail.com',
    phone: '+232 76 610 707',
    role: 'Rotarian',
    classification: 'Accounting',
    joinedDate: '2024-07-01',
    birthday: '17th August'
  },
  {
    uid: 'mem_37',
    name: 'Lawrence Sesay',
    email: 'sesayl@gmail.com',
    phone: '+232 76 800 005',
    role: 'Rotarian',
    classification: 'Information Technology & Systems',
    joinedDate: '2024-07-01',
    birthday: '30th April'
  },
  {
    uid: 'mem_38',
    name: 'Leslie Gordon-Browne',
    email: 'lesgordonbrowne@gmail.com',
    phone: '+232 76 827 035',
    role: 'Rotarian',
    classification: 'BusinessDevelopment',
    joinedDate: '2024-07-01',
    birthday: '24th December'
  },
  {
    uid: 'mem_39',
    name: 'Madinatu Senesie-Kamara',
    email: 'Madinatus02@gmail.com',
    phone: '+44 785 331 3995',
    role: 'Rotarian',
    classification: 'International Civil Service',
    joinedDate: '2024-07-01',
    birthday: '14th July'
  },
  {
    uid: 'mem_40',
    name: 'Eric Musyoka Mutulya',
    email: 'manja.karybo@googlemail.com',
    phone: '+232 76 981 560',
    role: 'Club Officer',
    classification: 'PublicAdministration',
    joinedDate: '2024-07-01',
    birthday: '19th November',
    committee: 'Executive Board',
    title: 'Sergeant-at-Arms',
    avatarUrl: ericPhoto
  },
  {
    uid: 'mem_41',
    name: 'Mariama Sesay',
    email: 'sesaym@gmail.com',
    phone: '+232 76 800 006',
    role: 'Rotarian',
    classification: 'Pharmaceutical Operations',
    joinedDate: '2024-07-01',
    birthday: '9th September'
  },
  {
    uid: 'mem_42',
    name: 'Mariama Ruth Jacinta Jaysid-Sankoh',
    email: 'mariamaruthjacinta@gmail.com',
    phone: 'None',
    role: 'Rotarian',
    classification: 'Law',
    joinedDate: '2024-07-01',
    birthday: '12th May'
  },
  {
    uid: 'mem_43',
    name: 'Melphina Beoku-Betts',
    email: 'meobetts@hotmail.co.uk',
    phone: '+232 78 931 771',
    role: 'Club Officer',
    classification: 'Education',
    joinedDate: '2024-07-01',
    birthday: '11th June',
    committee: 'Membership Committee',
    title: 'Membership Chair',
    avatarUrl: melphinaPhoto
  },
  {
    uid: 'mem_44',
    name: 'Miatta French',
    email: 'miattafrench@yahoo.com',
    phone: '+232 76 241 241',
    role: 'Rotarian',
    classification: 'Electoral Administration',
    joinedDate: '2024-07-01',
    birthday: '14th July'
  },
  {
    uid: 'mem_45',
    name: 'Michaela Serry',
    email: 'coascmk@yahoo.com',
    phone: '+232 79 454 575',
    role: 'Rotarian',
    classification: 'Corporate Law',
    joinedDate: '2024-07-01',
    birthday: '26th November'
  },
  {
    uid: 'mem_46',
    name: 'Millicent Cole',
    email: 'mkmacfoly@hotmail.com',
    phone: '+232 76 660 413',
    role: 'Club Officer',
    classification: 'Corporate Banking',
    joinedDate: '2024-07-01',
    birthday: '13th November',
    committee: 'Executive Board',
    title: 'Vice President',
    avatarUrl: millicentPhoto
  },
  {
    uid: 'mem_47',
    name: 'Musa Bernard Komeh',
    email: 'michealcole76@yahoo.com',
    phone: '+232 76 843 810',
    role: 'Club Officer',
    classification: 'Global Public Health',
    joinedDate: '2024-07-01',
    birthday: '15th August',
    committee: 'Executive Board',
    title: 'Immediate Past President',
    avatarUrl: musaPhoto
  },
  {
    uid: 'mem_48',
    name: 'Musa Mansaray',
    email: 'musamansaray260@yahoo.com',
    phone: '+232 75 557 673',
    role: 'Rotarian',
    classification: 'Procurement and Supply Chain Management Specialists',
    joinedDate: '2024-07-01',
    birthday: '28th November'
  },
  {
    uid: 'mem_49',
    name: 'Noel Asare-Roberts',
    email: 'asisaresolutions078@gmail.com',
    phone: '+232 76 800 078',
    role: 'Rotarian',
    classification: 'IT&Real Estate Consultancy',
    joinedDate: '2024-07-01',
    birthday: '23rd December'
  },
  {
    uid: 'mem_50',
    name: 'Pauline Wanjiru Kibe',
    email: 'paulinewanjiru3@gmail.com',
    phone: '+232 78 050 583',
    role: 'Rotarian',
    classification: 'Project management',
    joinedDate: '2024-07-01',
    birthday: '24th January'
  },
  {
    uid: 'mem_51',
    name: 'Saio Yanka',
    email: 'sojoyanku4@yahoo.com',
    phone: '+232 79 602 050',
    role: 'Club Officer',
    classification: 'Tax and Accounting',
    joinedDate: '2024-07-01',
    birthday: '26th January',
    committee: 'Executive Board',
    title: 'Treasurer',
    avatarUrl: saioPhoto
  },
  {
    uid: 'mem_52',
    name: 'Sallieu Kanu',
    email: 'sallieukanu50@yahoo.co.uk',
    phone: '+232 76 577 571',
    role: 'Rotarian',
    classification: 'BusinessDevelopment',
    joinedDate: '2024-07-01',
    birthday: '31st October'
  },
  {
    uid: 'mem_53',
    name: 'Sam Kumbo-Leigh',
    email: 'skleigh@edu-fld.org',
    phone: '+232 79 490 149',
    role: 'Rotarian',
    classification: 'BusinessManagement',
    joinedDate: '2024-07-01',
    birthday: '15th July'
  },
  {
    uid: 'mem_54',
    name: 'Stephen Kabba',
    email: 'bertie_Stephen@yahoo.com',
    phone: '+232 76 450 139',
    role: 'Rotarian',
    classification: 'Network Technology',
    joinedDate: '2024-07-01',
    birthday: '17th July'
  },
  {
    uid: 'mem_55',
    name: 'Sylvia Fusu-luki',
    email: 'sylviafusuluki@gmail.com',
    phone: '+232 78 795 704',
    role: 'Rotarian',
    classification: 'Medicine',
    joinedDate: '2024-07-01',
    birthday: '18th May'
  },
  {
    uid: 'mem_56',
    name: 'UlaomaFestus Omo-Obi',
    email: 'ulaoma125@yahoo.com',
    phone: '+232 79 584 233',
    role: 'Rotarian',
    classification: 'Health Systems & Development Management',
    joinedDate: '2024-07-01',
    birthday: '4th April'
  },
  {
    uid: 'mem_57',
    name: 'Victor Williams',
    email: 'vwilliams979@gmail.com',
    phone: '+232 88 141 020',
    role: 'Club Officer',
    classification: 'Banking',
    joinedDate: '2024-07-01',
    birthday: '20th August',
    committee: 'Executive Board',
    title: 'President Elect',
    avatarUrl: victorPhoto
  },
  {
    uid: 'mem_58',
    name: 'Wilhelmina Sho-Cole',
    email: 'mshocole2002@yahoo.com',
    phone: '+232 76 969 896',
    role: 'Rotarian',
    classification: 'GovernanceProgramme',
    joinedDate: '2024-07-01',
    birthday: '9th July'
  },
  {
    uid: 'mem_59',
    name: 'Yasmine Bilkis Ibrahim',
    email: 'info@minabilikis.com',
    phone: '+232 78 280 081',
    role: 'Club Officer',
    classification: 'Content Creation',
    joinedDate: '2024-07-01',
    birthday: '11th June',
    committee: 'Public Image Committee',
    title: 'Public Image Chair',
    avatarUrl: yasminePhoto
  }
];

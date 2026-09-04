/**
 * Centralized Site Configuration & Metadata Engine
 * 
 * Provides centralized definitions for production domain, canonical URLs,
 * page titles, Open Graph tags, Twitter metadata, and Schema.org structured data.
 */

// Production domain resolution: checks VITE_SITE_URL or falls back to production default
const envSiteUrl = (
  typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: { VITE_SITE_URL?: string } })?.env?.VITE_SITE_URL
    : undefined
);

export const SITE_URL = (envSiteUrl || 'https://algolearn-circularlinkedlist.vercel.app').replace(/\/$/, '');

export const SITE_CONFIG = {
  name: 'AlgoLearn',
  title: 'AlgoLearn – Interactive Circular Linked List Learning Platform',
  description:
    'Master the Circular Linked List data structure with interactive visualizations, step-by-step pointer manipulation lessons, time complexity analysis, real-world code implementations, and gamified challenges.',
  url: SITE_URL,
  ogImage: `${SITE_URL}/algolearn-logo.png`,
  logo: `${SITE_URL}/algolearn-logo.png`,
  author: 'AlgoLearn Educational Team',
  twitterHandle: '@algolearn',
  themeColor: '#2563EB',
  locale: 'en_US',
};

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  keywords?: string[];
}

export const ROUTE_METADATA: Record<string, PageMeta> = {
  HOME: {
    title: 'AlgoLearn – Interactive Circular Linked List Learning Platform',
    description:
      'Learn Circular Linked Lists step-by-step with interactive visualizations, pointer traces, complexity derivations, and gamified problem-solving challenges.',
    canonicalPath: '/',
    ogType: 'website',
  },
  THEORY: {
    title: 'Circular Linked List Data Structure Guide & Theory | AlgoLearn',
    description:
      'Comprehensive 17-chapter curriculum covering Circular Linked List mechanics, node pointer structures, memory addresses, C/Java/Python implementations, and Big-O complexity proofs.',
    canonicalPath: '/#learn',
    ogType: 'article',
  },
  VIDEO: {
    title: 'Circular Linked List Video Tutorials & Lessons | AlgoLearn',
    description:
      'Watch curated video lessons exploring circular linked list structures, pointer traversal, and step-by-step operations.',
    canonicalPath: '/#visualize',
    ogType: 'article',
  },
  GAME: {
    title: 'Circular Linked List Interactive Quest & Challenges | AlgoLearn',
    description:
      'Test and sharpen your algorithmic intuition through 5 progressive Circular Linked List interactive pointer manipulation game levels and earn curriculum mastery.',
    canonicalPath: '/#game',
    ogType: 'website',
  },
  QUEST: {
    title: 'Circular Linked List Quest Completion & Certificate | AlgoLearn',
    description:
      'Milestone achievement and completion certification for mastering circular linked lists, pointer rewiring, and memory address operations.',
    canonicalPath: '/#game',
    ogType: 'website',
  },
  LAB: {
    title: 'Circular Linked List Interactive Lab & Sandbox Explorer | AlgoLearn',
    description:
      'Build custom circular linked lists, manually update HEAD and TAIL pointers, and step through insertion and deletion operations in an interactive workbench.',
    canonicalPath: '/#lab',
    ogType: 'website',
  },
  QUIZ: {
    title: 'Circular Linked List Knowledge Quiz & Examination | AlgoLearn',
    description:
      'Evaluate your mastery with 10 comprehensive assessment questions covering node connections, circular traversals, pointer manipulations, and time complexity.',
    canonicalPath: '/#quiz',
    ogType: 'website',
  },
  PROGRESS: {
    title: 'Learning Progress & Mastery Ledger | AlgoLearn',
    description:
      'Track your journey through the 17 Circular Linked List theory modules, 5 quest levels, interactive lab experiments, and quiz milestones.',
    canonicalPath: '/#progress',
    ogType: 'website',
  },
  NOT_FOUND: {
    title: '404 Page Not Found | AlgoLearn',
    description: 'The requested learning resource or section could not be found. Navigate back to the AlgoLearn Circular Linked List curriculum.',
    canonicalPath: '/#404',
    ogType: 'website',
  },
};

/**
 * Generates Schema.org JSON-LD structured data for the site and curriculum
 */
export function getStructuredData(tab: string = 'HOME') {
  const currentMeta = ROUTE_METADATA[tab] || ROUTE_METADATA.HOME;
  const canonicalUrl = `${SITE_URL}${currentMeta.canonicalPath}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Course',
        '@id': `${SITE_URL}/#course`,
        name: 'Mastering the Circular Linked List Data Structure',
        description:
          'A comprehensive interactive course covering circular linked list mechanics, pointer rewiring, Big-O complexity analysis, multi-language implementations, and algorithmic tradeoffs.',
        provider: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
          url: SITE_URL,
          logo: SITE_CONFIG.logo,
        },
        educationalLevel: 'Beginner to Intermediate',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'Online',
          inLanguage: 'en-US',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: currentMeta.title.split('|')[0].trim(),
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

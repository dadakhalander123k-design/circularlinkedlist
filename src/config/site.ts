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

export const SITE_URL = (envSiteUrl || 'https://algolearn-linearsearch.vercel.app').replace(/\/$/, '');

export const SITE_CONFIG = {
  name: 'AlgoLearn',
  title: 'AlgoLearn – Interactive Linear Search Learning Platform',
  description:
    'Master the Linear Search algorithm with interactive visualizations, step-by-step sequential traversal lessons, time complexity analysis, real-world code implementations, and gamified challenges.',
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
    title: 'AlgoLearn – Interactive Linear Search Learning Platform',
    description:
      'Learn Linear Search step-by-step with interactive visualizations, step traces, complexity derivations, and gamified problem-solving challenges.',
    canonicalPath: '/',
    ogType: 'website',
  },
  THEORY: {
    title: 'Linear Search Algorithm Guide & Theory | AlgoLearn',
    description:
      'Comprehensive 12-module curriculum covering Linear Search mechanics, pseudocode, time complexity O(n), memory footprints, C/C++/Java/Python implementations, and binary search comparisons.',
    canonicalPath: '/#learn',
    ogType: 'article',
  },
  VIDEO: {
    title: 'Linear Search Video Tutorials & Lessons | AlgoLearn',
    description:
      'Watch curated video lessons exploring sequential scanning, array traversal, and how Linear Search compares elements sequentially.',
    canonicalPath: '/#visualize',
    ogType: 'article',
  },
  GAME: {
    title: 'Linear Search Interactive Quest & Challenges | AlgoLearn',
    description:
      'Test and sharpen your algorithmic intuition through 5 progressive Linear Search interactive game levels and earn curriculum mastery.',
    canonicalPath: '/#game',
    ogType: 'website',
  },
  QUEST: {
    title: 'Linear Search Quest Completion & Certificate | AlgoLearn',
    description:
      'Milestone achievement and completion certification for mastering sequential search, algorithmic efficiency, and comparison counting.',
    canonicalPath: '/#game',
    ogType: 'website',
  },
  LAB: {
    title: 'Linear Search Interactive Lab & Sandbox Explorer | AlgoLearn',
    description:
      'Configure custom arrays, choose target search items, and step through the sequential scan execution pipeline in an interactive simulation workbench.',
    canonicalPath: '/#lab',
    ogType: 'website',
  },
  QUIZ: {
    title: 'Linear Search Knowledge Quiz & Examination | AlgoLearn',
    description:
      'Evaluate your mastery with 10 comprehensive assessment questions covering best/worst case complexity, code syntax, array traversal, and search decision criteria.',
    canonicalPath: '/#quiz',
    ogType: 'website',
  },
  PROGRESS: {
    title: 'Learning Progress & Mastery Ledger | AlgoLearn',
    description:
      'Track your journey through the 12 Linear Search theory modules, 5 quest levels, interactive lab experiments, and quiz milestones.',
    canonicalPath: '/#progress',
    ogType: 'website',
  },
  NOT_FOUND: {
    title: '404 Page Not Found | AlgoLearn',
    description: 'The requested learning resource or section could not be found. Navigate back to the AlgoLearn Linear Search curriculum.',
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
        name: 'Mastering the Linear Search Algorithm',
        description:
          'A comprehensive interactive course covering sequential search mechanics, Big-O complexity analysis, multi-language implementations, and algorithmic tradeoffs.',
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

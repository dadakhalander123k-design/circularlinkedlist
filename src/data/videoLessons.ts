export interface LessonItem {
  id: 'lesson-01' | 'lesson-02';
  lessonNumber: string;
  title: string;
  nowPlayingTitle: string;
  description: string;
  topics: string[];
  videoSrc: string;
  filename: string;
}

export const VIDEO_LESSONS: LessonItem[] = [
  {
    id: 'lesson-01',
    lessonNumber: 'LESSON 01',
    title: 'WHAT IS CIRCULAR LINKED LIST',
    nowPlayingTitle: 'WHAT IS CIRCULAR LINKED LIST',
    description: 'Learn the basic idea of Linear Search, how it checks elements sequentially, and when it is useful for finding a target value.',
    topics: [
      'Circular Linked List Basics',
      'Circular Structure',
      'Head and Last Node',
      'Circular Traversal',
    ],
    videoSrc: '/videos/introductiontocll.mp4',
    filename: 'introductiontocll.mp4',
  },
  {
    id: 'lesson-02',
    lessonNumber: 'LESSON 02',
    title: 'OPERATIONS OF CIRCULAR LINKED LIST',
    nowPlayingTitle: 'OPERATIONS OF CIRCULAR LINKED LIST',
    description: 'Follow the step-by-step process of Linear Search as each element is compared with the target until the value is found or the list ends.',
    topics: [
      'Insertion',
      'Deletion',
      'Searching',
      'Traversal',
    ],
    videoSrc: '/videos/operationsofcll.mp4',
    filename: 'operationsofcll.mp4',
  },
];

export type TechniqueType = 'basic' | 'chaining' | 'linear' | 'quadratic' | 'double_hashing';

export type MainViewTab = 'HOME' | 'THEORY' | 'VIDEO' | 'GAME' | 'QUEST' | 'LAB' | 'QUIZ' | 'PROGRESS';

export interface VideoChapter {
  title: string;
  timestamp: number; // in seconds
  timeDisplay: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  subtitle: string;
  category: 'FOUNDATION' | 'TECHNIQUE' | 'ANALYSIS';
  duration: string; // e.g. "05:20"
  videoSrc: string; // e.g. "/videos/introduction.mp4"
  filename: string; // e.g. "introduction.mp4"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  keyConcepts: string[];
  formula?: string;
  relatedTheoryChapterId?: string;
  relatedLevelId?: number;
  chapters: VideoChapter[];
  isLocalAvailable?: boolean;
}

export type ModuleStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  technique: TechniqueType;
  tableSize: number;
  h1Formula: string;
  h2Formula?: string;
  keysSequence: number[];
  allowManualCalculation: boolean;
  introExplanation: string;
  techniqueSummary: string;
  formulaDisplay: string;
  moduleCode: string;
}

export interface ModuleRecord {
  id: string;
  number: string;
  code: string;
  title: string;
  category: 'FOUNDATION' | 'TECHNIQUE' | 'ANALYSIS' | 'EXAMINATION' | string;
  description: string;
  status: ModuleStatus;
  progressPercent: number; // 0 to 100
  criteriaDescription: string;
  completedAt?: string;
  score?: number;
  targetTab: 'HOME' | 'THEORY' | 'QUEST' | 'LAB' | 'QUIZ' | 'PROGRESS' | 'GAME' | 'LEARN' | 'SANDBOX' | 'MASTER';
  targetLevelId?: number;
  targetChapterId?: string;
}

export interface UserProgressState {
  version: number;
  modules: Record<string, ModuleStatus>;
  moduleProgress: Record<string, number>; // 0 - 100 percentage for each
  completedTheoryChapters: string[]; // Set of completed theory chapter IDs, e.g. ['theory-01', 'theory-02']
  currentTheoryChapterId: string;
  levelCompletedKeys: Record<number, number[]>; // keys completed for each level
  levelsCompleted: number[];
  levelsMastered: number[];
  quizScores: Record<number, number>; // questionId -> chosen answer
  quizSubmitted: boolean;
  quizFinalScore: number;
  masterChallengesCompleted: string[];
  sandboxOperationsCount: number;
  totalScore: number;
  streak: number;
  currentActiveModuleId: string;
  lastActiveTimestamp: number;
  hasCelebrated100Percent?: boolean;
  completedVideos?: string[]; // e.g. ['lesson-01', 'lesson-02']
}

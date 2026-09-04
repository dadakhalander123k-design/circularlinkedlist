import { ModuleRecord, ModuleStatus, UserProgressState } from '../types/game';

const STORAGE_KEY = 'hash_quest_field_notes_progress_v2';

export const FIELD_NOTES_MODULES: Omit<ModuleRecord, 'status' | 'progressPercent'>[] = [
  {
    id: 'theory-01',
    number: '01',
    code: 'TH-01',
    title: 'Introduction to Circular Linked List',
    category: 'INTRODUCTION',
    description: 'Core Definition, Continuous Traversal & Absence of NULL in Linked Nodes.',
    criteriaDescription: 'Read the foundation theory and understand the continuous cycle structure.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-01',
  },
  {
    id: 'theory-02',
    number: '02',
    code: 'TH-02',
    title: 'What is a Circular Linked List?',
    category: 'FUNDAMENTALS',
    description: 'Node Anatomy, Data & Next Fields, and lastNode.next == head Condition.',
    criteriaDescription: 'Inspect node structure and the circular invariant connecting last node to head.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-02',
  },
  {
    id: 'theory-03',
    number: '03',
    code: 'TH-03',
    title: 'Structure of a Circular Linked List',
    category: 'STRUCTURE',
    description: 'Head & Last Node Relationships, Memory Continuity and Pointer Loops.',
    criteriaDescription: 'Understand how head points to the entry node and tail completes the circle.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-03',
  },
  {
    id: 'theory-04',
    number: '04',
    code: 'TH-04',
    title: 'Types of Circular Linked Lists',
    category: 'VARIATIONS',
    description: 'Circular Singly vs Circular Doubly Linked List Architecture.',
    criteriaDescription: 'Compare unidirectional next loops against bidirectional next/prev rings.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-04',
  },
  {
    id: 'theory-05',
    number: '05',
    code: 'TH-05',
    title: 'Circular Singly vs Circular Doubly',
    category: 'COMPARISON',
    description: 'Structural Tradeoffs, Memory Overhead and Bidirectional Traversal.',
    criteriaDescription: 'Analyze memory overhead, pointer complexity, and navigation directions.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-05',
  },
  {
    id: 'theory-06',
    number: '06',
    code: 'TH-06',
    title: 'Memory Representation of Circular Linked List',
    category: 'MEMORY',
    description: 'Non-Contiguous Heap Allocation, Random Memory Addresses & Next Pointer Addresses.',
    criteriaDescription: 'Understand explicit pointer addresses linking non-contiguous heap memory.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-06',
  },
  {
    id: 'theory-07',
    number: '07',
    code: 'TH-07',
    title: 'Pointer Operations in Circular Linked List',
    category: 'POINTERS',
    description: 'HEAD Pointer, TAIL Pointer and NEXT Pointer Invariant Management.',
    criteriaDescription: 'Master atomic pointer redirection rules during circular updates.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-07',
  },
  {
    id: 'theory-08',
    number: '08',
    code: 'TH-08',
    title: 'Insertion at the Beginning of Circular Linked List',
    category: 'OPERATIONS',
    description: 'Creating New Node, Linking to Old Head, and Updating Last Node Next.',
    criteriaDescription: 'Trace beginning insertion pointer swaps with both head and tail pointers.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-08',
  },
  {
    id: 'theory-09',
    number: '09',
    code: 'TH-09',
    title: 'Insertion at the End of Circular Linked List',
    category: 'OPERATIONS',
    description: 'Attaching Node After Tail and Connecting New Node to Head in O(1) or O(n).',
    criteriaDescription: 'Inspect end insertion mechanics and tail pointer performance optimization.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-09',
  },
  {
    id: 'theory-10',
    number: '10',
    code: 'TH-10',
    title: 'Insertion at a Specific Position',
    category: 'OPERATIONS',
    description: 'Traversing to Position p - 1, Interleaving Pointers & Splice Logic.',
    criteriaDescription: 'Trace mid-list pointer splicing while preserving circular integrity.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-10',
  },
  {
    id: 'theory-11',
    number: '11',
    code: 'TH-11',
    title: 'Deletion from the Beginning of Circular Linked List',
    category: 'OPERATIONS',
    description: 'Bypassing Head, Moving Head Forward, and Updating Last Node Next.',
    criteriaDescription: 'Trace beginning node deletion and memory cleanup.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-11',
  },
  {
    id: 'theory-12',
    number: '12',
    code: 'TH-12',
    title: 'Deletion from the End of Circular Linked List',
    category: 'OPERATIONS',
    description: 'Traversing to Second-Last Node, Pointing to Head, and Freeing Old Tail.',
    criteriaDescription: 'Evaluate O(n) traversal to find the second-last node and close the loop.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-12',
  },
  {
    id: 'theory-13',
    number: '13',
    code: 'TH-13',
    title: 'Deletion at a Specific Position',
    category: 'OPERATIONS',
    description: 'Bypassing Target Node at Position p and Reconnecting Adjacent Nodes.',
    criteriaDescription: 'Examine interior node deletion and boundary condition validation.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-13',
  },
  {
    id: 'theory-14',
    number: '14',
    code: 'TH-14',
    title: 'Advantages of Circular Linked List',
    category: 'ANALYSIS',
    description: 'Zero-NULL Safety, Continuous Traversal, Memory Reuse and O(1) Tail Operations.',
    criteriaDescription: 'Understand key engineering benefits in cyclical systems.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-14',
  },
  {
    id: 'theory-15',
    number: '15',
    code: 'TH-15',
    title: 'Disadvantages of Circular Linked List',
    category: 'ANALYSIS',
    description: 'Traversal Cautions, Infinite Loop Hazards, Complexity & Linear Search.',
    criteriaDescription: 'Learn cycle-aware termination conditions to avoid infinite loops.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-15',
  },
  {
    id: 'theory-16',
    number: '16',
    code: 'TH-16',
    title: 'Applications of Circular Linked List',
    category: 'APPLICATIONS',
    description: 'Round-Robin CPU Scheduling, Looping Playlists, Multiplayer Turns & Ring Buffers.',
    criteriaDescription: 'Review real-world production use cases in operating systems and games.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-16',
  },
  {
    id: 'theory-17',
    number: '17',
    code: 'TH-17',
    title: 'Time Complexity of Circular Linked List Operations',
    category: 'COMPLEXITY',
    description: 'Asymptotic Big-O Derivations & The Tail Pointer O(1) Optimization.',
    criteriaDescription: 'Synthesize the Big-O complexity table for all circular operations.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-17',
  },
];

const INITIAL_PROGRESS: UserProgressState = {
  version: 2,
  modules: {},
  moduleProgress: {},
  completedTheoryChapters: [],
  currentTheoryChapterId: 'theory-01',
  levelCompletedKeys: {},
  levelsCompleted: [],
  levelsMastered: [],
  quizScores: {},
  quizSubmitted: false,
  quizFinalScore: 0,
  masterChallengesCompleted: [],
  sandboxOperationsCount: 0,
  totalScore: 0,
  streak: 0,
  currentActiveModuleId: 'theory-01',
  lastActiveTimestamp: Date.now(),
  completedVideos: [],
  hasCelebrated100Percent: false,
};

// Normalized map of chapter aliases to standard IDs
export const THEORY_ID_MAP: Record<string, string> = {
  '01': 'theory-01',
  '02': 'theory-02',
  '03': 'theory-03',
  '04': 'theory-04',
  '05': 'theory-05',
  '06': 'theory-06',
  '07': 'theory-07',
  '08': 'theory-08',
  '09': 'theory-09',
  '10': 'theory-10',
  '11': 'theory-11',
  '12': 'theory-12',
  '13': 'theory-13',
  '14': 'theory-14',
  '15': 'theory-15',
  '16': 'theory-16',
  '17': 'theory-17',
};

export const normalizeTheoryChapterId = (idOrSlug: string): string => {
  if (!idOrSlug) return 'theory-01';
  const match = idOrSlug.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 17) {
      return `theory-${num < 10 ? '0' : ''}${num}`;
    }
  }
  return THEORY_ID_MAP[idOrSlug] || idOrSlug;
};

export const normalizeVideoId = (id: string): string => {
  if (!id) return '';
  if (id === 'lesson-01' || id === 'introduction' || id === 'video-1' || id === '1') return 'lesson-01';
  if (id === 'lesson-02' || id === 'operations' || id === 'video-2' || id === '2') return 'lesson-02';
  return id;
};

type ProgressListener = (state: UserProgressState) => void;

class ProgressManager {
  private state: UserProgressState;
  private listeners: Set<ProgressListener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): UserProgressState {
    if (typeof window === 'undefined') return INITIAL_PROGRESS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return INITIAL_PROGRESS;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.version === 2) {
        // Strict filtering of completedTheoryChapters to valid 17 modules
        const rawTheory = Array.isArray(parsed.completedTheoryChapters)
          ? parsed.completedTheoryChapters
          : [];
        const validTheory = Array.from(
          new Set(
            rawTheory
              .map(normalizeTheoryChapterId)
              .filter((id: string) => /^theory-(0[1-9]|1[0-7])$/.test(id))
          )
        );

        // Strict filtering of completedVideos to 2 lessons
        const rawVideos = Array.isArray(parsed.completedVideos) ? parsed.completedVideos : [];
        const validVideos = Array.from(
          new Set(
            rawVideos
              .map(normalizeVideoId)
              .filter((id: string) => id === 'lesson-01' || id === 'lesson-02')
          )
        );

        // Strict filtering of levelsCompleted to levels 1-5
        const rawLevels = Array.isArray(parsed.levelsCompleted) ? parsed.levelsCompleted : [];
        const validLevels = Array.from(
          new Set(
            rawLevels.filter(
              (lvl: unknown): lvl is number => typeof lvl === 'number' && lvl >= 1 && lvl <= 5
            )
          )
        );

        const quizSubmitted = Boolean(parsed.quizSubmitted);

        return {
          ...INITIAL_PROGRESS,
          ...parsed,
          completedTheoryChapters: validTheory,
          currentTheoryChapterId: parsed.currentTheoryChapterId
            ? normalizeTheoryChapterId(parsed.currentTheoryChapterId)
            : 'theory-01',
          completedVideos: validVideos,
          levelsCompleted: validLevels,
          quizSubmitted,
        };
      }
      return INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  }

  private saveState() {
    if (typeof localStorage === 'undefined') return;
    try {
      this.state.lastActiveTimestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch {
      // Ignore write errors
    }
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const copy = this.getState();
    this.listeners.forEach((fn) => fn(copy));
  }

  public getState(): UserProgressState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // 1. THEORY STATS (17 Modules)
  public getTheoryStats() {
    const list = Array.isArray(this.state.completedTheoryChapters)
      ? Array.from(new Set(this.state.completedTheoryChapters.map(normalizeTheoryChapterId)))
      : [];
    const validCompleted = list.filter((id) => {
      const match = id.match(/^theory-(\d+)$/);
      if (!match) return false;
      const num = parseInt(match[1], 10);
      return num >= 1 && num <= 17;
    });
    const total = 17;
    const completed = validCompleted.length;
    const rawPercent = (completed / total) * 100;
    const percentage = Number(rawPercent.toFixed(completed === 0 || completed === total ? 0 : 2));

    return {
      total,
      completed,
      percentage,
      isComplete: completed >= total,
      completedIds: [...validCompleted],
      currentChapterId: this.state.currentTheoryChapterId,
    };
  }

  // 2. VIDEO STATS (2 Video Lessons)
  public getVideoStats() {
    const rawList = Array.isArray(this.state.completedVideos) ? this.state.completedVideos : [];
    const validList = Array.from(
      new Set(
        rawList
          .map(normalizeVideoId)
          .filter((id) => id === 'lesson-01' || id === 'lesson-02')
      )
    );
    const isIntroCompleted = validList.includes('lesson-01');
    const isCollisionCompleted = validList.includes('lesson-02');
    const completed = validList.length;
    const total = 2;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
      isIntroCompleted,
      isCollisionCompleted,
      isComplete: completed >= total,
      completedVideos: [...validList],
    };
  }

  // 3. GAME STATS (5 Levels)
  public getGameStats() {
    const rawList = Array.isArray(this.state.levelsCompleted) ? this.state.levelsCompleted : [];
    const completedList = Array.from(
      new Set(rawList.filter((lvl) => typeof lvl === 'number' && lvl >= 1 && lvl <= 5))
    );
    const completed = completedList.length;
    const total = 5;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
      isComplete: completed >= total,
      completedLevels: [...completedList],
    };
  }

  // 4. QUIZ STATS (1 Whole Quiz)
  public getQuizStats() {
    const isSubmitted = Boolean(this.state.quizSubmitted);
    const completed = isSubmitted ? 1 : 0;
    const total = 1;
    const percentage = isSubmitted ? 100 : 0;

    return {
      total,
      completed,
      percentage,
      isSubmitted,
      finalScore: this.state.quizFinalScore || 0,
      isComplete: isSubmitted,
    };
  }

  // ALL 17 CIRCULAR LINKED LIST MODULES
  public getModules(): ModuleRecord[] {
    const theoryDone = (this.state.completedTheoryChapters || []).map(normalizeTheoryChapterId);

    return FIELD_NOTES_MODULES.map((m) => {
      const isDone = theoryDone.includes(m.id);
      const status: ModuleStatus = isDone ? 'COMPLETED' : 'NOT_STARTED';
      const progressPercent = isDone ? 100 : 0;

      return {
        ...m,
        status,
        progressPercent,
      };
    });
  }

  // OVERALL PROGRESS (25 Total Measurable Activities: 17 Theory + 2 Videos + 5 Game + 1 Quiz)
  public getStats() {
    const theory = this.getTheoryStats();
    const video = this.getVideoStats();
    const game = this.getGameStats();
    const quiz = this.getQuizStats();

    const total = 25;
    const completed = theory.completed + video.completed + game.completed + quiz.completed;
    const isAllComplete =
      theory.completed >= 17 &&
      video.completed >= 2 &&
      game.completed >= 5 &&
      quiz.completed >= 1;

    // Strict calculation: each activity is exactly 4% (25 * 4 = 100)
    const percentage = completed * 4;

    const modules = this.getModules();
    const mastered = modules.filter((m) => m.status === 'COMPLETED').length;

    // Find next unfinished module
    const currentUnfinished =
      modules.find((m) => m.status === 'NOT_STARTED') || modules[modules.length - 1];

    return {
      total,
      completed,
      mastered,
      percentage,
      isAllComplete,
      nextModule: currentUnfinished,
      theory,
      video,
      game,
      quiz,
    };
  }

  // =========================================================================
  // THEORY SPECIFIC PROGRESS (Idempotent & Exact)
  // =========================================================================
  public isTheoryChapterCompleted(chapterId: string): boolean {
    const normalized = normalizeTheoryChapterId(chapterId);
    const list = (this.state.completedTheoryChapters || []).map(normalizeTheoryChapterId);
    return list.includes(normalized);
  }

  public completeTheoryChapter(chapterId: string): boolean {
    const normalized = normalizeTheoryChapterId(chapterId);

    if (!this.state.completedTheoryChapters) {
      this.state.completedTheoryChapters = [];
    }

    // Idempotent check: if already completed, do not re-add
    if (this.state.completedTheoryChapters.includes(normalized)) {
      return false; // Already completed
    }

    this.state.completedTheoryChapters.push(normalized);
    this.state.currentTheoryChapterId = normalized;

    if (!this.state.modules) this.state.modules = {};
    if (!this.state.moduleProgress) this.state.moduleProgress = {};
    this.state.modules[normalized] = 'COMPLETED';
    this.state.moduleProgress[normalized] = 100;

    this.saveState();
    return true; // Newly completed!
  }

  public setCurrentTheoryChapter(chapterId: string) {
    const normalized = normalizeTheoryChapterId(chapterId);
    this.state.currentTheoryChapterId = normalized;
    this.saveState();
  }

  // =========================================================================
  // VIDEO SPECIFIC PROGRESS (Idempotent & Independent)
  // =========================================================================
  public isVideoCompleted(videoId: string): boolean {
    const normalized = normalizeVideoId(videoId);
    const list = (this.state.completedVideos || []).map(normalizeVideoId);
    return list.includes(normalized);
  }

  public completeVideo(videoId: string): boolean {
    const normalized = normalizeVideoId(videoId);
    if (normalized !== 'lesson-01' && normalized !== 'lesson-02') {
      return false;
    }

    if (!this.state.completedVideos) {
      this.state.completedVideos = [];
    }
    const currentList = this.state.completedVideos.map(normalizeVideoId);
    if (currentList.includes(normalized)) {
      return false; // Already completed
    }
    this.state.completedVideos.push(normalized);
    this.saveState();
    return true; // Newly completed!
  }

  // =========================================================================
  // MODULE LEVEL METHODS
  // =========================================================================
  public startModule(moduleId: string) {
    if (!this.state.modules[moduleId] || this.state.modules[moduleId] === 'NOT_STARTED') {
      this.state.modules[moduleId] = 'IN_PROGRESS';
      this.state.moduleProgress[moduleId] = Math.max(this.state.moduleProgress[moduleId] || 0, 25);
      this.state.currentActiveModuleId = moduleId;
      this.saveState();
    }
  }

  public updateModuleProgress(moduleId: string, percent: number) {
    if (this.state.modules[moduleId] !== 'COMPLETED' && this.state.modules[moduleId] !== 'MASTERED') {
      this.state.modules[moduleId] = 'IN_PROGRESS';
      this.state.moduleProgress[moduleId] = Math.min(
        100,
        Math.max(this.state.moduleProgress[moduleId] || 0, percent)
      );
      this.state.currentActiveModuleId = moduleId;
      this.saveState();
    }
  }

  public completeModule(moduleId: string, isMastered: boolean = false) {
    const currentStatus = this.state.modules[moduleId];
    const newStatus: ModuleStatus =
      isMastered || currentStatus === 'MASTERED' ? 'MASTERED' : 'COMPLETED';

    this.state.modules[moduleId] = newStatus;
    this.state.moduleProgress[moduleId] = 100;
    this.state.currentActiveModuleId = moduleId;
    this.saveState();
  }

  public markLevelCompleted(levelId: number, scoreAwarded: number = 100, isPerfect: boolean = false) {
    if (typeof levelId !== 'number' || levelId < 1 || levelId > 5) {
      return;
    }

    if (!this.state.levelsCompleted) {
      this.state.levelsCompleted = [];
    }
    if (!this.state.levelsMastered) {
      this.state.levelsMastered = [];
    }

    const wasAlreadyCompleted = this.state.levelsCompleted.includes(levelId);

    if (!wasAlreadyCompleted) {
      this.state.levelsCompleted.push(levelId);
    }
    if (isPerfect && !this.state.levelsMastered.includes(levelId)) {
      this.state.levelsMastered.push(levelId);
    }

    this.saveState();
  }

  public checkAndCompleteCertification() {
    const stats = this.getStats();
    if (stats.isAllComplete && !this.state.hasCelebrated100Percent) {
      this.saveState();
    }
  }

  public setCelebrationAcknowledged() {
    this.state.hasCelebrated100Percent = true;
    this.saveState();
  }

  public recordQuizCompletion(scores: Record<number, number>, correctCount: number, totalQuestions: number) {
    this.state.quizScores = scores;
    this.state.quizSubmitted = true;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    this.state.quizFinalScore = percentage;
    this.saveState();
  }

  public resetQuizAttempt() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('hash_quest_quiz_answers_v4');
        localStorage.removeItem('hash_quest_quiz_submitted_v4');
        localStorage.removeItem('hash_quest_quiz_answers_v3');
        localStorage.removeItem('hash_quest_quiz_submitted_v3');
        localStorage.removeItem('cll_quiz_answers_v1');
        localStorage.removeItem('cll_quiz_submitted_v1');
      } catch {
        // Ignore storage errors
      }
    }
    this.state.quizScores = {};
    this.state.quizSubmitted = false;
    this.state.quizFinalScore = 0;
    this.saveState();
  }

  public recordMasterChallenge(challengeId: string) {
    if (!this.state.masterChallengesCompleted) {
      this.state.masterChallengesCompleted = [];
    }
    if (!this.state.masterChallengesCompleted.includes(challengeId)) {
      this.state.masterChallengesCompleted.push(challengeId);
    }
    this.saveState();
  }

  public recordSandboxOp() {
    this.state.sandboxOperationsCount += 1;
    this.saveState();
  }

  public resetProgress() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('hash_quest_quiz_answers_v4');
        localStorage.removeItem('hash_quest_quiz_submitted_v4');
        localStorage.removeItem('hash_quest_quiz_answers_v3');
        localStorage.removeItem('hash_quest_quiz_submitted_v3');
        localStorage.removeItem('cll_quiz_answers_v1');
        localStorage.removeItem('cll_quiz_submitted_v1');
        localStorage.removeItem('cll_quiz_answers');
        localStorage.removeItem('cll_quiz_submitted');
        localStorage.removeItem('hash_quest_field_notes_progress');
        localStorage.removeItem('cll_progress_v1');
        localStorage.removeItem('cll_progress');
      } catch {
        // Ignore storage errors
      }
    }

    this.state = {
      version: 2,
      modules: {},
      moduleProgress: {},
      completedTheoryChapters: [],
      currentTheoryChapterId: 'theory-01',
      levelCompletedKeys: {},
      levelsCompleted: [],
      levelsMastered: [],
      quizScores: {},
      quizSubmitted: false,
      quizFinalScore: 0,
      masterChallengesCompleted: [],
      sandboxOperationsCount: 0,
      totalScore: 0,
      streak: 0,
      currentActiveModuleId: 'theory-01',
      lastActiveTimestamp: Date.now(),
      completedVideos: [],
      hasCelebrated100Percent: false,
    };
    this.saveState();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cll_reset_progress'));
      window.dispatchEvent(new CustomEvent('cll_reset_quiz'));
    }
  }
}

export const progressManager = new ProgressManager();

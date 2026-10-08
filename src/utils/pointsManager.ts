/**
 * Centralized Points System for AlgoLearn
 *
 * Implements a strict, single-source-of-truth Points management engine.
 * Governs all points rewards, penalties, activity logging, idempotency checks,
 * and persistence.
 */

export type PointEventType =
  | 'THEORY_COMPLETED'
  | 'VISUALIZE_COMPLETED'
  | 'VIDEO_COMPLETED'
  | 'GAME_COMPLETED'
  | 'HINT_USED'
  | 'GUIDED_SOLVE_USED'
  | 'QUIZ_CORRECT'
  | 'QUIZ_WRONG';

export const POINT_VALUES: Record<PointEventType, number> = {
  THEORY_COMPLETED: 2,
  VISUALIZE_COMPLETED: 3,
  VIDEO_COMPLETED: 3,
  GAME_COMPLETED: 4,
  HINT_USED: -1,
  GUIDED_SOLVE_USED: -2,
  QUIZ_CORRECT: 1,
  QUIZ_WRONG: -1,
} as const;

export interface PointActivity {
  id: string;
  type: PointEventType;
  sourceId: string;
  description: string;
  points: number;
  timestamp: number;
}

export interface PointsBreakdown {
  theory: number;
  visualization: number;
  games: number;
  quiz: number;
  penalties: number;
  total: number;
}

export interface PointsState {
  version: number;
  totalPoints: number;
  rewardedItems: Record<string, boolean>;
  activities: PointActivity[];
}

export interface PointChangeEventDetail {
  delta: number;
  description: string;
  type: PointEventType;
  totalPoints: number;
}

const STORAGE_KEY = 'queue-learning-points';

const INITIAL_POINTS_STATE: PointsState = {
  version: 1,
  totalPoints: 0,
  rewardedItems: {},
  activities: [],
};

type PointsListener = (state: PointsState) => void;

class PointsManager {
  private state: PointsState;
  private listeners: Set<PointsListener> = new Set();
  private quizAnsweredInSession: Set<number> = new Set();

  constructor() {
    this.state = this.loadState();

    if (typeof window !== 'undefined') {
      window.addEventListener('cll_reset_progress', () => {
        this.reset();
      });

      window.addEventListener('cll_reset_quiz', () => {
        this.quizAnsweredInSession.clear();
      });
    }
  }

  private loadState(): PointsState {
    if (typeof localStorage === 'undefined') {
      return INITIAL_POINTS_STATE;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return INITIAL_POINTS_STATE;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        return INITIAL_POINTS_STATE;
      }

      const totalPoints = typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0;
      const rewardedItems = typeof parsed.rewardedItems === 'object' && parsed.rewardedItems !== null
        ? parsed.rewardedItems
        : {};
      const activities = Array.isArray(parsed.activities) ? parsed.activities : [];

      return {
        version: parsed.version || 1,
        totalPoints,
        rewardedItems,
        activities,
      };
    } catch {
      return INITIAL_POINTS_STATE;
    }
  }

  private saveState() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage quota errors
    }
    this.notifyListeners();
  }

  public subscribe(listener: PointsListener): () => void {
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

  public getState(): PointsState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getTotalPoints(): number {
    return this.state.totalPoints;
  }

  public isItemRewarded(sourceId: string): boolean {
    return Boolean(this.state.rewardedItems[sourceId]);
  }

  /**
   * Internal dispatcher for recording an event, validating idempotency,
   * updating state, and dispatching UI feedback.
   */
  public triggerEvent(
    type: PointEventType,
    options: {
      sourceId: string;
      description: string;
      isOneTimeReward?: boolean;
    }
  ): { success: boolean; pointsAwarded: number } {
    const { sourceId, description, isOneTimeReward = false } = options;
    const points = POINT_VALUES[type];

    // Idempotency check for completion rewards
    if (isOneTimeReward && this.state.rewardedItems[sourceId]) {
      return { success: false, pointsAwarded: 0 };
    }

    if (isOneTimeReward) {
      this.state.rewardedItems[sourceId] = true;
    }

    const activity: PointActivity = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      sourceId,
      description,
      points,
      timestamp: Date.now(),
    };

    // Prepend new activity so recent activities appear first
    this.state.activities.unshift(activity);
    this.state.totalPoints += points;

    this.saveState();

    // Broadcast toast/feedback event
    if (typeof window !== 'undefined') {
      const detail: PointChangeEventDetail = {
        delta: points,
        description,
        type,
        totalPoints: this.state.totalPoints,
      };
      window.dispatchEvent(new CustomEvent('points_changed', { detail }));
    }

    return { success: true, pointsAwarded: points };
  }

  /**
   * Theory Module Completion: +2 Points (Idempotent)
   */
  public awardTheoryCompletion(chapterId: string, description?: string): boolean {
    const sourceId = `theory:${chapterId}`;
    const result = this.triggerEvent('THEORY_COMPLETED', {
      sourceId,
      description: description || `Completed Theory Module: ${chapterId}`,
      isOneTimeReward: true,
    });
    return result.success;
  }

  /**
   * Video / Visualization Module Completion: +3 Points (Idempotent)
   */
  public awardVideoCompletion(videoId: string, description?: string): boolean {
    const sourceId = `video:${videoId}`;
    const result = this.triggerEvent('VIDEO_COMPLETED', {
      sourceId,
      description: description || `Completed Visualization: ${videoId}`,
      isOneTimeReward: true,
    });
    return result.success;
  }

  /**
   * Game Level Completion: +4 Points (Idempotent)
   */
  public awardGameCompletion(levelId: number, description?: string): boolean {
    const sourceId = `game:level-${levelId}`;
    const result = this.triggerEvent('GAME_COMPLETED', {
      sourceId,
      description: description || `Completed Game Level ${levelId}`,
      isOneTimeReward: true,
    });
    return result.success;
  }

  /**
   * Use Guided Solve: -2 Points (Per Genuine Use)
   */
  public deductGuidedSolve(sourceId: string = 'game', description?: string): boolean {
    const result = this.triggerEvent('GUIDED_SOLVE_USED', {
      sourceId,
      description: description || 'Used Guided Solve',
      isOneTimeReward: false,
    });
    return result.success;
  }

  /**
   * Use Hint: -1 Point (Per Genuine Use)
   */
  public deductHint(sourceId: string = 'game', description?: string): boolean {
    const result = this.triggerEvent('HINT_USED', {
      sourceId,
      description: description || 'Used Hint',
      isOneTimeReward: false,
    });
    return result.success;
  }

  /**
   * Quiz Question Answer Submission: Correct -> +1, Wrong -> -1
   * Guaranteed duplicate-protection per question in current quiz session.
   */
  public recordQuizAnswer(questionId: number, isCorrect: boolean, description?: string): boolean {
    if (this.quizAnsweredInSession.has(questionId)) {
      return false; // Prevent double trigger
    }
    this.quizAnsweredInSession.add(questionId);

    const type: PointEventType = isCorrect ? 'QUIZ_CORRECT' : 'QUIZ_WRONG';
    const desc = description || (isCorrect ? `Correct Quiz Answer (Q${questionId})` : `Wrong Quiz Answer (Q${questionId})`);

    const result = this.triggerEvent(type, {
      sourceId: `quiz:q-${questionId}`,
      description: desc,
      isOneTimeReward: false,
    });

    return result.success;
  }

  /**
   * Calculates the full Points Breakdown dynamically from state activities.
   */
  public getBreakdown(): PointsBreakdown {
    let theory = 0;
    let visualization = 0;
    let games = 0;
    let quiz = 0;
    let penalties = 0;

    for (const act of this.state.activities) {
      switch (act.type) {
        case 'THEORY_COMPLETED':
          theory += act.points;
          break;
        case 'VISUALIZE_COMPLETED':
        case 'VIDEO_COMPLETED':
          visualization += act.points;
          break;
        case 'GAME_COMPLETED':
          games += act.points;
          break;
        case 'QUIZ_CORRECT':
        case 'QUIZ_WRONG':
          quiz += act.points;
          break;
        case 'HINT_USED':
        case 'GUIDED_SOLVE_USED':
          penalties += act.points; // Negative values, e.g. -4
          break;
      }
    }

    const total = theory + visualization + games + quiz + penalties;

    return {
      theory,
      visualization,
      games,
      quiz,
      penalties,
      total,
    };
  }

  /**
   * Resets all points data (used on global reset confirmation)
   */
  public reset() {
    this.quizAnsweredInSession.clear();
    this.state = {
      version: 1,
      totalPoints: 0,
      rewardedItems: {},
      activities: [],
    };
    this.saveState();
  }
}

export const pointsManager = new PointsManager();

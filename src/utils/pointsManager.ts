/**
 * Centralized Points System for AlgoLearn
 *
 * Implements a strict, single-source-of-truth Points management engine
 * with a 100-point total distribution scale:
 * - Theory:          17 modules × 2 pts  = 34 pts max
 * - Visualize/Video:  2 modules × 3 pts  =  6 pts max
 * - Game:             5 levels × 8 pts   = 40 pts max
 * - Quiz:            +2 correct, -1 wrong = 20 pts max
 * ----------------------------------------------------
 * TOTAL:                                 100 pts max
 *
 * Penalties:
 * - Use Hint:         -2 pts per genuine use
 * - Use Guided Solve: -3 pts per genuine use
 *
 * Governs all points rewards, penalties, activity logging, idempotency checks,
 * non-negative balance enforcement (min 0, max 100), and persistence.
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

export const CATEGORY_CAPS = {
  THEORY: 34,
  QUIZ: 20,
  VISUALIZE: 6,
  GAME: 40,
  TOTAL: 100,
} as const;

export const POINT_VALUES: Record<PointEventType, number> = {
  THEORY_COMPLETED: 2,
  VISUALIZE_COMPLETED: 3,
  VIDEO_COMPLETED: 3,
  GAME_COMPLETED: 8,
  QUIZ_CORRECT: 2,
  QUIZ_WRONG: -1,
  HINT_USED: -2,
  GUIDED_SOLVE_USED: -3,
} as const;

export interface PointActivity {
  id: string;
  type: PointEventType;
  sourceId: string;
  description: string;
  points: number;       // Requested points change (+2, +3, +8, +2, -1, -2, -3)
  actualDelta: number;  // Actual balance change after applying 0 floor and 100 cap
  balanceAfter: number; // Balance after the event (always 0 <= balance <= 100)
  timestamp: number;
}

export interface PointsBreakdown {
  theory: number;
  visualization: number;
  games: number;
  quiz: number;
  quizCorrect: number;
  quizPenalties: number;
  hintPenalties: number;
  guidedSolvePenalties: number;
  totalGrossPenalties: number;
  penalties: number;
  currentBalance: number;
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
  actualDelta: number;
  description: string;
  type: PointEventType;
  totalPoints: number;
}

const STORAGE_KEY = 'queue-learning-points';

const INITIAL_POINTS_STATE: PointsState = {
  version: 4,
  totalPoints: 0,
  rewardedItems: {},
  activities: [],
};

type PointsListener = (state: PointsState) => void;

class PointsManager {
  private state: PointsState;
  private listeners: Set<PointsListener> = new Set();
  private quizAnsweredInSession: Set<number> = new Set();
  private lastActionTimestamps: Map<string, number> = new Map();

  constructor() {
    this.state = this.loadState();

    if (typeof window !== 'undefined') {
      window.addEventListener('cll_reset_progress', () => {
        this.reset();
      });

      window.addEventListener('cll_reset_quiz', () => {
        this.clearQuizSession();
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

      const totalPoints = typeof parsed.totalPoints === 'number'
        ? Math.min(CATEGORY_CAPS.TOTAL, parsed.totalPoints)
        : 0;
      const rewardedItems = typeof parsed.rewardedItems === 'object' && parsed.rewardedItems !== null
        ? parsed.rewardedItems
        : {};
      const activities: PointActivity[] = Array.isArray(parsed.activities)
        ? parsed.activities.map((act: any) => ({
            id: act.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: act.type,
            sourceId: act.sourceId || '',
            description: act.description || '',
            points: typeof act.points === 'number' ? act.points : 0,
            actualDelta: typeof act.actualDelta === 'number'
              ? act.actualDelta
              : (typeof act.points === 'number' ? act.points : 0),
            balanceAfter: typeof act.balanceAfter === 'number'
              ? Math.min(CATEGORY_CAPS.TOTAL, act.balanceAfter)
              : 0,
            timestamp: typeof act.timestamp === 'number' ? act.timestamp : Date.now(),
          }))
        : [];

      return {
        version: parsed.version || 4,
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
   * Helper to calculate the current category points accumulated from activities
   */
  public getCategoryContributions(): {
    theory: number;
    visualization: number;
    game: number;
    quiz: number;
  } {
    let theory = 0;
    let visualization = 0;
    let game = 0;
    let quiz = 0;

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
          game += act.points;
          break;
        case 'QUIZ_CORRECT':
        case 'QUIZ_WRONG':
          quiz += act.points;
          break;
      }
    }

    return {
      theory: Math.min(CATEGORY_CAPS.THEORY, Math.max(0, theory)),
      visualization: Math.min(CATEGORY_CAPS.VISUALIZE, Math.max(0, visualization)),
      game: Math.min(CATEGORY_CAPS.GAME, Math.max(0, game)),
      quiz: Math.min(CATEGORY_CAPS.QUIZ, Math.max(0, quiz)),
    };
  }

  /**
   * Internal dispatcher for recording an event, validating idempotency,
   * enforcing category caps and the 0-100 balance bounds,
   * recording activity, updating state, and dispatching UI feedback.
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
    const requestedPoints = POINT_VALUES[type];

    // Idempotency check for one-time completion rewards
    if (isOneTimeReward && this.state.rewardedItems[sourceId]) {
      return { success: false, pointsAwarded: 0 };
    }

    // Debounce protection (250ms) for repeatable actions against StrictMode double-invocations or bounce
    if (!isOneTimeReward) {
      const now = Date.now();
      const actionKey = `${type}:${sourceId}`;
      const lastTime = this.lastActionTimestamps.get(actionKey) || 0;
      if (now - lastTime < 250) {
        return { success: false, pointsAwarded: 0 };
      }
      this.lastActionTimestamps.set(actionKey, now);
    }

    // Check category cap for positive additions
    let effectivePoints = requestedPoints;
    if (requestedPoints > 0) {
      const contributions = this.getCategoryContributions();
      if (type === 'THEORY_COMPLETED') {
        const remaining = Math.max(0, CATEGORY_CAPS.THEORY - contributions.theory);
        effectivePoints = Math.min(requestedPoints, remaining);
      } else if (type === 'VISUALIZE_COMPLETED' || type === 'VIDEO_COMPLETED') {
        const remaining = Math.max(0, CATEGORY_CAPS.VISUALIZE - contributions.visualization);
        effectivePoints = Math.min(requestedPoints, remaining);
      } else if (type === 'GAME_COMPLETED') {
        const remaining = Math.max(0, CATEGORY_CAPS.GAME - contributions.game);
        effectivePoints = Math.min(requestedPoints, remaining);
      } else if (type === 'QUIZ_CORRECT') {
        const remaining = Math.max(0, CATEGORY_CAPS.QUIZ - contributions.quiz);
        effectivePoints = Math.min(requestedPoints, remaining);
      }
    }

    if (isOneTimeReward) {
      this.state.rewardedItems[sourceId] = true;
    }

    // Allow score to become negative while enforcing the 100 upper cap
    const prevBalance = this.state.totalPoints;
    const newBalance = Math.min(CATEGORY_CAPS.TOTAL, prevBalance + effectivePoints);
    const actualDelta = newBalance - prevBalance;

    const activity: PointActivity = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      sourceId,
      description,
      points: requestedPoints,
      actualDelta,
      balanceAfter: newBalance,
      timestamp: Date.now(),
    };

    // Prepend new activity so recent activities appear first
    this.state.activities.unshift(activity);
    this.state.totalPoints = newBalance;

    this.saveState();

    // Broadcast toast/feedback event
    if (typeof window !== 'undefined') {
      const detail: PointChangeEventDetail = {
        delta: requestedPoints,
        actualDelta,
        description,
        type,
        totalPoints: newBalance,
      };
      window.dispatchEvent(new CustomEvent('points_changed', { detail }));
    }

    return { success: true, pointsAwarded: effectivePoints };
  }

  /**
   * Theory Module Completion: +2 Points (17 modules × 2 pts = 34 pts max, one-time each)
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
   * Video / Visualization Module Completion: +3 Points (2 modules × 3 pts = 6 pts max, one-time each)
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
   * Game Level Completion: +8 Points (5 levels × 8 pts = 40 pts max, one-time each)
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
   * Use Guided Solve: -3 Points (Per Genuine Use)
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
   * Use Hint: -2 Points (Per Genuine Use)
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
   * Quiz Question Answer Submission: Correct -> +2, Wrong -> -1 (Quiz max 20 pts)
   * Guaranteed duplicate-protection per question in current quiz session.
   */
  public recordQuizAnswer(questionId: number, isCorrect: boolean, description?: string): boolean {
    if (this.quizAnsweredInSession.has(questionId)) {
      return false; // Prevent double trigger within same attempt
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
   * Clears session question deduplication when quiz is reset for a fresh attempt
   */
  public clearQuizSession() {
    this.quizAnsweredInSession.clear();
  }

  /**
   * Calculates the full Points Breakdown dynamically from state activities.
   */
  public getBreakdown(): PointsBreakdown {
    let theory = 0;
    let visualization = 0;
    let games = 0;
    let quizCorrect = 0;
    let quizPenalties = 0;
    let hintPenalties = 0;
    let guidedSolvePenalties = 0;

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
          quizCorrect += act.points;
          break;
        case 'QUIZ_WRONG':
          quizPenalties += act.points; // Negative values, e.g. -1, -2...
          break;
        case 'HINT_USED':
          hintPenalties += act.points; // Negative values, e.g. -2, -4...
          break;
        case 'GUIDED_SOLVE_USED':
          guidedSolvePenalties += act.points; // Negative values, e.g. -3, -6...
          break;
      }
    }

    const cappedTheory = Math.min(CATEGORY_CAPS.THEORY, Math.max(0, theory));
    const cappedVis = Math.min(CATEGORY_CAPS.VISUALIZE, Math.max(0, visualization));
    const cappedGames = Math.min(CATEGORY_CAPS.GAME, Math.max(0, games));
    const netQuiz = Math.min(CATEGORY_CAPS.QUIZ, Math.max(0, quizCorrect + quizPenalties));
    const totalGrossPenalties = quizPenalties + hintPenalties + guidedSolvePenalties;

    return {
      theory: cappedTheory,
      visualization: cappedVis,
      games: cappedGames,
      quiz: netQuiz,
      quizCorrect,
      quizPenalties,
      hintPenalties,
      guidedSolvePenalties,
      totalGrossPenalties,
      penalties: totalGrossPenalties,
      currentBalance: this.state.totalPoints,
      total: this.state.totalPoints,
    };
  }

  /**
   * Resets all points data (used on global reset confirmation)
   */
  public reset() {
    this.quizAnsweredInSession.clear();
    this.lastActionTimestamps.clear();
    this.state = {
      version: 4,
      totalPoints: 0,
      rewardedItems: {},
      activities: [],
    };
    this.saveState();
  }
}

export const pointsManager = new PointsManager();

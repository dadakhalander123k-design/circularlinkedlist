import React from 'react';
import {
  Play,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FlaskConical,
  Shield,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { soundManager } from '../utils/audio';

export interface GameLevelSelectionViewProps {
  currentLevelId: number;
  completedLevels: number[];
  score: number;
  streak: number;
  onPlayLevel: (levelId: number) => void;
  onOpenCompletion?: () => void;
  onOpenLab?: () => void;
}

interface LevelCardMeta {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  techniqueLabel: string;
  description: string;
  formula: string;
}

const LEVEL_CARDS_DATA: LevelCardMeta[] = [
  {
    id: 1,
    badge: 'LEVEL 01',
    title: 'Build the Circle',
    subtitle: 'Learn Node Anatomy, HEAD & Circular Pointers',
    techniqueLabel: 'Basic Pointers',
    description:
      'Learn node anatomy (DATA & NEXT fields), HEAD and TAIL pointers, and close the loop by linking the final node back to HEAD without NULL.',
    formula: 'tail.next = head',
  },
  {
    id: 2,
    badge: 'LEVEL 02',
    title: 'Traverse the Circle',
    subtitle: 'Master Sequential Traversal & Stopping Conditions',
    techniqueLabel: 'Linear Traversal',
    description:
      'Trace through circular nodes sequentially using NEXT pointers and master the cyclic stopping condition (current.next === head) to prevent infinite loops.',
    formula: 'while (current.next !== head)',
  },
  {
    id: 3,
    badge: 'LEVEL 03',
    title: 'Insert Into the Circle',
    subtitle: 'Pointer Reconnection at Beginning, End & Position',
    techniqueLabel: 'Pointer Splicing',
    description:
      'Insert new nodes into the circle by rewiring previous and next pointer links while strictly preserving continuous circular loop integrity.',
    formula: 'new.next = next; prev.next = new;',
  },
  {
    id: 4,
    badge: 'LEVEL 04',
    title: 'Delete From the Circle',
    subtitle: 'Node Bypassing & Memory Reconnection',
    techniqueLabel: 'Bypass & Reconnect',
    description:
      'Safely delete nodes by reconnecting adjacent pointer links to bypass target addresses and updating HEAD/TAIL references as required.',
    formula: 'prev.next = target.next',
  },
  {
    id: 5,
    badge: 'LEVEL 05',
    title: 'Master the Circle',
    subtitle: 'Searching, Tradeoffs, Real-World Uses & Boss Repair',
    techniqueLabel: 'Master Synthesis',
    description:
      'Apply comprehensive circular linked list skills: execute cyclic linear search, evaluate architectural tradeoffs against SLL, and repair broken pointer loops.',
    formula: 'Search O(n) • Cyclic Invariant',
  },
];

export const GameLevelSelectionView: React.FC<GameLevelSelectionViewProps> = ({
  currentLevelId,
  completedLevels,
  score,
  streak,
  onPlayLevel,
  onOpenLab,
}) => {
  const pState = progressManager.getState();

  const completedCount = [1, 2, 3, 4, 5].filter(
    (lvl) => completedLevels.includes(lvl) || pState.levelsCompleted.includes(lvl)
  ).length;

  const completionPercent = Math.round((completedCount / 5) * 100);

  // Determine next recommended level
  const firstIncompleteLevel = [1, 2, 3, 4, 5].find(
    (lvl) => !completedLevels.includes(lvl) && !pState.levelsCompleted.includes(lvl)
  );
  const nextTargetLevelId = firstIncompleteLevel !== undefined ? firstIncompleteLevel : 1;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 font-sans animate-page-enter select-text">
      {/* =========================================================================
          1. HEADER BANNER & PROGRESS AREA (Reference-Inspired Visual Hierarchy)
          ========================================================================= */}
      <section
        id="game-section-header"
        className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden transition-all"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Row: Left Content & Right Curriculum Progress Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Side: Eyebrow Badge -> Large Heading -> Supporting Description */}
            <div className="space-y-3 max-w-2xl">
              {/* 1. Small Blue Outlined Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold font-mono uppercase tracking-wider rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Interactive Challenges • 5 Levels</span>
              </div>

              {/* 2. Large Bold Primary Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-tight">
                Circular Linked List Game Levels
              </h1>

              {/* 3. Supporting Description */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Choose a level to begin your Circular Linked List interactive challenge. Master node anatomy, pointer rewiring, deletion bypassing, and cyclic invariants step by step.
              </p>
            </div>

            {/* Right Side: Curriculum Progress Card */}
            <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[260px] sm:min-w-[280px] shadow-2xs shrink-0 self-start lg:self-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-500/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Curriculum Progress
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {completedCount} of 5 Levels Completed
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Overall Completion & Horizontal Progress Bar */}
          <div className="pt-2 sm:pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                Overall Completion
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {completionPercent}%
              </span>
            </div>
            {/* Full-width Thin Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. EXACTLY FIVE LEVEL CARDS
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Available Levels (1 to 5)</span>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Sequential Unlock Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVEL_CARDS_DATA.map((card) => {
            const isCompleted =
              completedLevels.includes(card.id) ||
              pState.levelsCompleted.includes(card.id) ||
              pState.levelsMastered.includes(card.id);

            // Sequential unlock: Level 1 is always unlocked; subsequent levels require previous level to be completed
            const isUnlocked =
              card.id === 1 ||
              completedLevels.includes(card.id - 1) ||
              pState.levelsCompleted.includes(card.id - 1) ||
              isCompleted;

            const isCurrent = currentLevelId === card.id && isUnlocked;

            // Status label & badge style
            let statusLabel = 'LOCKED';
            let statusStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700';

            if (isCompleted) {
              statusLabel = 'COMPLETED';
              statusStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
            } else if (isCurrent) {
              statusLabel = 'IN PROGRESS';
              statusStyle = 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border-blue-200 dark:border-blue-500/30 ring-2 ring-blue-500/20';
            } else if (isUnlocked) {
              statusLabel = 'AVAILABLE';
              statusStyle = 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-[#3B82F6] border-[#DBEAFE] dark:border-blue-500/30';
            }

            return (
              <div
                key={card.id}
                id={`level-card-${card.id}`}
                className={`flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-300 border ${
                  isUnlocked
                    ? 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-blue-500/20 shadow-xs hover:shadow-lg dark:hover:shadow-[0_12px_32px_rgba(37,99,235,0.15)] hover:-translate-y-1'
                    : 'bg-slate-50/70 dark:bg-[#0B1120]/70 border-slate-200/60 dark:border-slate-800/80 opacity-75 cursor-not-allowed'
                } ${isCurrent ? 'ring-2 ring-[#2563EB] dark:ring-[#3B82F6]' : ''}`}
              >
                <div>
                  {/* Top Row: Level Badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold font-mono tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-blue-500/20">
                      {card.badge}
                    </span>

                    <span
                      className={`text-[11px] font-bold font-mono tracking-wider uppercase px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${statusStyle}`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                          <span>Completed</span>
                        </>
                      ) : isUnlocked ? (
                        <>
                          <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[#2563EB] dark:bg-[#3B82F6] animate-ping' : 'bg-[#2563EB] dark:bg-[#3B82F6]'}`} />
                          <span>{isCurrent ? 'In Progress' : 'Available'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>Locked</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Level Title */}
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-snug">
                    {card.title}
                  </h2>

                  {/* Subtitle / Objective focus */}
                  <div className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] mt-1 font-mono uppercase tracking-wide">
                    {card.subtitle}
                  </div>

                  {/* Educational Summary / Basic Information */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Key Formula / Invariant Pill */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                      Invariant:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#0F172A] px-2.5 py-0.5 rounded-md border border-slate-200/80 dark:border-blue-500/20 text-[11px]">
                      {card.formula}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Area: PLAY Button or Locked Notice */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-500/15">
                  {isUnlocked ? (
                    <button
                      id={`btn-play-level-${card.id}`}
                      onClick={() => {
                        soundManager.playPrimaryClick();
                        onPlayLevel(card.id);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md ${
                        isCompleted
                          ? 'btn-modern-secondary text-slate-800 dark:text-white'
                          : 'btn-modern-primary'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                          <span>Play Again</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play Level {card.id}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      id={`btn-locked-level-${card.id}`}
                      onClick={() => {
                        soundManager.playError();
                      }}
                      disabled
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>Locked</span>
                    </button>
                  )}

                  {!isUnlocked && (
                    <div className="text-[11px] font-mono text-center text-slate-400 dark:text-slate-500 mt-2">
                      Complete Level 0{card.id - 1} to unlock
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. HORIZONTAL LAB CARD (Replaces Quest Completion Card in Game Section)
          ========================================================================= */}
      <section
        id="game-lab-card"
        className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-lg dark:hover:shadow-[0_12px_32px_rgba(37,99,235,0.15)] transition-all duration-300 relative overflow-hidden"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left & Center: Lab Icon + LAB Badge + Title + Description */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Lab Icon Container */}
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <FlaskConical className="w-7 h-7 text-[#2563EB] dark:text-[#3B82F6]" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
                  LAB
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                  Interactive Laboratory
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-snug">
                Interactive Lab
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Practice Circular Linked List operations in the interactive laboratory.
              </p>
            </div>
          </div>

          {/* Right Action: OPEN LAB Button */}
          <div className="shrink-0 pt-2 md:pt-0">
            <button
              id="btn-open-lab-card"
              onClick={() => {
                soundManager.playPrimaryClick();
                if (onOpenLab) {
                  onOpenLab();
                }
              }}
              className="btn-modern-primary w-full md:w-auto py-3.5 px-6 sm:px-7 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:shadow-md transition-all whitespace-nowrap"
            >
              <span>Open Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

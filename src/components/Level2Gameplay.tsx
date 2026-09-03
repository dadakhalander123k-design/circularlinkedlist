import React, { useState } from 'react';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';

interface Level2Round {
  array: number[];
  target: number;
  expectedComparisons: number;
  positionLabel: string;
}

interface Level2GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level2Gameplay: React.FC<Level2GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  const rounds: Level2Round[] = [
    { array: [42, 17, 83, 25, 61], target: 42, expectedComparisons: 1, positionLabel: '1st element (Index 0)' },
    { array: [12, 33, 71, 18, 50], target: 71, expectedComparisons: 3, positionLabel: '3rd element (Index 2)' },
    { array: [14, 22, 31, 44, 57], target: 57, expectedComparisons: 5, positionLabel: '5th element (Index 4)' },
  ];

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [pointer, setPointer] = useState<number>(0);
  const [comparisons, setComparisons] = useState<number>(0);
  const [isFound, setIsFound] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Check elements sequentially from left to right.');
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  const currentRound = rounds[roundIndex];
  const isAllRoundsComplete = roundIndex >= rounds.length - 1 && isFound;

  const handleCheck = (clickedIndex?: number) => {
    if (isFound) return;

    if (clickedIndex !== undefined && clickedIndex !== pointer) {
      soundManager.playError();
      setFeedback('Check elements in sequential order from left to right.');
      return;
    }

    const currentVal = currentRound.array[pointer];
    const nextComparisons = comparisons + 1;
    setComparisons(nextComparisons);

    if (currentVal === currentRound.target) {
      soundManager.playCalcSuccess();
      setIsFound(true);
      setFeedback(
        `✓ Target ${currentRound.target} found! Position: ${currentRound.positionLabel}. Required ${nextComparisons} comparison${nextComparisons > 1 ? 's' : ''}.`
      );
      onScoreUpdate(30);
      onStreakUpdate(roundIndex + 1);
    } else {
      soundManager.playClick();
      setPointer((prev) => prev + 1);
      setFeedback(`${currentVal} ≠ ${currentRound.target}. Checking next element...`);
    }
  };

  const handleNextRound = () => {
    if (roundIndex < rounds.length - 1) {
      soundManager.playSelect();
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      setPointer(0);
      setComparisons(0);
      setIsFound(false);
      setFeedback(`Round ${nextIdx + 1}: Find target ${rounds[nextIdx].target}.`);
    } else {
      soundManager.playLevelVictory();
      onLevelComplete(2, 100);
    }
  };

  const getGuidedSolveExplanation = () => {
    if (isFound) {
      if (roundIndex < rounds.length - 1) {
        return `Target ${currentRound.target} found (${currentRound.positionLabel}) in ${comparisons} comparison${comparisons > 1 ? 's' : ''}! Click Next Step to proceed to Round ${roundIndex + 2}.`;
      }
      return `All 3 rounds completed! Linear Search demonstrated best-case, average-case, and worst-case search times.`;
    }
    const val = currentRound.array[pointer];
    if (val === currentRound.target) {
      return `Index ${pointer} contains element ${val}, which matches the target ${currentRound.target}! Target found.`;
    }
    return `Checking index ${pointer} (value ${val}). Since ${val} ≠ ${currentRound.target}, Linear Search advances to index ${pointer + 1}.`;
  };

  const handleGuidedNextStep = () => {
    if (!isFound) {
      handleCheck();
    } else {
      handleNextRound();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              ROUND {roundIndex + 1} OF {rounds.length}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Target:{' '}
              <span className="font-mono text-[#2563EB] dark:text-[#3B82F6] text-lg font-extrabold px-2 py-0.5 bg-[#EFF6FF] dark:bg-blue-900/40 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">
                {currentRound.target}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">COMPARISONS:</span>
              <span className="px-3 py-1 bg-[#2563EB] text-white rounded-lg font-bold text-sm shadow-xs animate-scale">
                {comparisons}
              </span>
            </div>

            {!isGuidedSolveActive && !isAllRoundsComplete && (
              <button
                id="btn-lvl2-start-guided-solve"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsGuidedSolveActive(true);
                }}
                className="btn-modern-secondary px-3 py-1 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs select-none"
                title="Start Guided Solve step-by-step assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Guided Solve</span>
              </button>
            )}
          </div>
        </div>

        {/* Guided Solve Step-by-Step Panel */}
        {isGuidedSolveActive && (
          <div className="pt-4">
            <GuidedSolvePanel
              stepNumber={isFound ? currentRound.expectedComparisons + 1 : pointer + 1}
              totalSteps={currentRound.expectedComparisons + 1}
              explanation={getGuidedSolveExplanation()}
              isComplete={isAllRoundsComplete}
              nextButtonLabel={
                isFound
                  ? roundIndex < rounds.length - 1
                    ? `Proceed to Round ${roundIndex + 2}`
                    : 'Complete Level 2'
                  : `Compare [${pointer}] with ${currentRound.target}`
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Interactive Array Grid */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
            <span>Array Elements</span>
            <span className="text-[#2563EB] dark:text-[#3B82F6]">Pointer: Index {pointer}</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {currentRound.array.map((val, idx) => {
              const isChecked = idx < pointer || (idx === pointer && isFound);
              const isCurrent = idx === pointer && !isFound;
              const isMatch = val === currentRound.target && isFound && idx === pointer;
              const isMismatch = isChecked && !isMatch;

              return (
                <button
                  key={idx}
                  id={`lvl2-array-cell-${idx}`}
                  onClick={() => handleCheck(idx)}
                  disabled={isFound || idx < pointer}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-xl border-2 transition-all duration-200 select-none ${isMatch
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-md scale-105 ring-4 ring-emerald-500/20'
                      : isMismatch
                        ? 'bg-slate-50 dark:bg-[#0F172A] border-slate-300 dark:border-blue-500/20 text-slate-400 dark:text-slate-500 opacity-80'
                        : isCurrent
                          ? 'bg-[#EFF6FF]/70 dark:bg-blue-950/40 border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-white shadow-md scale-105 ring-4 ring-blue-500/20 cursor-pointer'
                          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 opacity-60 cursor-not-allowed'
                    }`}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                    [{idx}]
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono">{val}</span>
                  <div className="mt-2 text-[10px] font-mono font-bold">
                    {isMatch ? (
                      <span className="text-emerald-600 dark:text-emerald-400">FOUND ✓</span>
                    ) : isMismatch ? (
                      <span className="text-slate-400">≠ {currentRound.target}</span>
                    ) : isCurrent ? (
                      <span className="text-[#2563EB] dark:text-[#3B82F6] animate-pulse">CHECK</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">WAIT</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action & Feedback Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{feedback}</span>
          </div>

          {!isFound ? (
            <button
              id="btn-lvl2-check-next"
              onClick={() => handleCheck()}
              className="btn-modern-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
            >
              <span>
                Compare [{pointer}] with {currentRound.target}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-lvl2-next-round"
              onClick={handleNextRound}
              className="btn-modern-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center"
            >
              <span>{isAllRoundsComplete ? 'Complete Level 2' : 'Next Round'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Position Rule Principle Card */}
      <div className="bg-gradient-to-r from-blue-500/10 via-[#2563EB]/10 to-[#6366F1]/10 dark:from-blue-950/40 dark:to-blue-950/40 border border-[#DBEAFE] dark:border-blue-500/30 rounded-2xl p-5 shadow-xs">
        <div className="text-xs font-bold uppercase font-mono tracking-widest text-[#2563EB] dark:text-[#3B82F6] mb-2">
          Target Position Principle
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/80 dark:bg-[#111827]/80 p-3 rounded-xl border border-[#DBEAFE] dark:border-blue-500/20">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
              EARLY TARGET (Best Case)
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              Target at index 0 requires only <strong>1 comparison</strong>.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-[#111827]/80 p-3 rounded-xl border border-[#DBEAFE] dark:border-blue-500/20">
            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
              LATE TARGET (Worst Case)
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              Target at the end requires checking every element (<strong>n comparisons</strong>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

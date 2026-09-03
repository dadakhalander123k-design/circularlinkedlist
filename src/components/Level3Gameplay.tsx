import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Lightbulb, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';

interface Level3Round {
  array: number[];
  target: number;
  exists: boolean;
  foundIndex: number;
}

interface Level3GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level3Gameplay: React.FC<Level3GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  const rounds: Level3Round[] = [
    { array: [10, 24, 37, 51, 68], target: 40, exists: false, foundIndex: -1 },
    { array: [15, 28, 42, 63, 79], target: 42, exists: true, foundIndex: 2 },
    { array: [8, 19, 33, 47, 62, 85], target: 99, exists: false, foundIndex: -1 },
  ];

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [pointer, setPointer] = useState<number>(0);
  const [comparisons, setComparisons] = useState<number>(0);
  const [status, setStatus] = useState<'searching' | 'decision_needed' | 'round_completed'>('searching');
  const [feedback, setFeedback] = useState<string>(
    'Search through the array to determine if the target exists.'
  );
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  const currentRound = rounds[roundIndex];
  const isDecisionPhase = status === 'decision_needed';
  const isRoundDone = status === 'round_completed';
  const isAllRoundsComplete = roundIndex >= rounds.length - 1 && isRoundDone;

  const handleCheck = (clickedIndex?: number) => {
    if (status !== 'searching') return;

    if (clickedIndex !== undefined && clickedIndex !== pointer) {
      soundManager.playError();
      setFeedback('Check elements sequentially from index 0.');
      return;
    }

    const currentVal = currentRound.array[pointer];
    const nextComparisons = comparisons + 1;
    setComparisons(nextComparisons);

    if (currentVal === currentRound.target) {
      soundManager.playCalcSuccess();
      setStatus('decision_needed');
      setFeedback(`Search reached target ${currentRound.target} at index ${pointer}. What is the result?`);
    } else if (pointer >= currentRound.array.length - 1) {
      soundManager.playClick();
      setStatus('decision_needed');
      setFeedback('Search reached the end of the array. What is the result?');
    } else {
      soundManager.playClick();
      setPointer((prev) => prev + 1);
      setFeedback(`${currentVal} ≠ ${currentRound.target}. Moving to index ${pointer + 1}...`);
    }
  };

  const handleDecision = (userClaimFound: boolean) => {
    const correct = userClaimFound === currentRound.exists;

    if (correct) {
      soundManager.playCalcSuccess();
      setStatus('round_completed');
      if (currentRound.exists) {
        setFeedback('Correct! The search stopped when the target was found.');
      } else {
        setFeedback('Correct! Linear Search checked every element and reached the end without finding the target.');
      }
      onScoreUpdate(40);
      onStreakUpdate(roundIndex + 1);
    } else {
      soundManager.playError();
      setFeedback(
        currentRound.exists
          ? 'Incorrect: The target was present in the array.'
          : 'Incorrect: The search reached the end without finding the target (Target Not Found).'
      );
    }
  };

  const handleNextRound = () => {
    if (roundIndex < rounds.length - 1) {
      soundManager.playSelect();
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      setPointer(0);
      setComparisons(0);
      setStatus('searching');
      setFeedback(`Round ${nextIdx + 1}: Search for target ${rounds[nextIdx].target}.`);
    } else {
      soundManager.playLevelVictory();
      onLevelComplete(3, 100);
    }
  };

  const getGuidedSolveExplanation = () => {
    if (status === 'round_completed') {
      if (roundIndex < rounds.length - 1) {
        return `Round ${roundIndex + 1} completed! Click Next Step to proceed to Round ${roundIndex + 2}.`;
      }
      return `All rounds completed! Linear search successfully distinguished target found vs target absent.`;
    }
    if (status === 'decision_needed') {
      if (currentRound.exists) {
        return `Target ${currentRound.target} was found at index ${pointer}! Confirm by selecting "Target Found".`;
      }
      return `Linear search checked all ${currentRound.array.length} elements without finding ${currentRound.target}. Confirm "Target Not Found".`;
    }
    const val = currentRound.array[pointer];
    if (val === currentRound.target) {
      return `Index ${pointer} equals target ${currentRound.target}! Target located.`;
    }
    if (pointer >= currentRound.array.length - 1) {
      return `Checking final element at index ${pointer} (${val} ≠ ${currentRound.target}). End of array reached.`;
    }
    return `Checking index ${pointer} (value ${val}). Since ${val} ≠ ${currentRound.target}, Linear Search advances to index ${pointer + 1}.`;
  };

  const handleGuidedNextStep = () => {
    if (status === 'searching') {
      handleCheck();
    } else if (status === 'decision_needed') {
      handleDecision(currentRound.exists);
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
              Search For:{' '}
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
                id="btn-lvl3-start-guided-solve"
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
              stepNumber={
                status === 'round_completed'
                  ? comparisons + 2
                  : status === 'decision_needed'
                  ? comparisons + 1
                  : pointer + 1
              }
              totalSteps={currentRound.exists ? currentRound.foundIndex + 2 : currentRound.array.length + 2}
              explanation={getGuidedSolveExplanation()}
              isComplete={isAllRoundsComplete}
              nextButtonLabel={
                status === 'searching'
                  ? `Compare [${pointer}] with ${currentRound.target}`
                  : status === 'decision_needed'
                  ? currentRound.exists
                    ? 'Confirm: Target Found'
                    : 'Confirm: Target Not Found'
                  : roundIndex < rounds.length - 1
                  ? `Proceed to Round ${roundIndex + 2}`
                  : 'Complete Level 3'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Interactive Array Grid */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
            <span>Array Elements ({currentRound.array.length} items)</span>
            <span className="text-[#2563EB] dark:text-[#3B82F6]">Pointer: Index {pointer}</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3">
            {currentRound.array.map((val, idx) => {
              const isChecked = idx < pointer || (idx === pointer && (isDecisionPhase || isRoundDone));
              const isCurrent = idx === pointer && !isDecisionPhase && !isRoundDone;
              const isMatch = val === currentRound.target && (isDecisionPhase || isRoundDone);
              const isMismatch = isChecked && !isMatch;

              return (
                <button
                  key={idx}
                  id={`lvl3-array-cell-${idx}`}
                  onClick={() => handleCheck(idx)}
                  disabled={isDecisionPhase || isRoundDone || idx < pointer}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 select-none ${isMatch
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
                  <span className="text-lg sm:text-xl font-bold font-mono">{val}</span>
                  <div className="mt-1.5 text-[9px] font-mono font-bold">
                    {isMatch ? (
                      <span className="text-emerald-600 dark:text-emerald-400">FOUND</span>
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

        {/* Decision Prompt Section */}
        {isDecisionPhase && (
          <div className="mt-6 p-4 sm:p-5 bg-[#EFF6FF]/70 dark:bg-blue-950/40 border border-[#DBEAFE] dark:border-blue-500/30 rounded-xl space-y-3 animate-fadeIn">
            <div className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono tracking-wider">
              Result Decision: What is the search outcome?
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              Based on the sequential scan of the array, identify the correct result:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                id="btn-lvl3-decision-found"
                onClick={() => handleDecision(true)}
                className="btn-modern-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>TARGET FOUND</span>
              </button>
              <button
                id="btn-lvl3-decision-not-found"
                onClick={() => handleDecision(false)}
                className="btn-modern-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:border-rose-400"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>TARGET NOT FOUND</span>
              </button>
            </div>
          </div>
        )}

        {/* Status & Next Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{feedback}</span>
          </div>

          {status === 'searching' && (
            <button
              id="btn-lvl3-check-next"
              onClick={() => handleCheck()}
              className="btn-modern-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
            >
              <span>
                Compare [{pointer}] with {currentRound.target}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isRoundDone && (
            <button
              id="btn-lvl3-next-round"
              onClick={handleNextRound}
              className="btn-modern-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center"
            >
              <span>{isAllRoundsComplete ? 'Complete Level 3' : 'Next Round'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

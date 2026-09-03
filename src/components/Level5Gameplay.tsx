import React, { useState } from 'react';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';

interface Level5Challenge {
  id: number;
  title: string;
  tag: string;
  array: number[];
  target: number;
  expectedComparisons: number;
  isAbsent?: boolean;
}

interface Level5GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level5Gameplay: React.FC<Level5GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  const challenges: Level5Challenge[] = [
    { id: 1, title: 'Challenge 1: Sequential Traversal', tag: 'GENERAL SEARCH', array: [18, 42, 7, 31, 65], target: 31, expectedComparisons: 4 },
    { id: 2, title: 'Challenge 2: Best Case Look-Up', tag: 'BEST CASE O(1)', array: [72, 14, 38, 51, 90], target: 72, expectedComparisons: 1 },
    { id: 3, title: 'Challenge 3: Late Target Scan', tag: 'LATE TARGET', array: [11, 24, 37, 48, 59, 63], target: 63, expectedComparisons: 6 },
    { id: 4, title: 'Challenge 4: Absent Target Handling', tag: 'TARGET ABSENT O(n)', array: [13, 26, 39, 52, 65], target: 40, expectedComparisons: 5, isAbsent: true },
  ];

  const [phase, setPhase] = useState<'challenges' | 'final_master'>('challenges');
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [pointer, setPointer] = useState<number>(0);
  const [comparisons, setComparisons] = useState<number>(0);
  const [status, setStatus] = useState<'searching' | 'challenge_completed'>('searching');
  const [feedback, setFeedback] = useState<string>('Execute the Linear Search sequence.');
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  // Final Master Challenge
  const finalMasterArray = [23, 41, 12, 67, 35, 89, 54];
  const finalMasterTarget = 35;
  const [masterPointer, setMasterPointer] = useState<number>(0);
  const [masterComparisons, setMasterComparisons] = useState<number>(0);
  const [masterStatus, setMasterStatus] = useState<'searching' | 'completed'>('searching');

  const currentChallenge = challenges[challengeIndex];

  // Challenge check
  const handleCheck = (clickedIndex?: number) => {
    if (status !== 'searching') return;

    if (clickedIndex !== undefined && clickedIndex !== pointer) {
      soundManager.playError();
      setFeedback('Linear Search must check elements sequentially from left to right.');
      return;
    }

    const currentVal = currentChallenge.array[pointer];
    const nextComparisons = comparisons + 1;
    setComparisons(nextComparisons);

    if (currentVal === currentChallenge.target) {
      soundManager.playCalcSuccess();
      setStatus('challenge_completed');
      setFeedback(`✓ Target ${currentChallenge.target} found in ${nextComparisons} comparison${nextComparisons > 1 ? 's' : ''}!`);
      onScoreUpdate(30);
      onStreakUpdate(challengeIndex + 1);
    } else if (pointer >= currentChallenge.array.length - 1) {
      soundManager.playClick();
      setStatus('challenge_completed');
      setFeedback(`✓ Checked all ${nextComparisons} elements: Target ${currentChallenge.target} NOT FOUND.`);
      onScoreUpdate(30);
      onStreakUpdate(challengeIndex + 1);
    } else {
      soundManager.playClick();
      setPointer((prev) => prev + 1);
      setFeedback(`${currentVal} ≠ ${currentChallenge.target}. Checking next element...`);
    }
  };

  const handleNextChallenge = () => {
    if (challengeIndex < challenges.length - 1) {
      soundManager.playSelect();
      const nextIdx = challengeIndex + 1;
      setChallengeIndex(nextIdx);
      setPointer(0);
      setComparisons(0);
      setStatus('searching');
      setFeedback(`Challenge ${nextIdx + 1}: ${challenges[nextIdx].title}`);
    } else {
      soundManager.playSelect();
      setPhase('final_master');
    }
  };

  const handleMasterCheck = (clickedIndex?: number) => {
    if (masterStatus !== 'searching') return;

    if (clickedIndex !== undefined && clickedIndex !== masterPointer) {
      soundManager.playError();
      return;
    }

    const currentVal = finalMasterArray[masterPointer];
    const nextComparisons = masterComparisons + 1;
    setMasterComparisons(nextComparisons);

    if (currentVal === finalMasterTarget) {
      soundManager.playCalcSuccess();
      setMasterStatus('completed');
      onScoreUpdate(50);
      onStreakUpdate(5);
    } else {
      soundManager.playClick();
      setMasterPointer((prev) => prev + 1);
    }
  };

  const handleMasterComplete = () => {
    soundManager.playLevelVictory();
    onLevelComplete(5, 100);
  };

  const getGuidedSolveExplanation = () => {
    if (phase === 'challenges') {
      if (status === 'challenge_completed') {
        if (challengeIndex < challenges.length - 1) {
          return `Challenge ${challengeIndex + 1} complete! Click Next Step to proceed to Challenge ${challengeIndex + 2}.`;
        }
        return `All 4 challenges completed! Click Next Step to unlock the Final Master Challenge.`;
      }
      const val = currentChallenge.array[pointer];
      if (val === currentChallenge.target) {
        return `Index ${pointer} contains target ${currentChallenge.target}! Target reached.`;
      }
      if (pointer >= currentChallenge.array.length - 1) {
        return `Checking final index ${pointer} (${val} ≠ ${currentChallenge.target}). Target is absent.`;
      }
      return `Checking index ${pointer} (${val} ≠ ${currentChallenge.target}). Linear Search advances to index ${pointer + 1}.`;
    } else {
      if (masterStatus === 'completed') {
        return `Final Master Challenge completed! Target ${finalMasterTarget} found at index 4. Level 5 complete!`;
      }
      const val = finalMasterArray[masterPointer];
      if (val === finalMasterTarget) {
        return `Index ${masterPointer} has value ${val}, matching target ${finalMasterTarget}! Match found.`;
      }
      return `Checking master index ${masterPointer} (${val} ≠ ${finalMasterTarget}). Linear Search checks index ${masterPointer + 1}.`;
    }
  };

  const handleGuidedNextStep = () => {
    if (phase === 'challenges') {
      if (status === 'searching') {
        handleCheck();
      } else {
        handleNextChallenge();
      }
    } else {
      if (masterStatus === 'searching') {
        handleMasterCheck();
      } else {
        handleMasterComplete();
      }
    }
  };

  // 1. Progressive Challenges Phase
  if (phase === 'challenges') {
    const isChallengeDone = status === 'challenge_completed';

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#2563EB] dark:bg-[#3B82F6] text-white rounded-lg text-xs font-bold font-mono">
                CHALLENGE {challengeIndex + 1} OF 4
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] rounded-md border border-[#DBEAFE] dark:border-blue-500/30 uppercase font-mono">
                {currentChallenge.tag}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">COMPARISONS:</span>
                <span className="px-3 py-1 bg-[#2563EB] dark:bg-[#3B82F6] text-white rounded-lg font-bold text-sm shadow-xs animate-scale">
                  {comparisons}
                </span>
              </div>

              {!isGuidedSolveActive && (
                <button
                  id="btn-lvl5-start-guided-solve"
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
                stepNumber={isChallengeDone ? comparisons + 2 : pointer + 1}
                explanation={getGuidedSolveExplanation()}
                isComplete={false}
                nextButtonLabel={
                  status === 'searching'
                    ? `Compare [${pointer}] with ${currentChallenge.target}`
                    : challengeIndex < challenges.length - 1
                    ? `Proceed to Challenge ${challengeIndex + 2}`
                    : 'Enter Final Master Challenge'
                }
                onNextStep={handleGuidedNextStep}
                onStop={() => setIsGuidedSolveActive(false)}
              />
            </div>
          )}

          <div className="pt-4 pb-2 flex items-center justify-between">
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Target: <span className="font-mono text-[#2563EB] dark:text-[#3B82F6] text-lg font-extrabold px-2 py-0.5 bg-[#EFF6FF] dark:bg-blue-900/40 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">{currentChallenge.target}</span>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Pointer: Index {pointer}
            </div>
          </div>

          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {currentChallenge.array.map((val, idx) => {
                const isChecked = idx < pointer || (idx === pointer && isChallengeDone);
                const isCurrent = idx === pointer && !isChallengeDone;
                const isMatch = val === currentChallenge.target && isChallengeDone;
                const isMismatch = isChecked && !isMatch;

                return (
                  <button
                    key={idx}
                    id={`l5-c${challengeIndex}-cell-${idx}`}
                    onClick={() => handleCheck(idx)}
                    disabled={isChallengeDone || idx < pointer}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 select-none ${
                      isMatch
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
                    <div className="mt-1 text-[9px] font-mono font-bold">
                      {isMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400">FOUND ✓</span>
                      ) : isMismatch ? (
                        <span className="text-slate-400">≠ {currentChallenge.target}</span>
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

          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 mb-4">
            {feedback}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-blue-500/15">
            {!isChallengeDone ? (
              <button
                id="btn-l5-check-next"
                onClick={() => handleCheck()}
                className="btn-modern-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Compare [{pointer}] with {currentChallenge.target}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-l5-next-challenge"
                onClick={handleNextChallenge}
                className="btn-modern-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm animate-bounce"
              >
                <span>{challengeIndex < challenges.length - 1 ? `Proceed to Challenge ${challengeIndex + 2}` : 'Proceed to Final Master Challenge'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Final Master Challenge Phase (Game Only)
  if (phase === 'final_master') {
    const isMasterFinished = masterStatus === 'completed';

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold font-mono shadow-xs">
                FINAL MASTER CHALLENGE
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Target: <span className="font-mono text-[#2563EB] dark:text-[#3B82F6] text-lg font-extrabold px-2 py-0.5 bg-[#EFF6FF] dark:bg-blue-900/40 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">{finalMasterTarget}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">COMPARISONS:</span>
                <span className="px-3 py-1 bg-[#2563EB] dark:bg-[#3B82F6] text-white rounded-lg font-bold text-sm shadow-xs animate-scale">
                  {masterComparisons}
                </span>
              </div>

              {!isGuidedSolveActive && !isMasterFinished && (
                <button
                  id="btn-master-start-guided-solve"
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

          {/* Guided Solve Step-by-Step Panel for Master Challenge */}
          {isGuidedSolveActive && (
            <div className="pt-2">
              <GuidedSolvePanel
                stepNumber={isMasterFinished ? 6 : masterPointer + 1}
                totalSteps={6}
                explanation={getGuidedSolveExplanation()}
                isComplete={isMasterFinished}
                nextButtonLabel={
                  !isMasterFinished
                    ? `Compare [${masterPointer}] with ${finalMasterTarget}`
                    : 'Complete Level 5'
                }
                onNextStep={handleGuidedNextStep}
                onStop={() => setIsGuidedSolveActive(false)}
              />
            </div>
          )}

          <div className="pt-2">
            <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Array Sequence: [23, 41, 12, 67, 35, 89, 54]</span>
              <span className="text-[#2563EB] dark:text-[#3B82F6]">Pointer: Index {masterPointer}</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
              {finalMasterArray.map((val, idx) => {
                const isChecked = idx < masterPointer || (idx === masterPointer && isMasterFinished);
                const isCurrent = idx === masterPointer && !isMasterFinished;
                const isMatch = val === finalMasterTarget && isMasterFinished;
                const isMismatch = isChecked && !isMatch;

                return (
                  <button
                    key={idx}
                    id={`master-array-cell-${idx}`}
                    onClick={() => handleMasterCheck(idx)}
                    disabled={isMasterFinished || idx < masterPointer}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 select-none ${
                      isMatch
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
                    <div className="mt-1 text-[9px] font-mono font-bold">
                      {isMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400">FOUND ✓</span>
                      ) : isMismatch ? (
                        <span className="text-slate-400">≠ {finalMasterTarget}</span>
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

          {/* Audit Results */}
          {isMasterFinished && (
            <div className="p-5 bg-[#EFF6FF]/60 dark:bg-blue-950/40 border border-[#DBEAFE] dark:border-blue-500/30 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono tracking-wider">
                <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Search Audit Results</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-blue-500/20">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Status</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">TARGET FOUND</span>
                </div>
                <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-blue-500/20">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Comparisons</span>
                  <span className="text-sm font-extrabold text-[#2563EB] dark:text-[#3B82F6]">5</span>
                </div>
                <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-blue-500/20">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Position</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">5 (Index 4)</span>
                </div>
                <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-blue-500/20">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Search Type</span>
                  <span className="text-sm font-extrabold text-[#2563EB] dark:text-[#3B82F6]">SUCCESSFUL</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              {!isMasterFinished ? 'Click each element in sequence to complete the search.' : 'Search complete! Master challenge verified.'}
            </div>

            {!isMasterFinished ? (
              <button
                id="btn-master-check-next"
                onClick={() => handleMasterCheck()}
                className="btn-modern-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Compare [{masterPointer}] with {finalMasterTarget}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-complete-level-5"
                onClick={() => {
                  soundManager.playLevelVictory();
                  onLevelComplete(5, 100);
                }}
                className="btn-modern-primary bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md animate-bounce"
              >
                <Award className="w-4 h-4" />
                <span>Complete Level 5</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

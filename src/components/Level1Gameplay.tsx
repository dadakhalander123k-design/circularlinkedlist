import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Check, Lightbulb, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';

interface Level1GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level1Gameplay: React.FC<Level1GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  const array = [12, 25, 7, 18, 30];
  const target = 7;
  const [pointer, setPointer] = useState<number>(0);
  const [searchPath, setSearchPath] = useState<number[]>([]);
  const [isFound, setIsFound] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>(
    'Click the first element or "Compare Element" to start sequential search.'
  );
  const [hasGuidanceError, setHasGuidanceError] = useState<boolean>(false);
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  const handleCheck = (clickedIndex?: number) => {
    if (isFound) return;

    if (clickedIndex !== undefined && clickedIndex !== pointer) {
      soundManager.playError();
      setHasGuidanceError(true);
      setFeedback('Linear Search must start from the first element and check sequentially!');
      setTimeout(() => setHasGuidanceError(false), 2000);
      return;
    }

    const currentVal = array[pointer];
    const newPath = [...searchPath, currentVal];
    setSearchPath(newPath);

    if (currentVal === target) {
      soundManager.playCalcSuccess();
      setIsFound(true);
      setFeedback(`Target ${target} found at index ${pointer}! (3 comparisons)`);
      onScoreUpdate(50);
      onStreakUpdate(1);
    } else {
      soundManager.playClick();
      setPointer((prev) => prev + 1);
      setFeedback(`${currentVal} ≠ ${target}. Moving to next element (index ${pointer + 1})...`);
    }
  };

  const handleComplete = () => {
    soundManager.playLevelVictory();
    onLevelComplete(1, 100);
  };

  const getGuidedSolveExplanation = () => {
    if (isFound) {
      return `Target ${target} has been found at index 2 after 3 comparisons. Linear search is complete!`;
    }
    if (pointer === 0) {
      return `Start at index 0. Linear Search always starts from the first element of the array. Compare ${array[0]} with target ${target}.`;
    }
    if (pointer === 1) {
      return `Since 12 ≠ ${target}, the pointer moves to index 1. Now compare element ${array[1]} with target ${target}.`;
    }
    if (pointer === 2) {
      return `25 ≠ ${target}, so the search advances to index 2. Here, element ${array[2]} equals target ${target}! Search succeeded.`;
    }
    return `Compare element at index ${pointer} with target ${target}.`;
  };

  const handleGuidedNextStep = () => {
    if (!isFound) {
      handleCheck();
    } else {
      handleComplete();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              MISSION
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Find target number{' '}
              <span className="font-mono text-[#2563EB] dark:text-[#3B82F6] text-lg font-extrabold px-2 py-0.5 bg-[#EFF6FF] dark:bg-blue-900/40 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">
                {target}
              </span>{' '}
              in the array
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-300">
              <span>Comparisons:</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/30 rounded-md font-bold text-slate-900 dark:text-white">
                {searchPath.length}
              </span>
            </div>

            {!isGuidedSolveActive && !isFound && (
              <button
                id="btn-lvl1-start-guided-solve"
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
              stepNumber={isFound ? 4 : pointer + 1}
              totalSteps={4}
              explanation={getGuidedSolveExplanation()}
              isComplete={isFound}
              nextButtonLabel={isFound ? 'Complete Level 1' : `Compare [${pointer}] with ${target}`}
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Interactive Array Grid */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
            <span>Array Elements (Click current active slot to compare)</span>
            <span className="text-[#2563EB] dark:text-[#3B82F6]">Pointer: Index {pointer}</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {array.map((val, idx) => {
              const isChecked = idx < pointer || (idx === pointer && isFound);
              const isCurrent = idx === pointer && !isFound;
              const isMatch = val === target && isFound && idx === pointer;
              const isMismatch = isChecked && !isMatch;

              return (
                <button
                  key={idx}
                  id={`lvl1-array-cell-${idx}`}
                  onClick={() => handleCheck(idx)}
                  disabled={isFound || idx < pointer}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-xl border-2 transition-all duration-200 select-none ${isMatch
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-md scale-105 ring-4 ring-emerald-500/20'
                      : isMismatch
                        ? 'bg-slate-50 dark:bg-[#0F172A] border-slate-300 dark:border-blue-500/20 text-slate-400 dark:text-slate-500 opacity-80'
                        : isCurrent
                          ? `bg-[#EFF6FF]/70 dark:bg-blue-950/40 border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-white shadow-md scale-105 ring-4 ring-blue-500/20 cursor-pointer ${hasGuidanceError ? 'animate-shake border-rose-500' : ''
                          }`
                          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-blue-500/40 cursor-not-allowed opacity-60'
                    }`}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                    [{idx}]
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono">{val}</span>
                  <div className="mt-2 text-[10px] font-mono font-bold flex items-center gap-1">
                    {isMatch ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> MATCH
                      </span>
                    ) : isMismatch ? (
                      <span className="text-slate-400 dark:text-slate-500">≠ {target}</span>
                    ) : isCurrent ? (
                      <span className="text-[#2563EB] dark:text-[#3B82F6] animate-pulse">CURRENT</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">UNCHECKED</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button & Live Feedback */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{feedback}</span>
          </div>

          {!isFound ? (
            <button
              id="btn-lvl1-check-next"
              onClick={() => handleCheck()}
              className="btn-modern-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
            >
              <span>
                Compare [{pointer}] with {target}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-lvl1-complete"
              onClick={handleComplete}
              className="btn-modern-primary bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Level 1</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Path Breadcrumb */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 shadow-xs">
        <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Search Path Sequence
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          {searchPath.length === 0 ? (
            <span className="text-slate-400 text-xs italic">Search has not started yet.</span>
          ) : (
            searchPath.map((item, i) => {
              const isLast = i === searchPath.length - 1;
              const isTargetItem = item === target;
              return (
                <React.Fragment key={i}>
                  <span
                    className={`px-3 py-1 rounded-lg border font-bold ${isTargetItem
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-[#0F172A] border-slate-200 dark:border-blue-500/30 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {item} {isTargetItem && '✓'}
                  </span>
                  {!isLast && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                </React.Fragment>
              );
            })
          )}
        </div>

        {isFound && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-blue-500/15 text-xs text-slate-600 dark:text-slate-300 bg-[#EFF6FF]/50 dark:bg-blue-950/30 p-3 rounded-xl border border-[#DBEAFE] dark:border-blue-500/20">
            <strong className="text-[#2563EB] dark:text-[#3B82F6] font-semibold block mb-1">
              Key Concept Learned:
            </strong>
            "Linear Search checks elements sequentially, starting from the first element, until the target is found."
          </div>
        )}
      </div>
    </div>
  );
};

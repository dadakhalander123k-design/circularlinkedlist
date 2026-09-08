import React from 'react';
import { Check, Circle, Star, Trophy, Layers, Lock } from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { soundManager } from '../utils/audio';

interface LevelProgressBarProps {
  currentLevelId: number;
  completedLevels: number[];
  onSelectLevel: (levelId: number) => void;
  onOpenLab?: () => void;
  isCompletionActive?: boolean;
  onBackToSelection?: () => void;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  currentLevelId,
  completedLevels,
  onSelectLevel,
  onOpenLab,
  isCompletionActive = false,
  onBackToSelection,
}) => {
  const pState = progressManager.getState();

  const steps = [
    { id: 1, code: '01', name: 'Build Circle' },
    { id: 2, code: '02', name: 'Traverse' },
    { id: 3, code: '03', name: 'Insert' },
    { id: 4, code: '04', name: 'Delete' },
    { id: 5, code: '05', name: 'Master' },
  ];

  const isAllQuestCompleted = [1, 2, 3, 4, 5].every(
    (id) => completedLevels.includes(id) || pState.levelsCompleted.includes(id)
  );
  const isLevel6Active = (currentLevelId === 6 || isCompletionActive) && isAllQuestCompleted;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex flex-col items-center">
      {onBackToSelection && (
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <button
            id="btn-stepper-back-to-levels"
            onClick={() => {
              soundManager.playSelect();
              onBackToSelection();
            }}
            className="btn-modern-secondary px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
          >
            <span>← All Levels</span>
          </button>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Level {currentLevelId <= 5 ? `0${currentLevelId}` : '06'} of 05
          </span>
        </div>
      )}

      <div className="w-full flex items-center justify-between relative font-sans">
        {/* Connecting Line */}
        <div className="absolute left-6 right-6 top-4.5 h-[2px] bg-slate-200 dark:bg-blue-500/25 -z-0" />

        {steps.map((step) => {
          const isMastered = pState.levelsMastered.includes(step.id);
          const isCompleted = completedLevels.includes(step.id) || pState.levelsCompleted.includes(step.id) || isMastered;
          const isUnlocked =
            step.id === 1 ||
            completedLevels.includes(step.id - 1) ||
            pState.levelsCompleted.includes(step.id - 1) ||
            isCompleted;
          const isCurrent = currentLevelId === step.id && !isLevel6Active;

          return (
            <button
              key={step.id}
              id={`step-progress-node-${step.id}`}
              onClick={() => {
                if (!isUnlocked) {
                  soundManager.playError();
                  return;
                }
                soundManager.playSelect();
                onSelectLevel(step.id);
              }}
              disabled={!isUnlocked}
              title={isUnlocked ? `Level ${step.code}: ${step.name}` : `Locked: Complete Level 0${step.id - 1} to unlock`}
              aria-disabled={!isUnlocked}
              className={`group flex flex-col items-center gap-2 relative z-10 focus:outline-hidden ${
                isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${isCurrent
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-[#2563EB] dark:border-[#3B82F6] shadow-md ring-4 ring-blue-100 dark:ring-blue-500/20 scale-110'
                    : isCompleted
                      ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#3B82F6] border-[#2563EB] dark:border-[#3B82F6] shadow-xs hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40'
                      : 'bg-white dark:bg-[#0F172A] text-slate-400 dark:text-slate-500 border-slate-300 dark:border-blue-500/30 hover:border-slate-400 dark:hover:border-blue-400'
                  }`}
              >
                {isMastered ? (
                  <Star className="w-4 h-4 fill-[#2563EB] text-[#2563EB] dark:fill-[#3B82F6] dark:text-[#3B82F6]" />
                ) : isCompleted ? (
                  <Check className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] stroke-[3]" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                )}
              </div>

              <div className="text-center">
                <span className={`text-[10px] font-mono font-bold block ${isCurrent ? 'text-[#2563EB] dark:text-[#3B82F6]' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.code}
                </span>
                <span
                  className={`text-[11px] font-semibold hidden sm:block max-w-[85px] leading-tight transition-colors ${isCurrent
                      ? 'text-[#2563EB] dark:text-[#3B82F6] font-bold'
                      : isCompleted
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {step.name}
                </span>
              </div>
            </button>
          );
        })}

        {/* Completion Step Node */}
        <button
          id="step-progress-node-completion"
          onClick={() => {
            if (!isAllQuestCompleted) {
              soundManager.playError();
              return;
            }
            soundManager.playSelect();
            onSelectLevel(6);
          }}
          disabled={!isAllQuestCompleted}
          className={`group flex flex-col items-center gap-2 relative z-10 focus:outline-hidden ${
            isAllQuestCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-85'
          }`}
          title={isAllQuestCompleted ? 'Completion Milestone' : 'Locked: Complete Levels 01–05 to unlock'}
          aria-disabled={!isAllQuestCompleted}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
              isLevel6Active
                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-4 ring-amber-100 dark:ring-amber-500/20 scale-110'
                : isAllQuestCompleted
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-500 dark:border-amber-400 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  : 'bg-slate-100 dark:bg-[#0F172A] text-slate-400 dark:text-slate-500 border-slate-300 dark:border-blue-500/30'
            }`}
          >
            {isAllQuestCompleted ? (
              <Trophy className={`w-4 h-4 ${isLevel6Active ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <div className="text-center">
            <span
              className={`text-[10px] font-mono font-bold block ${
                isLevel6Active
                  ? 'text-amber-600 dark:text-amber-400'
                  : isAllQuestCompleted
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              06
            </span>
            <span
              className={`text-[11px] font-semibold hidden sm:block max-w-[85px] leading-tight transition-colors ${
                isLevel6Active
                  ? 'text-amber-700 dark:text-amber-300 font-bold'
                  : isAllQuestCompleted
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              Completion
            </span>
          </div>
        </button>
      </div>

      {/* Optional Lab Action immediately below completion/progress section */}
      {(isLevel6Active || isAllQuestCompleted) && onOpenLab && (
        <div className="mt-4 pt-2 flex justify-center animate-fadeIn">
          <button
            id="btn-stepper-open-lab"
            onClick={() => {
              soundManager.playSelect();
              onOpenLab();
            }}
            className="btn-modern-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all"
            title="Open Interactive Lab (Optional)"
          >
            <Layers className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>LAB</span>
          </button>
        </div>
      )}
    </div>
  );
};

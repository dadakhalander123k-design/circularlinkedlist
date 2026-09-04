import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, StopCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';

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
  // Phase progression: 'sequential_traversal' -> 'stopping_decision' -> 'infinite_loop_demo' -> 'completed'
  const [phase, setPhase] = useState<'sequential_traversal' | 'stopping_decision' | 'infinite_loop_demo' | 'completed'>(
    'sequential_traversal'
  );

  const nodeValues = [10, 20, 30, 40];
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [visitedIndices, setVisitedIndices] = useState<number[]>([0]);
  const [feedback, setFeedback] = useState<string>(
    'CURRENT pointer starts at HEAD (Node [10]). Click "Advance CURRENT" to traverse the circle.'
  );

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<number>(1);

  // Infinite loop demo state
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [loopCycleCount, setLoopCycleCount] = useState<number>(0);
  const [loopCurrentIdx, setLoopCurrentIdx] = useState<number>(0);
  const [hasStoppedLoop, setHasStoppedLoop] = useState<boolean>(false);

  // Traversal Visual nodes
  const visualNodes: VisualNodeData[] = nodeValues.map((val, idx) => ({
    id: `l2-node-${idx}`,
    value: val,
    nextId: `l2-node-${(idx + 1) % nodeValues.length}`,
    isHead: idx === 0,
    isCurrent: phase === 'infinite_loop_demo' ? idx === loopCurrentIdx : idx === currentIdx,
    isVisited: visitedIndices.includes(idx),
    customBadge: idx === 0 ? 'START / HEAD' : undefined,
  }));

  // Advance CURRENT pointer sequentially
  const handleAdvanceCurrent = () => {
    if (phase !== 'sequential_traversal') return;

    soundManager.playClick();
    const nextIdx = (currentIdx + 1) % nodeValues.length;

    if (currentIdx === 3 && nextIdx === 0) {
      // Reached HEAD again! Stopping decision triggered
      setCurrentIdx(0);
      setVisitedIndices((prev) => [...prev, 0]);
      setPhase('stopping_decision');
      setFeedback('CURRENT followed the tail pointer and returned to HEAD (Node [10]). Choose your action:');
      onScoreUpdate(10);
      onStreakUpdate(4);
      setGuidedStep(4);
    } else {
      setCurrentIdx(nextIdx);
      setVisitedIndices((prev) => Array.from(new Set([...prev, nextIdx])));
      setFeedback(`CURRENT advanced to Node [${nodeValues[nextIdx]}]. Following NEXT pointer.`);
      onScoreUpdate(10);
      onStreakUpdate(visitedIndices.length);
      setGuidedStep(Math.min(3, visitedIndices.length + 1));
    }
  };

  // Handle stopping decision at HEAD
  const handleStoppingDecision = (decision: 'CONTINUE' | 'STOP') => {
    if (decision === 'STOP') {
      soundManager.playCalcSuccess();
      setPhase('infinite_loop_demo');
      setIsLooping(true);
      setFeedback('Great! Now witness what happens without a stopping condition, and engage the emergency brake.');
      onScoreUpdate(20);
      onStreakUpdate(5);
      setGuidedStep(5);
    } else {
      soundManager.playClick();
      setPhase('infinite_loop_demo');
      setIsLooping(true);
      setFeedback('Looping without a stopping condition causes an infinite loop! Engage the brake to stop it.');
    }
  };

  // Infinite loop simulation effect
  useEffect(() => {
    if (phase !== 'infinite_loop_demo' || hasStoppedLoop) return;

    const interval = setInterval(() => {
      setLoopCurrentIdx((prev) => {
        const nxt = (prev + 1) % nodeValues.length;
        if (nxt === 0) {
          setLoopCycleCount((c) => c + 1);
        }
        return nxt;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [phase, hasStoppedLoop, nodeValues.length]);

  // Handle engaging brake on infinite loop
  const handleStopInfiniteLoop = () => {
    soundManager.playCalcSuccess();
    setHasStoppedLoop(true);
    setIsLooping(false);
    setFeedback('✓ Stopping condition engaged! Traversal halted successfully.');
    onScoreUpdate(25);
    setTimeout(() => {
      setPhase('completed');
      soundManager.playLevelVictory();
    }, 1200);
  };

  // Guided solve explanation
  const getGuidedSolveExplanation = () => {
    switch (guidedStep) {
      case 1:
        return 'Start at HEAD: Traversal begins by initializing CURRENT = HEAD (Node [10]).';
      case 2:
        return 'Advance to Second Node: Follow Node [10]\'s NEXT pointer. CURRENT moves to Node [20].';
      case 3:
        return 'Advance Sequentially: Visit Node [30], then Node [40].';
      case 4:
        return 'Return to Start: The last node [40] points back to [10]. When CURRENT returns to HEAD, STOP traversal.';
      case 5:
        return 'Prevent Infinite Loops: In the loop demo, click "Engage Stopping Condition (STOP)" to halt endless cycling.';
      default:
        return 'Level 2 complete! You mastered circular traversal.';
    }
  };

  const handleGuidedNextStep = () => {
    if (phase === 'sequential_traversal') {
      handleAdvanceCurrent();
    } else if (phase === 'stopping_decision') {
      handleStoppingDecision('STOP');
    } else if (phase === 'infinite_loop_demo') {
      handleStopInfiniteLoop();
    } else if (phase === 'completed') {
      onLevelComplete(2, 100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Mission Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              GAMEPLAY
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Traverse the Circular Linked List & Stop at HEAD
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && phase !== 'completed' && (
              <button
                id="btn-lvl2-start-guided-solve"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsGuidedSolveActive(true);
                }}
                className="btn-modern-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs select-none"
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
              stepNumber={guidedStep}
              totalSteps={5}
              explanation={getGuidedSolveExplanation()}
              isComplete={phase === 'completed'}
              nextButtonLabel={
                phase === 'completed'
                  ? 'Complete Level 2'
                  : phase === 'stopping_decision'
                  ? 'Stop Traversal'
                  : phase === 'infinite_loop_demo'
                  ? 'Engage Stop'
                  : 'Advance CURRENT'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Circular Linked List Visualization */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Circular Structure</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
              CURRENT: Node [{nodeValues[phase === 'infinite_loop_demo' ? loopCurrentIdx : currentIdx]}]
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-3">
            <CLLCanvas
              nodes={visualNodes}
              headId="l2-node-0"
              currentId={`l2-node-${phase === 'infinite_loop_demo' ? loopCurrentIdx : currentIdx}`}
              onNodeClick={(id) => {
                if (phase === 'sequential_traversal') {
                  const idx = parseInt(id.replace('l2-node-', ''), 10);
                  if (idx === (currentIdx + 1) % nodeValues.length) {
                    handleAdvanceCurrent();
                  }
                }
              }}
              isAnimatingLoop={phase === 'infinite_loop_demo' && !hasStoppedLoop}
            />
          </div>
        </div>

        {/* Traversal Controls during sequential visiting */}
        {phase === 'sequential_traversal' && (
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                {feedback}
              </p>
            </div>
            <button
              id="btn-advance-traversal"
              onClick={handleAdvanceCurrent}
              className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Advance CURRENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Stopping Decision Card */}
        {phase === 'stopping_decision' && (
          <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-500/40 animate-scale-enter space-y-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Back at HEAD: Stopping Condition Reached</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Every node in the circle has now been visited once. Choose your action:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleStoppingDecision('CONTINUE')}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-amber-400 hover:bg-amber-50 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                Continue Without Stopping (Watch Loop)
              </button>

              <button
                onClick={() => handleStoppingDecision('STOP')}
                className="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 transition-all cursor-pointer shadow-xs"
              >
                ✓ STOP Traversal (Completed 1 Full Cycle)
              </button>
            </div>
          </div>
        )}

        {/* Infinite Loop Interactive Demo & Brake */}
        {phase === 'infinite_loop_demo' && (
          <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/40 space-y-4 animate-scale-enter">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-bounce" />
                <span>Infinite Loop Risk Demonstration</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-rose-200/80 dark:bg-rose-900/60 font-mono text-xs font-bold text-rose-900 dark:text-rose-200">
                Cycle: {loopCycleCount}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Without an explicit stopping condition, traversal cycles endlessly. Hit <strong>STOPPING CONDITION</strong> to brake the infinite loop!
            </p>

            <div className="pt-2">
              <button
                onClick={handleStopInfiniteLoop}
                disabled={hasStoppedLoop}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <StopCircle className="w-4 h-4" />
                <span>{hasStoppedLoop ? 'Loop Broken Successfully' : 'Engage Stopping Condition (STOP)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Level Complete Final Card */}
        {phase === 'completed' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-3 animate-page-enter">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              Level Complete!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
              Excellent work. You successfully traversed the circular linked list and engaged the stopping condition at HEAD.
            </p>
            <button
              onClick={() => onLevelComplete(2, 100)}
              className="btn-modern-primary px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
            >
              Next Level
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

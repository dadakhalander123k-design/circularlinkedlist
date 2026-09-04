import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';

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
  // Phase progression: 'connecting' -> 'animating_circle' -> 'completed'
  const [phase, setPhase] = useState<'connecting' | 'animating_circle' | 'completed'>('connecting');

  // Node connection state: 4 values [10, 20, 30, 40]
  const [connections, setConnections] = useState<Record<number, number | null>>({
    0: null, // 10.next
    1: null, // 20.next
    2: null, // 30.next
    3: null, // 40.next
  });

  const [activeFromIndex, setActiveFromIndex] = useState<number | null>(0);
  const [feedback, setFeedback] = useState<string>(
    'Connect Node [10] to Node [20] by clicking Node [20] or "Connect Next".'
  );
  const [isAnimatingLoop, setIsAnimatingLoop] = useState<boolean>(false);
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<number>(1);

  const nodeValues = [10, 20, 30, 40];

  // Visual nodes mapper
  const visualNodes: VisualNodeData[] = nodeValues.map((val, idx) => {
    const nextIdx = connections[idx];
    return {
      id: `l1-node-${idx}`,
      value: val,
      nextId: nextIdx !== null ? `l1-node-${nextIdx}` : null,
      isHead: idx === 0,
      isCurrent: activeFromIndex === idx,
      isSelected: activeFromIndex === idx,
      isVisited: nextIdx !== null,
      customBadge: idx === 0 ? 'START / HEAD' : idx === 3 ? 'TAIL' : undefined,
    };
  });

  // Handle clicking a node to connect NEXT pointer
  const handleNodeClick = (clickedIdx: number) => {
    if (phase !== 'connecting') return;

    if (activeFromIndex === null) {
      setActiveFromIndex(clickedIdx);
      setFeedback(`Selected Node [${nodeValues[clickedIdx]}]. Now click the destination node.`);
      return;
    }

    const from = activeFromIndex;
    const to = clickedIdx;

    if (from === 0 && to === 1) {
      soundManager.playClick();
      setConnections((prev) => ({ ...prev, 0: 1 }));
      setActiveFromIndex(1);
      setFeedback('Great! [10] → [20]. Now connect Node [20] to Node [30].');
      onScoreUpdate(10);
      onStreakUpdate(1);
      setGuidedStep(3);
    } else if (from === 1 && to === 2) {
      soundManager.playClick();
      setConnections((prev) => ({ ...prev, 1: 2 }));
      setActiveFromIndex(2);
      setFeedback('Excellent! [20] → [30]. Now connect Node [30] to Node [40].');
      onScoreUpdate(10);
      onStreakUpdate(2);
      setGuidedStep(4);
    } else if (from === 2 && to === 3) {
      soundManager.playClick();
      setConnections((prev) => ({ ...prev, 2: 3 }));
      setActiveFromIndex(3);
      setFeedback('Complete the circle: Connect the last node [40] back to HEAD [10].');
      onScoreUpdate(10);
      onStreakUpdate(3);
      setGuidedStep(5);
    } else if (from === 3 && to === 0) {
      soundManager.playCalcSuccess();
      setConnections((prev) => ({ ...prev, 3: 0 }));
      setActiveFromIndex(null);
      setPhase('animating_circle');
      setIsAnimatingLoop(true);
      setFeedback("✓ Correct Circular Connection! You're going around the circle: 10 → 20 → 30 → 40 → 10!");
      onScoreUpdate(20);
      onStreakUpdate(4);

      setTimeout(() => {
        setIsAnimatingLoop(false);
        setPhase('completed');
        soundManager.playLevelVictory();
      }, 2200);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      if (from === 3) {
        setFeedback('A Circular Linked List does not end at NULL. Connect the last node [40] back to HEAD [10]!');
      } else {
        setFeedback(`In sequential order, Node [${nodeValues[from]}] should point to Node [${nodeValues[from + 1]}].`);
      }
    }
  };

  // Guided Solve logic
  const getGuidedSolveExplanation = () => {
    switch (guidedStep) {
      case 1:
        return 'Identify HEAD: In a Circular Linked List, HEAD points to the starting node (Node [10]).';
      case 2:
        return 'Connect First Node: Link Node [10]\'s NEXT pointer forward to Node [20]: 10 → 20.';
      case 3:
        return 'Continue Chaining: Click Node [30] to create the pointer link from Node [20] to Node [30].';
      case 4:
        return 'Reach the Tail: Click Node [40] to link Node [30] → [40]. Now Node [40] is the last node.';
      case 5:
        return 'Complete the Circle: Connect Node [40] back to HEAD [10]. Unlike a singly linked list ending in NULL, a circular list loops back to the start!';
      default:
        return 'Level 1 complete! You successfully built the circular linked list.';
    }
  };

  const handleGuidedNextStep = () => {
    if (guidedStep === 1 || guidedStep === 2) {
      handleNodeClick(1);
    } else if (guidedStep === 3) {
      handleNodeClick(2);
    } else if (guidedStep === 4) {
      handleNodeClick(3);
    } else if (guidedStep === 5) {
      handleNodeClick(0);
    } else if (phase === 'completed') {
      onLevelComplete(1, 100);
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
              Build the Circular Linked List:{' '}
              <span className="font-mono text-[#2563EB] dark:text-[#3B82F6] font-extrabold">
                HEAD → 10 → 20 → 30 → 40 → HEAD
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && phase !== 'completed' && (
              <button
                id="btn-lvl1-start-guided-solve"
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
                  ? 'Complete Level 1'
                  : guidedStep === 5
                  ? 'Connect 40 → HEAD'
                  : `Connect to Node [${nodeValues[guidedStep]}]`
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Interactive CLL Canvas */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Linked Nodes (Click destination node to establish NEXT pointer)</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
              HEAD: Node [10]
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-3">
            <CLLCanvas
              nodes={visualNodes}
              headId="l1-node-0"
              currentId={activeFromIndex !== null ? `l1-node-${activeFromIndex}` : null}
              onNodeClick={(id) => {
                const idx = parseInt(id.replace('l1-node-', ''), 10);
                handleNodeClick(idx);
              }}
              isAnimatingLoop={isAnimatingLoop}
            />
          </div>
        </div>

        {/* Interactive Action Control */}
        {phase === 'connecting' && (
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                {feedback}
              </p>
            </div>
            <button
              onClick={() => {
                if (activeFromIndex !== null) {
                  if (activeFromIndex < 3) {
                    handleNodeClick(activeFromIndex + 1);
                  } else {
                    handleNodeClick(0);
                  }
                }
              }}
              className="btn-modern-primary px-4 py-2 text-xs font-bold shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>{activeFromIndex === 3 ? 'Connect 40 → HEAD [10]' : 'Connect Next Node'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Animating Circle Celebration Banner */}
        {phase === 'animating_circle' && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center animate-pulse">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {feedback}
            </p>
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
              Excellent work. You successfully built the circular linked list: HEAD → 10 → 20 → 30 → 40 → HEAD.
            </p>
            <button
              onClick={() => onLevelComplete(1, 100)}
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

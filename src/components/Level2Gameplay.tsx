import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, StopCircle, Cpu } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';
import { CLLMemoryBar } from './cll/CLLMemoryBar';

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

  const nodeSpecs = [
    { addr: 1000, val: 10, nextAddr: 1002 },
    { addr: 1002, val: 20, nextAddr: 1004 },
    { addr: 1004, val: 30, nextAddr: 1006 },
    { addr: 1006, val: 40, nextAddr: 1000 },
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [visitedIndices, setVisitedIndices] = useState<number[]>([0]);
  const [feedback, setFeedback] = useState<string>(
    'CURRENT starts at address 1000. Its NEXT field contains address 1002. Click "Follow NEXT Address".'
  );

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<number>(1);

  // Infinite loop demo state
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [loopCycleCount, setLoopCycleCount] = useState<number>(0);
  const [loopCurrentIdx, setLoopCurrentIdx] = useState<number>(0);
  const [hasStoppedLoop, setHasStoppedLoop] = useState<boolean>(false);

  const currentNode = nodeSpecs[phase === 'infinite_loop_demo' ? loopCurrentIdx : currentIdx];

  // Visual nodes mapper with addresses
  const visualNodes: VisualNodeData[] = nodeSpecs.map((spec, idx) => ({
    id: `l2-node-${spec.addr}`,
    address: spec.addr,
    value: spec.val,
    nextId: `l2-node-${spec.nextAddr}`,
    nextAddress: spec.nextAddr,
    isHead: spec.addr === 1000,
    isTail: spec.addr === 1006,
    isCurrent: (phase === 'infinite_loop_demo' ? loopCurrentIdx : currentIdx) === idx,
    isVisited: visitedIndices.includes(idx),
    customBadge: spec.addr === 1000 ? 'START / HEAD' : spec.addr === 1006 ? 'TAIL' : undefined,
  }));

  // Advance CURRENT pointer sequentially
  const handleAdvanceCurrent = () => {
    if (phase !== 'sequential_traversal') return;

    soundManager.playClick();
    const nextIdx = (currentIdx + 1) % nodeSpecs.length;

    if (currentIdx === 3 && nextIdx === 0) {
      // Reached HEAD again! Stopping decision triggered
      setCurrentIdx(0);
      setVisitedIndices((prev) => [...prev, 0]);
      setPhase('stopping_decision');
      setFeedback('CURRENT followed tail address 1006 back to HEAD address 1000. Stopping condition reached!');
      onScoreUpdate(10);
      onStreakUpdate(4);
      setGuidedStep(4);
    } else {
      setCurrentIdx(nextIdx);
      setVisitedIndices((prev) => Array.from(new Set([...prev, nextIdx])));
      setFeedback(
        `CURRENT dereferenced NEXT address ${nodeSpecs[currentIdx].nextAddr}: now at address ${nodeSpecs[nextIdx].addr}.`
      );
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
      setFeedback('Great! Now witness what happens without an address check, and engage the emergency brake.');
      onScoreUpdate(20);
      onStreakUpdate(5);
      setGuidedStep(5);
    } else {
      soundManager.playClick();
      setPhase('infinite_loop_demo');
      setIsLooping(true);
      setFeedback('Cycling through addresses without stopping creates an endless loop! Engage the brake to halt it.');
    }
  };

  // Infinite loop simulation effect
  useEffect(() => {
    if (phase !== 'infinite_loop_demo' || hasStoppedLoop) return;

    const interval = setInterval(() => {
      setLoopCurrentIdx((prev) => {
        const nxt = (prev + 1) % nodeSpecs.length;
        if (nxt === 0) {
          setLoopCycleCount((c) => c + 1);
        }
        return nxt;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [phase, hasStoppedLoop, nodeSpecs.length]);

  // Handle engaging brake on infinite loop
  const handleStopInfiniteLoop = () => {
    soundManager.playCalcSuccess();
    setHasStoppedLoop(true);
    setIsLooping(false);
    setFeedback('✓ Stopping condition engaged: if (current.nextAddress === headAddress) break;');
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
        return 'Initialize CURRENT: CURRENT is initialized with HEAD address (1000). Address 1000 holds data 10 and points to address 1002.';
      case 2:
        return 'Follow NEXT Address: Reading node 1000\'s NEXT field directs traversal to memory address 1002.';
      case 3:
        return 'Traverse Remaining Addresses: Follow address 1002 → 1004, then 1004 → 1006.';
      case 4:
        return 'Return to HEAD Address: Tail node 1006 holds NEXT address 1000. CURRENT returns to HEAD address 1000. Stop traversal!';
      case 5:
        return 'Brake Infinite Loop: In the demo, click "Engage Stopping Condition" to stop endless address cycling.';
      default:
        return 'Level 2 complete! You mastered address-based circular traversal.';
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
              LEVEL 2: TRAVERSAL
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Follow Memory Addresses & Detect Return to HEAD Address
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
                  : 'Follow NEXT Address'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Memory Pointer Registers Bar */}
        <div className="pt-4 pb-2">
          <CLLMemoryBar
            headAddress={1000}
            tailAddress={1006}
            tailNextAddress={1000}
            validAddresses={nodeSpecs.map((n) => n.addr)}
          />
        </div>

        {/* Current Node Address Inspector Box */}
        <div className="my-2 p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">CURRENT POINTER:</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-bold text-amber-900 dark:text-amber-200">
              ADDR: {currentNode.addr}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
              DATA: {currentNode.val}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 font-bold text-blue-800 dark:text-blue-200">
              NEXT: {currentNode.nextAddr}
            </span>
          </div>

          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            Dereferencing: Node [{currentNode.val}] holds address {currentNode.nextAddr}
          </div>
        </div>

        {/* Circular Linked List Visualization */}
        <div className="pt-2 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Circular Structure</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
              CURRENT → [ {currentNode.addr} ]
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-2">
            <CLLCanvas
              nodes={visualNodes}
              headId="l2-node-1000"
              tailId="l2-node-1006"
              currentId={`l2-node-${currentNode.addr}`}
              onNodeClick={(id) => {
                if (phase === 'sequential_traversal') {
                  const addr = parseInt(id.replace('l2-node-', ''), 10);
                  if (addr === currentNode.nextAddr) {
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
              <span>Follow NEXT Address ({currentNode.nextAddr})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Stopping Decision Card */}
        {phase === 'stopping_decision' && (
          <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-500/40 animate-scale-enter space-y-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Back at HEAD Address: Stopping Condition Met</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              CURRENT has completed a full loop and returned to HEAD (address 1000). Choose your action:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleStoppingDecision('CONTINUE')}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-amber-400 hover:bg-amber-50 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                Continue Without Stopping (Demo Endless Loop)
              </button>

              <button
                onClick={() => handleStoppingDecision('STOP')}
                className="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 transition-all cursor-pointer shadow-xs"
              >
                ✓ STOP Traversal (Completed 1 Full Cycle at 1000)
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
                <span>Infinite Loop Risk: No Address-Check Stopping Condition!</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-rose-200/80 dark:bg-rose-900/60 font-mono text-xs font-bold text-rose-900 dark:text-rose-200">
                Cycle: {loopCycleCount}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Without checking when <code>current.nextAddress === headAddress</code>, traversal cycles through addresses indefinitely. Hit <strong>STOPPING CONDITION</strong> to brake!
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
              Excellent work. You verified that traversal dereferences the NEXT memory address at each step, and stops when returning to the HEAD address (1000).
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

import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';
import { CLLMemoryBar } from './cll/CLLMemoryBar';

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

  // Node addresses: 1000, 1002, 1004, 1006
  const nodeSpecs = [
    { addr: 1000, val: 10 },
    { addr: 1002, val: 20 },
    { addr: 1004, val: 30 },
    { addr: 1006, val: 40 },
  ];

  const [headAddress, setHeadAddress] = useState<number | null>(1000);
  const [tailAddress, setTailAddress] = useState<number | null>(1006);

  // Address-to-target NEXT address mapping
  const [nextAddresses, setNextAddresses] = useState<Record<number, number | null>>({
    1000: null,
    1002: null,
    1004: null,
    1006: null,
  });

  const [activeFromAddr, setActiveFromAddr] = useState<number | null>(1000);
  const [feedback, setFeedback] = useState<string>(
    'Set NEXT for Node at address 1000 to 1002 (type address or click Node [20]).'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnimatingLoop, setIsAnimatingLoop] = useState<boolean>(false);
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<number>(1);

  // Visual nodes mapper with addresses
  const visualNodes: VisualNodeData[] = nodeSpecs.map((spec) => {
    const targetAddr = nextAddresses[spec.addr];
    const targetNode = nodeSpecs.find((n) => n.addr === targetAddr);

    return {
      id: `l1-node-${spec.addr}`,
      address: spec.addr,
      value: spec.val,
      nextId: targetNode ? `l1-node-${targetNode.addr}` : null,
      nextAddress: targetAddr,
      isHead: spec.addr === headAddress,
      isTail: spec.addr === tailAddress,
      isCurrent: activeFromAddr === spec.addr,
      isSelected: activeFromAddr === spec.addr,
      isVisited: targetAddr !== null,
      customBadge: spec.addr === 1000 ? 'START' : spec.addr === 1006 ? 'TAIL' : undefined,
    };
  });

  // Handle address connection (used both for typed address and node clicks)
  const applyConnection = (fromAddr: number, targetAddr: number) => {
    setErrorMessage(null);

    // 1. Check if target address exists
    const validTarget = nodeSpecs.find((n) => n.addr === targetAddr);
    if (!validTarget) {
      soundManager.playError();
      onScoreUpdate(-2);
      setErrorMessage(`Address ${targetAddr} does not belong to any node.`);
      return;
    }

    // 2. Validate current objective sequence
    if (fromAddr === 1000) {
      if (targetAddr === 1002) {
        soundManager.playClick();
        setNextAddresses((prev) => ({ ...prev, 1000: 1002 }));
        setActiveFromAddr(1002);
        setFeedback('Great! 1000 → 1002. Now set NEXT for Node 1002 to address 1004.');
        onScoreUpdate(10);
        onStreakUpdate(1);
        setGuidedStep(3);
      } else {
        soundManager.playError();
        onScoreUpdate(-2);
        setErrorMessage(
          `${targetAddr} is a valid node address, but node 1000 must connect sequentially to address 1002.`
        );
      }
    } else if (fromAddr === 1002) {
      if (targetAddr === 1004) {
        soundManager.playClick();
        setNextAddresses((prev) => ({ ...prev, 1002: 1004 }));
        setActiveFromAddr(1004);
        setFeedback('Excellent! 1002 → 1004. Now set NEXT for Node 1004 to address 1006.');
        onScoreUpdate(10);
        onStreakUpdate(2);
        setGuidedStep(4);
      } else {
        soundManager.playError();
        onScoreUpdate(-2);
        setErrorMessage(
          `${targetAddr} is a valid node address, but node 1002 must connect to address 1004.`
        );
      }
    } else if (fromAddr === 1004) {
      if (targetAddr === 1006) {
        soundManager.playClick();
        setNextAddresses((prev) => ({ ...prev, 1004: 1006 }));
        setActiveFromAddr(1006);
        setFeedback('Crucial Step: Complete the circle by setting NEXT for last node 1006 to HEAD address (1000).');
        onScoreUpdate(10);
        onStreakUpdate(3);
        setGuidedStep(5);
      } else {
        soundManager.playError();
        onScoreUpdate(-2);
        setErrorMessage(
          `${targetAddr} is a valid node address, but node 1004 must connect to address 1006.`
        );
      }
    } else if (fromAddr === 1006) {
      if (targetAddr === 1000) {
        soundManager.playCalcSuccess();
        setNextAddresses((prev) => ({ ...prev, 1006: 1000 }));
        setActiveFromAddr(null);
        setPhase('animating_circle');
        setIsAnimatingLoop(true);
        setFeedback(
          "✓ Circular connection established! Node 1006 NEXT stores HEAD address 1000: 1000 → 1002 → 1004 → 1006 → 1000."
        );
        onScoreUpdate(25);
        onStreakUpdate(4);

        setTimeout(() => {
          setIsAnimatingLoop(false);
          setPhase('completed');
          soundManager.playLevelVictory();
        }, 2200);
      } else {
        soundManager.playError();
        onScoreUpdate(-2);
        setErrorMessage(
          `A Circular Linked List does not end with NULL or middle nodes. Connect the tail node (1006) to HEAD address (1000)!`
        );
      }
    }
  };

  // Node click handler
  const handleNodeClick = (nodeId: string) => {
    if (phase !== 'connecting') return;
    const clickedAddr = parseInt(nodeId.replace('l1-node-', ''), 10);

    if (activeFromAddr === null) {
      setActiveFromAddr(clickedAddr);
      setFeedback(`Selected Node at address ${clickedAddr}. Enter or click destination address.`);
      return;
    }

    applyConnection(activeFromAddr, clickedAddr);
  };

  // Guided Solve logic
  const getGuidedSolveExplanation = () => {
    switch (guidedStep) {
      case 1:
        return 'Identify HEAD: Node [10] is located at memory address 1000. HEAD stores address 1000.';
      case 2:
        return 'Connect Node 1000: Node 1000 stores the address of the next node (1002) in its NEXT field: 1000 → 1002.';
      case 3:
        return 'Connect Node 1002: Set Node 1002\'s NEXT field to address 1004: 1002 → 1004.';
      case 4:
        return 'Reach the Tail: Set Node 1004\'s NEXT field to address 1006: 1004 → 1006.';
      case 5:
        return 'Complete the Circle: The last node at address 1006 must store the address of HEAD (1000) in its NEXT field. TAIL.NEXT = 1000.';
      default:
        return 'Level 1 complete! You successfully built the circular linked list using memory addresses.';
    }
  };

  const handleGuidedNextStep = () => {
    if (guidedStep === 1 || guidedStep === 2) {
      applyConnection(1000, 1002);
    } else if (guidedStep === 3) {
      applyConnection(1002, 1004);
    } else if (guidedStep === 4) {
      applyConnection(1004, 1006);
    } else if (guidedStep === 5) {
      applyConnection(1006, 1000);
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
              LEVEL 1: MEMORY POINTERS
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Build Circular Connections Using Addresses: 1000 → 1002 → 1004 → 1006 → 1000
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
                  ? 'Connect 1006 → 1000'
                  : `Connect ${nodeSpecs[guidedStep - 1].addr} → ${nodeSpecs[guidedStep].addr}`
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Memory Pointer Registers Bar */}
        <div className="pt-4 pb-2">
          <CLLMemoryBar
            headAddress={headAddress}
            tailAddress={tailAddress}
            tailNextAddress={nextAddresses[1006]}
            validAddresses={nodeSpecs.map((n) => n.addr)}
            onSetHeadAddress={(addr) => {
              if (nodeSpecs.some((n) => n.addr === addr)) {
                setHeadAddress(addr);
              } else {
                setErrorMessage(`Cannot set HEAD: Address ${addr} does not exist.`);
              }
            }}
            onSetTailAddress={(addr) => {
              if (nodeSpecs.some((n) => n.addr === addr)) {
                setTailAddress(addr);
              } else {
                setErrorMessage(`Cannot set TAIL: Address ${addr} does not exist.`);
              }
            }}
          />
        </div>

        {/* Interactive CLL Canvas with Addresses */}
        <div className="pt-2 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Memory Nodes (Click node or edit NEXT field to enter target address)</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
              HEAD: [ {headAddress} ]
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-2">
            <CLLCanvas
              nodes={visualNodes}
              headId={headAddress ? `l1-node-${headAddress}` : null}
              tailId={tailAddress ? `l1-node-${tailAddress}` : null}
              currentId={activeFromAddr !== null ? `l1-node-${activeFromAddr}` : null}
              onNodeClick={handleNodeClick}
              onApplyNextAddress={(from, target) => applyConnection(from, target)}
              isAnimatingLoop={isAnimatingLoop}
            />
          </div>
        </div>

        {/* Error Feedback Banner if invalid address entered */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        {phase === 'connecting' && (
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                {feedback}
              </p>
            </div>
            <button
              onClick={() => {
                if (activeFromAddr === 1000) applyConnection(1000, 1002);
                else if (activeFromAddr === 1002) applyConnection(1002, 1004);
                else if (activeFromAddr === 1004) applyConnection(1004, 1006);
                else if (activeFromAddr === 1006) applyConnection(1006, 1000);
              }}
              className="btn-modern-primary px-4 py-2 text-xs font-bold shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>
                {activeFromAddr === 1006 ? 'Connect 1006.NEXT → 1000 (HEAD)' : 'Connect Next Pointer'}
              </span>
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
              Excellent work. You verified that every node is stored at an ADDRESS, and each NEXT pointer stores the ADDRESS of the following node, closing the circle with TAIL.NEXT = HEAD (1006 → 1000).
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

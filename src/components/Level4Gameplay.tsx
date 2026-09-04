import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Trash2, Sparkles, AlertCircle, RefreshCw, Link as LinkIcon, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';
import { CLLMemoryBar } from './cll/CLLMemoryBar';

interface Level4GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level4Gameplay: React.FC<Level4GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  // 3 progressive stages: 'partA_beginning' -> 'partB_end' -> 'partC_position' -> 'completed'
  const [stage, setStage] = useState<'partA_beginning' | 'partB_end' | 'partC_position' | 'completed'>('partA_beginning');

  // Sub-step within each stage (1: step 1, 2: step 2, 3: step 3, 4: complete stage)
  const [subStep, setSubStep] = useState<number>(1);

  // Inputs for interactive step operations
  const [stepInput, setStepInput] = useState<string>('');
  const [mistakeText, setMistakeText] = useState<string | null>(null);

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  // -------------------------------------------------------------
  // PART A: Initial [1000: 10, 1002: 20, 1004: 30, 1006: 40]
  // Mode 1: Delete HEAD (1000)
  // Step 1: TAIL.NEXT = 1002 (HEAD.NEXT)
  // Step 2: HEAD = 1002 (TAIL.NEXT)
  // Step 3: Delete old HEAD (1000)
  // -------------------------------------------------------------
  const [partAHead, setPartAHead] = useState<number>(1000);
  const [partATail, setPartATail] = useState<number>(1006);
  const [partANodes, setPartANodes] = useState<VisualNodeData[]>([
    { id: 'da-1000', address: 1000, value: 10, nextId: 'da-1002', nextAddress: 1002, isHead: true, customBadge: 'TARGET (HEAD)' },
    { id: 'da-1002', address: 1002, value: 20, nextId: 'da-1004', nextAddress: 1004, customBadge: 'NEXT HEAD' },
    { id: 'da-1004', address: 1004, value: 30, nextId: 'da-1006', nextAddress: 1006 },
    { id: 'da-1006', address: 1006, value: 40, nextId: 'da-1000', nextAddress: 1000, isTail: true, customBadge: 'TAIL' },
  ]);

  // -------------------------------------------------------------
  // PART B: Initial [1000: 10, 1002: 20, 1004: 30, 1006: 40]
  // Mode 2: Delete TAIL (1006)
  // Step 1: TAIL = 1004 (Previous Node)
  // Step 2: TAIL.NEXT = 1000 (HEAD)
  // Step 3: Delete old TAIL (1006)
  // -------------------------------------------------------------
  const [partBHead, setPartBHead] = useState<number>(1000);
  const [partBTail, setPartBTail] = useState<number>(1006);
  const [partBNodes, setPartBNodes] = useState<VisualNodeData[]>([
    { id: 'db-1000', address: 1000, value: 10, nextId: 'db-1002', nextAddress: 1002, isHead: true },
    { id: 'db-1002', address: 1002, value: 20, nextId: 'db-1004', nextAddress: 1004 },
    { id: 'db-1004', address: 1004, value: 30, nextId: 'db-1006', nextAddress: 1006, customBadge: 'PREV NODE' },
    { id: 'db-1006', address: 1006, value: 40, nextId: 'db-1000', nextAddress: 1000, isTail: true, customBadge: 'TARGET (TAIL)' },
  ]);

  // -------------------------------------------------------------
  // PART C: Initial [1000: 10, 1002: 20, 1004: 30, 1006: 40]
  // Mode 3: Delete Middle (1004)
  // Step 1: Identify target node (1004)
  // Step 2: Bypass target: 1002.NEXT = 1006
  // Step 3: Delete target node (1004)
  // -------------------------------------------------------------
  const [partCHead, setPartCHead] = useState<number>(1000);
  const [partCTail, setPartCTail] = useState<number>(1006);
  const [partCTarget, setPartCTarget] = useState<number | null>(null);
  const [partCNodes, setPartCNodes] = useState<VisualNodeData[]>([
    { id: 'dc-1000', address: 1000, value: 10, nextId: 'dc-1002', nextAddress: 1002, isHead: true },
    { id: 'dc-1002', address: 1002, value: 20, nextId: 'dc-1004', nextAddress: 1004 },
    { id: 'dc-1004', address: 1004, value: 30, nextId: 'dc-1006', nextAddress: 1006 },
    { id: 'dc-1006', address: 1006, value: 40, nextId: 'dc-1000', nextAddress: 1000, isTail: true },
  ]);

  // Helper getters for current active stage
  const getCurrentNodes = (): VisualNodeData[] => {
    if (stage === 'partA_beginning') return partANodes;
    if (stage === 'partB_end') return partBNodes;
    return partCNodes;
  };

  const getCurrentHead = (): number => {
    if (stage === 'partA_beginning') return partAHead;
    if (stage === 'partB_end') return partBHead;
    return partCHead;
  };

  const getCurrentTail = (): number => {
    if (stage === 'partA_beginning') return partATail;
    if (stage === 'partB_end') return partBTail;
    return partCTail;
  };

  // Feedback text dynamically calculated from current stage and substep
  const getFeedbackMessage = (): string => {
    if (stage === 'partA_beginning') {
      if (subStep === 1)
        return 'Step 1: Set TAIL.NEXT to HEAD.NEXT. Tail [40] (1006) currently loops to 1000. Enter 1002 so 1006.NEXT points to 1002.';
      if (subStep === 2)
        return 'Step 2: Move HEAD. Enter 1002 into the HEAD register so HEAD points to the new first node (1002).';
      if (subStep === 3)
        return 'Step 3: Pointers rewired! Click "Delete Old HEAD" to remove node 1000 from memory.';
      return '✓ Part A Complete! HEAD node 1000 deleted. Structure: 1002 → 1004 → 1006 → 1002.';
    }
    if (stage === 'partB_end') {
      if (subStep === 1)
        return 'Step 1: Move TAIL to the previous node (1004). Enter 1004 into the TAIL address field.';
      if (subStep === 2)
        return 'Step 2: Reconnect new TAIL. Set 1004.NEXT to HEAD address (1000) to maintain circular link.';
      if (subStep === 3)
        return 'Step 3: Pointers rewired! Click "Delete Old TAIL" to remove node 1006 from memory.';
      return '✓ Part B Complete! Tail node 1006 deleted. Structure: 1000 → 1002 → 1004 → 1000.';
    }
    if (stage === 'partC_position') {
      if (subStep === 1)
        return 'Step 1: Enter the address of the node to delete (e.g. 1004) to identify Previous, Target, and Next.';
      if (subStep === 2)
        return 'Step 2: Bypass target! Update previous node 1002.NEXT to point directly to 1006 (prev.next = target.next).';
      if (subStep === 3)
        return 'Step 3: Node 1004 is unlinked! Click "Delete Target Node" to remove it from memory.';
      return '✓ Part C Complete! Node 1004 bypassed and deleted. Structure: 1000 → 1002 → 1006 → 1000.';
    }
    return 'Level 4 Completed!';
  };

  // -------------------------------------------------------------
  // MODE 1: DELETE HEAD (BEGINNING) STEP HANDLERS
  // -------------------------------------------------------------
  const handlePartAStep1_TailNext = (inputVal?: string) => {
    setMistakeText(null);
    const raw = (inputVal !== undefined ? inputVal : stepInput).trim();
    const num = parseInt(raw, 10);

    if (num !== 1002) {
      soundManager.playError();
      setMistakeText('TAIL.NEXT must point to HEAD.NEXT (address 1002) before HEAD is deleted.');
      return;
    }

    soundManager.playCalcSuccess();
    // 1006.NEXT = 1002
    setPartANodes((prev) =>
      prev.map((n) =>
        n.address === 1006
          ? { ...n, nextAddress: 1002, nextId: 'da-1002', customBadge: 'LOOPS TO 1002' }
          : n
      )
    );
    setStepInput('');
    setSubStep(2);
    onScoreUpdate(10);
    onStreakUpdate(1);
  };

  const handlePartAStep2_SetHead = (inputVal?: string) => {
    setMistakeText(null);
    const raw = (inputVal !== undefined ? inputVal : stepInput).trim();
    const num = parseInt(raw, 10);

    if (num !== 1002) {
      soundManager.playError();
      setMistakeText('HEAD must move to the new first node (address 1002).');
      return;
    }

    soundManager.playCalcSuccess();
    setPartAHead(1002);
    setPartANodes((prev) =>
      prev.map((n) => {
        if (n.address === 1002) return { ...n, isHead: true, customBadge: 'NEW HEAD' };
        if (n.address === 1000) return { ...n, isHead: false, customBadge: 'DETACHED (READY TO DELETE)' };
        return n;
      })
    );
    setStepInput('');
    setSubStep(3);
    onScoreUpdate(15);
    onStreakUpdate(2);
  };

  const handlePartAStep3_DeleteOldHead = () => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // Mark fading out
    setPartANodes((prev) =>
      prev.map((n) => (n.address === 1000 ? { ...n, isFadingOut: true, customBadge: 'DELETED' } : n))
    );

    // Completely remove node 1000 from the active array after short fade
    setTimeout(() => {
      setPartANodes((prev) => prev.filter((n) => n.address !== 1000));
    }, 400);

    setSubStep(4);
    onScoreUpdate(20);
    onStreakUpdate(3);
  };

  // -------------------------------------------------------------
  // MODE 2: DELETE TAIL (ENDING) STEP HANDLERS
  // -------------------------------------------------------------
  const handlePartBStep1_MoveTail = (inputVal?: string) => {
    setMistakeText(null);
    const raw = (inputVal !== undefined ? inputVal : stepInput).trim();
    const num = parseInt(raw, 10);

    if (num !== 1004) {
      soundManager.playError();
      setMistakeText('TAIL must move to the node immediately before the old tail (address 1004).');
      return;
    }

    soundManager.playCalcSuccess();
    setPartBTail(1004);
    setPartBNodes((prev) =>
      prev.map((n) => {
        if (n.address === 1004) return { ...n, isTail: true, customBadge: 'NEW TAIL' };
        if (n.address === 1006) return { ...n, isTail: false, customBadge: 'OLD TAIL (TO DELETE)' };
        return n;
      })
    );
    setStepInput('');
    setSubStep(2);
    onScoreUpdate(10);
    onStreakUpdate(4);
  };

  const handlePartBStep2_TailNext = (inputVal?: string) => {
    setMistakeText(null);
    const raw = (inputVal !== undefined ? inputVal : stepInput).trim();
    const num = parseInt(raw, 10);

    if (num !== 1000) {
      soundManager.playError();
      setMistakeText('TAIL.NEXT (1004.NEXT) must point back to HEAD (1000) to preserve the circular list.');
      return;
    }

    soundManager.playCalcSuccess();
    setPartBNodes((prev) =>
      prev.map((n) =>
        n.address === 1004
          ? { ...n, nextAddress: 1000, nextId: 'db-1000', customBadge: 'TAIL (LOOPS TO HEAD)' }
          : n
      )
    );
    setStepInput('');
    setSubStep(3);
    onScoreUpdate(15);
    onStreakUpdate(5);
  };

  const handlePartBStep3_DeleteOldTail = () => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    setPartBNodes((prev) =>
      prev.map((n) => (n.address === 1006 ? { ...n, isFadingOut: true, customBadge: 'DELETED' } : n))
    );

    setTimeout(() => {
      setPartBNodes((prev) => prev.filter((n) => n.address !== 1006));
    }, 400);

    setSubStep(4);
    onScoreUpdate(20);
    onStreakUpdate(6);
  };

  // -------------------------------------------------------------
  // MODE 3: DELETE ANY POSITION (MIDDLE) STEP HANDLERS
  // -------------------------------------------------------------
  const handlePartCStep1_IdentifyTarget = (inputVal?: string) => {
    setMistakeText(null);
    const raw = (inputVal !== undefined ? inputVal : stepInput).trim();
    const num = parseInt(raw, 10);

    if (num !== 1004) {
      soundManager.playError();
      setMistakeText('For this challenge, identify the middle node at address 1004.');
      return;
    }

    soundManager.playCalcSuccess();
    setPartCTarget(1004);
    setPartCNodes((prev) =>
      prev.map((n) => {
        if (n.address === 1002) return { ...n, isPrev: true, customBadge: 'PREVIOUS (1002)' };
        if (n.address === 1004) return { ...n, isTarget: true, customBadge: 'TARGET (1004)' };
        if (n.address === 1006) return { ...n, customBadge: 'NEXT NODE (1006)' };
        return n;
      })
    );
    setStepInput('');
    setSubStep(2);
    onScoreUpdate(10);
    onStreakUpdate(7);
  };

  const handlePartCStep2_BypassTarget = (inputVal?: string) => {
    setMistakeText(null);
    const raw = (inputVal !== undefined ? inputVal : stepInput).trim();
    const num = parseInt(raw, 10);

    if (num !== 1006) {
      soundManager.playError();
      setMistakeText('1002 must point to 1006 to bypass node 1004 (prev.next = target.next).');
      return;
    }

    soundManager.playCalcSuccess();
    setPartCNodes((prev) =>
      prev.map((n) => {
        if (n.address === 1002)
          return { ...n, nextAddress: 1006, nextId: 'dc-1006', customBadge: 'BYPASS → 1006' };
        if (n.address === 1004)
          return { ...n, customBadge: 'BYPASSED (READY TO DELETE)' };
        return n;
      })
    );
    setStepInput('');
    setSubStep(3);
    onScoreUpdate(15);
    onStreakUpdate(8);
  };

  const handlePartCStep3_DeleteTarget = () => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    setPartCNodes((prev) =>
      prev.map((n) => (n.address === 1004 ? { ...n, isFadingOut: true, customBadge: 'DELETED' } : n))
    );

    setTimeout(() => {
      setPartCNodes((prev) => prev.filter((n) => n.address !== 1004));
    }, 400);

    setSubStep(4);
    onScoreUpdate(25);
    onStreakUpdate(9);
    setTimeout(() => {
      setStage('completed');
      soundManager.playLevelVictory();
      onLevelComplete(4, 100);
    }, 1500);
  };

  // Canvas NEXT address edit callback
  const handleApplyNextAddress = (fromAddress: number, targetAddress: number) => {
    if (stage === 'partA_beginning' && subStep === 1) {
      if (fromAddress === 1006) {
        handlePartAStep1_TailNext(String(targetAddress));
      } else {
        setMistakeText('In Step 1, update tail 1006.NEXT to point to 1002.');
      }
    } else if (stage === 'partB_end' && subStep === 2) {
      if (fromAddress === 1004) {
        handlePartBStep2_TailNext(String(targetAddress));
      } else {
        setMistakeText('In Step 2, update new tail 1004.NEXT to point to HEAD (1000).');
      }
    } else if (stage === 'partC_position' && subStep === 2) {
      if (fromAddress === 1002) {
        handlePartCStep2_BypassTarget(String(targetAddress));
      } else {
        setMistakeText('In Step 2, update previous node 1002.NEXT to point to 1006.');
      }
    }
  };

  // Register bar setters
  const handleSetHead = (addr: number) => {
    if (stage === 'partA_beginning' && subStep === 2) {
      handlePartAStep2_SetHead(String(addr));
    } else {
      setPartAHead(addr);
      setPartANodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
    }
  };

  const handleSetTail = (addr: number) => {
    if (stage === 'partB_end' && subStep === 1) {
      handlePartBStep1_MoveTail(String(addr));
    } else {
      setPartBTail(addr);
      setPartBNodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
    }
  };

  // Guided Solve Step Progression
  const getGuidedSolveExplanation = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1)
        return 'Step 1: Set TAIL.NEXT to HEAD.NEXT. Tail [40] (1006) currently points to 1000. Set 1006.NEXT = 1002.';
      if (subStep === 2)
        return 'Step 2: Move HEAD. Set HEAD = 1002 so the list starts at the new first node.';
      if (subStep === 3)
        return 'Step 3: Delete old HEAD. Node 1000 is safely unlinked and can be deleted.';
      return 'Part A Complete! Click "Next Challenge" to proceed to ending deletion.';
    }
    if (stage === 'partB_end') {
      if (subStep === 1)
        return 'Step 1: Move TAIL to the previous node (1004). TAIL = 1004.';
      if (subStep === 2)
        return 'Step 2: Close the loop. Set 1004.NEXT = HEAD (1000).';
      if (subStep === 3)
        return 'Step 3: Delete old TAIL. Node 1006 is safely unlinked and can be deleted.';
      return 'Part B Complete! Click "Next Challenge" to proceed to middle node deletion.';
    }
    if (stage === 'partC_position') {
      if (subStep === 1)
        return 'Step 1: Identify middle target node at address 1004.';
      if (subStep === 2)
        return 'Step 2: Bypass target node: Set previous node 1002.NEXT = 1006 (prev.next = target.next).';
      if (subStep === 3)
        return 'Step 3: Delete target node. Node 1004 is unlinked and can be deleted from memory.';
      return 'Deletion mastery achieved across beginning, ending, and middle memory addresses!';
    }
    return 'Level 4 complete!';
  };

  const handleGuidedNextStep = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) handlePartAStep1_TailNext('1002');
      else if (subStep === 2) handlePartAStep2_SetHead('1002');
      else if (subStep === 3) handlePartAStep3_DeleteOldHead();
      else {
        setStage('partB_end');
        setSubStep(1);
        setStepInput('');
      }
    } else if (stage === 'partB_end') {
      if (subStep === 1) handlePartBStep1_MoveTail('1004');
      else if (subStep === 2) handlePartBStep2_TailNext('1000');
      else if (subStep === 3) handlePartBStep3_DeleteOldTail();
      else {
        setStage('partC_position');
        setSubStep(1);
        setStepInput('');
      }
    } else if (stage === 'partC_position') {
      if (subStep === 1) handlePartCStep1_IdentifyTarget('1004');
      else if (subStep === 2) handlePartCStep2_BypassTarget('1006');
      else if (subStep === 3) handlePartCStep3_DeleteTarget();
      else {
        onLevelComplete(4, 100);
      }
    } else if (stage === 'completed') {
      onLevelComplete(4, 100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Mission Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              {stage === 'partA_beginning'
                ? 'MODE 1: DELETE HEAD'
                : stage === 'partB_end'
                ? 'MODE 2: DELETE TAIL'
                : 'MODE 3: DELETE POSITION'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {stage === 'partA_beginning'
                ? 'Delete Beginning Node [10] (Address 1000)'
                : stage === 'partB_end'
                ? 'Delete Ending Node [40] (Address 1006)'
                : 'Bypass & Delete Middle Node [30] at Address 1004'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && stage !== 'completed' && (
              <button
                id="btn-lvl4-start-guided-solve"
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
              stepNumber={
                stage === 'partA_beginning'
                  ? subStep
                  : stage === 'partB_end'
                  ? 3 + subStep
                  : 6 + subStep
              }
              totalSteps={9}
              explanation={getGuidedSolveExplanation()}
              isComplete={stage === 'completed'}
              nextButtonLabel={
                stage === 'completed'
                  ? 'Complete Level 4'
                  : subStep === 4 && stage === 'partA_beginning'
                  ? 'Proceed to Mode 2'
                  : subStep === 4 && stage === 'partB_end'
                  ? 'Proceed to Mode 3'
                  : 'Execute Step'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Memory Pointer Registers Bar */}
        <div className="pt-4 pb-2">
          <CLLMemoryBar
            headAddress={getCurrentHead()}
            tailAddress={getCurrentTail()}
            tailNextAddress={
              getCurrentNodes().find((n) => n.address === getCurrentTail())?.nextAddress as number
            }
            validAddresses={getCurrentNodes().filter((n) => !n.isFadingOut).map((n) => n.address)}
            onSetHeadAddress={handleSetHead}
            onSetTailAddress={handleSetTail}
          />
        </div>

        {/* 3-Step Pointer Deletion Progress Indicator */}
        <div className="my-2 p-3 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200 dark:border-blue-500/20 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">PROGRESSION:</span>
            {stage === 'partA_beginning' && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  1. TAIL.NEXT = 1002
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  2. HEAD = 1002
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 3 ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  3. Delete Old HEAD
                </span>
              </div>
            )}
            {stage === 'partB_end' && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  1. TAIL = 1004
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  2. 1004.NEXT = 1000
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 3 ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  3. Delete Old TAIL
                </span>
              </div>
            )}
            {stage === 'partC_position' && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 1 ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  1. Identify Target (1004)
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  2. 1002.NEXT = 1006
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${subStep === 3 ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  3. Delete Target (1004)
                </span>
              </div>
            )}
          </div>

          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
            Invariant: TAIL.NEXT === HEAD
          </span>
        </div>

        {/* Canvas Display */}
        <div className="pt-2 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Pointer Wiring (Interactive memory nodes and pointer links)</span>
            <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
              Rule: prev.next = target.next
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-2">
            <CLLCanvas
              nodes={getCurrentNodes()}
              headId={
                getCurrentHead()
                  ? `${stage === 'partA_beginning' ? 'da' : stage === 'partB_end' ? 'db' : 'dc'}-${getCurrentHead()}`
                  : null
              }
              tailId={
                getCurrentTail()
                  ? `${stage === 'partA_beginning' ? 'da' : stage === 'partB_end' ? 'db' : 'dc'}-${getCurrentTail()}`
                  : null
              }
              onApplyNextAddress={handleApplyNextAddress}
            />
          </div>
        </div>

        {/* Interactive Step-by-Step Pointer Manipulation Panel */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-4 animate-scale-enter">
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {getFeedbackMessage()}
          </p>

          {/* MODE 1: DELETE HEAD (BEGINNING) CONTROLS */}
          {stage === 'partA_beginning' && (
            <div className="flex flex-wrap items-center gap-3">
              {subStep === 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    SET TAIL.NEXT (1006.NEXT):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">[</span>
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => {
                        setStepInput(e.target.value);
                        setMistakeText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePartAStep1_TailNext();
                        }
                      }}
                      placeholder="1002"
                      className="w-16 px-1.5 py-1 text-center font-bold bg-white dark:bg-[#111827] border border-blue-300 dark:border-blue-500/40 rounded text-blue-900 dark:text-blue-100 focus:outline-hidden"
                    />
                    <span className="text-slate-400">]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePartAStep1_TailNext()}
                    className="btn-modern-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Connect 1006.NEXT → 1002</span>
                  </button>
                </div>
              )}

              {subStep === 2 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    SET HEAD ADDRESS:
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">[</span>
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => {
                        setStepInput(e.target.value);
                        setMistakeText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePartAStep2_SetHead();
                        }
                      }}
                      placeholder="1002"
                      className="w-16 px-1.5 py-1 text-center font-bold bg-white dark:bg-[#111827] border border-blue-300 dark:border-blue-500/40 rounded text-blue-900 dark:text-blue-100 focus:outline-hidden"
                    />
                    <span className="text-slate-400">]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePartAStep2_SetHead()}
                    className="btn-modern-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set HEAD = 1002</span>
                  </button>
                </div>
              )}

              {subStep === 3 && (
                <button
                  type="button"
                  onClick={handlePartAStep3_DeleteOldHead}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-sm transition-transform"
                >
                  <Trash2 className="w-4 h-4 text-rose-200" />
                  <span>Delete Old HEAD Node (1000)</span>
                </button>
              )}

              {subStep === 4 && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partB_end');
                    setSubStep(1);
                    setStepInput('');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Mode 2 (Delete at End)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* MODE 2: DELETE TAIL (ENDING) CONTROLS */}
          {stage === 'partB_end' && (
            <div className="flex flex-wrap items-center gap-3">
              {subStep === 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    MOVE TAIL REGISTER TO PREVIOUS (1004):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">[</span>
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => {
                        setStepInput(e.target.value);
                        setMistakeText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePartBStep1_MoveTail();
                        }
                      }}
                      placeholder="1004"
                      className="w-16 px-1.5 py-1 text-center font-bold bg-white dark:bg-[#111827] border border-indigo-300 dark:border-indigo-500/40 rounded text-indigo-900 dark:text-indigo-100 focus:outline-hidden"
                    />
                    <span className="text-slate-400">]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePartBStep1_MoveTail()}
                    className="btn-modern-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set TAIL = 1004</span>
                  </button>
                </div>
              )}

              {subStep === 2 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    SET NEW TAIL.NEXT (1004.NEXT = HEAD):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">[</span>
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => {
                        setStepInput(e.target.value);
                        setMistakeText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePartBStep2_TailNext();
                        }
                      }}
                      placeholder="1000"
                      className="w-16 px-1.5 py-1 text-center font-bold bg-white dark:bg-[#111827] border border-blue-300 dark:border-blue-500/40 rounded text-blue-900 dark:text-blue-100 focus:outline-hidden"
                    />
                    <span className="text-slate-400">]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePartBStep2_TailNext()}
                    className="btn-modern-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Connect 1004.NEXT → 1000</span>
                  </button>
                </div>
              )}

              {subStep === 3 && (
                <button
                  type="button"
                  onClick={handlePartBStep3_DeleteOldTail}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-sm transition-transform"
                >
                  <Trash2 className="w-4 h-4 text-rose-200" />
                  <span>Delete Old TAIL Node (1006)</span>
                </button>
              )}

              {subStep === 4 && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partC_position');
                    setSubStep(1);
                    setStepInput('');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Mode 3 (Delete Position)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* MODE 3: DELETE ANY POSITION (MIDDLE) CONTROLS */}
          {stage === 'partC_position' && (
            <div className="flex flex-wrap items-center gap-3">
              {subStep === 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    TARGET NODE ADDRESS:
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">[</span>
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => {
                        setStepInput(e.target.value);
                        setMistakeText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePartCStep1_IdentifyTarget();
                        }
                      }}
                      placeholder="1004"
                      className="w-16 px-1.5 py-1 text-center font-bold bg-white dark:bg-[#111827] border border-purple-300 dark:border-purple-500/40 rounded text-purple-900 dark:text-purple-100 focus:outline-hidden"
                    />
                    <span className="text-slate-400">]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePartCStep1_IdentifyTarget()}
                    className="btn-modern-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Identify Target (1004)</span>
                  </button>
                </div>
              )}

              {subStep === 2 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    BYPASS TARGET: SET 1002.NEXT:
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">[</span>
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => {
                        setStepInput(e.target.value);
                        setMistakeText(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePartCStep2_BypassTarget();
                        }
                      }}
                      placeholder="1006"
                      className="w-16 px-1.5 py-1 text-center font-bold bg-white dark:bg-[#111827] border border-blue-300 dark:border-blue-500/40 rounded text-blue-900 dark:text-blue-100 focus:outline-hidden"
                    />
                    <span className="text-slate-400">]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePartCStep2_BypassTarget()}
                    className="btn-modern-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Set 1002.NEXT = 1006 (Bypass 1004)</span>
                  </button>
                </div>
              )}

              {subStep === 3 && (
                <button
                  type="button"
                  onClick={handlePartCStep3_DeleteTarget}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-sm transition-transform"
                >
                  <Trash2 className="w-4 h-4 text-rose-200" />
                  <span>Delete Bypassed Node (1004)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mistake feedback banner */}
        {mistakeText && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mistakeText}</span>
          </div>
        )}

        {/* Level Complete Final Card */}
        {stage === 'completed' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-3 animate-page-enter">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              Level 4 Complete!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
              Outstanding! You mastered the authentic Circular Linked List deletion algorithms: rewiring TAIL.NEXT and shifting HEAD for beginning deletion, moving TAIL and looping back to HEAD for ending deletion, and updating previous.NEXT to target.NEXT for middle deletion.
            </p>
            <button
              onClick={() => onLevelComplete(4, 100)}
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

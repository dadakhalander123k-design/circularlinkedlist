import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Trash2, Sparkles, AlertCircle } from 'lucide-react';
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

  // Sub-step within each stage (1: rewire pointers, 2: detached/complete)
  const [subStep, setSubStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>(
    'Part A: Delete beginning node [10] at address 1000. Tail [30] at address 1004 must point to new HEAD address (1002), and HEAD must update to 1002.'
  );
  const [mistakeText, setMistakeText] = useState<string | null>(null);

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  // -------------------------------------------------------------
  // PART A: Delete 10 (addr 1000) from [1000: 10, 1002: 20, 1004: 30]
  // -------------------------------------------------------------
  const [partAHead, setPartAHead] = useState<number>(1000);
  const [partATail, setPartATail] = useState<number>(1004);
  const [partANodes, setPartANodes] = useState<VisualNodeData[]>([
    { id: 'da-1000', address: 1000, value: 10, nextId: 'da-1002', nextAddress: 1002, isHead: true, customBadge: 'TARGET TO DELETE' },
    { id: 'da-1002', address: 1002, value: 20, nextId: 'da-1004', nextAddress: 1004, customBadge: 'NEXT HEAD' },
    { id: 'da-1004', address: 1004, value: 30, nextId: 'da-1000', nextAddress: 1000, isTail: true, customBadge: 'TAIL' },
  ]);

  // -------------------------------------------------------------
  // PART B: Delete 30 (addr 1004) from [1000: 10, 1002: 20, 1004: 30]
  // -------------------------------------------------------------
  const [partBHead, setPartBHead] = useState<number>(1000);
  const [partBTail, setPartBTail] = useState<number>(1004);
  const [partBNodes, setPartBNodes] = useState<VisualNodeData[]>([
    { id: 'db-1000', address: 1000, value: 10, nextId: 'db-1002', nextAddress: 1002, isHead: true },
    { id: 'db-1002', address: 1002, value: 20, nextId: 'db-1004', nextAddress: 1004, customBadge: 'PREV NODE' },
    { id: 'db-1004', address: 1004, value: 30, nextId: 'db-1000', nextAddress: 1000, isTail: true, customBadge: 'TARGET TAIL' },
  ]);

  // -------------------------------------------------------------
  // PART C: Delete 30 (addr 1004) from [1000: 10, 1002: 20, 1004: 30, 1006: 40]
  // -------------------------------------------------------------
  const [partCHead, setPartCHead] = useState<number>(1000);
  const [partCTail, setPartCTail] = useState<number>(1006);
  const [partCNodes, setPartCNodes] = useState<VisualNodeData[]>([
    { id: 'dc-1000', address: 1000, value: 10, nextId: 'dc-1002', nextAddress: 1002, isHead: true },
    { id: 'dc-1002', address: 1002, value: 20, nextId: 'dc-1004', nextAddress: 1004, isPrev: true, customBadge: 'PREVIOUS' },
    { id: 'dc-1004', address: 1004, value: 30, nextId: 'dc-1006', nextAddress: 1006, isTarget: true, customBadge: 'TARGET TO BYPASS' },
    { id: 'dc-1006', address: 1006, value: 40, nextId: 'dc-1000', nextAddress: 1000, isTail: true, customBadge: 'NEXT NODE' },
  ]);

  // Handle address input directly from CLLCanvas on node's NEXT field
  const handleApplyNextAddress = (fromNodeId: string, targetAddress: number) => {
    setMistakeText(null);

    if (stage === 'partA_beginning') {
      const activeAddresses = partANodes.map((n) => n.address);
      if (!activeAddresses.includes(targetAddress)) {
        soundManager.playError();
        setMistakeText(`Address ${targetAddress} does not belong to any active node.`);
        return;
      }
      if (fromNodeId === 'da-1004' && targetAddress === 1002) {
        handlePartAStep('rewire_tail_and_head');
      } else {
        soundManager.playError();
        setMistakeText(`Connecting ${fromNodeId.replace('da-', '')} to ${targetAddress} does not bypass the beginning node (1000). Set 1004.NEXT = 1002.`);
      }
    } else if (stage === 'partB_end') {
      const activeAddresses = partBNodes.map((n) => n.address);
      if (!activeAddresses.includes(targetAddress)) {
        soundManager.playError();
        setMistakeText(`Address ${targetAddress} does not belong to any active node.`);
        return;
      }
      if (fromNodeId === 'db-1002' && targetAddress === 1000) {
        handlePartBStep('rewire_prev_to_head');
      } else {
        soundManager.playError();
        setMistakeText(`To delete tail node 1004, the new tail (node 1002) must point back to HEAD address 1000.`);
      }
    } else if (stage === 'partC_position') {
      const activeAddresses = partCNodes.map((n) => n.address);
      if (!activeAddresses.includes(targetAddress)) {
        soundManager.playError();
        setMistakeText(`Address ${targetAddress} does not belong to any active node.`);
        return;
      }
      if (fromNodeId === 'dc-1002' && targetAddress === 1006) {
        handlePartCStep('bypass_target');
      } else {
        soundManager.playError();
        setMistakeText(`To bypass node 1004, connect previous node 1002.NEXT to 1006.`);
      }
    }
  };

  // Handle Part A (Delete Beginning: 1000)
  const handlePartAStep = (_action: 'rewire_tail_and_head') => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // 1. Shift HEAD to 1002, point 1004 to 1002, fade out 1000
    setPartAHead(1002);
    setPartANodes((prev) =>
      prev.map((n) => {
        if (n.address === 1000) return { ...n, isFadingOut: true, isHead: false, customBadge: 'DETACHED' };
        if (n.address === 1002) return { ...n, isHead: true, customBadge: 'NEW HEAD' };
        if (n.address === 1004) return { ...n, nextId: 'da-1002', nextAddress: 1002 };
        return n;
      })
    );
    setSubStep(2);
    setFeedback('✓ Part A Complete! Tail [30] at address 1004 now points to address 1002. HEAD is updated to 1002. Node 1000 is safely detached.');
    onScoreUpdate(20);
    onStreakUpdate(1);
  };

  // Handle Part B (Delete Ending: 1004)
  const handlePartBStep = (_action: 'rewire_prev_to_head') => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // Point 1002 to HEAD (1000), update TAIL to 1002, fade out 1004
    setPartBTail(1002);
    setPartBNodes((prev) =>
      prev.map((n) => {
        if (n.address === 1002) return { ...n, nextId: 'db-1000', nextAddress: 1000, isTail: true, customBadge: 'NEW TAIL' };
        if (n.address === 1004) return { ...n, isFadingOut: true, isTail: false, customBadge: 'DETACHED' };
        return n;
      })
    );
    setSubStep(2);
    setFeedback('✓ Part B Complete! Node [20] at address 1002 now points to HEAD (1000). TAIL register updated to 1002. Node 1004 detached safely.');
    onScoreUpdate(20);
    onStreakUpdate(2);
  };

  // Handle Part C (Delete Position / Middle Bypass: 1004)
  const handlePartCStep = (_action: 'bypass_target') => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // Bypass 1004: 1002.next = 1006
    setPartCNodes((prev) =>
      prev.map((n) => {
        if (n.address === 1002) return { ...n, nextId: 'dc-1006', nextAddress: 1006, isPrev: false };
        if (n.address === 1004) return { ...n, isFadingOut: true, isTarget: false, customBadge: 'DETACHED' };
        return n;
      })
    );
    setSubStep(2);
    setFeedback('✓ Part C Complete! Bypassed Node at address 1004: 1002.NEXT = 1006. Circuit reconnected: 1000 → 1002 → 1006 → 1000.');
    onScoreUpdate(25);
    onStreakUpdate(3);
    setTimeout(() => {
      setStage('completed');
      soundManager.playLevelVictory();
      onLevelComplete(4, 100);
    }, 1500);
  };

  // Guided solve explanation
  const getGuidedSolveExplanation = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1)
        return 'Delete Beginning: 1. Identify HEAD (1000) and next node (1002). 2. Update tail address 1004 to point to 1002 (1004.NEXT = 1002). 3. Shift HEAD register to 1002. Node 1000 is detached.';
      return 'Part A Complete! Click "Next Challenge" to proceed to ending deletion.';
    }
    if (stage === 'partB_end') {
      if (subStep === 1)
        return 'Delete Ending: 1. Identify tail (1004) and previous node (1002). 2. Point 1002.NEXT to HEAD address 1000. 3. Update TAIL register to 1002. Old tail 1004 is safely detached.';
      return 'Part B Complete! Click "Next Challenge" to proceed to middle node deletion.';
    }
    if (stage === 'partC_position') {
      if (subStep === 1)
        return 'Delete Any Position: 1. Find previous node (1002). 2. Identify target (1004) and target.next (1006). 3. Set 1002.NEXT = 1006 (prev.next = target.next). Target 1004 is cleanly bypassed!';
      return 'Deletion mastery achieved across beginning, ending, and middle memory addresses!';
    }
    return 'Level 4 complete!';
  };

  const handleGuidedNextStep = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) handlePartAStep('rewire_tail_and_head');
      else {
        setStage('partB_end');
        setSubStep(1);
        setFeedback('Part B: Delete ending node [30] at address 1004. Reconnect previous node [20] at address 1002 to HEAD address (1000).');
      }
    } else if (stage === 'partB_end') {
      if (subStep === 1) handlePartBStep('rewire_prev_to_head');
      else {
        setStage('partC_position');
        setSubStep(1);
        setFeedback('Part C: Delete middle node [30] at address 1004. Bypass it by updating 1002.NEXT to 1006.');
      }
    } else if (stage === 'partC_position') {
      if (subStep === 1) handlePartCStep('bypass_target');
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
              {stage === 'partA_beginning' ? 'PART A: DELETE HEAD' : stage === 'partB_end' ? 'PART B: DELETE TAIL' : 'PART C: BYPASS NODE'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {stage === 'partA_beginning'
                ? 'Delete Beginning Node [10] (Address 1000)'
                : stage === 'partB_end'
                ? 'Delete Ending Node [30] (Address 1004)'
                : 'Bypass & Delete Node [30] at Address 1004 (Middle Position)'}
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
                  ? 2 + subStep
                  : 4 + subStep
              }
              totalSteps={6}
              explanation={getGuidedSolveExplanation()}
              isComplete={stage === 'completed'}
              nextButtonLabel={
                stage === 'completed'
                  ? 'Complete Level 4'
                  : subStep === 2 && stage === 'partA_beginning'
                  ? 'Proceed to Part B'
                  : subStep === 2 && stage === 'partB_end'
                  ? 'Proceed to Part C'
                  : 'Bypass & Reconnect'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Memory Pointer Registers Bar */}
        <div className="pt-4 pb-2">
          <CLLMemoryBar
            headAddress={stage === 'partA_beginning' ? partAHead : stage === 'partB_end' ? partBHead : partCHead}
            tailAddress={stage === 'partA_beginning' ? partATail : stage === 'partB_end' ? partBTail : partCTail}
            tailNextAddress={
              stage === 'partA_beginning'
                ? partANodes.find((n) => n.address === partATail)?.nextAddress as number
                : stage === 'partB_end'
                ? partBNodes.find((n) => n.address === partBTail)?.nextAddress as number
                : partCNodes.find((n) => n.address === partCTail)?.nextAddress as number
            }
            validAddresses={
              stage === 'partA_beginning'
                ? partANodes.filter((n) => !n.isFadingOut).map((n) => n.address)
                : stage === 'partB_end'
                ? partBNodes.filter((n) => !n.isFadingOut).map((n) => n.address)
                : partCNodes.filter((n) => !n.isFadingOut).map((n) => n.address)
            }
          />
        </div>

        {/* Canvas Display */}
        <div className="pt-2 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Pointer Reconnection & Bypassing (Enter address into NEXT field or use action button)</span>
            <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
              Rule: prev.next = target.next
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-2">
            {stage === 'partA_beginning' && (
              <CLLCanvas
                nodes={partANodes}
                headId={`da-${partAHead}`}
                tailId={`da-${partATail}`}
                onApplyNextAddress={handleApplyNextAddress}
              />
            )}
            {stage === 'partB_end' && (
              <CLLCanvas
                nodes={partBNodes}
                headId={`db-${partBHead}`}
                tailId={`db-${partBTail}`}
                onApplyNextAddress={handleApplyNextAddress}
              />
            )}
            {stage === 'partC_position' && (
              <CLLCanvas
                nodes={partCNodes}
                headId={`dc-${partCHead}`}
                tailId={`dc-${partCTail}`}
                onApplyNextAddress={handleApplyNextAddress}
              />
            )}
          </div>
        </div>

        {/* Action Controls for Part A */}
        {stage === 'partA_beginning' && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-3 animate-scale-enter">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {feedback}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {subStep === 1 && (
                <button
                  onClick={() => handlePartAStep('rewire_tail_and_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Update Tail 1004.NEXT = 1002 & Set HEAD = 1002</span>
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partB_end');
                    setSubStep(1);
                    setFeedback('Part B: Delete ending node [30] at address 1004. Reconnect previous node [20] at address 1002 to HEAD address (1000).');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part B (Delete at End)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls for Part B */}
        {stage === 'partB_end' && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-3 animate-scale-enter">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {feedback}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {subStep === 1 && (
                <button
                  onClick={() => handlePartBStep('rewire_prev_to_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Reconnect 1002.NEXT → HEAD (1000) & Detach 1004</span>
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partC_position');
                    setSubStep(1);
                    setFeedback('Part C: Delete middle node [30] at address 1004. Bypass it by updating 1002.NEXT to 1006.');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part C (Delete Position)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls for Part C */}
        {stage === 'partC_position' && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-3 animate-scale-enter">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {feedback}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {subStep === 1 && (
                <button
                  onClick={() => handlePartCStep('bypass_target')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Bypass Node 1004: Point 1002.NEXT → 1006</span>
                </button>
              )}
            </div>
          </div>
        )}

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
              Level Complete!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
              Excellent work! You successfully updated memory address pointers to bypass and delete nodes from the beginning, end, and middle while maintaining circular integrity.
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

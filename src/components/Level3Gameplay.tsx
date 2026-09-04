import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Lightbulb, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';
import { CLLMemoryBar } from './cll/CLLMemoryBar';

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
  // 3 progressive parts: 'partA_beginning' -> 'partB_end' -> 'partC_position' -> 'completed'
  const [stage, setStage] = useState<'partA_beginning' | 'partB_end' | 'partC_position' | 'completed'>('partA_beginning');

  // Sub-step within each stage
  const [subStep, setSubStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>(
    'Part A: Set NEXT for new Node at address 1006 to point to current HEAD address (1000).'
  );
  const [mistakeText, setMistakeText] = useState<string | null>(null);

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  // -------------------------------------------------------------
  // PART A: Insert 5 (addr 1006) at Beginning of [1000, 1002, 1004]
  // -------------------------------------------------------------
  const [partAHead, setPartAHead] = useState<number>(1000);
  const [partATail, setPartATail] = useState<number>(1004);
  const [partANodes, setPartANodes] = useState<VisualNodeData[]>([
    { id: 'a-1006', address: 1006, value: 5, nextId: null, nextAddress: null, isNew: true, customBadge: 'NEW NODE' },
    { id: 'a-1000', address: 1000, value: 10, nextId: 'a-1002', nextAddress: 1002, isHead: true },
    { id: 'a-1002', address: 1002, value: 20, nextId: 'a-1004', nextAddress: 1004 },
    { id: 'a-1004', address: 1004, value: 30, nextId: 'a-1000', nextAddress: 1000, isTail: true },
  ]);

  // -------------------------------------------------------------
  // PART B: Insert 40 (addr 1006) at End of [1000, 1002, 1004]
  // -------------------------------------------------------------
  const [partBHead, setPartBHead] = useState<number>(1000);
  const [partBTail, setPartBTail] = useState<number>(1004);
  const [partBNodes, setPartBNodes] = useState<VisualNodeData[]>([
    { id: 'b-1000', address: 1000, value: 10, nextId: 'b-1002', nextAddress: 1002, isHead: true },
    { id: 'b-1002', address: 1002, value: 20, nextId: 'b-1004', nextAddress: 1004 },
    { id: 'b-1004', address: 1004, value: 30, nextId: 'b-1000', nextAddress: 1000, isTail: true, customBadge: 'OLD TAIL' },
    { id: 'b-1006', address: 1006, value: 40, nextId: null, nextAddress: null, isNew: true, customBadge: 'NEW TAIL' },
  ]);

  // -------------------------------------------------------------
  // PART C: Insert 25 (addr 1008) between 1002 and 1004
  // -------------------------------------------------------------
  const [partCHead, setPartCHead] = useState<number>(1000);
  const [partCTail, setPartCTail] = useState<number>(1006);
  const [partCNodes, setPartCNodes] = useState<VisualNodeData[]>([
    { id: 'c-1000', address: 1000, value: 10, nextId: 'c-1002', nextAddress: 1002, isHead: true },
    { id: 'c-1002', address: 1002, value: 20, nextId: 'c-1004', nextAddress: 1004, isPrev: true, customBadge: 'PREV' },
    { id: 'c-1008', address: 1008, value: 25, nextId: null, nextAddress: null, isNew: true, customBadge: 'INSERT' },
    { id: 'c-1004', address: 1004, value: 30, nextId: 'c-1006', nextAddress: 1006 },
    { id: 'c-1006', address: 1006, value: 40, nextId: 'c-1000', nextAddress: 1000, isTail: true },
  ]);

  // Handle Part A pointer updates
  const handlePartAStep = (action: 'point_new_to_head' | 'point_tail_to_new' | 'update_head') => {
    setMistakeText(null);
    if (subStep === 1 && action === 'point_new_to_head') {
      soundManager.playCalcSuccess();
      setPartANodes((prev) =>
        prev.map((n) =>
          n.address === 1006 ? { ...n, nextId: 'a-1000', nextAddress: 1000, isNew: false } : n
        )
      );
      setSubStep(2);
      setFeedback('Great! 1006.NEXT = 1000. Now update tail address 1004: set 1004.NEXT = 1006.');
      onScoreUpdate(15);
      onStreakUpdate(1);
    } else if (subStep === 2 && action === 'point_tail_to_new') {
      soundManager.playCalcSuccess();
      setPartANodes((prev) =>
        prev.map((n) => (n.address === 1004 ? { ...n, nextId: 'a-1006', nextAddress: 1006 } : n))
      );
      setSubStep(3);
      setFeedback('Now update the HEAD register: HEAD = 1006.');
      onScoreUpdate(15);
      onStreakUpdate(2);
    } else if (subStep === 3 && action === 'update_head') {
      soundManager.playCalcSuccess();
      setPartAHead(1006);
      setPartANodes((prev) =>
        prev.map((n) =>
          n.address === 1006
            ? { ...n, isHead: true }
            : n.address === 1000
            ? { ...n, isHead: false }
            : n
        )
      );
      setSubStep(4);
      setFeedback('✓ Part A Complete! HEAD = 1006. Circuit: 1006 → 1000 → 1002 → 1004 → 1006.');
      onScoreUpdate(20);
      onStreakUpdate(3);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      setMistakeText('Follow the pointer order: connect new node address first so memory links stay valid!');
    }
  };

  // Handle Part B pointer updates (Insert at End)
  const handlePartBStep = (action: 'point_tail_to_new' | 'point_new_to_head') => {
    setMistakeText(null);
    if (subStep === 1 && action === 'point_tail_to_new') {
      soundManager.playCalcSuccess();
      setPartBNodes((prev) =>
        prev.map((n) =>
          n.address === 1004 ? { ...n, nextId: 'b-1006', nextAddress: 1006, customBadge: undefined } : n
        )
      );
      setSubStep(2);
      setFeedback('Old tail 1004 now points to 1006. Now close the circle: set 1006.NEXT = HEAD address (1000)!');
      onScoreUpdate(15);
      onStreakUpdate(4);
    } else if (subStep === 2 && action === 'point_new_to_head') {
      soundManager.playCalcSuccess();
      setPartBTail(1006);
      setPartBNodes((prev) =>
        prev.map((n) =>
          n.address === 1006
            ? { ...n, nextId: 'b-1000', nextAddress: 1000, isNew: false, isTail: true, customBadge: 'TAIL' }
            : n.address === 1004
            ? { ...n, isTail: false }
            : n
        )
      );
      setSubStep(3);
      setFeedback('✓ Part B Complete! TAIL = 1006. 1004 → 1006 → 1000 (HEAD).');
      onScoreUpdate(20);
      onStreakUpdate(5);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      setMistakeText('The new last node must receive the address link from old tail, and its NEXT must store HEAD address (1000).');
    }
  };

  // Handle Part C pointer updates (Insert at Position between 1002 and 1004)
  const handlePartCStep = (action: 'point_new_to_next' | 'point_prev_to_new') => {
    setMistakeText(null);
    if (subStep === 1 && action === 'point_new_to_next') {
      soundManager.playCalcSuccess();
      setPartCNodes((prev) =>
        prev.map((n) =>
          n.address === 1008 ? { ...n, nextId: 'c-1004', nextAddress: 1004, isNew: false } : n
        )
      );
      setSubStep(2);
      setFeedback('Address linked! 1008.NEXT = 1004. Now update previous node 1002: set 1002.NEXT = 1008.');
      onScoreUpdate(15);
      onStreakUpdate(6);
    } else if (subStep === 2 && action === 'point_prev_to_new') {
      soundManager.playCalcSuccess();
      setPartCNodes((prev) =>
        prev.map((n) =>
          n.address === 1002 ? { ...n, nextId: 'c-1008', nextAddress: 1008 } : n
        )
      );
      setSubStep(3);
      setFeedback('✓ Part C Complete! Reconnected: 1002 → 1008 → 1004. Memory addresses correctly spliced!');
      onScoreUpdate(25);
      onStreakUpdate(7);
      setTimeout(() => {
        setStage('completed');
        soundManager.playLevelVictory();
      }, 1500);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      setMistakeText('Check the address direction! The new node (1008) must point to address 1004 first.');
    }
  };

  // Handler for typed NEXT address inputs
  const handleApplyNextAddress = (fromAddr: number, targetAddr: number) => {
    if (stage === 'partA_beginning') {
      if (fromAddr === 1006 && targetAddr === 1000) handlePartAStep('point_new_to_head');
      else if (fromAddr === 1004 && targetAddr === 1006) handlePartAStep('point_tail_to_new');
      else setMistakeText(`Invalid target address for step ${subStep}.`);
    } else if (stage === 'partB_end') {
      if (fromAddr === 1004 && targetAddr === 1006) handlePartBStep('point_tail_to_new');
      else if (fromAddr === 1006 && targetAddr === 1000) handlePartBStep('point_new_to_head');
      else setMistakeText(`Invalid target address for step ${subStep}.`);
    } else if (stage === 'partC_position') {
      if (fromAddr === 1008 && targetAddr === 1004) handlePartCStep('point_new_to_next');
      else if (fromAddr === 1002 && targetAddr === 1008) handlePartCStep('point_prev_to_new');
      else setMistakeText(`Invalid target address for step ${subStep}.`);
    }
  };

  // Guided solve explanation
  const getGuidedSolveExplanation = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) return 'Insert Beginning: Set new node 1006.NEXT = 1000 (old HEAD address).';
      if (subStep === 2) return 'Update Tail: Set tail node 1004.NEXT = 1006 (new node address).';
      if (subStep === 3) return 'Update HEAD Register: Set HEAD = 1006.';
      return 'Part A Complete! Click "Next Challenge" to insert at end.';
    }
    if (stage === 'partB_end') {
      if (subStep === 1) return 'Insert End: Set old tail 1004.NEXT = 1006 (new node address).';
      if (subStep === 2) return 'Close Circle: Set new tail 1006.NEXT = 1000 (HEAD address). TAIL = 1006.';
      return 'Part B Complete! Click "Next Challenge" to insert at a specific position.';
    }
    if (stage === 'partC_position') {
      if (subStep === 1) return 'Insert Position: Point new node 1008.NEXT = 1004 (address of node after 1002).';
      if (subStep === 2) return 'Splice Chain: Point previous node 1002.NEXT = 1008.';
      return 'Address-based insertion mastered across beginning, end, and position!';
    }
    return 'Level 3 complete!';
  };

  const handleGuidedNextStep = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) handlePartAStep('point_new_to_head');
      else if (subStep === 2) handlePartAStep('point_tail_to_new');
      else if (subStep === 3) handlePartAStep('update_head');
      else {
        setStage('partB_end');
        setSubStep(1);
        setFeedback('Part B: Insert Node at address 1006 at the END. Update 1004.NEXT = 1006.');
      }
    } else if (stage === 'partB_end') {
      if (subStep === 1) handlePartBStep('point_tail_to_new');
      else if (subStep === 2) handlePartBStep('point_new_to_head');
      else {
        setStage('partC_position');
        setSubStep(1);
        setFeedback('Part C: Insert Node 1008 between address 1002 and address 1004.');
      }
    } else if (stage === 'partC_position') {
      if (subStep === 1) handlePartCStep('point_new_to_next');
      else if (subStep === 2) handlePartCStep('point_prev_to_new');
      else {
        onLevelComplete(3, 100);
      }
    } else if (stage === 'completed') {
      onLevelComplete(3, 100);
    }
  };

  const handleSetHead = (addr: number) => {
    if (stage === 'partA_beginning') {
      setPartAHead(addr);
      setPartANodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
    } else if (stage === 'partB_end') {
      setPartBHead(addr);
      setPartBNodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
    } else if (stage === 'partC_position') {
      setPartCHead(addr);
      setPartCNodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
    }
  };

  const handleSetTail = (addr: number) => {
    if (stage === 'partA_beginning') {
      setPartATail(addr);
      setPartANodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
    } else if (stage === 'partB_end') {
      setPartBTail(addr);
      setPartBNodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
    } else if (stage === 'partC_position') {
      setPartCTail(addr);
      setPartCNodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
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
                ? 'PART A: INSERT AT HEAD'
                : stage === 'partB_end'
                ? 'PART B: INSERT AT TAIL'
                : 'PART C: SPLICING ADDRESSES'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {stage === 'partA_beginning'
                ? 'Insert Node at Address 1006 at Beginning'
                : stage === 'partB_end'
                ? 'Insert Node at Address 1006 at End'
                : 'Insert Node 1008 Between 1002 and 1004'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && stage !== 'completed' && (
              <button
                id="btn-lvl3-start-guided-solve"
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
                  : 5 + subStep
              }
              totalSteps={7}
              explanation={getGuidedSolveExplanation()}
              isComplete={stage === 'completed'}
              nextButtonLabel={
                stage === 'completed'
                  ? 'Complete Level 3'
                  : subStep === 4 && stage === 'partA_beginning'
                  ? 'Proceed to Part B'
                  : subStep === 3 && stage === 'partB_end'
                  ? 'Proceed to Part C'
                  : 'Execute Pointer Update'
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
                ? partANodes.map((n) => n.address)
                : stage === 'partB_end'
                ? partBNodes.map((n) => n.address)
                : partCNodes.map((n) => n.address)
            }
            onSetHeadAddress={handleSetHead}
            onSetTailAddress={handleSetTail}
          />
        </div>

        {/* Canvas Display */}
        <div className="pt-2 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Pointer Wiring (Type target address into NEXT or click action buttons)</span>
            <span className="text-[#2563EB] dark:text-[#3B82F6] font-mono font-bold">
              Memory Invariant: TAIL.NEXT === HEAD
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-2">
            {stage === 'partA_beginning' && (
              <CLLCanvas
                nodes={partANodes}
                headId={`a-${partAHead}`}
                tailId={`a-${partATail}`}
                onApplyNextAddress={handleApplyNextAddress}
              />
            )}
            {stage === 'partB_end' && (
              <CLLCanvas
                nodes={partBNodes}
                headId={`b-${partBHead}`}
                tailId={`b-${partBTail}`}
                onApplyNextAddress={handleApplyNextAddress}
              />
            )}
            {stage === 'partC_position' && (
              <CLLCanvas
                nodes={partCNodes}
                headId={`c-${partCHead}`}
                tailId={`c-${partCTail}`}
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
                  onClick={() => handlePartAStep('point_new_to_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set 1006.NEXT = 1000 (HEAD)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => handlePartAStep('point_tail_to_new')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set Tail 1004.NEXT = 1006</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 3 && (
                <button
                  onClick={() => handlePartAStep('update_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set HEAD Register = 1006</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 4 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partB_end');
                    setSubStep(1);
                    setFeedback('Part B: Insert Node 1006 at the END. Set 1004.NEXT = 1006.');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part B (Insert at End)</span>
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
                  onClick={() => handlePartBStep('point_tail_to_new')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set Old Tail 1004.NEXT = 1006</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => handlePartBStep('point_new_to_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set New Tail 1006.NEXT = 1000 (HEAD)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 3 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partC_position');
                    setSubStep(1);
                    setFeedback('Part C: Insert Node 1008 between address 1002 and address 1004.');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part C (Insert at Position)</span>
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
                  onClick={() => handlePartCStep('point_new_to_next')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set 1008.NEXT = 1004</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => handlePartCStep('point_prev_to_new')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set Previous 1002.NEXT = 1008</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
              Excellent work. You successfully inserted nodes at the beginning, end, and middle by updating memory addresses and pointer registers!
            </p>
            <button
              onClick={() => onLevelComplete(3, 100)}
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

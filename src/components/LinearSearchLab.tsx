import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Shuffle,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  Sliders,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LinearSearchLabProps {
  onExit?: () => void;
  onOpenTheory?: () => void;
}

export const LinearSearchLab: React.FC<LinearSearchLabProps> = () => {
  // Array Configuration
  const [arraySize, setArraySize] = useState<number>(5);
  const [arrayElements, setArrayElements] = useState<string[]>(['12', '25', '7', '18', '30']);
  const [targetInput, setTargetInput] = useState<string>('7');

  // Search Runtime State
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [comparisons, setComparisons] = useState<number>(0);
  const [searchPath, setSearchPath] = useState<number[]>([]);
  const [explanation, setExplanation] = useState<string>(
    'Configure your array and target, then click "Start Linear Search".'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-play state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Prediction Challenge State
  const [predictedComparisons, setPredictedComparisons] = useState<string>('');
  const [predictionFeedback, setPredictionFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Synchronize array elements array when size changes
  const handleSizeChange = (newSize: number) => {
    const safeSize = Math.max(3, Math.min(12, newSize));
    setArraySize(safeSize);
    resetSearch();

    setArrayElements((prev) => {
      const next = [...prev];
      if (safeSize > next.length) {
        for (let i = next.length; i < safeSize; i++) {
          next.push(String(Math.floor(Math.random() * 90) + 10));
        }
      } else {
        next.length = safeSize;
      }
      return next;
    });
  };

  const handleElementChange = (index: number, val: string) => {
    resetSearch();
    setArrayElements((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRandomArray = () => {
    soundManager.playSelect();
    resetSearch();
    const randomVals = Array.from({ length: arraySize }, () =>
      String(Math.floor(Math.random() * 90) + 10)
    );
    setArrayElements(randomVals);
    // Pick one element or a random number as target
    const randomTarget = Math.random() > 0.3
      ? randomVals[Math.floor(Math.random() * randomVals.length)]
      : String(Math.floor(Math.random() * 90) + 10);
    setTargetInput(randomTarget);
  };

  const handleClearArray = () => {
    soundManager.playReset();
    resetSearch();
    setArrayElements(Array.from({ length: arraySize }, () => ''));
  };

  const resetSearch = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setSearchState('idle');
    setCurrentIndex(0);
    setComparisons(0);
    setSearchPath([]);
    setValidationError(null);
    setExplanation('Search reset. Click "Start Linear Search" to begin.');
    setPredictionFeedback(null);
  };

  // Validates inputs upon user actions
  const validateAndParse = (): { numericArray: number[]; numericTarget: number } | null => {
    for (let i = 0; i < arrayElements.length; i++) {
      const item = arrayElements[i]?.trim();
      if (!item || isNaN(Number(item))) {
        setValidationError(`Please enter a valid number at Index [${i}].`);
        soundManager.playError();
        return null;
      }
    }
    const targetTrimmed = targetInput?.trim();
    if (!targetTrimmed || isNaN(Number(targetTrimmed))) {
      setValidationError('Please enter a valid target number.');
      soundManager.playError();
      return null;
    }

    setValidationError(null);
    return {
      numericArray: arrayElements.map((el) => Number(el.trim())),
      numericTarget: Number(targetTrimmed),
    };
  };

  const startSearch = () => {
    const parsed = validateAndParse();
    if (!parsed) return;

    soundManager.playPrimaryClick();
    resetSearch();
    setSearchState('searching');
    setCurrentIndex(0);
    setComparisons(0);
    setSearchPath([]);
    setExplanation(`Starting search at index 0. Target: ${parsed.numericTarget}. Click "Next Step" to compare.`);
  };

  // Step function
  const stepSearch = () => {
    const parsed = validateAndParse();
    if (!parsed) return;

    const { numericArray, numericTarget } = parsed;

    if (currentIndex >= numericArray.length) {
      // Reached end without match
      setSearchState('not_found');
      soundManager.playError();
      setExplanation(
        `Target ${numericTarget} was NOT found. Linear Search examined all ${numericArray.length} elements and reached the end of the array.`
      );
      if (isPlaying) setIsPlaying(false);
      return;
    }

    const currentVal = numericArray[currentIndex];
    const newComparisons = comparisons + 1;
    setComparisons(newComparisons);
    const newPath = [...searchPath, currentVal];
    setSearchPath(newPath);

    if (currentVal === numericTarget) {
      // Target Match!
      soundManager.playCalcSuccess();
      setSearchState('found');
      setExplanation(
        `✓ ${currentVal} matches target ${numericTarget}! Linear Search stops immediately at index ${currentIndex} after ${newComparisons} comparison${newComparisons > 1 ? 's' : ''}.`
      );
      if (isPlaying) setIsPlaying(false);
    } else {
      // Mismatch
      soundManager.playClick();
      if (currentIndex + 1 < numericArray.length) {
        setExplanation(
          `${currentVal} ≠ ${numericTarget}. Moving to index ${currentIndex + 1} (${numericArray[currentIndex + 1]}).`
        );
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Last element checked and did not match
        setSearchState('not_found');
        setExplanation(
          `Checked last element: ${currentVal} ≠ ${numericTarget}. Target ${numericTarget} is NOT in the array (${newComparisons} comparisons).`
        );
        if (isPlaying) setIsPlaying(false);
      }
    }
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && searchState === 'searching') {
      timerRef.current = setInterval(() => {
        stepSearch();
      }, 1100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, searchState, currentIndex, comparisons, searchPath, arrayElements, targetInput]);

  // Test Your Understanding: Check Prediction
  const handleCheckPrediction = () => {
    const parsed = validateAndParse();
    if (!parsed) return;

    const userPred = parseInt(predictedComparisons.trim(), 10);
    if (isNaN(userPred)) {
      setPredictionFeedback({ isCorrect: false, text: 'Please enter a valid comparison count.' });
      soundManager.playError();
      return;
    }

    const { numericArray, numericTarget } = parsed;
    const targetIdx = numericArray.indexOf(numericTarget);
    const actualComparisons = targetIdx !== -1 ? targetIdx + 1 : numericArray.length;

    if (userPred === actualComparisons) {
      soundManager.playCalcSuccess();
      setPredictionFeedback({
        isCorrect: true,
        text: `Correct! ${targetIdx !== -1
            ? `Target ${numericTarget} is at position ${targetIdx + 1} (index ${targetIdx}), requiring exactly ${actualComparisons} comparisons.`
            : `Target ${numericTarget} is absent, requiring all ${actualComparisons} comparisons to verify.`
          }`,
      });
    } else {
      soundManager.playError();
      setPredictionFeedback({
        isCorrect: false,
        text: `Not quite. Count elements from index 0 until target or array end. Correct answer: ${actualComparisons} comparisons.`,
      });
    }
  };

  const parsedTargetNum = Number(targetInput);
  const numericTarget = !isNaN(parsedTargetNum) ? parsedTargetNum : 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans animate-page-enter">
      {/* 1. Header & Introduction */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 dark:border-blue-500/15 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold font-mono uppercase tracking-wider rounded-lg border border-[#DBEAFE] dark:border-blue-500/30">
            <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Interactive Algorithm Workbench</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Sequential Scan Explorer
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white tracking-tight animate-heading-enter">
            LINEAR SEARCH LAB
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#2563EB] dark:text-[#3B82F6]">
            Build your own array, choose a target, and perform Linear Search step by step.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Experiment with different arrays and discover how Linear Search checks elements one by one until the target is found or the array ends.
          </p>
        </div>
      </div>

      {/* 2. Setup Controls: Size, Inputs & Target */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          {/* Step 1: Choose Array Size */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>1. CHOOSE ARRAY SIZE (3 - 12)</span>
            </span>
            <div className="flex items-center gap-2 font-mono">
              <button
                id="btn-lab-decrease-size"
                onClick={() => handleSizeChange(arraySize - 1)}
                disabled={arraySize <= 3}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-blue-500/30 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                -
              </button>
              <div className="px-4 py-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/30 rounded-lg text-sm font-bold text-slate-900 dark:text-white text-center min-w-[50px]">
                {arraySize}
              </div>
              <button
                id="btn-lab-increase-size"
                onClick={() => handleSizeChange(arraySize + 1)}
                disabled={arraySize >= 12}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-blue-500/30 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              id="btn-lab-random-array"
              onClick={handleRandomArray}
              className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Generate Random Array</span>
            </button>
            <button
              id="btn-lab-clear-array"
              onClick={handleClearArray}
              className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer select-none hover:border-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear Array</span>
            </button>
          </div>
        </div>

        {/* Step 2: Build Your Array (Custom Inputs) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              2. BUILD YOUR ARRAY (Enter Custom Numbers)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Positions [0] to [{arraySize - 1}]
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {arrayElements.map((el, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                  [{idx}]
                </span>
                <input
                  id={`lab-input-cell-${idx}`}
                  type="number"
                  value={el}
                  onChange={(e) => handleElementChange(idx, e.target.value)}
                  placeholder="0"
                  className="w-full text-center py-2 px-1 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-blue-500/30 rounded-xl font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-blue-400/25"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Choose Your Target */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-blue-500/15">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              3. CHOOSE YOUR TARGET:
            </span>
            <input
              id="lab-target-input"
              type="number"
              value={targetInput}
              onChange={(e) => {
                resetSearch();
                setTargetInput(e.target.value);
              }}
              placeholder="Target value"
              className="w-28 text-center py-2 px-3 bg-white dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-blue-500/40 rounded-xl font-mono font-extrabold text-[#2563EB] dark:text-[#3B82F6] text-base focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-blue-400/25"
            />
          </div>

          {/* Start Search Action */}
          <div className="flex items-center gap-2">
            {searchState === 'idle' ? (
              <button
                id="btn-start-linear-search"
                onClick={startSearch}
                className="btn-modern-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>START LINEAR SEARCH</span>
              </button>
            ) : (
              <button
                id="btn-lab-reset-search"
                onClick={resetSearch}
                className="btn-modern-secondary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset / Try Another Target</span>
              </button>
            )}
          </div>
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* 3. Primary Visual Array Data Structure & Step Pointer */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 uppercase font-mono">
            <span>Visual Array State</span>
            <span className="text-slate-400">({arrayElements.length} items)</span>
          </div>

          {/* Live Search Statistics Pill */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="text-slate-500">Target: <strong className="text-[#2563EB] dark:text-[#3B82F6]">{targetInput || '—'}</strong></span>
            <span className="text-slate-500">Index: <strong className="text-slate-900 dark:text-white">{searchState !== 'idle' ? currentIndex : '—'}</strong></span>
            <span className="text-slate-500">Comparisons: <strong className="px-2 py-0.5 bg-[#2563EB] text-white rounded-md">{comparisons}</strong></span>
            <span className="text-slate-500">
              Status:{' '}
              <strong
                className={`uppercase font-bold ${searchState === 'found'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : searchState === 'not_found'
                      ? 'text-rose-500'
                      : searchState === 'searching'
                        ? 'text-[#2563EB] dark:text-[#3B82F6] animate-pulse'
                        : 'text-slate-500'
                  }`}
              >
                {searchState === 'idle' ? 'Ready' : searchState.replace('_', ' ')}
              </strong>
            </span>
          </div>
        </div>

        {/* Array Cells Grid */}
        <div className="pt-4 pb-2 overflow-x-auto">
          <div className="flex items-end justify-center gap-2 sm:gap-3 min-w-max pb-2">
            {arrayElements.map((el, idx) => {
              const numVal = Number(el);
              const isExamined = idx < currentIndex || (idx === currentIndex && searchState !== 'searching');
              const isCurrent = idx === currentIndex && searchState === 'searching';
              const isMatch = numVal === numericTarget && (searchState === 'found' || (idx === currentIndex && isExamined && numVal === numericTarget));
              const isMismatch = isExamined && !isMatch;

              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Step Pointer Indicator */}
                  <div className="h-7 flex items-center justify-center font-mono font-bold text-[11px]">
                    {isCurrent ? (
                      <div className="flex flex-col items-center text-[#2563EB] dark:text-[#3B82F6] animate-bounce">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold">CHECK</span>
                        <span>▼</span>
                      </div>
                    ) : isMatch && searchState === 'found' ? (
                      <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold">FOUND</span>
                        <span>▼</span>
                      </div>
                    ) : (
                      <span className="opacity-0">▼</span>
                    )}
                  </div>

                  {/* Array Cell Box */}
                  <div
                    id={`visual-cell-${idx}`}
                    className={`relative w-14 sm:w-18 h-20 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center select-none transition-all duration-300 ${isMatch && (searchState === 'found' || isExamined)
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-lg scale-105 ring-4 ring-emerald-500/20'
                        : isMismatch
                          ? 'bg-slate-50 dark:bg-[#0F172A] border-slate-300 dark:border-blue-500/20 text-slate-400 dark:text-slate-500 opacity-75'
                          : isCurrent
                            ? 'bg-[#EFF6FF] dark:bg-blue-950/60 border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-white shadow-md scale-105 ring-4 ring-blue-500/20'
                            : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-blue-500/30 text-slate-800 dark:text-slate-200 opacity-90'
                      }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                      [{idx}]
                    </span>
                    <span className="text-lg sm:text-2xl font-bold font-mono">
                      {el !== '' ? el : '—'}
                    </span>
                    <div className="mt-1 text-[9px] font-mono font-bold">
                      {isMatch && (searchState === 'found' || isExamined) ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓ MATCH</span>
                      ) : isMismatch ? (
                        <span className="text-slate-400">≠ {numericTarget}</span>
                      ) : isCurrent ? (
                        <span className="text-[#2563EB] dark:text-[#3B82F6] animate-pulse">?</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">WAIT</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Step Controller Controls */}
        {searchState === 'searching' && (
          <div className="pt-4 border-t border-slate-100 dark:border-blue-500/15 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <button
                id="btn-lab-next-step"
                onClick={stepSearch}
                className="btn-modern-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>NEXT STEP</span>
                <SkipForward className="w-4 h-4" />
              </button>

              {!isPlaying ? (
                <button
                  id="btn-lab-autoplay"
                  onClick={() => setIsPlaying(true)}
                  className="btn-modern-secondary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Auto Play</span>
                </button>
              ) : (
                <button
                  id="btn-lab-pause"
                  onClick={() => setIsPlaying(false)}
                  className="btn-modern-secondary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer border-amber-400 text-amber-600"
                >
                  <Pause className="w-3.5 h-3.5 fill-amber-600" />
                  <span>Pause</span>
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Comparing Array[{currentIndex}] ({arrayElements[currentIndex]}) with Target {numericTarget}
            </div>
          </div>
        )}

        {/* Live Dynamic Educational Explanation */}
        <div className="p-4 bg-[#EFF6FF]/70 dark:bg-blue-950/30 border border-[#DBEAFE] dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono tracking-wider block">
              Step Explanation
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        {/* Search Path Breadcrumb Trail */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
            Search Path Sequence
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            {searchPath.length === 0 ? (
              <span className="text-slate-400 text-xs italic">No comparisons made yet.</span>
            ) : (
              searchPath.map((item, i) => {
                const isLast = i === searchPath.length - 1;
                const isTargetItem = item === numericTarget;
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
                    {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </React.Fragment>
                );
              })
            )}

            {searchState === 'not_found' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-400 text-rose-700 dark:text-rose-300 rounded-lg font-bold text-xs">
                  NOT FOUND
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. Additional Educational Panels: Prediction Challenge, Algorithm Logic, and Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Your Understanding: Prediction Challenge */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono tracking-wider">
              <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Predict Comparisons</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Can you predict how many comparisons Linear Search will need for target <strong>{targetInput || '—'}</strong> in your current array?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="input-predict-comparisons"
                type="number"
                value={predictedComparisons}
                onChange={(e) => setPredictedComparisons(e.target.value)}
                placeholder="Count"
                className="w-24 text-center py-2 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-blue-500/30 rounded-xl font-mono font-bold text-xs"
              />
              <button
                id="btn-check-prediction"
                onClick={handleCheckPrediction}
                className="btn-modern-primary px-3.5 py-2 text-xs font-bold cursor-pointer"
              >
                CHECK ANSWER
              </button>
            </div>
          </div>

          {predictionFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${predictionFeedback.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200'
                }`}
            >
              {predictionFeedback.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span>{predictionFeedback.text}</span>
            </div>
          )}
        </div>

        {/* Algorithm Logic Panel */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Algorithm Logic</span>
          </div>

          <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium list-decimal list-inside">
            <li className={searchState === 'searching' && currentIndex === 0 ? 'text-[#2563EB] dark:text-[#3B82F6] font-bold' : ''}>
              Start at the first element (index 0)
            </li>
            <li className={searchState === 'searching' ? 'text-[#2563EB] dark:text-[#3B82F6] font-bold' : ''}>
              Compare current element with target
            </li>
            <li className={searchState === 'found' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
              If equal → FOUND & stop
            </li>
            <li className={searchState === 'searching' ? 'text-[#2563EB] dark:text-[#3B82F6] font-bold' : ''}>
              Otherwise, move to next element
            </li>
            <li className={searchState === 'not_found' ? 'text-rose-500 font-bold' : ''}>
              Repeat until found or array ends
            </li>
          </ol>
        </div>

        {/* Pseudocode Panel */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 shadow-xs space-y-3 font-mono">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>How Linear Search Works</span>
          </div>

          <pre className="text-[11px] p-3 bg-slate-900 text-[#DBEAFE] dark:text-[#93C5FD] rounded-xl leading-relaxed overflow-x-auto">
            {`function linearSearch(arr, target):
  for i = 0 to arr.length - 1:
    if arr[i] == target:
      return i  // Target Found
  return -1     // Target Not Found`}
          </pre>
        </div>
      </div>
    </div>
  );
};

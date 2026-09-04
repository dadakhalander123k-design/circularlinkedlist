import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  Trash2,
  Search,
  RotateCw,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  CornerDownRight,
  Terminal,
  Database,
  Layers,
  Info,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface LabNode {
  id: string;
  address: number;
  value: number;
  nextAddress: number;
}

interface CircularLinkedListLabProps {
  onExit?: () => void;
  onOpenTheory?: () => void;
}

export const CircularLinkedListLab: React.FC<CircularLinkedListLabProps> = ({
  onExit,
  onOpenTheory,
}) => {
  // -------------------------------------------------------------
  // CLL Primary State
  // -------------------------------------------------------------
  const [nodes, setNodes] = useState<LabNode[]>([
    { id: 'node-1000', address: 1000, value: 10, nextAddress: 1002 },
    { id: 'node-1002', address: 1002, value: 20, nextAddress: 1004 },
    { id: 'node-1004', address: 1004, value: 30, nextAddress: 1006 },
    { id: 'node-1006', address: 1006, value: 40, nextAddress: 1000 },
  ]);

  // Next address counter to guarantee unique, realistic sequential addresses (1000, 1002, 1004, 1006...)
  const nextAddressCounterRef = useRef<number>(1008);

  // Active operation tab
  const [activeTab, setActiveTab] = useState<'INSERT' | 'DELETE' | 'SEARCH' | 'TRAVERSE'>('INSERT');

  // -------------------------------------------------------------
  // Inputs for Operations
  // -------------------------------------------------------------
  // Add / Insert inputs
  const [insertValue, setInsertValue] = useState<string>('50');
  const [insertMode, setInsertMode] = useState<'BEGINNING' | 'ENDING' | 'POSITION'>('ENDING');
  const [insertTargetAddress, setInsertTargetAddress] = useState<string>('1006');
  const [insertPositionIndex, setInsertPositionIndex] = useState<string>('1');

  // Delete inputs
  const [deleteMode, setDeleteMode] = useState<'BEGINNING' | 'ENDING' | 'POSITION'>('BEGINNING');
  const [deleteTargetAddress, setDeleteTargetAddress] = useState<string>('');

  // Search inputs & state
  const [searchValue, setSearchValue] = useState<string>('30');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [currentSearchAddr, setCurrentSearchAddr] = useState<number | null>(null);
  const [foundAddress, setFoundAddress] = useState<number | null>(null);

  // Traversal state
  const [traversalStatus, setTraversalStatus] = useState<'idle' | 'traversing' | 'complete'>('idle');
  const [currentTraversalAddr, setCurrentTraversalAddr] = useState<number | null>(null);
  const [traversalPath, setTraversalPath] = useState<number[]>([]);
  const [isLoopingBack, setIsLoopingBack] = useState<boolean>(false);

  // General animation & feedback state
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [fadingNodeId, setFadingNodeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Console output history
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Circular Linked List Lab initialized.',
    'List contains 4 nodes: 1000 → 1002 → 1004 → 1006.',
    'HEAD is at address 1000.',
    'TAIL is at address 1006.',
    'Circular connection verified: TAIL.NEXT (1006) = HEAD (1000).',
  ]);

  // Traversal / Search timer reference
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number; w: number; h: number }>>(
    new Map()
  );

  // -------------------------------------------------------------
  // Helper: Log message to output console
  // -------------------------------------------------------------
  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev, msg]);
  };

  const clearLogs = () => {
    setConsoleLogs(['Console logs cleared.']);
  };

  // Derive HEAD and TAIL
  const headNode = nodes.length > 0 ? nodes[0] : null;
  const tailNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
  const headAddress = headNode ? headNode.address : null;
  const tailAddress = tailNode ? tailNode.address : null;

  // Clear messages after a delay
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Clean up any ongoing timers on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, []);

  // Synchronize target address dropdown defaults
  useEffect(() => {
    if (nodes.length > 0) {
      if (!nodes.some((n) => String(n.address) === insertTargetAddress)) {
        setInsertTargetAddress(String(nodes[nodes.length - 1].address));
      }
      if (!nodes.some((n) => String(n.address) === deleteTargetAddress)) {
        setDeleteTargetAddress(String(nodes[0].address));
      }
    } else {
      setInsertTargetAddress('');
      setDeleteTargetAddress('');
    }
  }, [nodes]);

  // -------------------------------------------------------------
  // SVG Arrow Coordinate Measurement relative to Content Wrapper
  // -------------------------------------------------------------
  const updatePositions = () => {
    if (!contentWrapperRef.current) return;
    const wrapperRect = contentWrapperRef.current.getBoundingClientRect();
    const posMap = new Map<string, { x: number; y: number; w: number; h: number }>();

    nodes.forEach((node) => {
      const el = document.getElementById(`lab-node-${node.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        posMap.set(node.id, {
          x: rect.left - wrapperRect.left,
          y: rect.top - wrapperRect.top,
          w: rect.width,
          h: rect.height,
        });
      }
    });

    setNodePositions(posMap);
  };

  useEffect(() => {
    updatePositions();
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && contentWrapperRef.current) {
      ro = new ResizeObserver(() => {
        updatePositions();
      });
      ro.observe(contentWrapperRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      if (ro) ro.disconnect();
    };
  }, [nodes, currentSearchAddr, currentTraversalAddr, isLoopingBack]);

  // -------------------------------------------------------------
  // Node Allocation Helper
  // -------------------------------------------------------------
  const allocateAddress = (): number => {
    let candidate = nextAddressCounterRef.current;
    // Ensure uniqueness
    const usedAddresses = new Set(nodes.map((n) => n.address));
    while (usedAddresses.has(candidate)) {
      candidate += 2;
    }
    nextAddressCounterRef.current = candidate + 2;
    return candidate;
  };

  // -------------------------------------------------------------
  // OPERATION 1: ADD NODE / INSERTION
  // -------------------------------------------------------------
  const handleInsert = () => {
    setErrorMessage(null);
    const trimmedVal = insertValue.trim();
    if (!trimmedVal) {
      soundManager.playError();
      setErrorMessage('Please enter node data.');
      return;
    }
    const valNum = parseInt(trimmedVal, 10);
    if (isNaN(valNum)) {
      soundManager.playError();
      setErrorMessage('Node data must be a valid integer.');
      return;
    }

    const newAddress = allocateAddress();
    const newNodeId = `node-${newAddress}`;

    // CASE 1: Empty list insertion
    if (nodes.length === 0) {
      const firstNode: LabNode = {
        id: newNodeId,
        address: newAddress,
        value: valNum,
        nextAddress: newAddress, // Points back to itself!
      };
      setNodes([firstNode]);
      setRecentlyAddedId(newNodeId);
      soundManager.playSuccess();
      setSuccessMessage(`Created first node with DATA ${valNum} at address ${newAddress}.`);
      addLog(`> Node ${valNum} created at address ${newAddress}.`);
      addLog(`> Single-node circular list established: ${newAddress}.NEXT = ${newAddress}.`);
      addLog(`> HEAD = ${newAddress}, TAIL = ${newAddress}.`);
      setTimeout(() => setRecentlyAddedId(null), 1200);
      return;
    }

    // CASE 2: Insert at Beginning (New HEAD)
    if (insertMode === 'BEGINNING') {
      const oldHead = nodes[0];
      const oldTail = nodes[nodes.length - 1];

      const newNode: LabNode = {
        id: newNodeId,
        address: newAddress,
        value: valNum,
        nextAddress: oldHead.address,
      };

      // In the new list, the tail's NEXT must point to the new head
      const updatedNodes = [
        newNode,
        ...nodes.map((n, idx) => {
          if (idx === nodes.length - 1) {
            return { ...n, nextAddress: newAddress };
          }
          return n;
        }),
      ];

      setNodes(updatedNodes);
      setRecentlyAddedId(newNodeId);
      soundManager.playSuccess();
      setSuccessMessage(`Inserted DATA ${valNum} at Beginning (address ${newAddress}).`);
      addLog(`> Insert at Beginning: Created node with DATA ${valNum} at address ${newAddress}.`);
      addLog(`> Set ${newAddress}.NEXT → old HEAD (${oldHead.address}).`);
      addLog(`> Updated TAIL (${oldTail.address}).NEXT → new HEAD (${newAddress}).`);
      addLog(`> New HEAD = ${newAddress}, TAIL = ${oldTail.address}.`);
      addLog(`> Circular connection preserved.`);
      setTimeout(() => setRecentlyAddedId(null), 1200);
      return;
    }

    // CASE 3: Insert at Ending (New TAIL)
    if (insertMode === 'ENDING') {
      const oldTail = nodes[nodes.length - 1];
      const currentHead = nodes[0];

      const newNode: LabNode = {
        id: newNodeId,
        address: newAddress,
        value: valNum,
        nextAddress: currentHead.address, // Points back to HEAD
      };

      // Old tail points to new node
      const updatedNodes = nodes.map((n, idx) => {
        if (idx === nodes.length - 1) {
          return { ...n, nextAddress: newAddress };
        }
        return n;
      });
      updatedNodes.push(newNode);

      setNodes(updatedNodes);
      setRecentlyAddedId(newNodeId);
      soundManager.playSuccess();
      setSuccessMessage(`Inserted DATA ${valNum} at Ending (address ${newAddress}).`);
      addLog(`> Insert at Ending: Created node with DATA ${valNum} at address ${newAddress}.`);
      addLog(`> Updated old TAIL (${oldTail.address}).NEXT → ${newAddress}.`);
      addLog(`> Set new TAIL (${newAddress}).NEXT → HEAD (${currentHead.address}).`);
      addLog(`> HEAD = ${currentHead.address}, New TAIL = ${newAddress}.`);
      addLog(`> Circular connection preserved.`);
      setTimeout(() => setRecentlyAddedId(null), 1200);
      return;
    }

    // CASE 4: Insert at Any Position (Insert after specific node address)
    if (insertMode === 'POSITION') {
      const targetAddrNum = parseInt(insertTargetAddress, 10);
      const targetIdx = nodes.findIndex((n) => n.address === targetAddrNum);

      if (targetIdx === -1) {
        soundManager.playError();
        setErrorMessage(`Node address ${insertTargetAddress} not found in the list.`);
        return;
      }

      const targetNode = nodes[targetIdx];
      const nextAfterTargetAddr = targetNode.nextAddress;

      const newNode: LabNode = {
        id: newNodeId,
        address: newAddress,
        value: valNum,
        nextAddress: nextAfterTargetAddr,
      };

      const newNodesList = [...nodes];
      // Target node's NEXT becomes new node
      newNodesList[targetIdx] = {
        ...targetNode,
        nextAddress: newAddress,
      };
      // Splice in new node right after target
      newNodesList.splice(targetIdx + 1, 0, newNode);

      // If target was tail, new node becomes tail
      if (targetIdx === nodes.length - 1) {
        newNode.nextAddress = nodes[0].address;
      }

      setNodes(newNodesList);
      setRecentlyAddedId(newNodeId);
      soundManager.playSuccess();
      setSuccessMessage(`Inserted DATA ${valNum} after node address ${targetNode.address}.`);
      addLog(`> Insert at Position: Created node with DATA ${valNum} at address ${newAddress}.`);
      addLog(`> Updated node ${targetNode.address}.NEXT from ${nextAfterTargetAddr} to ${newAddress}.`);
      addLog(`> Set new node ${newAddress}.NEXT → ${nextAfterTargetAddr}.`);
      if (targetIdx === nodes.length - 1) {
        addLog(`> Node was inserted after TAIL; new TAIL = ${newAddress}.`);
      }
      addLog(`> Circular connection preserved.`);
      setTimeout(() => setRecentlyAddedId(null), 1200);
      return;
    }
  };

  // -------------------------------------------------------------
  // OPERATION 2: DELETION
  // -------------------------------------------------------------
  const handleDelete = () => {
    setErrorMessage(null);

    if (nodes.length === 0) {
      soundManager.playError();
      setErrorMessage('Cannot delete. The list is empty.');
      addLog('> Error: Cannot delete from an empty circular linked list.');
      return;
    }

    // CASE 1: Only 1 node in list
    if (nodes.length === 1) {
      const solitaryNode = nodes[0];
      setFadingNodeId(solitaryNode.id);
      soundManager.playClick();

      setTimeout(() => {
        setNodes([]);
        setFadingNodeId(null);
        soundManager.playSuccess();
        setSuccessMessage(`Deleted solitary node at address ${solitaryNode.address}. List is now empty.`);
        addLog(`> Deleted node ${solitaryNode.address} (DATA = ${solitaryNode.value}).`);
        addLog(`> List is now empty. HEAD = —, TAIL = —.`);
      }, 300);
      return;
    }

    // CASE 2: Delete at Beginning (Head Deletion)
    if (deleteMode === 'BEGINNING') {
      const oldHead = nodes[0];
      const newHead = nodes[1];
      const tail = nodes[nodes.length - 1];

      setFadingNodeId(oldHead.id);
      soundManager.playClick();

      setTimeout(() => {
        const remaining = nodes.slice(1);
        // Update tail's NEXT to point to new HEAD
        remaining[remaining.length - 1] = {
          ...remaining[remaining.length - 1],
          nextAddress: newHead.address,
        };

        setNodes(remaining);
        setFadingNodeId(null);
        soundManager.playSuccess();
        setSuccessMessage(`Deleted HEAD node at address ${oldHead.address}.`);
        addLog(`> Delete at Beginning: Removed node at address ${oldHead.address} (DATA = ${oldHead.value}).`);
        addLog(`> New HEAD is address ${newHead.address}.`);
        addLog(`> Reconnected TAIL (${tail.address}).NEXT → new HEAD (${newHead.address}).`);
        addLog(`> Circular connection preserved.`);
      }, 300);
      return;
    }

    // CASE 3: Delete at Ending (Tail Deletion)
    if (deleteMode === 'ENDING') {
      const oldTail = nodes[nodes.length - 1];
      const newTail = nodes[nodes.length - 2];
      const head = nodes[0];

      setFadingNodeId(oldTail.id);
      soundManager.playClick();

      setTimeout(() => {
        const remaining = nodes.slice(0, nodes.length - 1);
        // New tail points to head
        remaining[remaining.length - 1] = {
          ...remaining[remaining.length - 1],
          nextAddress: head.address,
        };

        setNodes(remaining);
        setFadingNodeId(null);
        soundManager.playSuccess();
        setSuccessMessage(`Deleted TAIL node at address ${oldTail.address}.`);
        addLog(`> Delete at Ending: Removed node at address ${oldTail.address} (DATA = ${oldTail.value}).`);
        addLog(`> Node ${newTail.address} is now the new TAIL.`);
        addLog(`> Reconnected new TAIL (${newTail.address}).NEXT → HEAD (${head.address}).`);
        addLog(`> Circular connection preserved.`);
      }, 300);
      return;
    }

    // CASE 4: Delete at Any Position (by target address)
    if (deleteMode === 'POSITION') {
      const targetAddrNum = parseInt(deleteTargetAddress, 10);
      const targetIdx = nodes.findIndex((n) => n.address === targetAddrNum);

      if (targetIdx === -1) {
        soundManager.playError();
        setErrorMessage(`Target address ${deleteTargetAddress} not found in the list.`);
        addLog(`> Error: Target address ${deleteTargetAddress} does not exist.`);
        return;
      }

      // If target is head
      if (targetIdx === 0) {
        setDeleteMode('BEGINNING');
        handleDelete();
        return;
      }

      // If target is tail
      if (targetIdx === nodes.length - 1) {
        setDeleteMode('ENDING');
        handleDelete();
        return;
      }

      // Middle node bypass
      const targetNode = nodes[targetIdx];
      const prevNode = nodes[targetIdx - 1];
      const nextNode = nodes[targetIdx + 1];

      setFadingNodeId(targetNode.id);
      soundManager.playClick();

      setTimeout(() => {
        const updated = [...nodes];
        // Bypass target: prev.next = target.next
        updated[targetIdx - 1] = {
          ...prevNode,
          nextAddress: targetNode.nextAddress,
        };
        // Remove target node
        updated.splice(targetIdx, 1);

        setNodes(updated);
        setFadingNodeId(null);
        soundManager.playSuccess();
        setSuccessMessage(
          `Deleted node ${targetNode.address}. Bypassed: ${prevNode.address}.NEXT → ${nextNode.address}.`
        );
        addLog(`> Delete at Position: Target node = ${targetNode.address} (DATA = ${targetNode.value}).`);
        addLog(`> Previous node = ${prevNode.address}.`);
        addLog(`> Bypass pointer: updated ${prevNode.address}.NEXT → ${nextNode.address}.`);
        addLog(`> Node ${targetNode.address} safely disconnected and removed.`);
        addLog(`> Circular connection preserved.`);
      }, 300);
      return;
    }
  };

  // -------------------------------------------------------------
  // OPERATION 3: SEARCHING
  // -------------------------------------------------------------
  const handleStartSearch = () => {
    if (nodes.length === 0) {
      soundManager.playError();
      setErrorMessage('Cannot search. The circular linked list is empty.');
      addLog('> Error: Cannot search in an empty list.');
      return;
    }

    const trimmedVal = searchValue.trim();
    if (!trimmedVal) {
      soundManager.playError();
      setErrorMessage('Please enter a search value.');
      return;
    }

    const targetVal = parseInt(trimmedVal, 10);
    if (isNaN(targetVal)) {
      soundManager.playError();
      setErrorMessage('Search value must be a valid number.');
      return;
    }

    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    setSearchStatus('searching');
    setFoundAddress(null);
    setCurrentSearchAddr(null);
    addLog(`> Starting search for DATA = ${targetVal} at HEAD (${nodes[0].address})...`);

    let currentIdx = 0;
    let visitedCount = 0;

    animationTimerRef.current = setInterval(() => {
      if (currentIdx >= nodes.length) {
        // Traversal returned to HEAD without finding target
        clearInterval(animationTimerRef.current!);
        setCurrentSearchAddr(null);
        setSearchStatus('not_found');
        soundManager.playError();
        setErrorMessage(`Value ${targetVal} not found in the circular linked list.`);
        addLog(`> Traversal completed full loop back to HEAD (${nodes[0].address}).`);
        addLog(`> Value ${targetVal} not found in the circular linked list.`);
        return;
      }

      const node = nodes[currentIdx];
      setCurrentSearchAddr(node.address);
      soundManager.playClick();
      addLog(`> Inspecting node ${node.address}: DATA is ${node.value} (target: ${targetVal}).`);

      if (node.value === targetVal) {
        clearInterval(animationTimerRef.current!);
        setSearchStatus('found');
        setFoundAddress(node.address);
        soundManager.playSuccess();
        setSuccessMessage(`Value ${targetVal} FOUND at address ${node.address}!`);
        addLog(`> MATCH FOUND! DATA ${targetVal} is located at address ${node.address}.`);
        addLog(`> Pointer NEXT = ${node.nextAddress}.`);
        return;
      }

      currentIdx += 1;
      visitedCount += 1;
    }, 700);
  };

  const handleResetSearch = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    setSearchStatus('idle');
    setCurrentSearchAddr(null);
    setFoundAddress(null);
  };

  // -------------------------------------------------------------
  // OPERATION 4: TRAVERSAL
  // -------------------------------------------------------------
  const handleStartTraversal = () => {
    if (nodes.length === 0) {
      soundManager.playError();
      setErrorMessage('Cannot traverse. The circular linked list is empty.');
      addLog('> Error: Cannot traverse an empty list.');
      return;
    }

    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    setTraversalStatus('traversing');
    setCurrentTraversalAddr(null);
    setTraversalPath([]);
    setIsLoopingBack(false);
    addLog(`> Traversal started at HEAD (address ${nodes[0].address})...`);

    let idx = 0;
    const pathAcc: number[] = [];

    animationTimerRef.current = setInterval(() => {
      if (idx < nodes.length) {
        const curr = nodes[idx];
        setCurrentTraversalAddr(curr.address);
        pathAcc.push(curr.value);
        setTraversalPath([...pathAcc]);
        soundManager.playClick();
        addLog(`> Visited node ${curr.address} (DATA = ${curr.value}, NEXT = ${curr.nextAddress}).`);
        idx += 1;
      } else if (idx === nodes.length) {
        // Demonstrate the circular return loop back to head
        setIsLoopingBack(true);
        setCurrentTraversalAddr(null);
        soundManager.playClick();
        addLog(
          `> Following TAIL (${nodes[nodes.length - 1].address}).NEXT back to HEAD (${nodes[0].address}).`
        );
        idx += 1;
      } else {
        clearInterval(animationTimerRef.current!);
        setIsLoopingBack(false);
        setTraversalStatus('complete');
        soundManager.playSuccess();
        setSuccessMessage('Traversal complete! Successfully circled back to HEAD.');
        const orderStr = pathAcc.join(' → ') + ` → HEAD (${pathAcc[0]})`;
        addLog(`> Traversal Result: ${orderStr}`);
        addLog(`> Traversal cleanly terminated upon returning to HEAD.`);
      }
    }, 650);
  };

  const handleResetTraversal = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    setTraversalStatus('idle');
    setCurrentTraversalAddr(null);
    setTraversalPath([]);
    setIsLoopingBack(false);
  };

  // -------------------------------------------------------------
  // RESET LAB FUNCTIONALITY
  // -------------------------------------------------------------
  const handleResetLab = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    soundManager.playClick();
    setNodes([
      { id: 'node-1000', address: 1000, value: 10, nextAddress: 1002 },
      { id: 'node-1002', address: 1002, value: 20, nextAddress: 1004 },
      { id: 'node-1004', address: 1004, value: 30, nextAddress: 1006 },
      { id: 'node-1006', address: 1006, value: 40, nextAddress: 1000 },
    ]);
    nextAddressCounterRef.current = 1008;
    setInsertValue('50');
    setInsertMode('ENDING');
    setInsertTargetAddress('1006');
    setDeleteMode('BEGINNING');
    setDeleteTargetAddress('1000');
    setSearchValue('30');
    setSearchStatus('idle');
    setCurrentSearchAddr(null);
    setFoundAddress(null);
    setTraversalStatus('idle');
    setCurrentTraversalAddr(null);
    setTraversalPath([]);
    setIsLoopingBack(false);
    setRecentlyAddedId(null);
    setFadingNodeId(null);
    setErrorMessage(null);
    setSuccessMessage('Lab reset to initial 4-node circular state.');
    setConsoleLogs([
      'Circular Linked List Lab reset to default 4-node state.',
      'Nodes: 1000 (10) → 1002 (20) → 1004 (30) → 1006 (40).',
      'HEAD = 1000, TAIL = 1006, TAIL.NEXT = 1000.',
    ]);
  };

  const handleClearToEmpty = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    soundManager.playClick();
    setNodes([]);
    setCurrentSearchAddr(null);
    setCurrentTraversalAddr(null);
    setFoundAddress(null);
    setSearchStatus('idle');
    setTraversalStatus('idle');
    setIsLoopingBack(false);
    setSuccessMessage('List cleared to empty state. Add a node to begin!');
    addLog('> List cleared. Active nodes: 0. HEAD = —, TAIL = —.');
  };

  const handleLoadSingleNode = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    soundManager.playClick();
    setNodes([{ id: 'node-1000', address: 1000, value: 10, nextAddress: 1000 }]);
    nextAddressCounterRef.current = 1002;
    setSuccessMessage('Loaded 1-node circular list pointing to itself (1000.NEXT = 1000).');
    addLog('> 1-node circular list loaded.');
    addLog('> HEAD = 1000, TAIL = 1000.');
    addLog('> Self loop established: 1000.NEXT = 1000.');
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-slate-800 dark:text-slate-100">
      {/* ========================================================= */}
      {/* 1. LAB HEADER & QUICK ACTIONS                             */}
      {/* ========================================================= */}
      <div className="card-modern p-6 sm:p-8 bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFF] to-white dark:from-[#0F172A] dark:via-[#172033] dark:to-[#0B1120] border border-slate-200 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
              Interactive Workbench
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Data Structures Lab
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
            Circular Linked List Lab
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Build, modify, search, and traverse a circular linked list interactively. Inspect real memory
            addresses, verify pointer bypasses, and observe circular pointer closure in real time.
          </p>
        </div>

        {/* Quick Action Presets */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleResetLab}
            id="btn-lab-reset"
            className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Reset to 4-node default list"
          >
            <RotateCcw className="w-4 h-4 text-blue-600" />
            <span>Reset Lab</span>
          </button>
          <button
            onClick={handleClearToEmpty}
            id="btn-lab-clear"
            className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Empty the list completely"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Clear to Empty</span>
          </button>
          <button
            onClick={handleLoadSingleNode}
            id="btn-lab-1-node"
            className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Load 1-node self-looping list"
          >
            <RotateCw className="w-4 h-4 text-blue-600" />
            <span>1-Node Self Loop</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Toasts / Alerts */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/80 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 shadow-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 rounded-xl text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. POINTER STATE & METRICS SUMMARY CARDS                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Metric 1: HEAD */}
        <div className="card-modern p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            HEAD Pointer
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
              {headAddress !== null ? headAddress : '—'}
            </span>
            {headAddress !== null && (
              <span className="text-xs font-mono text-slate-400">
                (DATA: {headNode?.value})
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Entry point of circular list
          </span>
        </div>

        {/* Metric 2: TAIL */}
        <div className="card-modern p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            TAIL Pointer
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#1D4ED8] dark:text-[#3B82F6]">
              {tailAddress !== null ? tailAddress : '—'}
            </span>
            {tailAddress !== null && (
              <span className="text-xs font-mono text-slate-400">
                (DATA: {tailNode?.value})
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Last node in sequence
          </span>
        </div>

        {/* Metric 3: Active Nodes */}
        <div className="card-modern p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Active Nodes
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-800 dark:text-white">
              {nodes.length}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {nodes.length === 1 ? 'node' : 'nodes'}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Allocated heap memory
          </span>
        </div>

        {/* Metric 4: Circular Invariant */}
        <div className="card-modern p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Circular Invariant
          </span>
          <div className="mt-1.5 flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {nodes.length > 0
                ? `${tailNode?.address}.NEXT = ${tailNode?.nextAddress}`
                : 'Empty (N/A)'}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            TAIL.NEXT ≡ HEAD
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE VISUALIZATION STAGE (THE CENTERPIECE)      */}
      {/* ========================================================= */}
      <div className="card-modern p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-800 dark:text-white font-mono">
              Live Circular Linked List Visualization
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            Click on any node to select its address for insertion or deletion
          </span>
        </div>

        {/* Visual Stage Container */}
        {nodes.length === 0 ? (
          <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#0B1120] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800">
            <Database className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3 stroke-[1.5]" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
              List is currently empty (HEAD = —, TAIL = —)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md">
              Use the operation controls below to add your first node with data. The first node will automatically point back to itself.
            </p>
            <button
              onClick={() => {
                setInsertValue('10');
                setInsertMode('ENDING');
                handleInsert();
              }}
              className="mt-4 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Initial Node (10)</span>
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full overflow-x-auto overflow-y-visible py-4 sm:py-6 select-none bg-slate-50/50 dark:bg-[#0B1120]/60 rounded-xl border border-slate-100 dark:border-slate-800 overscroll-x-contain touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Scrollable content wrapper that expands to fit all nodes + safe padding */}
            <div
              ref={contentWrapperRef}
              className="relative min-w-full w-max flex items-center justify-center gap-6 sm:gap-10 z-10 pt-4 pb-16 px-8 sm:px-14 flex-nowrap"
            >
              {nodes.map((node, idx) => {
                const isHead = idx === 0;
                const isTail = idx === nodes.length - 1;
                const isCurrentSearch = node.address === currentSearchAddr;
                const isCurrentTraversal = node.address === currentTraversalAddr;
                const isFound = node.address === foundAddress;
                const isNew = node.id === recentlyAddedId;
                const isFading = node.id === fadingNodeId;

                return (
                  <div
                    key={node.id}
                    id={`lab-node-${node.id}`}
                    onClick={() => {
                      setInsertTargetAddress(String(node.address));
                      setDeleteTargetAddress(String(node.address));
                      soundManager.playClick();
                    }}
                    className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 shrink-0 ${
                      isFading ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
                    }`}
                    title={`Click to select node ${node.address}`}
                  >
                    {/* Role Badges */}
                    <div className="h-7 mb-1 flex items-center gap-1.5 justify-center">
                      {isHead && !isTail && (
                        <div className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1">
                          <span>HEAD</span>
                          <span className="text-blue-200">↓</span>
                        </div>
                      )}
                      {isTail && !isHead && (
                        <div className="px-2.5 py-0.5 rounded-md bg-[#1D4ED8] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1">
                          <span>TAIL</span>
                          <span className="text-blue-200">↓</span>
                        </div>
                      )}
                      {isHead && isTail && (
                        <div className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#6366F1] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1">
                          <span>HEAD • TAIL</span>
                          <span className="text-blue-200">↓</span>
                        </div>
                      )}
                      {isCurrentSearch && (
                        <div className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-900 font-mono font-bold text-xs tracking-wider uppercase shadow-xs animate-pulse">
                          <span>SEARCHING</span>
                        </div>
                      )}
                      {isCurrentTraversal && (
                        <div className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-900 font-mono font-bold text-xs tracking-wider uppercase shadow-xs animate-pulse">
                          <span>VISITED</span>
                        </div>
                      )}
                      {isFound && (
                        <div className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs">
                          <span>MATCH</span>
                        </div>
                      )}
                      {isNew && (
                        <div className="px-2.5 py-0.5 rounded-md bg-[#2563EB] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1 animate-bounce">
                          <Sparkles className="w-3 h-3" />
                          <span>NEW</span>
                        </div>
                      )}
                    </div>

                    {/* Node Card Box: ADDR | DATA | NEXT */}
                    <div
                      className={`group flex flex-col rounded-xl border-2 shadow-xs transition-all duration-200 overflow-hidden min-w-[140px] sm:min-w-[155px] ${
                        isFound
                          ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/60 scale-105'
                          : isCurrentSearch
                          ? 'border-amber-500 ring-4 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/30 scale-105'
                          : isCurrentTraversal
                          ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/30 scale-105'
                          : isNew
                          ? 'border-[#2563EB] ring-4 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30 scale-105'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-[#2563EB] dark:hover:border-blue-500'
                      }`}
                    >
                      {/* Tier 1: ADDRESS */}
                      <div className="px-3 py-1 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono">
                        <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          ADDR
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-blue-700 dark:text-blue-300 bg-white dark:bg-[#0B1120] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {node.address}
                        </span>
                      </div>

                      {/* Tier 2: DATA & NEXT side-by-side */}
                      <div className="flex items-stretch flex-1">
                        {/* DATA */}
                        <div className="flex-1 px-3 py-2 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-[#0F172A]/60 border-r border-slate-200 dark:border-slate-700/80">
                          <span className="text-xs font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                            DATA
                          </span>
                          <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-800 dark:text-white">
                            {node.value}
                          </span>
                        </div>

                        {/* NEXT */}
                        <div className="flex-1 px-2.5 py-2 flex flex-col items-center justify-center bg-white dark:bg-[#111827]">
                          <div className="w-full flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                              NEXT
                            </span>
                            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                          </div>
                          <span className="text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300">
                            {node.nextAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* SVG Arrows & Circular Loopback overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              style={{ minWidth: '100%', minHeight: '100%' }}
            >
              <defs>
                <marker
                  id="lab-arrow-blue"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
                </marker>
                <marker
                  id="lab-arrow-amber"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
                <marker
                  id="lab-arrow-emerald"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
              </defs>

              {/* 1. Forward Arrows between adjacent nodes */}
              {nodes.map((node, idx) => {
                if (idx >= nodes.length - 1) return null;
                const nextNode = nodes[idx + 1];
                const fromPos = nodePositions.get(node.id);
                const toPos = nodePositions.get(nextNode.id);
                if (!fromPos || !toPos) return null;

                const startX = fromPos.x + fromPos.w;
                const startY = fromPos.y + fromPos.h * 0.72;
                const endX = toPos.x;
                const endY = toPos.y + toPos.h * 0.72;

                const isInspecting =
                  node.address === currentSearchAddr || node.address === currentTraversalAddr;

                return (
                  <g key={`arrow-forward-${node.id}-${nextNode.id}`}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={isInspecting ? '#F59E0B' : '#2563EB'}
                      strokeWidth="2.5"
                      strokeDasharray={isInspecting ? '4 2' : 'none'}
                      markerEnd={isInspecting ? 'url(#lab-arrow-amber)' : 'url(#lab-arrow-blue)'}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {/* 2. Self-loop for single node: 1000.NEXT = 1000 */}
              {nodes.length === 1 &&
                (() => {
                  const node = nodes[0];
                  const pos = nodePositions.get(node.id);
                  if (!pos) return null;

                  const x = pos.x + pos.w * 0.75;
                  const y = pos.y + pos.h;
                  const path = `M ${x} ${y} C ${x + 45} ${y + 45}, ${x - 45} ${y + 45}, ${x - 12} ${y + 6}`;

                  return (
                    <g key={`single-self-loop-${node.id}`}>
                      <path
                        d={path}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                        markerEnd="url(#lab-arrow-blue)"
                      />
                      <text
                        x={x}
                        y={y + 55}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-blue-600 dark:fill-blue-400 select-none"
                      >
                        Self-Loop: {node.address}.NEXT = {node.address}
                      </text>
                    </g>
                  );
                })()}

              {/* 3. Circular Return Loop-back Arrow from Tail back to HEAD */}
              {nodes.length > 1 &&
                (() => {
                  const head = nodes[0];
                  const tail = nodes[nodes.length - 1];
                  const fromPos = nodePositions.get(tail.id);
                  const toPos = nodePositions.get(head.id);
                  if (!fromPos || !toPos) return null;

                  const startX = fromPos.x + fromPos.w * 0.85;
                  const startY = fromPos.y + fromPos.h;
                  const targetX = toPos.x + toPos.w * 0.35;
                  const targetY = toPos.y + toPos.h;
                  const loopDepth = 42;

                  const path = `
                    M ${startX} ${startY}
                    v ${loopDepth}
                    H ${targetX}
                    V ${targetY + 6}
                  `;

                  const isLoopActive = isLoopingBack || tail.address === currentTraversalAddr;

                  return (
                    <g key={`loopback-tail-to-head`}>
                      <path
                        d={path}
                        fill="none"
                        stroke={isLoopActive ? '#10B981' : '#2563EB'}
                        strokeWidth="2.5"
                        strokeDasharray={isLoopActive ? '6 3' : 'none'}
                        markerEnd={isLoopActive ? 'url(#lab-arrow-emerald)' : 'url(#lab-arrow-blue)'}
                        className={isLoopActive ? 'animate-pulse' : 'transition-all duration-300'}
                      />
                      {/* Loopback Label */}
                      <text
                        x={(startX + targetX) / 2}
                        y={startY + loopDepth + 15}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-blue-600 dark:fill-blue-400 select-none"
                      >
                        TAIL ({tail.address}).NEXT → HEAD ({head.address}) [Circular Closure]
                      </text>
                    </g>
                  );
                })()}
            </svg>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. LAB WORKBENCH: OPERATION CONTROLS                      */}
      {/* ========================================================= */}
      <div className="card-modern p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('INSERT')}
            id="tab-insert"
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'INSERT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>INSERTION</span>
          </button>

          <button
            onClick={() => setActiveTab('DELETE')}
            id="tab-delete"
            className={`px-4.5 py-2.5 text-xs sm:text-sm font-bold font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'DELETE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>DELETION</span>
          </button>

          <button
            onClick={() => setActiveTab('SEARCH')}
            id="tab-search"
            className={`px-4.5 py-2.5 text-xs sm:text-sm font-bold font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'SEARCH'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>SEARCHING</span>
          </button>

          <button
            onClick={() => setActiveTab('TRAVERSE')}
            id="tab-traverse"
            className={`px-4.5 py-2.5 text-xs sm:text-sm font-bold font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'TRAVERSE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>TRAVERSAL</span>
          </button>
        </div>

        {/* TAB 1: INSERTION CONTROLS */}
        {activeTab === 'INSERT' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Choose Insertion Target:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInsertMode('BEGINNING')}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md border transition-all cursor-pointer ${
                    insertMode === 'BEGINNING'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Beginning (New HEAD)
                </button>
                <button
                  type="button"
                  onClick={() => setInsertMode('ENDING')}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md border transition-all cursor-pointer ${
                    insertMode === 'ENDING'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Ending (New TAIL)
                </button>
                <button
                  type="button"
                  onClick={() => setInsertMode('POSITION')}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md border transition-all cursor-pointer ${
                    insertMode === 'POSITION'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  After Node Address
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
              {/* Data Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                  Node DATA (Integer):
                </label>
                <input
                  type="number"
                  id="input-insert-data"
                  value={insertValue}
                  onChange={(e) => setInsertValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="px-3.5 py-2.5 text-sm sm:text-base font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Target Address Selector (if POSITION mode) */}
              {insertMode === 'POSITION' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                    Insert After Address:
                  </label>
                  <select
                    id="select-insert-address"
                    value={insertTargetAddress}
                    onChange={(e) => setInsertTargetAddress(e.target.value)}
                    className="px-3.5 py-2.5 text-sm sm:text-base font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {nodes.map((n) => (
                      <option key={n.address} value={n.address}>
                        Node {n.address} (DATA: {n.value})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-mono font-bold text-slate-400 dark:text-slate-500">
                    Target Placement:
                  </label>
                  <div className="px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    {insertMode === 'BEGINNING'
                      ? 'Prepend before HEAD (1000)'
                      : 'Append after current TAIL'}
                  </div>
                </div>
              )}

              {/* Execute Insert Button */}
              <div>
                <button
                  type="button"
                  id="btn-execute-insert"
                  onClick={handleInsert}
                  className="w-full px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {insertMode === 'BEGINNING'
                      ? 'Insert at Beginning'
                      : insertMode === 'ENDING'
                      ? 'Insert at End'
                      : 'Insert After Node'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 leading-relaxed">
              <span className="font-bold text-blue-700 dark:text-blue-300">Educational Hint: </span>
              {insertMode === 'BEGINNING' &&
                'In a Circular Linked List, inserting at the beginning requires updating the new node to point to the old HEAD, and also updating TAIL.NEXT to point to the new HEAD!'}
              {insertMode === 'ENDING' &&
                'Inserting at the end updates the old TAIL to point to the new node, and the new node points back to HEAD, becoming the new TAIL.'}
              {insertMode === 'POSITION' &&
                'Inserting after an existing node updates the previous node’s NEXT pointer to the new node, and sets the new node’s NEXT pointer to the succeeding node.'}
            </div>
          </div>
        )}

        {/* TAB 2: DELETION CONTROLS */}
        {activeTab === 'DELETE' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Choose Deletion Target:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteMode('BEGINNING')}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md border transition-all cursor-pointer ${
                    deleteMode === 'BEGINNING'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Beginning (HEAD)
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteMode('ENDING')}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md border transition-all cursor-pointer ${
                    deleteMode === 'ENDING'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Ending (TAIL)
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteMode('POSITION')}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-md border transition-all cursor-pointer ${
                    deleteMode === 'POSITION'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Specific Address
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
              {/* Target Address Selector (if POSITION mode) */}
              {deleteMode === 'POSITION' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                    Target Node Address to Delete:
                  </label>
                  <select
                    id="select-delete-address"
                    value={deleteTargetAddress}
                    onChange={(e) => setDeleteTargetAddress(e.target.value)}
                    className="px-3.5 py-2.5 text-sm sm:text-base font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500"
                  >
                    {nodes.map((n) => (
                      <option key={n.address} value={n.address}>
                        Node {n.address} (DATA: {n.value})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-mono font-bold text-slate-400 dark:text-slate-500">
                    Active Target:
                  </label>
                  <div className="px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    {deleteMode === 'BEGINNING'
                      ? `Target HEAD Node: ${headAddress !== null ? headAddress : 'None'}`
                      : `Target TAIL Node: ${tailAddress !== null ? tailAddress : 'None'}`}
                  </div>
                </div>
              )}

              {/* Execute Delete Button */}
              <div>
                <button
                  type="button"
                  id="btn-execute-delete"
                  onClick={handleDelete}
                  disabled={nodes.length === 0}
                  className="w-full px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {deleteMode === 'BEGINNING'
                      ? 'Delete Head Node'
                      : deleteMode === 'ENDING'
                      ? 'Delete Tail Node'
                      : 'Delete Target Node'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/40 leading-relaxed">
              <span className="font-bold text-rose-700 dark:text-rose-300">Educational Hint: </span>
              {deleteMode === 'BEGINNING' &&
                'Deleting HEAD requires advancing HEAD to HEAD.NEXT and updating TAIL.NEXT to point to the new HEAD so the circular structure remains unbroken!'}
              {deleteMode === 'ENDING' &&
                'Deleting TAIL requires traversing to the node preceding TAIL, making it the new TAIL, and pointing its NEXT to HEAD.'}
              {deleteMode === 'POSITION' &&
                'Deleting any middle node requires locating the preceding node, changing PREV.NEXT = TARGET.NEXT to bypass the target node, and freeing memory.'}
            </div>
          </div>
        )}

        {/* TAB 3: SEARCHING CONTROLS */}
        {activeTab === 'SEARCH' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                  Search Target DATA:
                </label>
                <input
                  type="number"
                  id="input-search-data"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="e.g. 30"
                  className="px-3.5 py-2.5 text-sm sm:text-base font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <button
                  type="button"
                  id="btn-execute-search"
                  onClick={handleStartSearch}
                  disabled={searchStatus === 'searching' || nodes.length === 0}
                  className="w-full px-5 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {searchStatus === 'searching' ? 'Searching Chain...' : 'Start Animated Search'}
                  </span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  id="btn-reset-search"
                  onClick={handleResetSearch}
                  className="w-full px-5 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Search</span>
                </button>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/40 leading-relaxed">
              <span className="font-bold text-amber-700 dark:text-amber-300">Educational Hint: </span>
              In a Circular Linked List, searching starts at HEAD and follows NEXT pointers. Unlike a singly linked list that terminates at NULL, a circular list must explicitly check if the current pointer loops back to HEAD to prevent an infinite loop!
            </div>
          </div>
        )}

        {/* TAB 4: TRAVERSAL CONTROLS */}
        {activeTab === 'TRAVERSE' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
              <div className="sm:col-span-2">
                <button
                  type="button"
                  id="btn-execute-traverse"
                  onClick={handleStartTraversal}
                  disabled={traversalStatus === 'traversing' || nodes.length === 0}
                  className="w-full px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {traversalStatus === 'traversing' ? 'Traversing List...' : 'Start Full Traversal'}
                  </span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  id="btn-reset-traverse"
                  onClick={handleResetTraversal}
                  className="w-full px-5 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Traversal</span>
                </button>
              </div>
            </div>

            {traversalPath.length > 0 && (
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/80 font-mono text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 flex-wrap">
                <span className="font-bold">Visited Sequence:</span>
                {traversalPath.map((v, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 font-extrabold text-xs sm:text-sm">
                      {v}
                    </span>
                    <span>→</span>
                  </span>
                ))}
                {traversalStatus === 'complete' && (
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    HEAD ({nodes[0]?.value}) [Cycle Complete]
                  </span>
                )}
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 leading-relaxed">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Educational Hint: </span>
              A standard circular traversal begins with <code>do &#123; visit(curr); curr = curr-&gt;next; &#125; while (curr != head);</code>. Notice how it visits all active nodes and stops cleanly when returning to HEAD.
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. POINTER INSPECTION TABLE & EDUCATIONAL OUTPUT CONSOLE  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Pointer Table (5 cols) */}
        <div className="lg:col-span-5 card-modern p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-white">
                  Memory Pointer Table
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {nodes.length} active records
              </span>
            </div>

            {nodes.length === 0 ? (
              <div className="py-8 text-center text-xs sm:text-sm font-mono text-slate-400">
                Table empty. No nodes currently allocated in memory.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2 px-2.5">Address</th>
                      <th className="py-2 px-2.5">Data</th>
                      <th className="py-2 px-2.5">Next</th>
                      <th className="py-2 px-2.5">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {nodes.map((n, i) => {
                      const isHead = i === 0;
                      const isTail = i === nodes.length - 1;
                      return (
                        <tr
                          key={n.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2 px-2.5 font-bold text-blue-600 dark:text-blue-400">
                            {n.address}
                          </td>
                          <td className="py-2 px-2.5 font-extrabold text-slate-800 dark:text-slate-100">
                            {n.value}
                          </td>
                          <td className="py-2 px-2.5 font-semibold text-slate-600 dark:text-slate-300">
                            {n.nextAddress}
                          </td>
                          <td className="py-2 px-2.5">
                            {isHead && !isTail && (
                              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                                HEAD
                              </span>
                            )}
                            {isTail && !isHead && (
                              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#1D4ED8] dark:text-[#3B82F6] text-xs font-bold">
                                TAIL
                              </span>
                            )}
                            {isHead && isTail && (
                              <span className="px-2 py-0.5 rounded bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold">
                                HEAD/TAIL
                              </span>
                            )}
                            {!isHead && !isTail && (
                              <span className="text-slate-400 text-xs font-medium">NODE</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
            {nodes.length > 0 ? (
              <span>
                Verified invariant: Node {nodes[nodes.length - 1].address}.NEXT == {nodes[0].address}
              </span>
            ) : (
              <span>Invariant: No cyclic pointer active</span>
            )}
          </div>
        </div>

        {/* Right Column: Educational Output Console (7 cols) */}
        <div className="lg:col-span-7 card-modern p-5 bg-[#0B1120] text-slate-200 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-white">
                  Live Operations Console & Step Output
                </h3>
              </div>
              <button
                onClick={clearLogs}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Clear Output
              </button>
            </div>

            {/* Terminal Window with auto-scroll */}
            <div className="font-mono text-xs sm:text-sm flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
              {consoleLogs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    log.startsWith('> Error')
                      ? 'text-rose-400 font-semibold'
                      : log.startsWith('> MATCH') || log.startsWith('> Traversal Result')
                      ? 'text-emerald-400 font-bold'
                      : log.startsWith('> Circular connection') || log.startsWith('> Single-node')
                      ? 'text-blue-400 font-semibold'
                      : log.startsWith('>')
                      ? 'text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Terminal status: LIVE</span>
            <span>Educational Pointer Verifier v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

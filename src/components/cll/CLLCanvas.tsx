import React, { useRef, useEffect, useState } from 'react';
import { CLLNodeView } from './CLLNodeView';

export interface VisualNodeData {
  id: string;
  address: number;
  value: number;
  nextId: string | null;
  nextAddress?: number | null | string;
  isHead?: boolean;
  isTail?: boolean;
  isCurrent?: boolean;
  isPrev?: boolean;
  isTarget?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
  isVisited?: boolean;
  isFadingOut?: boolean;
  hasBrokenPointer?: boolean;
  nextLabel?: string;
  customBadge?: string;
}

interface CLLCanvasProps {
  nodes: VisualNodeData[];
  headId: string | null;
  tailId?: string | null;
  currentId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  onNextClick?: (nodeId: string) => void;
  onApplyNextAddress?: (fromAddress: number, targetAddress: number) => void;
  isAnimatingLoop?: boolean;
  showNullForTail?: boolean;
  customTailLabel?: string;
}

export const CLLCanvas: React.FC<CLLCanvasProps> = ({
  nodes,
  headId,
  tailId,
  currentId,
  onNodeClick,
  onNextClick,
  onApplyNextAddress,
  isAnimatingLoop = false,
  showNullForTail = false,
  customTailLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number; w: number; h: number }>>(
    new Map()
  );

  // Measure positions of nodes relative to content wrapper for exact SVG arrow drawing
  const updatePositions = () => {
    if (!contentWrapperRef.current) return;
    const wrapperRect = contentWrapperRef.current.getBoundingClientRect();
    const posMap = new Map<string, { x: number; y: number; w: number; h: number }>();

    nodes.forEach((node) => {
      const el = document.getElementById(`cll-node-container-${node.id}`);
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
    const timer = setTimeout(updatePositions, 80);
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
  }, [nodes, headId, tailId, currentId]);

  const headNode = nodes.find((n) => n.id === headId);
  const tailNode = tailId ? nodes.find((n) => n.id === tailId) : nodes[nodes.length - 1];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-x-auto overflow-y-visible py-3 sm:py-4 select-none overscroll-x-contain touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Scrollable content wrapper that expands to fit all nodes + safe padding */}
      <div
        ref={contentWrapperRef}
        className="relative min-w-full w-max flex items-center justify-center gap-6 sm:gap-10 z-10 pt-4 pb-16 px-8 sm:px-14 flex-nowrap"
      >
        {nodes.map((node) => {
          return (
            <div key={node.id} className="relative shrink-0">
              <CLLNodeView
                id={node.id}
                address={node.address}
                value={node.value}
                nextAddress={node.nextAddress}
                isHead={node.id === headId}
                isTail={node.id === tailId || (!tailId && node === nodes[nodes.length - 1])}
                isCurrent={node.id === currentId}
                isPrev={node.isPrev}
                isTarget={node.isTarget}
                isNew={node.isNew}
                isSelected={node.isSelected}
                isVisited={node.isVisited}
                isFadingOut={node.isFadingOut}
                hasBrokenPointer={node.hasBrokenPointer}
                nextLabel={node.nextLabel}
                customBadge={node.customBadge}
                onClick={() => onNodeClick && onNodeClick(node.id)}
                onNextClick={onNextClick ? () => onNextClick(node.id) : undefined}
                onApplyNextAddress={onApplyNextAddress}
              />
            </div>
          );
        })}

        {/* Visual NULL box if tail points to NULL */}
        {showNullForTail && (
          <div className="flex items-center gap-2 pl-2 shrink-0">
            <span className="text-slate-400 font-mono text-sm">→</span>
            <div className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border-2 border-dashed border-rose-400 dark:border-rose-600/60 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">
              NULL (0x0)
            </div>
          </div>
        )}

        {/* SVG Arrows connecting nodes and the circular loop-back path */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        >
          <defs>
            <marker
              id="cll-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-[#2563EB] dark:fill-[#3B82F6]" />
            </marker>
            <marker
              id="cll-arrow-amber"
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
              id="cll-arrow-emerald"
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
            if (!node.nextId) return null;
            const fromPos = nodePositions.get(node.id);
            const toPos = nodePositions.get(node.nextId);
            if (!fromPos || !toPos) return null;

            // If pointing to immediately next node in linear view
            if (idx < nodes.length - 1 && nodes[idx + 1].id === node.nextId) {
              const startX = fromPos.x + fromPos.w;
              const startY = fromPos.y + fromPos.h * 0.7;
              const endX = toPos.x;
              const endY = toPos.y + toPos.h * 0.7;

              const isHighlighted = isAnimatingLoop || node.id === currentId || node.isVisited;

              return (
                <g key={`arrow-${node.id}-${node.nextId}`}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isHighlighted ? '#F59E0B' : '#2563EB'}
                    strokeWidth="2.5"
                    strokeDasharray={isHighlighted ? '4 2' : 'none'}
                    markerEnd={isHighlighted ? 'url(#cll-arrow-amber)' : 'url(#cll-arrow)'}
                    className="transition-all duration-300"
                  />
                </g>
              );
            }

            // If single node points to itself
            if (node.id === node.nextId && nodes.length === 1) {
              const x = fromPos.x + fromPos.w * 0.75;
              const y = fromPos.y + fromPos.h;
              const path = `M ${x} ${y} C ${x + 40} ${y + 35}, ${x - 40} ${y + 35}, ${x - 10} ${y + 5}`;
              return (
                <path
                  key={`self-loop-${node.id}`}
                  d={path}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  markerEnd="url(#cll-arrow)"
                />
              );
            }

            return null;
          })}

          {/* 2. Curved Return Loop-back Arrow from Tail back to HEAD */}
          {(() => {
            if (nodes.length <= 1 || showNullForTail) return null;
            const tail = tailNode;
            if (!tail || !tail.nextId) return null;

            const fromPos = nodePositions.get(tail.id);
            const toPos = nodePositions.get(tail.nextId);
            if (!fromPos || !toPos) return null;

            // Loop-back below all nodes returning to target (HEAD)
            const startX = fromPos.x + fromPos.w * 0.85;
            const startY = fromPos.y + fromPos.h;
            const targetX = toPos.x + toPos.w * 0.35;
            const targetY = toPos.y + toPos.h;
            const loopDepth = 40;

            const path = `
              M ${startX} ${startY}
              v ${loopDepth}
              H ${targetX}
              V ${targetY + 4}
            `;

            const isLoopActive = isAnimatingLoop || tail.id === currentId;

            return (
              <g key={`loopback-tail-to-${tail.nextId}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={isLoopActive ? '#10B981' : '#2563EB'}
                  strokeWidth="2.5"
                  strokeDasharray={isLoopActive ? '6 3' : 'none'}
                  markerEnd={isLoopActive ? 'url(#cll-arrow-emerald)' : 'url(#cll-arrow)'}
                  className={isLoopActive ? 'animate-pulse' : 'transition-all duration-300'}
                />
                {/* Loopback Label with Memory Addresses */}
                <text
                  x={(startX + targetX) / 2}
                  y={startY + loopDepth + 14}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-blue-600 dark:fill-blue-400 select-none"
                >
                  {customTailLabel || `TAIL (addr ${tail.address}) NEXT → HEAD (addr ${headNode?.address || 1000})`}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

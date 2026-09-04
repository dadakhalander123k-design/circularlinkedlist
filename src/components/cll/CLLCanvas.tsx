import React, { useRef, useEffect, useState } from 'react';
import { CLLNodeView } from './CLLNodeView';

export interface VisualNodeData {
  id: string;
  value: number;
  nextId: string | null;
  isHead?: boolean;
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
  currentId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  onNextClick?: (nodeId: string) => void;
  isAnimatingLoop?: boolean;
  showNullForTail?: boolean;
  customTailLabel?: string;
}

export const CLLCanvas: React.FC<CLLCanvasProps> = ({
  nodes,
  headId,
  currentId,
  onNodeClick,
  onNextClick,
  isAnimatingLoop = false,
  showNullForTail = false,
  customTailLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number; w: number; h: number }>>(
    new Map()
  );

  // Measure positions of nodes relative to container for exact SVG arrow drawing
  const updatePositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const posMap = new Map<string, { x: number; y: number; w: number; h: number }>();

    nodes.forEach((node) => {
      const el = document.getElementById(`cll-node-container-${node.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        posMap.set(node.id, {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
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
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [nodes, headId, currentId]);

  const headNode = nodes.find((n) => n.id === headId);
  const headPos = headId ? nodePositions.get(headId) : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-x-auto overflow-y-visible py-6 px-4 min-h-[170px] flex items-center justify-center select-none"
    >
      {/* Node elements in responsive flex row */}
      <div className="flex items-center gap-6 sm:gap-10 z-10 py-4 flex-nowrap">
        {nodes.map((node) => {
          return (
            <div key={node.id} className="relative">
              <CLLNodeView
                id={node.id}
                value={node.value}
                isHead={node.id === headId}
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
              />
            </div>
          );
        })}

        {/* Visual NULL box if tail points to NULL (demonstrates SLL or broken CLL) */}
        {showNullForTail && (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-slate-400 font-mono text-sm">→</span>
            <div className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border-2 border-dashed border-rose-400 dark:border-rose-600/60 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">
              NULL
            </div>
          </div>
        )}
      </div>

      {/* SVG Arrows connecting nodes and the circular loop-back path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        style={{ minWidth: '100%', minHeight: '100%' }}
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
            const startY = fromPos.y + fromPos.h * 0.65;
            const endX = toPos.x;
            const endY = toPos.y + toPos.h * 0.65;

            const isHighlighted =
              isAnimatingLoop || node.id === currentId || node.isVisited;

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

          // If single node points to itself: Draw loop-around
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
          const tailNode = nodes[nodes.length - 1];
          if (!tailNode || !tailNode.nextId) return null;

          const fromPos = nodePositions.get(tailNode.id);
          const toPos = nodePositions.get(tailNode.nextId);
          if (!fromPos || !toPos) return null;

          // Only draw loop-back if pointing backwards (e.g. to head or earlier node)
          const startX = fromPos.x + fromPos.w * 0.85;
          const startY = fromPos.y + fromPos.h;
          const targetX = toPos.x + toPos.w * 0.35;
          const targetY = toPos.y + toPos.h;
          const loopDepth = 38;

          // Draw an elegant curved loop below all nodes returning to head
          const path = `
            M ${startX} ${startY}
            v ${loopDepth}
            H ${targetX}
            V ${targetY + 4}
          `;

          const isLoopActive = isAnimatingLoop || tailNode.id === currentId;

          return (
            <g key={`loopback-tail-to-${tailNode.nextId}`}>
              <path
                d={path}
                fill="none"
                stroke={isLoopActive ? '#10B981' : '#2563EB'}
                strokeWidth="2.5"
                strokeDasharray={isLoopActive ? '6 3' : 'none'}
                markerEnd={isLoopActive ? 'url(#cll-arrow-emerald)' : 'url(#cll-arrow)'}
                className={isLoopActive ? 'animate-pulse' : 'transition-all duration-300'}
              />
              {/* Loopback Label */}
              <text
                x={(startX + targetX) / 2}
                y={startY + loopDepth + 14}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-blue-600 dark:fill-blue-400 select-none"
              >
                {customTailLabel || 'CIRCULAR LOOP: LAST NODE → HEAD'}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

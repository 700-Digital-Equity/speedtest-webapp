import React, { useRef, useState } from 'react';
import { LeaderboardTable } from './LeaderboardTable';

// Simple floating, draggable, resizable panel for the results table
export default function FloatingResultsTable({ results, onClose, handleSort, sortKey, sortOrder }) {
  const panelRef = useRef(null);
  const [size, setSize] = useState({ width: 820, height: 340 });
  // Center the panel by default
  const [pos, setPos] = useState(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(0, Math.round((vw - 820) / 2)),
      y: Math.max(0, Math.round((vh - 340) / 2)),
    };
  });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Drag handlers
  const onMouseDownDrag = e => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    e.stopPropagation();
  };
  const onMouseMove = e => {
    if (dragging) {
      setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (resizing) {
      setSize({
        width: Math.max(320, resizeStart.width + (e.clientX - resizeStart.x)),
        height: Math.max(180, resizeStart.height + (e.clientY - resizeStart.y)),
      });
    }
  };
  const onMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };
  // Resize handlers
  const onMouseDownResize = e => {
    setResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width: size.width, height: size.height });
    e.stopPropagation();
  };

  React.useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  });

  return (
    <>
      <style>{`
        :root {
          --float-bg: #232837ee;
          --float-fg: #fff;
          --float-border: #4e79a7;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --float-bg: #fff;
            --float-fg: #232837;
            --float-border: #4e79a7;
          }
        }
      `}</style>
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: size.width,
          height: size.height,
          background: 'var(--float-bg, #232837ee)',
          color: 'var(--float-fg, #fff)',
          border: '2px solid var(--float-border, #4e79a7)',
          borderRadius: 10,
          zIndex: 2000,
          boxShadow: '0 4px 32px #000a',
          display: 'flex',
          flexDirection: 'column',
          userSelect: dragging || resizing ? 'none' : 'auto',
          transition: dragging || resizing ? 'none' : 'box-shadow 0.2s',
        }}
      >
        <div
          style={{
            cursor: 'move',
            background: 'var(--float-border, #4e79a7)',
            color: 'var(--float-fg, #fff)',
            padding: '8px 16px',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseDown={onMouseDownDrag}
        >
        Results in View
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginLeft: 12 }}
          title="Close"
        >
          ×
        </button>
      </div>
        <div style={{ flex: 1, overflow: 'auto', background: 'inherit', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
          <LeaderboardTable
            results={results}
            compact
            handleSort={handleSort}
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 18,
          height: 18,
          cursor: 'nwse-resize',
          zIndex: 10,
        }}
        onMouseDown={onMouseDownResize}
        title="Resize"
      >
        <svg width="18" height="18"><polyline points="0,18 18,0" stroke="#4e79a7" strokeWidth="3" fill="none" /></svg>
      </div>
      </div>
    </>
  );
}

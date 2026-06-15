import { IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MidiEventLogEntry } from '../../midi/useMidiEventLog';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { MidiEventLog } from './MidiEventLog';

type MidiEventLogPanelProps = {
  entries: MidiEventLogEntry[];
  onClear: () => void;
  onClose: () => void;
};

const DEFAULT_PANEL_WIDTH = 384;
const MIN_PANEL_WIDTH = 175;

export function MidiEventLogPanel({ entries, onClear, onClose }: MidiEventLogPanelProps) {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [showCc, setShowCc] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  const [showProgramChange, setShowProgramChange] = useState(true);
  const [showUnknown, setShowUnknown] = useState(true);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_PANEL_WIDTH);

  const clampWidth = useCallback((width: number) => {
    return Math.min(Math.max(width, MIN_PANEL_WIDTH), window.innerWidth);
  }, []);

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    dragStartXRef.current = event.clientX;
    dragStartWidthRef.current = panelWidth;
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const delta = dragStartXRef.current - event.clientX;
      const nextWidth = clampWidth(dragStartWidthRef.current + delta);
      setPanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [clampWidth, isResizing]);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (entry.direction === 'in') {
          if (!showInput) {
            return false;
          }
        } else if (!showOutput) {
          return false;
        }

        if (entry.type === 'cc') {
          return showCc;
        }

        if (entry.type === 'noteOn') {
          return showNote;
        }

        if (entry.type === 'noteOff') {
          return showNote;
        }

        if (entry.type === 'programChange') {
          return showProgramChange;
        }

        return showUnknown;
      }),
    [entries, showCc, showInput, showNote, showOutput, showProgramChange, showUnknown],
  );

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex flex-col border-l border-slate-700 bg-slate-950 shadow-lg"
      style={{ maxWidth: '100%', width: `${panelWidth}px` }}
    >
      <div
        aria-label="Resize MIDI event log panel"
        className="absolute top-0 bottom-0 left-0 w-2 cursor-col-resize bg-transparent transition-colors hover:bg-brand-400/30"
        onMouseDown={handleResizeStart}
        role="separator"
      />
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">MIDI Event Log</h2>
          <Button color="default" isIcon onClick={onClose} title="Close panel" variant="text">
            <IconX className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {entries.length === 0
            ? 'No events captured yet'
            : `${filteredEntries.length} of ${entries.length} event${entries.length !== 1 ? 's' : ''} shown`}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <Checkbox
            checked={showInput}
            label="Input"
            onChange={(event) => setShowInput(event.target.checked)}
          />
          <Checkbox
            checked={showOutput}
            label="Output"
            onChange={(event) => setShowOutput(event.target.checked)}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          <Checkbox
            checked={showNote}
            label="Note"
            onChange={(event) => setShowNote(event.target.checked)}
          />
          <Checkbox
            checked={showProgramChange}
            label="PC"
            onChange={(event) => setShowProgramChange(event.target.checked)}
          />
          <Checkbox
            checked={showCc}
            label="CC"
            onChange={(event) => setShowCc(event.target.checked)}
          />
          <Checkbox
            checked={showUnknown}
            label="Other"
            onChange={(event) => setShowUnknown(event.target.checked)}
          />
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4">
          <MidiEventLog allCapturedCount={entries.length} entries={filteredEntries} />
        </div>
      </div>

      {/* Footer with clear button */}
      <div className="border-t border-slate-700 bg-slate-900 px-4 py-3">
        <Button color="default" onClick={onClear} variant="outlined" className="w-full">
          Clear Log
        </Button>
      </div>
    </div>
  );
}

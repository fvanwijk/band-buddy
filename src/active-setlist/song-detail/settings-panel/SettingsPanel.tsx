import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconAdjustments } from '@tabler/icons-react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import { useGetShowDrawingTools, useSetShowDrawingTools } from '../../../api/useSettings';
import { useUpdateSong } from '../../../api/useSong';
import { useMidiEventLogContext } from '../../../contexts/MidiEventLogContext';
import { Grid } from '../../../settings/Grid';
import { GridCell } from '../../../settings/GridCell';
import { defaultTabOptions } from '../../../songs/form/settings/SettingsTab';
import type { Song } from '../../../types';
import { Button } from '../../../ui/Button';
import { Checkbox } from '../../../ui/Checkbox';
import { SelectField } from '../../../ui/form/SelectField';
import { MetronomeVolumePanel } from '../metronome-volume-panel/MetronomeVolumePanel';
import { TransposePanel } from '../transpose-panel/TransposePanel';
import { ZoomPanel } from '../zoom-panel/ZoomPanel';

type SettingsPanelProps = {
  onZoomChange: (zoom: number) => void;
  song: Song;
  zoom: number;
};

type SongDefaultTab = NonNullable<Song['defaultTab']>;

export function SettingsPanel({ onZoomChange, song, zoom }: SettingsPanelProps) {
  const updateSong = useUpdateSong(song.id);
  const { isOpen: isMidiEventLogOpen, setIsOpen: setIsMidiEventLogOpen } = useMidiEventLogContext();
  const showDrawingTools = useGetShowDrawingTools();
  const setShowDrawingTools = useSetShowDrawingTools();
  const transpose = song.transpose ?? 0;
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
    placement: 'bottom-end',
  });

  const handleTranspose = (delta: number) => {
    updateSong({
      ...song,
      transpose: transpose + delta,
    });
  };

  const hasSettings = song.key || song.lyrics || song.bpm;

  const handleDefaultTabChange = (defaultTab: SongDefaultTab) => {
    updateSong({
      ...song,
      defaultTab,
    });
  };

  return (
    <Popover>
      <PopoverButton
        as={Button}
        color="primary"
        isIcon
        ref={setReferenceElement}
        title="Settings"
        type="button"
        variant="outlined"
      >
        <IconAdjustments className="h-4 w-4" />
      </PopoverButton>
      <PopoverPanel
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="z-20 shadow-lg"
      >
        <Grid className="divide-slate-800 border-slate-800 bg-slate-900">
          {hasSettings ? (
            <>
              {song.key && (
                <TransposePanel onTransposeChange={handleTranspose} transpose={transpose} />
              )}
              {song.bpm && <MetronomeVolumePanel />}
              {song.lyrics && (
                <>
                  <ZoomPanel onZoomChange={onZoomChange} zoom={zoom} />
                  <div className="space-y-3 bg-slate-800/20 p-3">
                    <Checkbox
                      checked={showDrawingTools}
                      label="Show drawing tools"
                      onChange={(e) => setShowDrawingTools(e.target.checked)}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <GridCell className="p-3">
              <p className="mb-1 text-slate-200">No settings available for this song.</p>
              <p className="text-slate-400">
                Add more information such as lyrics, key or BPM to enable settings.
              </p>
            </GridCell>
          )}
          <GridCell className="p-3">
            <SelectField
              label="Default tab"
              onChange={(event) => handleDefaultTabChange(event.target.value as SongDefaultTab)}
              options={defaultTabOptions}
              value={song.defaultTab || 'auto'}
            />
          </GridCell>
          <GridCell className="p-3">
            <Checkbox
              checked={isMidiEventLogOpen}
              label="Show MIDI event log"
              onChange={(event) => setIsMidiEventLogOpen(event.target.checked)}
            />
          </GridCell>
        </Grid>
      </PopoverPanel>
    </Popover>
  );
}

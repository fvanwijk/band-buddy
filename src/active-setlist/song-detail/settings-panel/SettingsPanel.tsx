import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconAdjustments } from '@tabler/icons-react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import {
  useGetHideEmptyTabs,
  useGetShowDrawingTools,
  useGetSkipMidiOnSongChange,
  useSetHideEmptyTabs,
  useSetShowDrawingTools,
  useSetSkipMidiOnSongChange,
} from '../../../api/useSettings';
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
  const hideEmptyTabs = useGetHideEmptyTabs();
  const setHideEmptyTabs = useSetHideEmptyTabs();
  const showDrawingTools = useGetShowDrawingTools();
  const setShowDrawingTools = useSetShowDrawingTools();
  const skipMidiOnSongChange = useGetSkipMidiOnSongChange();
  const setSkipMidiOnSongChange = useSetSkipMidiOnSongChange();
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
          {song.key && <TransposePanel onTransposeChange={handleTranspose} transpose={transpose} />}
          {song.bpm && <MetronomeVolumePanel />}
          {song.lyrics && <ZoomPanel onZoomChange={onZoomChange} zoom={zoom} />}
          <GridCell className="p-3">
            <Checkbox
              checked={showDrawingTools}
              label="Show drawing tools"
              onChange={(event) => setShowDrawingTools(event.target.checked)}
            />
          </GridCell>
          <GridCell className="p-3">
            <SelectField
              label="Default tab"
              onChange={(event) => handleDefaultTabChange(event.target.value as SongDefaultTab)}
              options={defaultTabOptions}
              value={song.defaultTab || 'auto'}
            />
            <Checkbox
              checked={hideEmptyTabs}
              className="mt-3"
              label="Hide empty tabs"
              onChange={(event) => setHideEmptyTabs(event.target.checked)}
            />
          </GridCell>
          <GridCell className="flex flex-col gap-2 p-3">
            <Checkbox
              checked={skipMidiOnSongChange}
              label="Skip MIDI on song change"
              onChange={(event) => setSkipMidiOnSongChange(event.target.checked)}
            />
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

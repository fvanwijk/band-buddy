import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandSpotify,
  IconMicrophone2Off,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
} from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from 'tinybase/ui-react';

import { useGetInstruments } from '../../../api/useInstruments';
import { useGetSetlist } from '../../../api/useSetlist';
import { useGetSongs } from '../../../api/useSong';
import { useMetronome } from '../../../hooks/useMetronome';
import { useMidiDevices } from '../../../midi/useMidiDevices';
import { songDetailTabSchema } from '../../../schemas';
import { Button } from '../../../ui/Button';
import { EmptyStateBlock } from '../../../ui/empty-state-block/EmptyStateBlock';
import { InputField } from '../../../ui/form/InputField';
import { Page } from '../../../ui/Page';
import { PageHeader } from '../../../ui/PageHeader';
import { Tabs } from '../../../ui/Tabs';
import { DrawingOverlay } from '../lyrics/DrawingOverlay';
import { LyricsBlock } from '../lyrics/LyricsBlock';
import { MidiButtonsDisplay } from '../midi-buttons-display/MidiButtonsDisplay';
import { SettingsPanel } from '../settings-panel/SettingsPanel';
import { SheetMusicTab } from '../sheet-music-tab/SheetMusicTab';
import { SongStats } from '../song-stats/SongStats';

export function SongDetailPage() {
  const { setlistId, setlistSongId, tab } = useParams<{
    setlistId: string;
    setlistSongId: string;
    tab: string;
  }>();
  const navigate = useNavigate();
  const store = useStore();

  const setlist = useGetSetlist(setlistId!);
  const instruments = useGetInstruments();
  const songs = useGetSongs();
  const { isReady, isSupported, outputs } = useMidiDevices();

  const [zoom, setZoom] = useState(1);
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);

  // Create songs map
  const songsMap = new Map(songs.map((song) => [song.id, song]));

  const instrumentsById = useMemo(
    () => new Map(instruments.map((instrument) => [instrument.id, instrument])),
    [instruments],
  );

  const isMidiButtonDisabled = useCallback(
    (event: { instrumentId: string }) => {
      if (!isSupported || !isReady) {
        return true;
      }

      const instrument = instrumentsById.get(event.instrumentId);
      if (!instrument) {
        console.warn('Instrument not found for MIDI button');
        return true;
      }

      const output = outputs.find((o) => o.id === instrument.midiInId);
      if (!output) {
        console.warn('The MIDI input that is configured for the instrument is not available');
      }
      return !output;
    },
    [instrumentsById, outputs],
  );

  // Find the current song's details from the setlist structure
  const currentSongRef = setlist?.sets
    .flatMap((set) => set.songs)
    .find((song) => song.id === setlistSongId);
  const currentSongId = currentSongRef?.songId;

  if (!setlist || !currentSongId) {
    throw new Error('Song not found');
  }

  // Flatten all sets into a single list of songs for easier navigation, ordered by setIndex and songIndex
  const songsFromSetlist = setlist.sets
    .toSorted((a, b) => a.setIndex - b.setIndex)
    .flatMap((set) =>
      set.songs
        .toSorted((a, b) => a.songIndex - b.songIndex)
        .map((songRef) => ({
          setlistSongId: songRef.id,
          songId: songRef.songId,
        })),
    );

  // Find current position in the flattened list
  const currentSongIndex = songsFromSetlist.findIndex((s) => s.setlistSongId === setlistSongId);

  if (currentSongIndex === -1) {
    throw new Error('Song not found');
  }

  const currentSong = songsMap.get(currentSongId);
  if (!currentSong) {
    throw new Error('Song not found');
  }

  const parsedRouteTab = songDetailTabSchema.safeParse(tab);
  const selectedTab = parsedRouteTab.success ? parsedRouteTab.data : 'lyrics';

  // Initialize metronome
  useMetronome({
    bpm: currentSong.bpm || 120,
    isRunning: isMetronomeRunning,
    timeSignature: currentSong.timeSignature || '4/4',
  });

  const beatDurationSeconds = 60 / (currentSong.bpm || 120);

  // Get previous and next entries
  const previousEntry = currentSongIndex > 0 ? songsFromSetlist[currentSongIndex - 1] : null;
  const nextEntry =
    currentSongIndex < songsFromSetlist.length - 1 ? songsFromSetlist[currentSongIndex + 1] : null;

  const previousSong = previousEntry ? songsMap.get(previousEntry.songId) : null;
  const nextSong = nextEntry ? songsMap.get(nextEntry.songId) : null;

  const handleTabChange = (tabId: string) => {
    void navigate(`/play/${setlistId}/${setlistSongId}/${tabId}`);
  };

  const handleTriggerMidiEvent = (event: { instrumentId: string; programChange: number }) => {
    if (!isSupported || !isReady) {
      return;
    }

    const instrument = instrumentsById.get(event.instrumentId);
    if (!instrument) {
      console.warn('Instrument not found for MIDI button');
      return;
    }
    const selectedDevice = instrument.midiInId;
    if (!selectedDevice) {
      console.warn('No MIDI input device configured for the instrument');
      return;
    }

    const output = outputs.find((o) => o.id === selectedDevice);
    if (output) {
      output.sendProgramChange(event.programChange);
    }
  };

  const toolbar = (
    <div className="flex items-center gap-4">
      {currentSong.bpm && (
        <Button
          className="metronome-pulse"
          icon
          onClick={() => setIsMetronomeRunning((prev) => !prev)}
          style={{ animationDuration: `${beatDurationSeconds}s` }}
          title={isMetronomeRunning ? 'Stop metronome' : 'Start metronome'}
          type="button"
          variant="outlined"
        >
          {isMetronomeRunning ? (
            <IconPlayerStopFilled className="h-4 w-4" />
          ) : (
            <IconPlayerPlayFilled className="h-4 w-4" />
          )}
        </Button>
      )}
      <SongStats song={currentSong} />
      <SettingsPanel onZoomChange={setZoom} song={currentSong} zoom={zoom} />
    </div>
  );

  return (
    <>
      <Page className="pb-24.25">
        <PageHeader
          action={toolbar}
          backPath="/play"
          title={
            <div className="flex items-center gap-2">
              {currentSong.title}{' '}
              {currentSong.spotifyId && (
                <IconBrandSpotify
                  className="inline h-5 w-5 shrink-0 stroke-slate-300"
                  title="Imported from Spotify. Expect more features soon."
                />
              )}
            </div>
          }
          subtitle={currentSong.artist}
        />

        <Tabs
          activeTabId={selectedTab}
          onTabChange={handleTabChange}
          tabs={[
            {
              content:
                currentSong.lyrics && currentSong.lyrics.trim().length > 0 ? (
                  <DrawingOverlay songId={currentSongId} zoom={zoom}>
                    <LyricsBlock lyrics={currentSong.lyrics} transpose={currentSong.transpose} />
                  </DrawingOverlay>
                ) : (
                  <EmptyStateBlock icon={<IconMicrophone2Off className="h-8 w-8" />}>
                    No lyrics added yet
                  </EmptyStateBlock>
                ),
              id: 'lyrics',
              label: 'Lyrics',
            },
            {
              content: (
                <SheetMusicTab
                  sheetMusicFilename={currentSong.sheetMusicFilename}
                  songId={currentSongId}
                />
              ),
              id: 'sheet-music',
              label: 'Sheet Music',
            },
            {
              content: (
                <InputField
                  className="text-sm"
                  label="Notes"
                  onChange={(event) => {
                    store?.setPartialRow('songs', currentSongId, { notes: event.target.value });
                  }}
                  placeholder="Add notes, chord changes, or reminders..."
                  rows={12}
                  value={currentSong.notes || ''}
                />
              ),
              id: 'notes',
              label: 'Notes',
            },
            {
              content: (
                <MidiButtonsDisplay
                  isDisabled={isMidiButtonDisabled}
                  midiEvents={currentSong.midiEvents}
                  onTriggerEvent={handleTriggerMidiEvent}
                />
              ),
              id: 'midi',
              label: 'MIDI buttons',
            },
          ]}
        />
        <nav className="fixed bottom-0 left-0 z-10 w-full bg-slate-950">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 border-t border-slate-800 p-4">
            {previousEntry && (
              <Button
                as={Link}
                className="h-16 flex-1"
                color="primary"
                iconStart={<IconArrowLeft className="h-4 w-4" />}
                to={`/play/${setlistId}/${previousEntry.setlistSongId}`}
                variant="outlined"
              >
                {previousSong?.title || 'Previous'}
              </Button>
            )}
            {nextEntry && (
              <Button
                as={Link}
                className="col-start-2 h-16 flex-1"
                color="primary"
                iconEnd={<IconArrowRight className="h-4 w-4" />}
                to={`/play/${setlistId}/${nextEntry.setlistSongId}`}
                variant="outlined"
              >
                {nextSong?.title || 'Next'}
              </Button>
            )}
          </div>
        </nav>
      </Page>
    </>
  );
}

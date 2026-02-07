import { IconArrowLeft, IconArrowRight, IconMicrophone2Off } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { WebMidi } from 'webmidi';

import { DrawingOverlay } from './lyrics/DrawingOverlay';
import { LyricsBlock } from './lyrics/LyricsBlock';
import { MidiButtonsDisplay } from './midi-buttons-display/MidiButtonsDisplay';
import { SettingsPanel } from './SettingsPanel';
import { SongStats } from './SongStats';
import { useGetInstruments } from '../../api/useInstruments';
import { useGetSetlist } from '../../api/useSetlist';
import { useGetSongs } from '../../api/useSong';
import { useMidiDevices } from '../../midi/useMidiDevices';
import { Button } from '../../ui/Button';
import { EmptyStateBlock } from '../../ui/EmptyStateBlock';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';
import { Tabs } from '../../ui/Tabs';
export function SongDetailPage() {
  const { setlistId, songId, tab } = useParams<{
    setlistId: string;
    songId: string;
    tab: string;
  }>();
  const navigate = useNavigate();

  const setlist = useGetSetlist(setlistId!);
  const instruments = useGetInstruments();
  const songs = useGetSongs();
  const { isReady, isSupported, outputs } = useMidiDevices();

  const [zoom, setZoom] = useState(1);

  // Default to 'details' tab if not specified
  const selectedTab = tab && ['details', 'midi'].includes(tab) ? tab : 'details';

  // Create songs map
  const songsMap = new Map(songs.map((song) => [song.id, song]));

  const instrumentsById = useMemo(
    () => new Map(instruments.map((instrument) => [instrument.id, instrument])),
    [instruments],
  );

  const isMidiButtonDisabled = useCallback(
    (event: { instrumentId: string }) => {
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

  if (!setlist || !songId) {
    throw new Error('Song not found');
  }

  // Flatten all sets into a single list of songs for easier navigation
  const songFromSetlist = setlist.sets.flatMap((set) =>
    set.songs.map((songRef) => ({ setNumber: set.setNumber, songId: songRef.songId })),
  );

  // Find current song index
  const currentSongIndex = songFromSetlist.findIndex((s) => s.songId === songId);

  if (currentSongIndex === -1) {
    throw new Error('Song not found');
  }

  const currentSong = songsMap.get(songId);
  if (!currentSong) {
    throw new Error('Song not found');
  }

  // Get previous and next song IDs
  const previousSongId = currentSongIndex > 0 ? songFromSetlist[currentSongIndex - 1].songId : null;
  const nextSongId =
    currentSongIndex < songFromSetlist.length - 1
      ? songFromSetlist[currentSongIndex + 1].songId
      : null;

  const previousSong = previousSongId ? songsMap.get(previousSongId) : null;
  const nextSong = nextSongId ? songsMap.get(nextSongId) : null;

  const handleTabChange = (tabId: string) => {
    navigate(`/setlist/${setlistId}/song/${songId}/${tabId}`);
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

    const output = WebMidi.getOutputById(selectedDevice);
    if (output) {
      output.sendProgramChange(event.programChange);
    }
  };

  const transposeControl = (
    <div className="flex items-center gap-4">
      <SongStats song={currentSong} />
      <SettingsPanel onZoomChange={setZoom} song={currentSong} zoom={zoom} />
    </div>
  );

  return (
    <>
      <Page className="pb-24.25">
        <PageHeader
          action={transposeControl}
          backPath="/"
          title={currentSong.title}
          subtitle={currentSong.artist}
        />

        <Tabs
          activeTabId={selectedTab}
          onTabChange={handleTabChange}
          tabs={[
            {
              content:
                currentSong.lyrics && currentSong.lyrics.trim().length > 0 ? (
                  <DrawingOverlay songId={songId} zoom={zoom}>
                    <LyricsBlock lyrics={currentSong.lyrics} transpose={currentSong.transpose} />
                  </DrawingOverlay>
                ) : (
                  <EmptyStateBlock icon={<IconMicrophone2Off className="h-8 w-8" />}>
                    No lyrics added yet
                  </EmptyStateBlock>
                ),
              id: 'details',
              label: 'Lyrics',
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
            {previousSongId && (
              <Button
                as={Link}
                className="h-16 flex-1"
                color="primary"
                iconStart={<IconArrowLeft className="h-4 w-4" />}
                to={`/setlist/${setlistId}/song/${previousSongId}/${selectedTab}`}
                variant="outlined"
              >
                {previousSong?.title || 'Previous'}
              </Button>
            )}
            {nextSongId && (
              <Button
                as={Link}
                className="col-start-2 h-16 flex-1"
                color="primary"
                iconEnd={<IconArrowRight className="h-4 w-4" />}
                to={`/setlist/${setlistId}/song/${nextSongId}/${selectedTab}`}
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

import { IconArrowLeft, IconArrowRight, IconMicrophone2Off } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
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
import { BackButton } from '../../ui/BackButton';
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

  const setlist = useGetSetlist(setlistId);
  const instruments = useGetInstruments();
  const songs = useGetSongs();
  const { isReady, isSupported } = useMidiDevices();

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
      if (!isSupported || !isReady) {
        return true;
      }

      const instrument = instrumentsById.get(event.instrumentId);
      if (!instrument) {
        console.warn('Instrument not found for MIDI button');
        return true;
      }

      const output = WebMidi.getOutputById(instrument.midiInId);
      if (!output) {
        console.warn('The MIDI input that is configured for the instrument is not available');
      }
      return !output;
    },
    [isReady, isSupported, instrumentsById],
  );

  if (!setlist || !songId) {
    return (
      <Page>
        <BackButton to="/" />
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Song not found</p>
        </div>
      </Page>
    );
  }

  // Flatten all sets into a single list of songs for easier navigation
  const allSongs = setlist.sets.flatMap((set) =>
    set.songs.map((songRef) => ({ setNumber: set.setNumber, songId: songRef.songId })),
  );

  // Find current song index
  const currentSongIndex = allSongs.findIndex((s) => s.songId === songId);

  if (currentSongIndex === -1) {
    return (
      <Page>
        <BackButton to="/" />
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Song not found</p>
        </div>
      </Page>
    );
  }

  const currentSong = songsMap.get(songId);
  if (!currentSong) {
    return (
      <Page>
        <BackButton to="/" />
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Song not found</p>
        </div>
      </Page>
    );
  }

  // Get previous and next song IDs
  const previousSongId = currentSongIndex > 0 ? allSongs[currentSongIndex - 1].songId : null;
  const nextSongId =
    currentSongIndex < allSongs.length - 1 ? allSongs[currentSongIndex + 1].songId : null;

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
      <SettingsPanel song={currentSong} />
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
                  <DrawingOverlay songId={songId}>
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
        <nav className="fixed w-full left-0 bottom-0 z-10 bg-slate-950 ">
          <div className="mx-auto max-w-5xl grid grid-cols-2 gap-3 border-t border-slate-800 p-4">
            {previousSongId && (
              <Button
                as={Link}
                className="flex-1 h-16"
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
                className="flex-1 h-16 col-start-2"
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

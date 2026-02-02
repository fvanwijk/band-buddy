import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WebMidi } from 'webmidi';

import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { LyricsBlock } from '../components/LyricsBlock';
import { MidiButtonsDisplay } from '../components/MidiButtonsDisplay';
import { Page } from '../components/Page';
import { SongStats } from '../components/SongStats';
import { Tabs } from '../components/Tabs';
import { useGetInstruments } from '../hooks/useInstruments';
import { useMidiDevices } from '../hooks/useMidiDevices';
import { useGetSetlist } from '../hooks/useSetlist';
import { useGetSongs } from '../hooks/useSong';
import type { Song } from '../types';

function SongDetailPage() {
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
  const songsMap = new Map<string, Song>();
  songs.forEach((song) => {
    songsMap.set(song.id, song);
  });

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

  const handlePrevious = () => {
    if (previousSongId) {
      navigate(`/setlist/${setlistId}/song/${previousSongId}/${selectedTab}`);
    }
  };

  const handleNext = () => {
    if (nextSongId) {
      navigate(`/setlist/${setlistId}/song/${nextSongId}/${selectedTab}`);
    }
  };

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

  return (
    <Page>
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <BackButton to="/" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-100">{currentSong.title}</h1>
          <p className="text-sm text-slate-400">{currentSong.artist}</p>
        </div>
        <SongStats song={currentSong} />
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <Tabs
          activeTabId={selectedTab}
          onTabChange={handleTabChange}
          tabs={[
            {
              content: (
                <LyricsBlock lyrics={currentSong.lyrics} transpose={currentSong.transpose} />
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
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          color="primary"
          disabled={!previousSongId}
          iconStart={<IconArrowLeft className="h-4 w-4" />}
          onClick={handlePrevious}
          variant="outlined"
        >
          Previous
        </Button>
        <Button
          className="flex-1"
          color="primary"
          disabled={!nextSongId}
          iconEnd={<IconArrowRight className="h-4 w-4" />}
          onClick={handleNext}
          variant="outlined"
        >
          Next
        </Button>
      </div>
    </Page>
  );
}

export default SongDetailPage;

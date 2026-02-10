import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { DetailsTab } from './DetailsTab';
import { LyricsTab } from './lyrics/LyricsTab';
import { calculateMeasures } from './measures';
import { MidiButtonsTab } from './midi/MidiButtonsTab';
import { SheetMusicFormTab } from './sheet-music/SheetMusicFormTab';
import { useGetInstruments } from '../../api/useInstruments';
import type { MidiEvent, Song } from '../../types';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';
import { Tabs } from '../../ui/Tabs';
import { formatDurationToString, parseDuration } from '../../utils/duration';

type SongSubmitData = Omit<Song, 'id'>;

export type SongFormData = SongSubmitData & {
  durationString?: string;
  keyNote?: string;
  keyQuality?: string;
  sheetMusicFiles?: FileList;
  sheetMusicFilename?: string;
};

type SongFormProps = {
  backPath: string;
  initialData?: Song;
  onSubmit: (data: SongSubmitData, sheetMusicFile?: File) => void;
  title: string;
};

export function SongForm({ backPath, initialData, onSubmit, title }: SongFormProps) {
  const [calculatedMeasures, setCalculatedMeasures] = useState<number | null>(null);

  const { id, tab } = useParams<{ id?: string; tab?: string }>();
  const navigate = useNavigate();

  const instruments = useGetInstruments();

  const existingKey = initialData?.key || '';
  const existingNote = existingKey.replace(/m$/, '');
  const existingQuality = existingKey.endsWith('m') ? 'm' : '';

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SongFormData>({
    defaultValues: {
      artist: initialData?.artist || '',
      bpm: initialData?.bpm || undefined,
      durationString: initialData?.duration ? formatDurationToString(initialData.duration) : '',
      keyNote: existingNote || undefined,
      keyQuality: existingQuality || existingNote ? '' : undefined,
      lyrics: initialData?.lyrics || '',
      midiEvents: initialData?.midiEvents || [],
      sheetMusicFilename: initialData?.sheetMusicFilename,
      timeSignature: initialData?.timeSignature,
      title: initialData?.title || '',
    },
  });

  const { append, remove } = useFieldArray({
    control,
    name: 'midiEvents',
  });

  const durationString = watch('durationString');
  const durationSeconds = parseDuration(durationString);
  const bpm = watch('bpm');
  const lyrics = watch('lyrics');
  const midiEvents = watch('midiEvents') || [];
  const sheetMusicFiles = watch('sheetMusicFiles');
  const sheetMusicFilename = watch('sheetMusicFilename');
  const timeSignature = watch('timeSignature');

  const hasDrawings = initialData?.canvasPaths && initialData.canvasPaths.length > 0;
  const lyricsChanged = lyrics !== (initialData?.lyrics || '');
  const showDrawingWarning = hasDrawings && lyricsChanged;

  // Define which fields belong to which tab
  const detailsFields: (keyof SongFormData)[] = [
    'artist',
    'bpm',
    'durationString',
    'keyNote',
    'keyQuality',
    'timeSignature',
    'title',
  ];
  const lyricsFields: (keyof SongFormData)[] = ['lyrics'];

  // Check which tabs have errors
  const hasDetailsErrors = detailsFields.some((field) => !!errors[field]);
  const hasLyricsErrors = lyricsFields.some((field) => !!errors[field]);

  useEffect(() => {
    const measures = calculateMeasures(durationSeconds, bpm, timeSignature);
    setCalculatedMeasures(measures);
  }, [durationSeconds, bpm, timeSignature]);

  const selectedTab =
    tab && ['details', 'lyrics', 'sheet-music', 'midi'].includes(tab) ? tab : 'details';
  const songFormBasePath = id ? `/songs/edit/${id}` : '/songs/add';

  const handleTabChange = (tabId: string) => {
    navigate(`${songFormBasePath}/${tabId}`);
  };

  const handleFormError = (formErrors: FieldErrors<SongFormData>) => {
    // Check which tabs have errors using the fresh errors object
    const hasDetailsErrors = detailsFields.some((field) => !!formErrors[field]);
    const hasLyricsErrors = lyricsFields.some((field) => !!formErrors[field]);

    // Navigate to the first tab with errors
    if (hasDetailsErrors) {
      handleTabChange('details');
    } else if (hasLyricsErrors) {
      handleTabChange('lyrics');
    }
  };

  const handleFormSubmit = (data: SongFormData) => {
    const durationSeconds = parseDuration(data.durationString);

    onSubmit(
      {
        artist: data.artist,
        bpm: data.bpm,
        canvasPaths: initialData?.canvasPaths || [],
        duration: durationSeconds || undefined,
        key: (data.keyNote || existingNote) + (data.keyQuality || ''),
        lyrics: data.lyrics,
        midiEvents: data.midiEvents,
        sheetMusicFilename: data.sheetMusicFilename,
        spotifyId: initialData?.spotifyId,
        timeSignature: data.timeSignature,
        title: data.title,
        transpose: initialData?.transpose,
      },
      data.sheetMusicFiles?.[0],
    );
  };

  const handleAddMidiEvent = (event: Omit<MidiEvent, 'id'>) => {
    const newEvent: MidiEvent = {
      ...event,
      id: `midi-${Date.now()}`,
    };
    append(newEvent);
  };

  const handleDeleteMidiEvent = (eventId: string) => {
    const index = midiEvents.findIndex((event) => event.id === eventId);
    if (index >= 0) {
      remove(index);
    }
  };

  return (
    <Page>
      <PageHeader backPath={backPath} title={title} />
      <form
        autoComplete="off"
        className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        noValidate
        onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
      >
        <Tabs
          activeTabId={selectedTab}
          onTabChange={handleTabChange}
          tabs={[
            {
              content: (
                <DetailsTab
                  calculatedMeasures={calculatedMeasures}
                  errors={errors}
                  existingNote={existingNote}
                  register={register}
                />
              ),
              hasError: hasDetailsErrors,
              id: 'details',
              label: 'Song details',
            },
            {
              content: <LyricsTab error={errors.lyrics} register={register('lyrics')} />,
              hasError: hasLyricsErrors,
              id: 'lyrics',
              label: 'Lyrics',
            },
            {
              content: (
                <SheetMusicFormTab
                  error={errors.sheetMusicFiles}
                  register={register('sheetMusicFiles', {
                    validate: {
                      fileType: (files) => {
                        console.log(files, 'validating');
                        if (!files || files.length === 0) return true;
                        const file = files[0];
                        return file.type === 'application/pdf' || 'Please select a PDF file';
                      },
                    },
                  })}
                  setValue={setValue}
                  sheetMusicFiles={sheetMusicFiles}
                  sheetMusicFilename={sheetMusicFilename}
                />
              ),
              id: 'sheet-music',
              label: 'Sheet Music',
            },
            {
              content: (
                <MidiButtonsTab
                  instruments={instruments}
                  midiEvents={midiEvents}
                  onAddEvent={handleAddMidiEvent}
                  onDeleteEvent={handleDeleteMidiEvent}
                />
              ),
              id: 'midi',
              label: 'MIDI events',
            },
          ]}
        />

        {showDrawingWarning && (
          <Alert severity="warning">
            Lyrics have changed. Your drawings may no longer align correctly with the lyrics during
            performance.
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button as={Link} className="flex-1" to={backPath} type="button" variant="outlined">
            Cancel
          </Button>
          <Button
            className="flex-1"
            color="primary"
            iconStart={<IconDeviceFloppy className="h-4 w-4" />}
            type="submit"
            variant="filled"
          >
            {initialData ? 'Save Changes' : 'Add song'}
          </Button>
        </div>
      </form>
    </Page>
  );
}

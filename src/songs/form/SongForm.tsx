import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { LyricsTab } from './lyrics/LyricsTab';
import { calculateMeasures } from './measures';
import { MidiButtonsTab } from './midi/MidiButtonsTab';
import { useGetInstruments } from '../../api/useInstruments';
import type { MidiEvent, Song } from '../../types';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { InputField } from '../../ui/form/InputField';
import { RadioGroup } from '../../ui/form/RadioGroup';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';
import { Switch } from '../../ui/Switch';
import { Tabs } from '../../ui/Tabs';
import { formatDurationToString, parseDuration } from '../../utils/duration';

type SongSubmitData = Omit<Song, 'id'>;

type SongFormData = SongSubmitData & {
  durationString?: string;
  keyNote?: string;
  keyQuality?: string;
};

type SongFormProps = {
  backPath: string;
  initialData?: Song;
  onSubmit: (data: SongSubmitData) => void;
  title: string;
};

export function SongForm({ backPath, initialData, onSubmit, title }: SongFormProps) {
  const [useFlats, setUseFlats] = useState(false);
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
    watch,
  } = useForm<SongFormData>({
    defaultValues: {
      artist: initialData?.artist || '',
      bpm: initialData?.bpm || undefined,
      durationString: initialData?.duration ? formatDurationToString(initialData.duration) : '',
      keyNote: existingNote || undefined,
      keyQuality: existingQuality || undefined,
      lyrics: initialData?.lyrics || '',
      midiEvents: initialData?.midiEvents || [],
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

  useEffect(() => {
    // Auto-detect if the existing key uses flats
    if (existingNote.includes('b')) {
      setUseFlats(true);
    }
  }, [existingNote]);

  const selectedTab = tab && ['details', 'lyrics', 'midi'].includes(tab) ? tab : 'details';
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

  const noteOptions = useFlats
    ? [
        { label: 'C', value: 'C' },
        { label: 'D♭', value: 'Db' },
        { label: 'D', value: 'D' },
        { label: 'E♭', value: 'Eb' },
        { label: 'E', value: 'E' },
        { label: 'F', value: 'F' },
        { label: 'G♭', value: 'Gb' },
        { label: 'G', value: 'G' },
        { label: 'A♭', value: 'Ab' },
        { label: 'A', value: 'A' },
        { label: 'B♭', value: 'Bb' },
        { label: 'B', value: 'B' },
      ]
    : [
        { label: 'C', value: 'C' },
        { label: 'C♯', value: 'C#' },
        { label: 'D', value: 'D' },
        { label: 'D♯', value: 'D#' },
        { label: 'E', value: 'E' },
        { label: 'F', value: 'F' },
        { label: 'F♯', value: 'F#' },
        { label: 'G', value: 'G' },
        { label: 'G♯', value: 'G#' },
        { label: 'A', value: 'A' },
        { label: 'A♯', value: 'A#' },
        { label: 'B', value: 'B' },
      ];

  const qualityOptions = [
    { label: 'Major', value: '' },
    { label: 'Minor', value: 'm' },
  ];

  const timeSignatureOptions = [
    { label: '4/4', value: '4/4' },
    { label: '3/4', value: '3/4' },
    { label: '6/8', value: '6/8' },
    { label: '2/4', value: '2/4' },
  ];

  const handleFormSubmit = (data: SongFormData) => {
    const durationSeconds = parseDuration(data.durationString);

    onSubmit({
      artist: data.artist,
      bpm: data.bpm,
      canvasPaths: initialData?.canvasPaths || [],
      duration: durationSeconds || undefined,
      key: (data.keyNote || existingNote) + (data.keyQuality || ''),
      lyrics: data.lyrics,
      midiEvents: data.midiEvents,
      timeSignature: data.timeSignature,
      title: data.title,
      transpose: initialData?.transpose,
    });
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
                <div className="space-y-4">
                  <InputField
                    label="Artist"
                    id="artist"
                    placeholder="Enter artist name"
                    error={errors.artist}
                    register={register('artist', { required: 'Artist is required' })}
                    required
                  />
                  <InputField
                    label="Title"
                    id="title"
                    placeholder="Enter song title"
                    error={errors.title}
                    register={register('title', { required: 'Title is required' })}
                    required
                  />
                  <RadioGroup
                    label="Key (Note)"
                    options={noteOptions}
                    error={errors.keyNote}
                    register={register('keyNote', { required: 'Key note is required' })}
                    required
                  >
                    <div className="flex items-center gap-2">
                      <Switch checked={useFlats} onCheckedChange={setUseFlats} />
                      <span className="text-xs font-medium text-slate-400">
                        {useFlats ? '♭' : '♯'}
                      </span>
                    </div>
                  </RadioGroup>
                  <RadioGroup
                    label="Key (Quality)"
                    options={qualityOptions}
                    error={errors.keyQuality}
                    register={register('keyQuality', {
                      required: 'Key quality is required',
                    })}
                    required
                  />
                  <RadioGroup
                    label="Time Signature"
                    options={timeSignatureOptions}
                    error={errors.timeSignature}
                    register={register('timeSignature', {
                      required: 'Time signature is required',
                    })}
                  />
                  <InputField
                    error={errors.bpm}
                    id="bpm"
                    label="BPM"
                    max="200"
                    min="0"
                    placeholder="Enter BPM (0-200)"
                    register={register('bpm', {
                      max: { message: 'BPM must be at most 200', value: 200 },
                      min: { message: 'BPM must be at least 0', value: 0 },
                      valueAsNumber: true,
                    })}
                    type="number"
                  />
                  <div>
                    <InputField
                      error={errors.durationString}
                      id="duration"
                      label="Duration (mm:ss)"
                      placeholder="Enter duration (mm:ss)"
                      register={register('durationString', {
                        pattern: {
                          message: 'Duration must be in mm:ss format',
                          value: /^\d{1,3}:[0-5]\d$/,
                        },
                      })}
                    />
                    {!errors.durationString && calculatedMeasures !== null && (
                      <p className="mt-1 text-xs text-slate-500">
                        ±{calculatedMeasures} measure{calculatedMeasures !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
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

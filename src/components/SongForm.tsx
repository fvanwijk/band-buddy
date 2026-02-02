import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BackButton } from './BackButton';
import { Button } from './Button';
import { InputField } from './InputField';
import { LyricsTab } from './LyricsTab';
import { MidiEventsTab } from './MidiEventsTab';
import { PageHeader } from './PageHeader';
import { RadioGroup } from './RadioGroup';
import { Tabs } from './Tabs';
import { useGetInstruments } from '../hooks/useInstruments';
import type { MidiEvent, Song } from '../types';
import { calculateMeasures } from '../utils/measures';

type SongFormData = Omit<Song, 'id' | 'midiEvents'> & {
  keyNote?: string;
  keyQuality?: string;
};

type SongFormProps = {
  backPath: string;
  initialData?: Song;
  onSubmit: (data: {
    artist: string;
    bpm?: number;
    duration?: string;
    key: string;
    lyrics?: string;
    midiEvents?: MidiEvent[];
    timeSignature: string;
    title: string;
    transpose?: number;
  }) => void;
  title: string;
};

export function SongForm({ backPath, initialData, onSubmit, title }: SongFormProps) {
  const [useFlats, setUseFlats] = useState(false);
  const [calculatedMeasures, setCalculatedMeasures] = useState<number | null>(null);
  const [midiEvents, setMidiEvents] = useState<MidiEvent[]>(initialData?.midiEvents || []);

  const { id, tab } = useParams<{ id?: string; tab?: string }>();
  const navigate = useNavigate();

  const instruments = useGetInstruments();

  const existingKey = initialData?.key || 'C';
  const existingNote = existingKey.replace(/m$/, '');
  const existingQuality = existingKey.endsWith('m') ? 'm' : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SongFormData>({
    defaultValues: {
      artist: initialData?.artist || '',
      bpm: initialData?.bpm || undefined,
      duration: initialData?.duration || '',
      keyNote: existingNote,
      keyQuality: existingQuality,
      lyrics: initialData?.lyrics || '',
      timeSignature: initialData?.timeSignature || '4/4',
      title: initialData?.title || '',
    },
  });

  const duration = watch('duration');
  const bpm = watch('bpm');
  const timeSignature = watch('timeSignature');

  useEffect(() => {
    const measures = calculateMeasures(duration, bpm, timeSignature);
    setCalculatedMeasures(measures);
  }, [duration, bpm, timeSignature]);

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
    // Combine note and quality for the key
    const key = (data.keyNote || existingNote) + (data.keyQuality || '');
    const finalData: {
      artist: string;
      bpm?: number;
      duration?: string;
      key: string;
      lyrics?: string;
      midiEvents?: MidiEvent[];
      timeSignature: string;
      title: string;
      transpose?: number;
    } = {
      artist: data.artist,
      key,
      timeSignature: data.timeSignature,
      title: data.title,
    };
    if (data.bpm) {
      finalData.bpm = data.bpm;
    }
    if (data.duration) {
      finalData.duration = data.duration;
    }
    if (data.lyrics) {
      finalData.lyrics = data.lyrics;
    }
    if (midiEvents.length > 0) {
      finalData.midiEvents = midiEvents;
    }
    if (initialData?.transpose !== undefined) {
      finalData.transpose = initialData.transpose;
    }
    onSubmit(finalData);
  };

  const handleAddMidiEvent = (event: Omit<MidiEvent, 'id'>) => {
    const newEvent: MidiEvent = {
      ...event,
      id: `midi-${Date.now()}`,
    };
    setMidiEvents([...midiEvents, newEvent]);
  };

  const handleDeleteMidiEvent = (eventId: string) => {
    setMidiEvents(midiEvents.filter((event) => event.id !== eventId));
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackButton to={backPath} />
        <PageHeader title={title} />
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        autoComplete="off"
        noValidate
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
                      <button
                        type="button"
                        onClick={() => setUseFlats(!useFlats)}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                          useFlats ? 'bg-brand-400/30' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform ${
                            useFlats ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-slate-400">
                        {useFlats ? '♭' : '♯'}
                      </span>
                    </div>
                  </RadioGroup>
                  <RadioGroup
                    label="Key (Quality)"
                    options={qualityOptions}
                    error={errors.keyQuality}
                    register={register('keyQuality')}
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
                      error={errors.duration}
                      id="duration"
                      label="Duration"
                      placeholder="Enter duration (mm:ss)"
                      register={register('duration', {
                        pattern: {
                          message: 'Duration must be in mm:ss format',
                          value: /^\d{1,3}:[0-5]\d$/,
                        },
                      })}
                    />
                    {calculatedMeasures !== null && (
                      <p className="mt-1 text-xs text-slate-500">
                        ±{calculatedMeasures} measure{calculatedMeasures !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ),
              id: 'details',
              label: 'Song details',
            },
            {
              content: <LyricsTab error={errors.lyrics} register={register('lyrics')} />,
              id: 'lyrics',
              label: 'Lyrics',
            },
            {
              content: (
                <MidiEventsTab
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
    </section>
  );
}

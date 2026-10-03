import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useGetInstruments } from '../../api/useInstruments';
import { useSheetMusic } from '../../hooks/useSheetMusic';
import type { MidiButtonTrigger, MidiEvent, Song } from '../../types';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';
import { Tabs } from '../../ui/Tabs';
import { DetailsTab } from './details/DetailsTab';
import { LyricsTab } from './lyrics/LyricsTab';
import { calculateMeasures } from './measures';
import { MidiButtonsTab } from './midi/MidiButtonsTab';
import { SettingsTab } from './settings/SettingsTab';
import { SheetMusicFormTab } from './sheet-music/SheetMusicFormTab';
import { TextNotesTab } from './text-notes/TextNotesTab';

type SongSubmitData = Omit<Song, 'id'>;

export type SongFormData = SongSubmitData & {
  durationMinutes?: number;
  durationSeconds?: number;
  keyNote?: string;
  keyQuality?: string;
  sheetMusicFiles?: FileList;
  sheetMusicFilename?: string;
};

export type SongFormProps = {
  backPath: string;
  initialData?: Omit<Song, 'id'>;
  onSubmit: (data: SongSubmitData, sheetMusicFile?: File) => void;
  title: string;
};

export function SongForm({ backPath, initialData, onSubmit, title }: SongFormProps) {
  const [calculatedMeasures, setCalculatedMeasures] = useState<number | null>(null);

  const { id, tab } = useParams<{ id?: string; returnUrl?: string; tab?: string }>();
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
      ...initialData,
      defaultTab: initialData?.defaultTab || 'auto',
      durationMinutes: initialData?.duration ? Math.floor(initialData.duration / 60) : undefined,
      durationSeconds: initialData?.duration ? initialData.duration % 60 : undefined,
      keyNote: existingNote || undefined,
      keyQuality: existingQuality || existingNote ? '' : undefined,
    },
  });

  const { append, remove, update } = useFieldArray({
    control,
    name: 'midiEvents',
  });
  const {
    append: appendMidiButtonTrigger,
    remove: removeMidiButtonTrigger,
    replace: replaceMidiButtonTriggers,
    update: updateMidiButtonTrigger,
  } = useFieldArray({
    control,
    name: 'midiButtonTriggers',
  });

  const durationMins = watch('durationMinutes');
  const durationSecs = watch('durationSeconds');
  const totalDurationSeconds = (durationMins || 0) * 60 + (durationSecs || 0);
  const bpm = watch('bpm');
  const lyrics = watch('lyrics');
  const midiButtonTriggers = watch('midiButtonTriggers') || [];
  const midiEvents = watch('midiEvents') || [];
  const sheetMusicFiles = watch('sheetMusicFiles');
  const sheetMusicFilename = watch('sheetMusicFilename');
  const timeSignature = watch('timeSignature');

  const hasDrawings =
    (initialData?.lyricsCanvasPaths && initialData.lyricsCanvasPaths.length > 0) ||
    (initialData?.canvasPaths && initialData.canvasPaths.length > 0);
  const lyricsChanged = lyrics !== (initialData?.lyrics || '');
  const showDrawingWarning = hasDrawings && lyricsChanged;

  // Fetch existing sheet music when editing
  const { data: existingSheetMusic } = useSheetMusic(
    id,
    !!id && !!sheetMusicFilename && (!sheetMusicFiles || sheetMusicFiles.length === 0),
  );

  // Set sheet music file in form state when fetched
  useEffect(() => {
    if (
      existingSheetMusic &&
      sheetMusicFilename &&
      (!sheetMusicFiles || sheetMusicFiles.length === 0)
    ) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(existingSheetMusic);
      setValue('sheetMusicFiles', dataTransfer.files);
    }
  }, [existingSheetMusic, sheetMusicFiles, sheetMusicFilename, setValue]);

  // Define which fields belong to which tab
  const detailsFields: (keyof SongFormData)[] = [
    'artist',
    'bpm',
    'durationMinutes',
    'durationSeconds',
    'keyNote',
    'keyQuality',
    'timeSignature',
    'title',
  ];
  const lyricsFields: (keyof SongFormData)[] = ['lyrics'];
  const settingsFields: (keyof SongFormData)[] = ['defaultTab', 'transpose'];

  // Check which tabs have errors
  const hasDetailsErrors = detailsFields.some((field) => !!errors[field]);
  const hasLyricsErrors = lyricsFields.some((field) => !!errors[field]);
  const hasSettingsErrors = settingsFields.some((field) => !!errors[field]);

  useEffect(() => {
    const measures = calculateMeasures(totalDurationSeconds, bpm, timeSignature);
    setCalculatedMeasures(measures);
  }, [totalDurationSeconds, bpm, timeSignature]);

  useEffect(() => {
    if (!midiButtonTriggers.length) {
      return;
    }

    const midiEventIds = new Set(midiEvents.map((event) => event.id));
    const nextTriggers = midiButtonTriggers.filter((trigger) =>
      midiEventIds.has(trigger.midiEventId),
    );

    if (nextTriggers.length !== midiButtonTriggers.length) {
      replaceMidiButtonTriggers(nextTriggers);
    }
  }, [midiButtonTriggers, midiEvents, replaceMidiButtonTriggers]);

  const selectedTab =
    tab && ['details', 'lyrics', 'sheet-music', 'text-notes', 'midi', 'settings'].includes(tab)
      ? tab
      : 'details';
  const songFormBasePath = id ? `/songs/edit/${id}` : '/songs/add';

  const handleTabChange = (tabId: string) => {
    void navigate(`${songFormBasePath}/${tabId}${window.location.search}`);
  };

  const handleFormError = (formErrors: FieldErrors<SongFormData>) => {
    // Check which tabs have errors using the fresh errors object
    const hasDetailsErrors = detailsFields.some((field) => !!formErrors[field]);
    const hasLyricsErrors = lyricsFields.some((field) => !!formErrors[field]);
    const hasSettingsErrors = settingsFields.some((field) => !!formErrors[field]);

    // Navigate to the first tab with errors
    if (hasDetailsErrors) {
      handleTabChange('details');
    } else if (hasLyricsErrors) {
      handleTabChange('lyrics');
    } else if (hasSettingsErrors) {
      handleTabChange('settings');
    }
  };

  const handleFormSubmit = ({
    durationMinutes,
    durationSeconds,
    keyQuality,
    keyNote,
    sheetMusicFiles,
    defaultTab,
    ...data
  }: SongFormData) => {
    const totalSeconds = (durationMinutes || 0) * 60 + (durationSeconds || 0);

    onSubmit(
      {
        ...data,
        canvasPaths: initialData?.canvasPaths || [],
        defaultTab,
        duration: totalSeconds || undefined,
        key: (keyNote || existingNote) + (keyQuality || ''),
        lyricsCanvasPaths: initialData?.lyricsCanvasPaths || [],
        spotifyId: initialData?.spotifyId,
        textNotesCanvasPaths: initialData?.textNotesCanvasPaths || [],
      },
      sheetMusicFiles?.[0],
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

  const handleEditMidiEvent = (eventId: string, event: Omit<MidiEvent, 'id'>) => {
    const index = midiEvents.findIndex((item) => item.id === eventId);
    if (index >= 0) {
      update(index, {
        ...event,
        id: eventId,
      });
    }
  };

  const handleAddMidiButtonTrigger = (trigger: Omit<MidiButtonTrigger, 'id'>) => {
    const newTrigger: MidiButtonTrigger = {
      ...trigger,
      id: `midi-trigger-${Date.now()}`,
    };
    appendMidiButtonTrigger(newTrigger);
  };

  const handleDeleteMidiButtonTrigger = (triggerId: string) => {
    const index = midiButtonTriggers.findIndex((trigger) => trigger.id === triggerId);
    if (index >= 0) {
      removeMidiButtonTrigger(index);
    }
  };

  const handleEditMidiButtonTrigger = (
    triggerId: string,
    trigger: Omit<MidiButtonTrigger, 'id'>,
  ) => {
    const index = midiButtonTriggers.findIndex((item) => item.id === triggerId);
    if (index >= 0) {
      updateMidiButtonTrigger(index, {
        ...trigger,
        id: triggerId,
      });
    }
  };

  return (
    <Page>
      <PageHeader backPath={backPath} title={title} />
      <form
        autoComplete="off"
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
              content: <TextNotesTab register={register('notes')} />,
              id: 'text-notes',
              label: 'Text notes',
            },
            {
              content: (
                <MidiButtonsTab
                  instruments={instruments}
                  midiButtonTriggers={midiButtonTriggers}
                  midiEvents={midiEvents}
                  onAddMidiButtonTrigger={handleAddMidiButtonTrigger}
                  onAddEvent={handleAddMidiEvent}
                  onDeleteMidiButtonTrigger={handleDeleteMidiButtonTrigger}
                  onDeleteEvent={handleDeleteMidiEvent}
                  onEditMidiButtonTrigger={handleEditMidiButtonTrigger}
                  onEditEvent={handleEditMidiEvent}
                />
              ),
              id: 'midi',
              label: 'MIDI events',
            },
            {
              content: <SettingsTab errors={errors} register={register} />,
              hasError: hasSettingsErrors,
              id: 'settings',
              label: 'Settings',
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
            {initialData ? 'Save changes' : 'Create song'}
          </Button>
        </div>
      </form>
    </Page>
  );
}

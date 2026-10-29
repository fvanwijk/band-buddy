import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it, vi } from 'vite-plus/test';

import { seedInstruments } from '../../mocks/seed';
import { createCueEvent, createTempoChangeEvent } from '../../mocks/songEvents';
import { createSong } from '../../mocks/songs';
import { StoreProvider } from '../../store/StoreProvider';
import { MockQueryClientProvider, getMockStore } from '../../testUtils';
import { SongForm, type SongFormProps } from './SongForm';

describe('SongForm', () => {
  const renderComponent = (props: Partial<SongFormProps> = {}, id?: string) =>
    render(
      <SongForm
        backPath="/songs"
        onSubmit={vi.fn()}
        title={id ? 'Edit song' : 'Add new song'}
        {...props}
      />,
      {
        wrapper: ({ children }) => {
          const RoutesStub = createRoutesStub([
            {
              children: [{ Component: () => children, path: ':tab' }],
              path: id ? `songs/edit/${id}` : '/songs/add',
            },
          ]);

          return (
            <MockQueryClientProvider>
              <StoreProvider>
                <RoutesStub
                  initialEntries={[id ? `/songs/edit/${id}/details` : '/songs/add/details']}
                />
              </StoreProvider>
            </MockQueryClientProvider>
          );
        },
      },
    );

  it('should render a back link and title', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Go back' })).toHaveAttribute('href', '/songs');
    expect(screen.getByRole('heading', { name: 'Add new song' })).toBeInTheDocument();
  });

  it('should render alert on MIDI buttons tab when there are no instruments', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(await screen.findByRole('tab', { name: 'MIDI buttons' }));

    expect(screen.getByRole('link', { name: 'Settings → Instruments' })).toHaveAttribute(
      'href',
      '/settings/instruments',
    );
  });

  it('should fill in the form and submit it', async () => {
    const { store, persister } = getMockStore();
    seedInstruments(store);
    await persister.save();

    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderComponent({ onSubmit });

    // Validation
    await user.click(await screen.findByRole('button', { name: 'Create song' }));

    expect(screen.getByText('Artist is required')).toBeInTheDocument();
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Key is required')).toBeInTheDocument();

    // Details
    await user.type(screen.getByLabelText('Artist*'), 'Test Artist');
    await user.type(screen.getByLabelText('Title*'), 'Test Title');
    await user.click(screen.getByRole('radio', { name: 'A♭ major' }));
    await user.click(screen.getByLabelText('4/4'));
    await user.type(screen.getByLabelText('BPM'), '120');
    await user.type(screen.getByLabelText('Minutes'), '1');
    await user.type(screen.getByLabelText('Seconds'), '23');

    // Lyrics
    await user.click(screen.getByRole('tab', { name: 'Lyrics' }));
    await user.type(
      await screen.findByLabelText('Chords & lyrics'),
      'Is this the real life? Is this just fantasy?',
    );

    // Sheet music
    // TODO

    // Text notes
    await user.click(screen.getByRole('tab', { name: 'Text notes' }));
    await user.type(
      await screen.findByLabelText('Notes'),
      'Act like a rock star while playing this song',
    );

    // MIDI buttons
    await user.click(screen.getByRole('tab', { name: 'MIDI buttons' }));

    await user.click(screen.getByRole('button', { name: 'Add MIDI button' }));

    await user.type(await screen.findByLabelText('Button label*'), 'Piano');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    // Add MIDI button
    expect(await screen.findByText('Piano')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit MIDI button' }));
    await user.clear(await screen.findByLabelText('Button label*'));
    await user.type(screen.getByLabelText('Button label*'), 'Piano Lead');
    await user.click(screen.getByRole('button', { name: 'Update button' }));
    expect(await screen.findByText('Piano Lead')).toBeInTheDocument();
    expect(screen.getByText('Nord Stage 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test MIDI button' })).toBeInTheDocument();

    // Delete and readd
    await user.click(screen.getByRole('button', { name: 'Delete MIDI button' }));
    await user.click(screen.getByRole('button', { name: 'Create one' }));
    await user.type(await screen.findByLabelText('Button label*'), 'Piano');
    await user.click(screen.getByRole('button', { name: 'Add button' }));

    // Events
    await user.click(screen.getByRole('tab', { name: 'Events' }));
    await user.click(screen.getByRole('button', { name: 'Add MIDI button' }));

    await user.click(screen.getByRole('button', { name: 'Create song' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        artist: 'Test Artist',
        bpm: 120,
        canvasPaths: [],
        duration: 83,
        events: [
          expect.objectContaining({
            beat: 1,
            id: expect.any(String),
            measure: 1,
            midiEventId: expect.any(String),
            type: 'midiButton',
          }),
        ],
        key: 'Ab',
        lyrics: 'Is this the real life? Is this just fantasy?',
        midiEvents: [
          {
            events: [{ instrumentId: '0', programChange: 0, type: 'programChange' }],
            id: expect.any(String),
            label: 'Piano',
          },
        ],
        notes: 'Act like a rock star while playing this song',
        timeSignature: '4/4',
        title: 'Test Title',
      }),
      undefined,
    );
  });

  it('should fill the form with existing song data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { id, ...initialData } = createSong();

    renderComponent(
      {
        initialData,
        onSubmit,
      },
      '123',
    );

    expect(await screen.findByRole('heading', { name: 'Edit song' })).toBeInTheDocument();

    // Details
    expect(screen.getByLabelText('Artist*')).toHaveValue(initialData.artist);
    expect(screen.getByLabelText('Title*')).toHaveValue(initialData.title);
    expect(screen.getByRole('radio', { name: 'B♭ major' })).toBeChecked();
    expect(screen.getByLabelText('4/4')).toBeChecked();
    expect(screen.getByLabelText('BPM')).toHaveValue(72);
    expect(screen.getByLabelText('Minutes')).toHaveValue(5);
    expect(screen.getByLabelText('Seconds')).toHaveValue(55);

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        ...initialData,
        defaultTab: initialData.defaultTab || 'auto',
      }),
      undefined,
    );
  });

  it('should save edited events', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { id: _id, ...initialData } = createSong({
      events: [createTempoChangeEvent({ bpm: 100, id: 'tempo', measure: 3 })],
    });

    renderComponent({ initialData, onSubmit });

    await user.click(await screen.findByRole('tab', { name: 'Events' }));
    await user.click(screen.getByRole('button', { name: 'Add cue to measure 3, beat 1' }));
    await user.type(screen.getByLabelText('Cue text'), 'Faster!');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          createTempoChangeEvent({ bpm: 100, id: 'tempo', measure: 3 }),
          expect.objectContaining({ beat: 1, measure: 3, text: 'Faster!', type: 'cue' }),
        ],
      }),
      undefined,
    );
  });

  it('should not save events with errors and show them on the events tab', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { id: _id, ...initialData } = createSong({
      events: [createCueEvent({ id: 'empty', text: '' })],
    });

    renderComponent({ initialData, onSubmit });

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText('A cue needs text to speak')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Cue text'), 'Verse');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ events: [expect.objectContaining({ text: 'Verse' })] }),
      undefined,
    );
  });

  it('should have no language selected by default and save the selected language', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { language: _language, ...initialData } = createSong();

    renderComponent({ initialData, onSubmit }, '0');

    const english = await screen.findByRole('radio', { name: '🇺🇸 English' });
    const dutch = screen.getByRole('radio', { name: '🇳🇱 Dutch' });
    expect(english).not.toBeChecked();
    expect(dutch).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ language: undefined }),
      undefined,
    );

    await user.click(dutch);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ language: 'nl' }),
      undefined,
    );
  });

  it('should preselect the saved language', async () => {
    renderComponent({ initialData: createSong({ language: 'en' }) }, '0');

    expect(await screen.findByRole('radio', { name: '🇺🇸 English' })).toBeChecked();
  });
});

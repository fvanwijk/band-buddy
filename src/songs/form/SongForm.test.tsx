import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it, vi } from 'vite-plus/test';

import { seedInstruments } from '../../mocks/seed';
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

    await user.click(await screen.findByRole('tab', { name: 'MIDI events' }));

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
    expect(screen.getByText('Key note is required')).toBeInTheDocument();
    expect(screen.getByText('Key quality is required')).toBeInTheDocument();

    // Details
    await user.type(screen.getByLabelText('Artist*'), 'Test Artist');
    await user.type(screen.getByLabelText('Title*'), 'Test Title');
    expect(screen.queryByLabelText('Ab')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('♯'));
    await user.click(screen.getByLabelText('A♭'));
    await user.click(screen.getByLabelText('Major'));
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

    // MIDI events
    await user.click(screen.getByRole('tab', { name: 'MIDI events' }));

    await user.click(screen.getByRole('button', { name: 'Add MIDI button' }));

    await user.type(await screen.findByLabelText('Button label*'), 'Piano');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    // Add MIDI button
    expect(await screen.findByText('Piano')).toBeInTheDocument();
    expect(screen.getByText('Program Change 0 →')).toBeInTheDocument();
    expect(screen.getByText('Nord Stage 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test MIDI button' })).toBeInTheDocument();

    // Delete and readd
    await user.click(screen.getByRole('button', { name: 'Delete MIDI button' }));
    await user.click(screen.getByRole('button', { name: 'Create one' }));
    await user.type(await screen.findByLabelText('Button label*'), 'Piano');
    await user.click(screen.getByRole('button', { name: 'Add button' }));

    await user.click(screen.getByRole('button', { name: 'Create song' }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        artist: 'Test Artist',
        bpm: 120,
        canvasPaths: [],
        duration: 83,
        key: 'Ab',
        lyrics: 'Is this the real life? Is this just fantasy?',
        midiEvents: [
          { id: expect.any(String), instrumentId: '0', label: 'Piano', programChange: 0 },
        ],
        timeSignature: '4/4',
        title: 'Test Title',
      },
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
    expect(screen.getByLabelText('Major')).toBeChecked();
    expect(screen.getByLabelText('B♭')).toBeChecked();
    expect(screen.getByLabelText('4/4')).toBeChecked();
    expect(screen.getByLabelText('BPM')).toHaveValue(72);
    expect(screen.getByLabelText('Minutes')).toHaveValue(5);
    expect(screen.getByLabelText('Seconds')).toHaveValue(55);

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(initialData, undefined);
  });
});

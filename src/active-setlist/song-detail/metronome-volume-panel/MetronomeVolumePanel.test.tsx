import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { MetronomeVolumePanel } from './MetronomeVolumePanel';

describe('MetronomeVolumePanel', () => {
  const renderComponent = async (initialVolume: number) => {
    const { store, persister } = getMockStore();
    store.setValue('metronomeVolume', initialVolume);
    await persister.save();

    render(<MetronomeVolumePanel />, { wrapper: StoreProvider });
    await screen.findByText('Metronome volume');
  };

  it('renders heading and rounded volume percentage', async () => {
    await renderComponent(42.4);

    expect(screen.getByText('Metronome volume')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('updates volume when slider changes', async () => {
    await renderComponent(40);

    fireEvent.change(screen.getByRole('slider', { name: 'Metronome volume' }), {
      target: { value: '71.8' },
    });

    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(localStorage.getItem('band-buddy')).toContain('"metronomeVolume":71.8');
  });
});

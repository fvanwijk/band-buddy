import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { type MidiEventLogEntry } from '../../midi/useMidiEventLog';
import { createInstrumentTable } from '../../mocks/instruments';
import { StoreProvider } from '../../store/StoreProvider';
import { getMockStore } from '../../testUtils';
import { MidiEventLog } from './MidiEventLog';

describe('MidiEventLog', () => {
  const renderComponent = async (entries: MidiEventLogEntry[]) => {
    const { store, persister } = getMockStore();

    store.setRow(
      'instruments',
      'rev2',
      createInstrumentTable({
        midiInId: 'prophet-rev2-in',
        midiInName: 'USB MIDI Out',
        midiOutId: 'prophet-rev2-out',
        midiOutName: 'USB MIDI In',
        name: 'Prophet Rev2',
      }),
    );
    await persister.save();

    render(<MidiEventLog allCapturedCount={entries.length} entries={entries} />, {
      wrapper: StoreProvider,
    });
  };

  it('shows instrument names and instrument-aware CC labels in the event log', async () => {
    await renderComponent([
      {
        channels: [1],
        data: [0xb0, 34, 64],
        deviceId: 'prophet-rev2-in',
        deviceName: 'USB MIDI Out',
        direction: 'out',
        timestamp: 1_718_436_800_000,
        type: 'cc',
        value: 34,
      },
      {
        channels: [1],
        data: [0xc0, 7],
        deviceId: 'prophet-rev2-out',
        deviceName: 'USB MIDI In',
        direction: 'in',
        timestamp: 1_718_436_800_500,
        type: 'programChange',
        value: 7,
      },
    ]);

    expect(await screen.findByText('CC ARP Mode (34) = 64')).toBeInTheDocument();
    expect(screen.getByText('Program Change P8 (7)')).toBeInTheDocument();
    expect(screen.getAllByText('Prophet Rev2')).toHaveLength(2);
    expect(screen.queryByText('USB MIDI Out')).not.toBeInTheDocument();
    expect(screen.queryByText('USB MIDI In')).not.toBeInTheDocument();
  });
});

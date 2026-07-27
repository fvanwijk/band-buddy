import { Switch } from '../../ui/Switch';
import { GridCell } from '../GridCell';

type MidiEventLogCardProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function MidiEventLogCard({ isOpen, onOpenChange }: MidiEventLogCardProps) {
  return (
    <GridCell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">MIDI Event Log</h2>
          <p className="mt-2 text-sm text-slate-400">
            Debug MIDI messages sent and received between BandBuddy and your instruments.
          </p>
        </div>
        <Switch checked={isOpen} label="Show event log" onCheckedChange={onOpenChange} />
      </div>
    </GridCell>
  );
}

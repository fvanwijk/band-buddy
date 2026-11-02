import { useGetCueOffsetBeats, useSetCueOffsetBeats } from '../../api/useSettings';
import { SelectField } from '../../ui/form/SelectField';
import { GridCell } from '../GridCell';

const MAX_CUE_OFFSET_BEATS = 8;

const options = Array.from({ length: MAX_CUE_OFFSET_BEATS + 1 }, (_, beats) => ({
  label:
    beats === 0
      ? 'On the beat (0)'
      : `${beats} ${beats === 1 ? 'beat' : 'beats'} earlier (-${beats})`,
  value: String(-beats),
}));

export function CueCard() {
  const cueOffsetBeats = useGetCueOffsetBeats();
  const setCueOffsetBeats = useSetCueOffsetBeats();

  return (
    <GridCell>
      <h2 className="text-lg font-semibold text-slate-100">Cues</h2>
      <p className="mt-2 text-sm text-slate-400">
        Spoken cues are played earlier, so you have time to react. With -2, a cue configured on
        measure 8 beat 1 is played on measure 7 beat 3 (in 4/4).
      </p>

      <div className="mt-6">
        <SelectField
          label="Cue offset"
          onChange={(event) => setCueOffsetBeats(Number(event.target.value))}
          options={options}
          value={String(cueOffsetBeats)}
        />
      </div>
    </GridCell>
  );
}

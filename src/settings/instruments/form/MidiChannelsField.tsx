type MidiChannelsFieldProps = {
  onChange: (channels: number[]) => void;
  value?: number[];
};

const midiChannels = Array.from({ length: 16 }, (_, index) => index + 1);

export function MidiChannelsField({ onChange, value = midiChannels }: MidiChannelsFieldProps) {
  const selectedChannels = new Set(value);
  const allChannelsSelected = selectedChannels.size === midiChannels.length;

  const toggleChannel = (channel: number) => {
    if (selectedChannels.has(channel) && selectedChannels.size === 1) {
      return;
    }

    const nextChannels = selectedChannels.has(channel)
      ? value.filter((selectedChannel) => selectedChannel !== channel)
      : [...value, channel];

    onChange(nextChannels.sort((a, b) => a - b));
  };

  const handleSelectAll = () => {
    if (allChannelsSelected) {
      return;
    }

    onChange([...midiChannels]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-slate-200">MIDI Channels</p>
        <button
          className="rounded-sm bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={allChannelsSelected}
          onClick={handleSelectAll}
          type="button"
        >
          All
        </button>
      </div>

      <fieldset>
        <legend className="sr-only">MIDI channel selection</legend>
        <div className="flex flex-wrap gap-1">
          {midiChannels.map((channel) => {
            const isSelected = selectedChannels.has(channel);

            return (
              <label className="cursor-pointer" key={channel}>
                <input
                  aria-label={`MIDI channel ${channel}`}
                  checked={isSelected}
                  className="sr-only"
                  onChange={() => toggleChannel(channel)}
                  type="checkbox"
                />
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-sm border text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {channel}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

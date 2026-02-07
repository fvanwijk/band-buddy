type MidiDeviceStatusProps = {
  isAvailable?: boolean;
  isOptional?: boolean;
  label: string;
  name: string;
};

export function MidiDeviceStatus({
  isAvailable = true,
  isOptional = false,
  label,
  name,
}: MidiDeviceStatusProps) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <div className="flex items-center gap-2">
        <p
          className={
            isAvailable || isOptional
              ? 'font-semibold text-slate-100'
              : 'font-semibold text-red-300'
          }
        >
          {name}
        </p>
        {!isAvailable && !isOptional && (
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-red-300 uppercase">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}

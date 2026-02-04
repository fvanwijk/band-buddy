type FormattedDurationProps = {
  seconds: number;
};

export function FormattedDuration({ seconds }: FormattedDurationProps) {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const unitClass = '[font-variant-caps:small-caps]';

  if (hours > 0) {
    return (
      <>
        {hours}
        <span className={unitClass}>h</span> {minutes}
        <span className={unitClass}>m</span> {secs}
        <span className={unitClass}>s</span>
      </>
    );
  }

  return (
    <>
      {minutes}
      <span className={unitClass}>m</span> {secs}
      <span className={unitClass}>s</span>
    </>
  );
}

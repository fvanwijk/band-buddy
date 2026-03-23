import type { ReactNode } from 'react';

type SettingHeadingProps = {
  children: ReactNode;
  resetButton?: ReactNode;
};

export function SettingHeading({ children, resetButton }: SettingHeadingProps) {
  return (
    <div className="mb-2 flex h-4 items-center justify-between">
      <p className="text-xs tracking-wide text-slate-400 uppercase">{children}</p>
      {resetButton}
    </div>
  );
}

import type { ReactNode } from 'react';

type SettingHeadingProps = {
  children: ReactNode;
  resetButton?: ReactNode;
};

export function SettingHeading({ children, resetButton }: SettingHeadingProps) {
  return (
    <div className="flex items-center justify-between mb-2 h-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{children}</p>
      {resetButton}
    </div>
  );
}

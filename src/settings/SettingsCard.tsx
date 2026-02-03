import type { ReactNode } from 'react';

type SettingsCardProps = {
  children: ReactNode;
};

export function SettingsCard({ children }: SettingsCardProps) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">{children}</div>;
}

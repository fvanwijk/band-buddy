import type { FC } from 'react';

type ImportSettingsSectionProps = {
  settings: { label: string; value: string }[];
};

export const ImportSettingsSection: FC<ImportSettingsSectionProps> = ({ settings }) => (
  <div>
    <div className="font-medium">Settings</div>
    <ul className="space-y-1 pl-4 text-slate-400">
      {settings.map(({ label, value }) => (
        <li className="flex justify-between" key={label}>
          <span>{label}</span>
          <span>{value}</span>
        </li>
      ))}
    </ul>
  </div>
);

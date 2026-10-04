import type { FC } from 'react';

import { Checkbox } from '../../../ui/Checkbox';

type ImportSettingsSectionProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  settings: { label: string; value: string }[];
};

export const ImportSettingsSection: FC<ImportSettingsSectionProps> = ({
  checked,
  onCheckedChange,
  settings,
}) => (
  <div aria-label="Settings" role="group">
    <Checkbox
      checked={checked}
      label="Settings"
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
    {checked && settings.length > 0 && (
      <ul className="space-y-1 pl-6 text-slate-400">
        {settings.map(({ label, value }) => (
          <li className="flex justify-between" key={label}>
            <span>{label}</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

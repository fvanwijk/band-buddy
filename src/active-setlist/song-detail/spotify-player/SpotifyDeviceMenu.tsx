import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { IconCheck, IconDevices } from '@tabler/icons-react';
import type { FC } from 'react';

import { Button } from '../../../ui/Button';

type SpotifyDeviceMenuProps = {
  devices: Array<{ id: string | null; name: string; type: string }>;
  onOpen: () => void;
  onSelect: (deviceId: string) => void;
  selectedId: string;
};

export const SpotifyDeviceMenu: FC<SpotifyDeviceMenuProps> = ({
  devices,
  onOpen,
  onSelect,
  selectedId,
}) => (
  <Menu>
    <MenuButton
      as={Button}
      isIcon
      onClick={onOpen}
      title="Choose Spotify device"
      type="button"
      variant="outlined"
    >
      <IconDevices className="h-4 w-4" />
    </MenuButton>
    <MenuItems
      anchor="top start"
      className="z-60 w-64 rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-lg focus:outline-none"
    >
      {devices.length === 0 && (
        <p className="px-3 py-1.5 text-sm text-slate-400">
          No devices found. Open Spotify on the device you want to play on.
        </p>
      )}
      {devices.map(({ id, name, type }) => (
        <MenuItem key={id}>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-slate-100 data-focus:bg-slate-800"
            onClick={() => onSelect(id ?? '')}
            type="button"
          >
            <span className="min-w-0 flex-1 truncate">
              {name} <span className="text-slate-400">({type})</span>
            </span>
            {id === selectedId && <IconCheck className="h-4 w-4 shrink-0 text-brand-400" />}
          </button>
        </MenuItem>
      ))}
    </MenuItems>
  </Menu>
);

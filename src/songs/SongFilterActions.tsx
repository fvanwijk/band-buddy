import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { IconPlus } from '@tabler/icons-react';
import type { FC } from 'react';

import { Button } from '../ui/Button';
import { filterDefinitions } from './songFilterDefinitions';
import type { FilterId } from './songFilterDefinitions';

type SongFilterActionsProps = {
  activeIds: FilterId[];
  canClear: boolean;
  onAdd: (id: FilterId) => void;
  onClear: () => void;
};

export const SongFilterActions: FC<SongFilterActionsProps> = ({
  activeIds,
  canClear,
  onAdd,
  onClear,
}) => {
  const availableDefinitions = filterDefinitions.filter(({ id }) => !activeIds.includes(id));

  return (
    <div className="flex shrink-0 items-center gap-1">
      {availableDefinitions.length > 0 && (
        <Menu>
          <MenuButton
            as={Button}
            color="primary"
            iconStart={<IconPlus className="h-4 w-4" />}
            size="medium"
            variant="text"
          >
            Add filter
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="z-60 w-56 rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-lg focus:outline-none"
          >
            {availableDefinitions.map((definition) => (
              <MenuItem key={definition.id}>
                <button
                  className="w-full rounded-lg px-3 py-1.5 text-left text-sm text-slate-100 data-focus:bg-slate-800"
                  onClick={() => onAdd(definition.id)}
                  type="button"
                >
                  {definition.label}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      )}
      {canClear && (
        <Button onClick={onClear} size="medium" type="button" variant="text">
          Clear filters
        </Button>
      )}
    </div>
  );
};

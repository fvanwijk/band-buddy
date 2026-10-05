import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { emptySongFilters } from './filterSongs';
import type { SongFilters } from './filterSongs';
import { isHasField } from './songFilterDefinitions';
import type { FilterDefinition, FilterId } from './songFilterDefinitions';

/** Tracks which filters are shown and keeps the form values in sync with adding/removing them. */
export const useActiveSongFilters = ({ reset, setValue }: UseFormReturn<SongFilters>) => {
  const [activeIds, setActiveIds] = useState<FilterId[]>([]);

  const add = (id: FilterId) => {
    // A new has-filter starts on "yes" so a radio is always selected
    if (isHasField(id)) setValue(id, 'yes');
    setActiveIds((ids) => [...ids, id]);
  };

  const remove = ({ fields, id }: FilterDefinition) => {
    fields.forEach((field) => setValue(field, isHasField(field) ? undefined : ''));
    setActiveIds((ids) => ids.filter((activeId) => activeId !== id));
  };

  const clear = () => {
    reset(emptySongFilters);
    setActiveIds([]);
  };

  return { activeIds, add, clear, remove };
};

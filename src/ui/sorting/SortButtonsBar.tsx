import { SortButton } from './SortButton';

type SortButtonsBarProps<T extends string> = {
  fields: readonly T[];
  isActive: (field: T) => boolean;
  onSort: (field: T) => void;
  sortDirection?: 'asc' | 'desc' | 'none';
};

export function SortButtonsBar<T extends string>({
  fields,
  isActive,
  onSort,
  sortDirection,
}: SortButtonsBarProps<T>) {
  return (
    <div className="flex gap-1.5">
      {fields.map((field) => (
        <SortButton
          key={field}
          isActive={isActive(field)}
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          onClick={() => onSort(field)}
          sortDirection={isActive(field) && sortDirection !== 'none' ? sortDirection : undefined}
        />
      ))}
    </div>
  );
}

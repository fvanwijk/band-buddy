import { Button } from '../Button';

type SortButtonProps = {
  isActive: boolean;
  label: string;
  onClick: () => void;
  sortDirection?: 'asc' | 'desc';
};

export function SortButton({ isActive, label, onClick, sortDirection }: SortButtonProps) {
  const directionSymbol = isActive && sortDirection ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <Button onClick={onClick} variant="ghost">
      {label}
      {directionSymbol}
    </Button>
  );
}

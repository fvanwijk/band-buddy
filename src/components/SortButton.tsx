type SortButtonProps = {
  isActive: boolean;
  label: string;
  onClick: () => void;
  sortDirection?: 'asc' | 'desc';
};

export function SortButton({ isActive, label, onClick, sortDirection }: SortButtonProps) {
  const directionSymbol = isActive && sortDirection ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <button
      className="font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
      onClick={onClick}
    >
      {label}
      {directionSymbol}
    </button>
  );
}

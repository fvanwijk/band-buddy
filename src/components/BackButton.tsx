import { Button } from './Button';

type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button
      className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      onClick={onClick}
      variant="ghost"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Button>
  );
}

import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

type BackButtonProps = {
  to: string;
};

export function BackButton({ to }: BackButtonProps) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
      to={to}
    >
      <IconArrowLeft className="h-5 w-5" />
    </Link>
  );
}

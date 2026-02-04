import type { ReactNode } from 'react';

type DialogTitleProps = {
  children: ReactNode;
};

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="mb-4 text-xl font-semibold text-slate-100">{children}</h2>;
}

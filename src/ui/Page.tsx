import type { ClassValue } from 'clsx';
import type { ReactNode } from 'react';

import { cn } from '../utils/cn';

type PageProps = {
  children: ReactNode;
  className?: ClassValue;
};

export function Page({ children, className }: PageProps) {
  return <section className={cn('flex h-full flex-col gap-6', className)}>{children}</section>;
}

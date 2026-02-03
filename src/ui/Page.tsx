import type { ReactNode } from 'react';

type PageProps = {
  children: ReactNode;
};

export function Page({ children }: PageProps) {
  return <section className="flex h-full flex-col gap-6">{children}</section>;
}

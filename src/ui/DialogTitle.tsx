import type { HTMLAttributes } from 'react';

type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function DialogTitle(props: DialogTitleProps) {
  return <h2 className="mb-4 text-xl font-semibold text-slate-100" {...props} />;
}

import { IconMusic } from '@tabler/icons-react';

import { cn } from '../utils/cn';

type LogoProps = {
  className?: string;
  iconClassName?: string;
};

export function Logo({ className, iconClassName }: LogoProps) {
  return (
    <span className={cn('text-brand-400 font-bold', className)}>
      Band
      <span className="text-brand-600 font-semibold">
        b<IconMusic className={cn('-mx-0.5 inline rotate-180', iconClassName)} />
        ddy
      </span>
    </span>
  );
}

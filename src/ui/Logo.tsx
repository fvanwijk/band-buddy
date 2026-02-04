import { IconMusic } from '@tabler/icons-react';

import { cn } from '../utils/cn';

type LogoProps = {
  className?: string;
  iconClassName?: string;
};

export function Logo({ className, iconClassName }: LogoProps) {
  return (
    <span className={cn('font-bold text-brand-400', className)}>
      Band
      <span className="font-semibold text-brand-600">
        b<IconMusic className={cn('inline rotate-180 -mx-0.5', iconClassName)} />
        ddy
      </span>
    </span>
  );
}

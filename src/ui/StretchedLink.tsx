import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import { cn } from '../utils/cn';

// The ::after element covers the nearest positioned ancestor, making the whole container clickable
// while keeping a single, properly named link for keyboard and screen reader users.
export const StretchedLink: FC<LinkProps> = ({ className, ...props }) => (
  <Link
    className={cn(
      'after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-400 focus-visible:after:ring-inset',
      className,
    )}
    {...props}
  />
);

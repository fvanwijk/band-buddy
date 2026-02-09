import {
  IconMusic,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconPlaylist,
  IconSettings,
} from '@tabler/icons-react';
import { NavLink } from 'react-router-dom';

import { useGetActiveSetlist } from '../api/useSettings';
import { cn } from '../utils/cn';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  to: string;
};

const navItems: NavItem[] = [
  {
    icon: <IconPlayerPlayFilled className="h-4 w-4" />,
    label: 'Active setlist',
    shortLabel: 'Active',
    to: '/play',
  },
  {
    icon: <IconPlaylist className="h-4 w-4" />,
    label: 'Manage setlists',
    shortLabel: 'Setlists',
    to: '/setlists',
  },
  {
    icon: <IconMusic className="h-4 w-4" />,
    label: 'Manage songs',
    shortLabel: 'Songs',
    to: '/songs',
  },
  {
    icon: <IconSettings className="h-4 w-4" />,
    label: 'Settings',
    shortLabel: 'Settings',
    to: '/settings',
  },
];

export function TopNav() {
  const activeSetlistId = useGetActiveSetlist();
  const hasActiveSetlist = Boolean(activeSetlistId);

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => {
        const icon =
          item.to === '/play' && !hasActiveSetlist ? (
            <IconPlayerPlay className="h-4 w-4" />
          ) : (
            item.icon
          );

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/play'}
            className={({ isActive }) =>
              cn(
                'rounded-full transition',
                'px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase',
                'sm:px-4 sm:py-2 md:inline-flex md:items-center md:gap-2 md:px-3 md:py-2 md:text-xs',
                'lg:inline-flex lg:items-center lg:gap-2 lg:px-4 lg:py-2 lg:text-xs',
                isActive ? 'bg-brand-400/15 text-brand-200' : 'text-slate-400 hover:text-slate-200',
              )
            }
            aria-label={item.label}
            title={item.label}
          >
            <span>{icon}</span>
            <span className="hidden lg:inline">{item.label}</span>
            <span className="hidden md:inline lg:hidden">{item.shortLabel}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

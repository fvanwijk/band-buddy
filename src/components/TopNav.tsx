import { IconMusic, IconPlaylist, IconPlaylistOff, IconSettings } from '@tabler/icons-react';
import { NavLink } from 'react-router-dom';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  to: string;
};

const navItems: NavItem[] = [
  {
    icon: <IconPlaylistOff className="h-4 w-4" />,
    label: 'Active setlist',
    shortLabel: 'Active',
    to: '/',
  },
  {
    icon: <IconPlaylist className="h-4 w-4" />,
    label: 'Manage setlists',
    shortLabel: 'Setlists',
    to: '/setlist',
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

function TopNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            [
              'rounded-full transition',
              'px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]',
              'sm:px-4 sm:py-2 md:gap-2 md:inline-flex md:items-center md:px-3 md:py-2 md:text-xs',
              'lg:gap-2 lg:inline-flex lg:items-center lg:px-4 lg:py-2 lg:text-xs',
              isActive ? 'bg-brand-400/15 text-brand-200' : 'text-slate-400 hover:text-slate-200',
            ].join(' ')
          }
          aria-label={item.label}
          title={item.label}
        >
          <span className="hidden md:inline">{item.icon}</span>
          <span className="md:hidden">{item.icon}</span>
          <span className="hidden lg:inline">{item.label}</span>
          <span className="hidden md:inline lg:hidden">{item.shortLabel}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default TopNav;

import { IconSettings } from '@tabler/icons-react';
import { NavLink } from 'react-router-dom';

type NavItem = {
  label: string;
  to: string;
  icon?: 'cog';
};

const navItems: NavItem[] = [
  { label: 'Active setlist', to: '/' },
  { label: 'Manage setlists', to: '/setlist' },
  { label: 'Manage songs', to: '/songs' },
  { icon: 'cog', label: 'Settings', to: '/settings' },
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
              'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
              isActive ? 'bg-brand-400/15 text-brand-200' : 'text-slate-400 hover:text-slate-200',
            ].join(' ')
          }
        >
          {item.icon === 'cog' ? <IconSettings className="h-4 w-4" /> : item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default TopNav;

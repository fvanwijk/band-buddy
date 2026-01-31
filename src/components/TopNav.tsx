import { NavLink } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
  icon?: "cog";
};

const navItems: NavItem[] = [
  { label: "Active setlist", to: "/" },
  { label: "Manage setlists", to: "/manage" },
  { label: "Manage songs", to: "/songs" },
  { label: "Settings", to: "/settings", icon: "cog" },
];

function TopNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            [
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
              isActive
                ? "bg-brand-400/15 text-brand-200"
                : "text-slate-400 hover:text-slate-200",
            ].join(" ")
          }
        >
          {item.icon === "cog" ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
            item.label
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default TopNav;

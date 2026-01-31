import { NavLink } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
};

const navItems: NavItem[] = [
  { label: "Active setlist", to: "/" },
  { label: "Manage setlists", to: "/manage" },
  { label: "Manage songs", to: "/songs" },
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
                ? "bg-emerald-400/15 text-emerald-200"
                : "text-slate-400 hover:text-slate-200",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default TopNav;

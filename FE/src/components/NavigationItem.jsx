import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function NavigationItem({ funcName, icon, path }) {
  const Icon = icon;
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{funcName}</span>
    </NavLink>
  );
}

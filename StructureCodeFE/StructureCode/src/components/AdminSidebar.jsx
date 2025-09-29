import { Navigate, NavLink } from "react-router-dom";
import LogoSidebar from "./LogoSidebar";
import UserState from "./UserState";

export default function AdminSidebar() {
  return (
    <div className="sidebar pe-4 pb-3">
      <nav className="navbar bg-light navbar-light">
        <LogoSidebar />
        <UserState />
        <div className="navbar-nav w-100">
          <NavLink
            to="/admin/accounts"
            className={({ isActive }) =>
              "nav-item nav-link" + (isActive ? " active" : "")
            }
          >
            Account
          </NavLink>
          <NavLink
            to="/admin/warehouse"
            className={({ isActive }) =>
              "nav-item nav-link" + (isActive ? " active" : "")
            }
          >
            Warehouse Area
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

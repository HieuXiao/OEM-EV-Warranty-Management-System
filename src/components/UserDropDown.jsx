import { useState } from "react";

export default function UserDropDown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav-item dropdown">
      <a
        className="btn nav-link dropdown-toggle"
        onClick={() => setOpen(!open)}
      >
        <img
          className="rounded-circle"
          src="../image/user.jpg"
          alt="user"
          style={{ width: "40px", height: "40px" }}
        />
        <span className="d-none d-lg-inline-flex">John Doe</span>
      </a>
      {open && (
        <div className="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 show">
          <a href="#" className="dropdown-item">
            My Profile
          </a>
          <a href="#" className="dropdown-item">
            Settings
          </a>
          <a href="#" className="dropdown-item">
            Log Out
          </a>
        </div>
      )}
    </div>
  );
}

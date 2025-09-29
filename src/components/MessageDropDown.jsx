import { useState } from "react";
import Messages from "./Messages";

export default function MessageDropDown() {
  const [open, setOpen] = useState(false);

  const messages = [
    { id: 1, text: "Jhon send you a message", time: "15 minutes ago" },
    { id: 2, text: "Jhon send you a message", time: "15 minutes ago" },
    { id: 3, text: "Jhon send you a message", time: "15 minutes ago" },
  ];

  return (
    <div className="nav-item dropdown">
      <a
        className="btn nav-link dropdown-toggle"
        onClick={() => setOpen(!open)}
      >
        <i className="fa fa-envelope me-lg-2"></i>
        <span className="d-none d-lg-inline-flex">Message</span>
      </a>

      {open && (
        <div className="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 show">
          {messages.map((msg) => (
            <Messages key={msg.id} msg={msg} />
          ))}
          <hr className="dropdown-divider" />
          <a href="#" className="dropdown-item text-center">
            See all message
          </a>
        </div>
      )}
    </div>
  );
}

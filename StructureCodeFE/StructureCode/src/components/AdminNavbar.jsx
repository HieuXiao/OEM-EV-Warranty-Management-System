import MessageDropDown from "./MessageDropDown";
import User from "./User";

export default function AdminNavbar() {
  return (
    <>
      <nav className="navbar navbar-expand bg-light navbar-light sticky-top px-4 py-0">
        <form className="d-none d-md-flex ms-4">
          <input
            className="form-control border-0"
            type="search"
            placeholder="Search"
          />
        </form>
        <div className="navbar-nav align-items-center ms-auto">
          <MessageDropDown />
          <User />
        </div>
      </nav>
    </>
  );
}

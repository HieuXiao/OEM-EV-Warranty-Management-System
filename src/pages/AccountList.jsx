import Spinner from "../components/Spinner";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect } from "react";

export default function AccountList() {
  useEffect(() => {
    document.title = `Admin Page`;
  }, []);
  return (
    <>
      <div className="container-xxl position-relative bg-white d-flex p-0">
        <Spinner />
        <AdminSidebar />
        <div className="content">
          <AdminNavbar />
          <div className="container-fluid pt-4 px-4">
            <div className="row vh-100 bg-light rounded align-items-center justify-content-center mx-0">
              <div className="col-md-6 text-center">
                <h3>This is accounts blank page</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import React from "react";
import JobCard from "../components/JobCard";
import avatar from "../assets/Meo.png";

const jobs = [
  { id: "JOB001", type: "Check", plate: "51A-12345", status: "Process" },
  { id: "JOB002", type: "Repair", plate: "29B-67890", status: "To Do" },
  { id: "JOB003", type: "Repair", plate: "30F-11223", status: "To Do" },
  { id: "JOB004", type: "Check", plate: "88C-44556", status: "To Do" },
  { id: "JOB005", type: "Check", plate: "60D-77889", status: "To Do" },
  { id: "JOB006", type: "Check", plate: "79E-99112", status: "To Do" },
  { id: "JOB007", type: "Repair", plate: "43G-33445", status: "To Do" },
  { id: "JOB008", type: "Check", plate: "90H-66778", status: "To Do" },
];

const SCTechnician = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside className="sidebar p-4 d-flex flex-column justify-content-between">
        <div>
            <h5 className="text-primary fw-bold">#MEGA TEMA</h5>
            <div className="d-flex align-items-center my-4">
                {/* Avatar bên trái */}
                <img
                src={avatar}
                alt="avatar"
                className="rounded-circle me-3"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />

                {/* Thông tin bên phải */}
                <div className="d-flex flex-column">
                    <p className="fw-bold mb-1">Mage Team</p>
                    <span className="text-muted">SC Technician</span>
                </div>
            </div>
            <nav className="navbar navbar-light">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" href="#"> <i className="bi bi-list-task me-2"></i> My Job</a>
              </li>
            </ul> 
          </nav>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center mb-2"><i className="bi bi-telephone-fill me-2"></i><span>1900150xxx</span></div>
          <div className="d-flex align-items-center"><i className="bi bi-journal-text me-2"></i><span>Guide</span></div>
        </div>
      </aside>

        {/* Main Content */}
        <main className="content p-4 flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">My Job</h3>
                <div className="d-flex align-items-center">
                <i className="bi bi-bell me-3 fs-5"></i>
                <span className="fw-bold">Luong Dieu Vinh</span>
            </div>
        </div>

        <div className="row">
          {jobs.map(job => (
            <div key={job.id} className="col-md-3 mb-4">
              <JobCard job={job} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SCTechnician;

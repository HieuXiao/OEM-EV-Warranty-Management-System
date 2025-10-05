import React from "react";

const JobCard = ({ job }) => {
  return (
    <div className="border rounded p-3 h-100 position-relative bg-white">
      <h6 className="fw-bold">#{job.id}</h6>
      <p className="mb-1 text-muted">Date & time</p>
      <p className="mb-1">Type: {job.type}</p>
      <p className="mb-1">Plate: {job.plate}</p>
      <p className="mb-3">Comment: ...</p>
      <div className="d-flex justify-content-between small text-muted">
        <span>SC Staff</span>
        <span>SC Technician</span>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <button className="btn btn-sm btn-secondary">Report</button>
        <button className="btn btn-sm btn-primary">Complete</button>
      </div>
      {job.status && (
        <span className="badge bg-warning text-dark position-absolute" style={{ right: 8, top: 8 }}>
          {job.status}
        </span>
      )}
    </div>
  );
};

export default JobCard;

import React from "react";

// Thêm prop onReportClick để xử lý sự kiện click
const JobCard = ({ job, onReportClick }) => {
  // Hàm này sẽ gọi hàm từ prop, truyền theo ID và Type của job
  const handleReportClick = () => {
    if (onReportClick) {
      onReportClick(job.id, job.type);
    }
  };

  // Giữ nguyên logic status badge (bg-warning mặc định)
  
  return (
    <div className="border rounded p-3 h-100 position-relative bg-white">
      <h6 className="fw-bold mb-2">#{job.id}</h6>
      <p className="mb-1 text-muted">Date & time</p>
      <p className="mb-1">Type: {job.type}</p>
      <p className="mb-1">Plate: {job.plate}</p>
      <p className="mb-2">Comment: ...</p>
      
      {/* Cặp 1: SC Staff + Report ngang */}
      <div className="d-flex justify-content-between align-items-center text-muted mb-2 small">
        <span>SC Staff</span>
        <button
          className="btn btn-sm btn-secondary"
          style={{ minWidth: '80px', textAlign: 'center' }}
          onClick={handleReportClick} // <--- Đã thêm onClick
        >
          Report
        </button>
      </div>
      
      {/* Cặp 2: SC Technician + Complete ngang */}
      <div className="d-flex justify-content-between align-items-center text-muted small">
        <span>SC Technician</span>
        <button
          className="btn btn-sm btn-primary"
          style={{ minWidth: '80px', textAlign: 'center' }}
        >
          Complete
        </button>
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
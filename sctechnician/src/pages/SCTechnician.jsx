import React, { useState } from "react";
import JobCard from "../components/JobCard";
import avatar from "../assets/Meo.png";
import "../styles/SCTechnician.css"; 

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

// Component mới mô phỏng ô input nhưng chỉ để hiển thị text (Giữ nguyên)
const DisplayBox = ({ label, value, large = false }) => (
    <div className="flex-fill">
        <label className="form-label small text-muted mb-1">{label}:</label>
        <div 
            className="border rounded px-2 py-1 bg-light text-dark small" 
            style={{ 
                height: large ? 'calc(100% - 20px)' : '31px', 
                lineHeight: large ? '1.2' : '1.5',
                overflow: 'hidden',
                whiteSpace: large ? 'normal' : 'nowrap', 
                textOverflow: 'ellipsis'
            }}
            title={value}
        >
            {value}
        </div>
    </div>
);

// --- Component cho từng Option có thể chèn ảnh và thay đổi Quantity ---
const ImageOption = ({ optionName, index }) => {
    // ... (Giữ nguyên logic useState, handleImageInsert, handleQuantityChange)
    const [hasImage, setHasImage] = useState(false);
    const [quantity, setQuantity] = useState(0); 
    
    const handleImageInsert = () => { setHasImage(true); };
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) { setQuantity(value); }
    };
    
    const optionHeight = '37px';

    return (
        <div 
            className={`border rounded px-2 py-0 ${hasImage ? 'border-primary' : 'bg-white'}`} 
            style={{ 
                position: 'relative', 
                height: optionHeight, 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'space-between', 
                overflow: 'hidden',
                transition: 'border-color 0.2s'
            }} 
        >
            {/* 1. Container cho Icon và Tên Option (Giữ nguyên) */}
            <div className="d-flex align-items-center flex-grow-1" style={{ gap: '5px' }}>
                
                {/* Icon Camera: 23x23px */}
                <div
                    className={`rounded d-flex align-items-center justify-content-center ${hasImage ? 'bg-primary' : 'bg-secondary'}`}
                    style={{
                        width: '23px', 
                        height: '23px', 
                        cursor: 'pointer',
                        flexShrink: 0 
                    }}
                    onClick={handleImageInsert}
                >
                    <i 
                        className={`bi bi-camera-fill ${hasImage ? 'text-white' : 'text-light'}`} 
                        style={{ fontSize: '0.8rem' }}
                    ></i>
                </div>

                {/* Tên Option (Giữ nguyên) */}
                <div 
                    className="flex-grow-1"
                    style={{ 
                        overflow: 'hidden', 
                        whiteSpace: 'nowrap', 
                        textOverflow: 'ellipsis',
                        lineHeight: optionHeight 
                    }}
                >
                    <span className="small text-muted">
                        {optionName}
                    </span>
                </div>
            </div>

            {/* 2. Ô nhập số lượng (Input 20x20px, loại bỏ lớp form-control để tùy chỉnh) */}
            <input
                type="number" // Đảm bảo chỉ nhận số
                min="0" 
                value={quantity}
                onChange={handleQuantityChange}
                onClick={(e) => e.stopPropagation()} 
                // LOẠI BỎ: className="form-control form-control-sm"
                style={{
                    position: 'absolute',
                    bottom: '8px', 
                    right: '8px',
                    
                    // GIAO DIỆN MÔ PHỎNG DIV: border, background trắng, rounded
                    border: '1px solid #ccc',
                    borderRadius: '4px', // Tương đương lớp .rounded
                    backgroundColor: '#fff', // Tương đương lớp .bg-white
                    color: '#343a40', // Màu chữ (text-dark)

                    // KÍCH THƯỚC VÀ CĂN CHỈNH
                    width: '20px', 
                    height: '20px', 
                    padding: '0', 
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    fontSize: '0.7rem', 
                    lineHeight: '18px', 
                    
                    // ẨN CÁC NÚT TĂNG/GIẢM
                    MozAppearance: 'textfield', 
                    WebkitAppearance: 'none', 
                    appearance: 'none', 
                    margin: 0, 
                    
                    zIndex: 10
                }}
            />
        </div>
    );
}

// --- Component mới cho từng Option có ô Quantity ---
const QuantityOption = ({ optionName, index }) => {
    // Dữ liệu số lượng giả định (ví dụ: 1 hoặc 2)
    const quantity = (index % 3 === 0) ? 2 : 1; 

    return (
        <div 
            // Đã thay thế form-check bằng border-rounded và padding tùy chỉnh
            className="border rounded p-2" 
            style={{ 
                position: 'relative', 
                height: '40px', // Chiều cao cố định
                display: 'flex',
                alignItems: 'center' // Căn chữ Option ở giữa
            }} 
        >
            {/* Tên Option - Đã xóa checkbox và label for */}
            <span className="small me-2" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {optionName}
            </span>
            
            {/* Ô hiển thị số lượng cố định 20x20px (Giữ nguyên) */}
            <div
                className="border rounded bg-white text-dark fw-bold"
                style={{
                    position: 'absolute',
                    bottom: '5px', // Cách đáy 5px
                    right: '5px', // Cách phải 5px
                    width: '20px', 
                    height: '20px', 
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    lineHeight: '18px', 
                    border: '1px solid #ccc'
                }}
            >
                {quantity}
            </div>
        </div>
    );
}

// --- Component Form Report cho Check (Cập nhật Grid) ---
const ReportCheckForm = ({ jobId, onClose }) => {
    // ... (Giữ nguyên constants và options)
    const options = [
        "Exterior Front", "Exterior Back", "Engine Bay", "Left Door", 
        "Right Door", "Tires & Rims", "Interior Dashboard", "Trunk",
        "Brake System", "Headlights"
    ];
    // ... (Giữ nguyên constants)
    const columnWidth = '50%'; 
    const headerHeight = 70; 
    const contentHeight = 485 - headerHeight - 16; 
    const fieldWidth = '48%'; 

    return (
        // ... (Giữ nguyên cấu trúc bên ngoài)
        <div 
            className="border rounded p-4 bg-white shadow-lg" 
            style={{ 
                width: '1014px', 
                height: '485px', 
                marginTop: '24px', 
                marginLeft: '124px',
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative' 
            }}
        >
            {/* Hàng 1: Tiêu đề và nút Đóng (Giữ nguyên) */}
            <div 
                className="d-flex justify-content-between align-items-center mb-4"
                style={{ height: headerHeight - 32 }}
            >
                <h4 className="text-primary fw-bold">REPORT CHECK - Job #{jobId}</h4>
                <button className="btn btn-sm btn-danger" onClick={onClose}>X Close</button>
            </div>
            
            {/* Hàng 2: Nội dung Form chính (Giữ nguyên cấu trúc 2 cột) */}
            <div 
                className="d-flex" 
                style={{ height: contentHeight + 'px' }}
            >
                
                {/* 1. Cột BÊN TRÁI (50%): Form Details (Giữ nguyên) */}
                <div 
                    className="p-3 border-end d-flex flex-column" 
                    style={{ flex: `0 0 ${columnWidth}`, height: '100%' }}
                >
                    <h6 className="fw-semibold mb-3 text-muted">Vehicle Details</h6>
                    {/* ... (Giữ nguyên DisplayBox rows) ... */}
                    <div className="d-flex mb-3 justify-content-between">
                        <div style={{ width: fieldWidth }}> 
                            <DisplayBox label="Vehicle plate" value={"51A-123.45"} />
                        </div>
                        <div style={{ width: fieldWidth }}>
                            <DisplayBox label="Color vehicle" value={"Trắng"} />
                        </div>
                    </div>
                    <div className="d-flex mb-3 justify-content-between">
                        <div style={{ width: fieldWidth }}>
                            <DisplayBox label="Type vehicle" value={"Sedan 4 chỗ"} />
                        </div>
                        <div style={{ width: fieldWidth }}>
                            <DisplayBox label="Model vehicle" value={"Toyota Camry 2022"} />
                        </div>
                    </div>
                    <div className="flex-grow-1 mb-3">
                        <DisplayBox label="Note" value={"Yêu cầu kiểm tra kỹ càng hệ thống phanh và đèn pha."} large={true} />
                    </div>
                </div>
                
                {/* 2. Cột BÊN PHẢI (50%): Bảng Chèn Ảnh - ĐIỀU CHỈNH GRID */}
                <div 
                    className="p-3 d-flex flex-column"
                    style={{ flex: `0 0 ${columnWidth}`, height: '100%', position: 'relative' }} 
                >
                    <h6 className="fw-semibold mb-3 text-muted">Image Checklist</h6>
                    
                    {/* Bảng Image Options: 2 cột và cách nhau 4px */}
                    <div 
                        className="flex-grow-1"
                        style={{ 
                            display: 'grid', 
                            // CHỈNH SỬA: 2 cột bằng nhau (vì đã xóa yêu cầu 230px cố định)
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '4px', // Cách nhau 4px theo chiều rộng và chiều cao
                            paddingBottom: '32px', 
                            overflowY: 'auto' 
                        }}
                    >
                        {options.map((option, index) => (
                            <ImageOption 
                                key={index} 
                                optionName={option} 
                                index={index} 
                            />
                        ))}
                    </div>

                    {/* Nút Done/Submit (Giữ nguyên) */}
                    <div 
                        style={{ 
                            position: 'absolute', 
                            bottom: '16px', 
                            right: '23px', 
                        }}
                    >
                        <button className="btn btn-primary">Complete Check</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component Form Report cho Repair (1014x485) ---
const ReportRepairForm = ({ jobId, onClose }) => {
    // Dữ liệu mô phỏng cho bảng Option
    const options = [
        "Lốp Michelin", "Dầu động cơ Shell", "Lọc gió", "Bugia (Set 4)", 
        "Cần gạt nước", "Phanh đĩa (Cặp)", "Bình ắc quy", "Bơm nước",
        "Dây curoa cam", "Hệ thống đèn LED"
    ];
    
    const columnWidth = '50%'; 
    const headerHeight = 70; 
    const contentHeight = 485 - headerHeight - 16; 

    // Dữ liệu giả định để hiển thị
    const vehicleData = {
        plate: "51A-123.45",
        color: "Trắng",
        type: "Sedan 4 chỗ",
        model: "Toyota Camry 2022",
        note: "Xe có vết xước nhỏ ở cửa sau bên phải, cần phải ghi chú cẩn thận để tránh nhầm lẫn khi bàn giao lại cho khách hàng."
    };

    const fieldWidth = '48%'; 
    
    return (
        <div 
            className="border rounded p-4 bg-white shadow-lg" 
            style={{ 
                width: '1014px', 
                height: '485px', 
                marginTop: '24px', 
                marginLeft: '124px',
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative' 
            }}
        >
            {/* Hàng 1: Tiêu đề và nút Đóng */}
            <div 
                className="d-flex justify-content-between align-items-center mb-4"
                style={{ height: headerHeight - 32 }}
            >
                <h4 className="text-success fw-bold">REPORT REPAIR - Job #{jobId}</h4>
                <button className="btn btn-sm btn-danger" onClick={onClose}>X Close</button>
            </div>
            
            {/* Hàng 2: Nội dung Form chính (Split 2 main columns) */}
            <div 
                className="d-flex" 
                style={{ height: contentHeight + 'px' }}
            >
                
                {/* 1. Cột BÊN TRÁI (50%): Form Details (Thông tin xe + Note) */}
                <div 
                    className="p-3 border-end d-flex flex-column" 
                    style={{ flex: `0 0 ${columnWidth}`, height: '100%' }}
                >
                    <h6 className="fw-semibold mb-3 text-muted">Vehicle Details</h6>

                    {/* Hàng 1 & 2: Display Boxes (Giữ nguyên) */}
                    <div className="d-flex mb-3 justify-content-between">
                        <div style={{ width: fieldWidth }}> 
                            <DisplayBox label="Vehicle plate" value={vehicleData.plate} />
                        </div>
                        <div style={{ width: fieldWidth }}>
                            <DisplayBox label="Color vehicle" value={vehicleData.color} />
                        </div>
                    </div>

                    <div className="d-flex mb-3 justify-content-between">
                        <div style={{ width: fieldWidth }}>
                            <DisplayBox label="Type vehicle" value={vehicleData.type} />
                        </div>
                        <div style={{ width: fieldWidth }}>
                            <DisplayBox label="Model vehicle" value={vehicleData.model} />
                        </div>
                    </div>
                    
                    {/* Khu vực Note */}
                    <div className="flex-grow-1 mb-3">
                        <DisplayBox label="Note" value={vehicleData.note} large={true} />
                    </div>
                </div>
                
                {/* 2. Cột BÊN PHẢI (50%): Bảng Option + Nút Done */}
                <div 
                    className="p-3 d-flex flex-column"
                    style={{ flex: `0 0 ${columnWidth}`, height: '100%', position: 'relative' }} 
                >
                    <h6 className="fw-semibold mb-3 text-muted">Available Options</h6>
                    
                    {/* Bảng Option: Giờ sử dụng QuantityOption */}
                    <div 
                        className="flex-grow-1"
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '8px', // Tăng gap nhẹ cho Option để chứa nút nhỏ
                            paddingBottom: '32px', 
                            overflowY: 'auto' 
                        }}
                    >
                        {options.map((option, index) => (
                            <QuantityOption 
                                key={index} 
                                optionName={option} 
                                index={index} 
                            />
                        ))}
                    </div>

                    {/* Nút Done/Submit: Cách đáy 16px, cách phải 23px (Giữ nguyên) */}
                    <div 
                        style={{ 
                            position: 'absolute', 
                            bottom: '16px', 
                            right: '23px', 
                        }}
                    >
                        <button className="btn btn-primary">Done / Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};



const SCTechnician = () => {
  const [activeReport, setActiveReport] = useState(null); 

  const handleReportClick = (jobId, jobType) => {
    // Dòng kiểm tra: Bật Console (F12) để xem thông báo này. Nếu thấy, state đã đổi.
    console.log(`Report clicked for Job ID: ${jobId}, Type: ${jobType}. Switching view.`);
    
    setActiveReport({ id: jobId, type: jobType });
  };

  const handleCloseReport = () => {
    setActiveReport(null);
  };
  
  const renderReportForm = () => {
    if (!activeReport) return null;

    if (activeReport.type === "Check") {
      return <ReportCheckForm jobId={activeReport.id} onClose={handleCloseReport} />;
    }
    if (activeReport.type === "Repair") {
      return <ReportRepairForm jobId={activeReport.id} onClose={handleCloseReport} />;
    }
    return null;
  };
  

  return (
    <div className="d-flex">
      {/* Sidebar giữ nguyên */}
      <aside 
        className="sidebar p-4 d-flex flex-column justify-content-between" 
        style={{ width: '250px', height: '729px' }}
      >
        <div>
            <h5 className="text-primary fw-bold">#MEGA TEMA</h5>
            <div className="d-flex align-items-center my-4">
                <img
                src={avatar}
                alt="avatar"
                className="rounded-circle me-3"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
                <div className="d-flex flex-column">
                    <p className="fw-bold mb-1">Mage Team</p>
                    <span className="text-muted">SC Technician</span>
                </div>
            </div>
            <nav className="navbar navbar-light">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" href="#"> 
                  <i className="bi bi-list-task me-2"></i> My Job
                </a>
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
            {/* Navbar (1162x64) */}
            <div 
              className="d-flex justify-content-between align-items-center mb-4"
              style={{ 
                width: '1162px', 
                height: '64px', 
                marginLeft: '0', 
                paddingLeft: '0', 
                paddingRight: '0', 
                marginBottom: '2rem' 
              }}
            >
                <h3 className="fw-bold">My Job</h3>
                <div className="d-flex align-items-center">
                <i className="bi bi-bell me-3 fs-5"></i>
                <span className="fw-bold">Luong Dieu Vinh</span>
                </div>
            </div>
            
            {/* LOGIC HIỂN THỊ FORM HOẶC GRID */}
            {activeReport ? (
                // 1. Hiển thị Form Report
                renderReportForm()
            ) : (
                // 2. Hiển thị Grid Job Card
                <div 
                  className="sc-technician-grid"
                  style={{ 
                    marginTop: '24px', 
                    marginLeft: '124px', 
                    width: '1014px', 
                    padding: '0' 
                  }}
                >
                  {/* Row inline style FORCE grid + gap 31px dọc */}
                  <div 
                    className="row"
                    style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 248px)',
                      gridAutoRows: '227px',
                      gap: '31px 18px', 
                      width: '1014px',
                      height: '485px', // Giữ nguyên chiều cao 485px khi hiển thị grid
                      margin: '0',
                      padding: '0'
                    }}
                  >
                    {jobs.map((job, index) => (
                      <div 
                        key={job.id} 
                        className="col-md-3"
                        style={{ 
                          padding: '0', 
                          margin: '0', 
                          width: '248px', 
                          height: '227px',
                          flex: 'none',
                          marginBottom: index < 4 ? '31px' : '0' 
                        }}
                      >
                        <JobCard job={job} onReportClick={handleReportClick} /> 
                      </div>
                    ))}
                  </div>
                </div>
            )}

        </main>
    </div>
  );
};

export default SCTechnician;
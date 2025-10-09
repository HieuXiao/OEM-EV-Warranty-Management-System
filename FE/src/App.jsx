import { Route, Routes } from "react-router-dom";
import "./App.css";
// IMPORT PUBLIC
import Login from "./pages/LoginPage";
// IMPORT ADMIN
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminWarehouseArea from "./pages/AdminWarehouseArea";
import AdminSetting from "./pages/AdminSetting";
// IMPORT SCSTAFF
import SCStaffDashboard from "./pages/SCStaffDashboard";
import SCStaffProfile from "./pages/SCStaffProfile";
import SCStaffWarranty from "./pages/SCStaffWarrantyClaim";
import SCStaffCampaign from "./pages/SCStaffCampaign";

// IMPORT SCTECHNICIAN
import SCTechnicianDashboard from "./pages/SCTechnicianDashBoard";
import SCTechnicianCheck from "./pages/SCTechnicianCheck";
import SCTechnicianRepair from "./pages/SCTechnicianRepair";

function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        {/* Admin */}
        <Route path="/admin/setting" element={<AdminSetting />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/warehouses" element={<AdminWarehouseArea />} />
        {/* ScStaff */}
        <Route path="/scstaff/dashboard" element={<SCStaffDashboard />} />
        <Route path="/scstaff/profiles" element={<SCStaffProfile />} />
        <Route path="/scstaff/warranty" element={<SCStaffWarranty />} />
        <Route path="/scstaff/campaigns" element={<SCStaffCampaign />} />
        {/* ScTechnician */}
        <Route path="/sctechnician/dashboard" element={<SCTechnicianDashboard />} />
        <Route path="/sctechnician/check" element={<SCTechnicianCheck />} />
        <Route path="/sctechnician/repair" element={<SCTechnicianRepair />} />        
      </Routes>
    </>
  );
}

export default App;

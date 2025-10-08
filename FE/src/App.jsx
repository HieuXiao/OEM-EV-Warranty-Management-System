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
      </Routes>
    </>
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import "./App.css";

/* Admin */
import AdminUserManagement from "./pages/AdminUserManagement";

/* Service Center Staff */
import SCStaffDashboard from "./pages/SCStaffDashboard";
import SCStaffWarrantyClaim from "./pages/SCStaffWarrantyClaim";
import SCStaffCampaign from "./pages/SCStaffCampaign";

/* Login */
import Login from "./pages/LoginPage";
import AdminWarehouseArea from "./pages/AdminWarehouseArea";
import AdminSetting from "./pages/AdminSetting";
import SCStaffDashboard from "./pages/SCStaffDashboard";
import SCStaffProfile from "./pages/SCStaffProfile";
import SCStaffCampaign from "./pages/SCStaffCampaign";

function App() {
  return (
    <>
      <Routes>  
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminUserManagement />} />

        <Route path="/admin/warehouses" element={<AdminWarehouseArea />} />
        <Route path="/admin/setting" element={<AdminSetting />} />
        <Route path="/scstaff/dashboard" element={<SCStaffDashboard />} />
        <Route path="/scstaff/profiles" element={<SCStaffProfile />} />
        <Route path="/scstaff/claims" element={<SCStaffWarrantyClaim />} />
        <Route path="/scstaff/campaigns" element={<SCStaffCampaign />} />
      </Routes>
    </>
  );
}

export default App;

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

function App() {
  return (
    <>
      <Routes>  
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminUserManagement />} />

        {/* SC Staff Routes */}
        <Route path="/scstaff/dashboard" element={<SCStaffDashboard />} />
        <Route path="/scstaff/claims" element={<SCStaffWarrantyClaim />} />
        <Route path="/scstaff/campaigns" element={<SCStaffCampaign />} />

      </Routes>
    </>
  );
}

export default App;

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
import CustomerDetail from "./components/scstaff/ScsProfCustDetail";
import SCStaffWarranty from "./pages/SCStaffWarrantyClaim";
import SCStaffCampaign from "./pages/SCStaffCampaign";

// IMPORT SCTECHNICIAN
import SCTechnicianDashboard from "./pages/SCTechnicianDashBoard";
import SCTechnicianCheck from "./pages/SCTechnicianCheck";
import SCTechnicianRepair from "./pages/SCTechnicianRepair";

// IMPORT EVMSTAFF
import EVMStaffProductPart from "./pages/EVMStaffProduct&Part";
import EVMStaffSupplyChain from "./pages/EVMStaffSupplyChain";
import EVMStaffReportAnalysis from "./pages/EVMStaffReport&Analysis";
import EVMStaffWarrantyClaim from "./pages/EVMStaffWarrantyClaim";
import EVMStaffCampaign from "./pages/EVMStaffCampaign";
import EVMStaffDetailPart from "./components/evmstaff/EVMStaffDetailPart";
import EVMStaffReportDetail from "./components/evmstaff/EVMStaffReportDetail";

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
        <Route path="/scstaff/profiles/:id" element={<CustomerDetail />} />
        <Route path="/scstaff/warranty" element={<SCStaffWarranty />} />
        <Route path="/scstaff/campaigns" element={<SCStaffCampaign />} />

        {/* ScTechnician */}
        <Route
          path="/sctechnician/dashboard"
          element={<SCTechnicianDashboard />}
        />
        <Route path="/sctechnician/check" element={<SCTechnicianCheck />} />
        <Route path="/sctechnician/repair" element={<SCTechnicianRepair />} />

        {/* EVMStaff */}
        <Route path="/evmstaff/products" element={<EVMStaffProductPart />} />
        <Route path="/evmstaff/products/:id" element={<EVMStaffDetailPart />} />
        <Route path="/evmstaff/warranty" element={<EVMStaffWarrantyClaim />} />
        <Route path="/evmstaff/reports" element={<EVMStaffReportAnalysis />} />
        <Route
          path="/evmstaff/reports/:id"
          element={<EVMStaffReportDetail />}
        />
        <Route
          path="/evmstaff/supply-chain"
          element={<EVMStaffSupplyChain />}
        />
        <Route path="/evmstaff/campaign" element={<EVMStaffCampaign />} />
      </Routes>
    </>
  );
}

export default App;

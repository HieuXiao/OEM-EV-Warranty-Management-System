import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
// IMPORT PUBLIC
import NotFound from "./pages/NotFound";
import Login from "./pages/LoginPage";
import UserProfile from "./pages/UserProfile";
// IMPORT ADMIN
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminWarehouseArea from "./pages/AdminWarehouseArea";
import AdminPartsPolicy from "./pages/AdminParts&Policy";
import AdminSetting from "./pages/AdminSetting";
import AdminServiceCenter from "./pages/AdminServiceCenter";
// IMPORT SCSTAFF
import SCStaffDashboard from "./pages/SCStaffDashboard";
import SCStaffProfile from "./pages/SCStaffProfile";
import CustomerDetail from "./components/scstaff/ScsProfDetail";
import SCStaffWarranty from "./pages/SCStaffWarrantyClaim";
import SCStaffCampaign from "./pages/SCStaffCampaign";

// IMPORT SCTECHNICIAN
import SCTechnicianDashboard from "./pages/SCTechnicianDashBoard";
import SCTechnicianCheck from "./pages/SCTechnicianCheck";
import SCTechnicianRepair from "./pages/SCTechnicianRepair";

// IMPORT EVMSTAFF
import EVMStaffProductPart from "./pages/EVMStaffProduct&Part";
import EVMStaffWarehouse from "./pages/EVMStaffWarehouse";
import EVMStaffReportAnalysis from "./pages/EVMStaffReport&Analysis";
import EVMStaffWarrantyClaim from "./pages/EVMStaffWarrantyClaim";
import EVMStaffCampaign from "./pages/EVMStaffCampaign";
import EVMStaffDetailPart from "./components/evmstaff/EVMStaffDetailPart";
import EVMStaffReportDetail from "./components/evmstaff/EVMStaffReportDetail";
import EVMStaffWarehouseDetail from "./components/evmstaff/EvmWareDetail";
import RequireAuth from "./components/RequireAuth";
import RootRedirect from "./components/RootRedirect";

function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route
          element={
            <RequireAuth
              allowedRoles={["ADMIN", "SC_STAFF", "SC_TECHNICIAN", "EVM_STAFF"]}
            />
          }
        >
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Admin */}
        <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/setting" element={<AdminSetting />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/warehouses" element={<AdminWarehouseArea />} />
          <Route path="/admin/parts-policy" element={<AdminPartsPolicy />} />
          <Route
            path="/admin/service-centers"
            element={<AdminServiceCenter />}
          />
        </Route>

        {/* ScStaff */}
        <Route element={<RequireAuth allowedRoles={["SC_STAFF"]} />}>
          <Route path="/scstaff/dashboard" element={<SCStaffDashboard />} />
          <Route path="/scstaff/profiles" element={<SCStaffProfile />} />
          <Route path="/scstaff/profiles/:id" element={<CustomerDetail />} />
          <Route path="/scstaff/warranty" element={<SCStaffWarranty />} />
          <Route path="/scstaff/campaigns" element={<SCStaffCampaign />} />
        </Route>

        {/* ScTechnician */}
        <Route element={<RequireAuth allowedRoles={["SC_TECHNICIAN"]} />}>
          <Route
            path="/sctechnician/dashboard"
            element={<SCTechnicianDashboard />}
          />
          <Route path="/sctechnician/check" element={<SCTechnicianCheck />} />
          <Route path="/sctechnician/repair" element={<SCTechnicianRepair />} />
        </Route>

        {/* EVMStaff */}
        <Route element={<RequireAuth allowedRoles={["EVM_STAFF"]} />}>
          {/* <Route path="/evmstaff/products" element={<EVMStaffProductPart />} />
          <Route
            path="/evmstaff/products/:id"
            element={<EVMStaffDetailPart />}
          /> */}
          <Route
            path="/evmstaff/warranty"
            element={<EVMStaffWarrantyClaim />}
          />
          <Route
            path="/evmstaff/reports"
            element={<EVMStaffReportAnalysis />}
          />
          <Route
            path="/evmstaff/reports/:id"
            element={<EVMStaffReportDetail />}
          />
          <Route path="/evmstaff/warehouse" element={<EVMStaffWarehouse />} />
          <Route
            path="/evmstaff/warehouse/:id"
            element={<EVMStaffWarehouseDetail />}
          />
          <Route path="/evmstaff/campaign" element={<EVMStaffCampaign />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

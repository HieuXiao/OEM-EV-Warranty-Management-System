import { Route, Routes } from "react-router-dom";
import "./App.css";
import AdminUserManagement from "./pages/AdminUserManagement";
import Login from "./pages/LoginPage";
import AdminWarehouseArea from "./pages/AdminWarehouseArea";
import AdminSetting from "./pages/AdminSetting";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/warehouses" element={<AdminWarehouseArea />} />
        <Route path="/admin/setting" element={<AdminSetting />} />
      </Routes>
    </>
  );
}

export default App;

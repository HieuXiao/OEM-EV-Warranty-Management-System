import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import AdminPage from "./pages/AdminPage";
import AccountList from "./pages/AccountList";
import WarehouseArea from "./pages/WarehouseArea";
import Login from "./pages/LoginPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/accounts" element={<AccountList />} />
        <Route path="/admin/warehouse" element={<WarehouseArea />} />
      </Routes>
    </>
  );
}

export default App;

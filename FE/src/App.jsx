import { Route, Routes } from "react-router-dom";
import "./App.css";
import AdminUserManagement from "./pages/AdminUserManagement";
import Login from "./pages/LoginPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/evmstaff" element={< EVMStaff />} />
      </Routes>
    </>
  );
}

export default App;

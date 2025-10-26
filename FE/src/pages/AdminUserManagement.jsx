//FE/src/pages/AdminUserManagement.jsx

import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import AdminUserDetail from "@/components/admin/AdUserDetail.jsx";
import AdUserTable from "@/components/admin/AdUserTable.jsx";
import AdUserEdit from "@/components/admin/AdUserEdit.jsx";
import AdUserCreate from "@/components/admin/AdUserCreate.jsx";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const USERS_URL = "/api/accounts/";
const REGISTER_URL = "/api/auth/register";

export default function AdminUserManagement() {
  const { auth } = useAuth();

  // State
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    fullname: "",
    gender: "male",
    email: "",
    phone: "",
    role: "sc_technician",
    serviceCenter: "",
  });

  // ================== FETCH USERS ==================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get(USERS_URL);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================== FORM HANDLERS ==================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () =>
    setFormData({
      id: "",
      username: "",
      password: "",
      fullname: "",
      gender: "male",
      email: "",
      phone: "",
      role: "sc_technician",
      serviceCenter: "",
    });

  // ================== CRUD ==================
  const handleAddUser = async () => {
    const newUser = {
      accountId: formData.id,
      username: formData.username,
      password: formData.password,
      fullName: formData.fullname,
      gender: formData.gender === "male",
      email: formData.email,
      phone: formData.phone,
    };

    try {
      await axiosPrivate.post(REGISTER_URL, newUser);
      fetchUsers();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  const handleEditUser = async () => {
    const updatedUser = {
      username: formData.username,
      password: formData.password || null,
      fullName: formData.fullname,
      gender: formData.gender === "male",
      email: formData.email,
      phone: formData.phone,
    };

    try {
      await axiosPrivate.put(`${USERS_URL}${formData.id}`, updatedUser);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Edit user failed:", err);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = !user.enabled;
      await axiosPrivate.put(
        `${USERS_URL}${user.accountId}/status?enabled=${newStatus}`
      );
      fetchUsers();
    } catch (err) {
      console.error("Toggle user status failed:", err);
    }
  };

  // ================== FILTER ==================
  const filteredUsers = users.filter((u) =>
    [u.username, u.fullName, u.email, u.roleName]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>

          <div className="flex items-center justify-between mb-4">
            {/* Thanh search */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search user..."
                className="w-[450px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Nút Add User */}
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create New User
            </Button>
          </div>

          {/* Table */}
          <AdUserTable
            users={filteredUsers}
            loading={loading}
            onEdit={setEditingUser}
            onToggleStatus={toggleUserStatus}
            onSelectUser={(user) => {
              setSelectedUser(user);
              setIsDetailDialogOpen(true);
            }}
          />

          {/* Dialogs */}
          <AdUserCreate
            open={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onReset={resetForm}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleAddUser}
          />

          <AdUserEdit
            open={!!editingUser}
            formData={formData}
            onClose={() => setEditingUser(null)}
            onChange={handleChange}
            onSubmit={handleEditUser}
            setFormData={setFormData}
            user={editingUser}
          />

          <AdminUserDetail
            open={isDetailDialogOpen}
            onClose={() => setIsDetailDialogOpen(false)}
            user={selectedUser}
            onToggleStatus={toggleUserStatus}
          />
        </div>
      </div>
    </div>
  );
}

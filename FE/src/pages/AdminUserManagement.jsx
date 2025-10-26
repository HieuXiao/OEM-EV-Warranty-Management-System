//FE/src/pages/AdminUserManagement.jsx

// ======================= IMPORTS =======================
// Import layout & component utilities
import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";

// React hooks
import { useEffect, useState } from "react";

// UI components (Shadcn)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Custom admin components
import AdminUserDetail from "@/components/admin/AdUserDetail.jsx";
import AdUserTable from "@/components/admin/AdUserTable.jsx";
import AdUserEdit from "@/components/admin/AdUserEdit.jsx";
import AdUserCreate from "@/components/admin/AdUserCreate.jsx";

// API config & auth hook
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

// ======================= CONSTANTS =======================
const USERS_URL = "/api/accounts/";
const REGISTER_URL = "/api/auth/register";

// ======================= MAIN COMPONENT =======================
export default function AdminUserManagement() {
  const { auth } = useAuth();

  // ================== STATE ==================
  // User data and UI state
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  // Dialog & form states
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
  // Get list of users from API
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
  // Handling input form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  //Reset form to original state
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

  // ================== CRUD HANDLERS ==================
  // Add new user (POST)
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
  // Edit user information (PUT)
  const handleEditUser = async () => {
    const updatedUser = {
      username: editingUser.username,
      password: null,
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
  // Enable/Disable Account Status (PATCH)
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
  // Filter user list by search + role
  const filteredUsers = users
    .filter((u) =>
      [u.username, u.fullName, u.email, u.roleName]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .filter(
      (u) => filterRole === "all" || u.roleName.toLowerCase() === filterRole
    );

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-6 space-y-4">
          {/* Header */}
          {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">User Management</h1>
          </div> */}

          {/* Toolbar: Search + Filter + Add */}
          <Card className="border bg-white shadow-sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 px-5 py-0">
              {/* Search + Filter */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search user..."
                    className="pl-9 w-[300px] sm:w-[400px] border-gray-300 focus-visible:ring-1 focus-visible:ring-primary h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter role dropdown */}
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[160px] border-gray-300 focus-visible:ring-1 focus-visible:ring-primary h-10">
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="evm_staff">EVM Staff</SelectItem>
                    <SelectItem value="sc_staff">SC Staff</SelectItem>
                    <SelectItem value="sc_technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add new user button */}
              <Button
                className="gap-2 h-10"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create New User
              </Button>
            </CardContent>
          </Card>

          {/* User table */}
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

// FE/src/pages/AdminUserManagement.jsx

import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Edit, Shield, Power } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import AdminUserDetail from "@/components/admin/AdUserDetail.jsx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const USERS_URL = "/api/accounts/";
const REGISTER_URL = "/api/auth/register";

export default function AdminUserManagement() {
  const { auth } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // ================== FORM RESET ==================
  const resetForm = () => {
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
  };

  // ================== ADD USER ==================
  const handleAddUser = async () => {
    const newUser = {
      accountId: formData.id,
      username: formData.username,
      password: formData.password,
      fullName: formData.fullname,
      gender: formData.gender === "male", // true nếu male
      email: formData.email,
      phone: formData.phone,
    };

    try {
      const res = await axiosPrivate.post(REGISTER_URL, newUser);
      console.log("✅ User created:", res.data);

      fetchUsers(); // load lại danh sách
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  // ================== EDIT USER ==================
  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      id: user.accountId,
      username: user.username,
      password: "",
      fullname: user.fullName,
      gender: user.gender ? "male" : "female",
      email: user.email,
      phone: user.phone || "",
    });
  };

  const handleEditUser = async () => {
    const updatedUser = {
      username: formData.username,
      password: formData.password || null, // nếu bỏ trống thì không đổi
      fullName: formData.fullname,
      gender: formData.gender === "male",
      email: formData.email,
      phone: formData.phone,
    };

    try {
      await axiosPrivate.put(`${USERS_URL}${formData.id}`, updatedUser);
      console.log("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Edit user failed:", err);
    }
  };

  // ================== ENABLE / DISABLE USER ==================
  const toggleUserStatus = async (user) => {
    try {
      const accountId = user.accountId;
      const newStatus = !user.enabled;

      await axiosPrivate.put(
        `/api/accounts/${accountId}/status?enabled=${newStatus}`
      );
      console.log(
        `User ${accountId} status updated to ${
          newStatus ? "enabled" : "disabled"
        }`
      );
      fetchUsers();
    } catch (err) {
      console.error("Toggle user status failed:", err);
    }
  };

  // ================== FORM CHANGE ==================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ================== SEARCH FILTER ==================
  const filteredUsers = users.filter((u) =>
    [u.username, u.fullName, u.email, u.roleName]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ================== ROLE UTILS ==================
  function getRoleColor(role) {
    switch (role) {
      case "admin":
        return "bg-purple-500";
      case "evm_staff":
        return "bg-blue-500";
      case "sc_staff":
        return "bg-green-500";
      case "sc_technician":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  }

  function getRoleLabel(role) {
    switch (role) {
      case "admin":
        return "Admin";
      case "evm_staff":
        return "EVM Staff";
      case "sc_staff":
        return "SC Staff";
      case "sc_technician":
        return "Technician";
      default:
        return "Unknown";
    }
  }

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold">User Management</h1>
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add User
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    {[
                      {
                        id: "id",
                        label: "Account ID",
                        placeholder: "e.g. ad000001",
                      },
                      {
                        id: "username",
                        label: "Username",
                        placeholder: "e.g. john_doe",
                      },
                      {
                        id: "password",
                        label: "Password",
                        placeholder: "Enter password",
                      },
                      {
                        id: "fullname",
                        label: "Full Name",
                        placeholder: "e.g. John Doe",
                      },
                      {
                        id: "email",
                        label: "Email",
                        placeholder: "e.g. john@example.com",
                      },
                      {
                        id: "phone",
                        label: "Phone Number",
                        placeholder: "e.g. 0987654321",
                      },
                    ].map((field) => (
                      <div className="grid gap-2" key={field.id}>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Input
                          id={field.id}
                          name={field.id}
                          value={formData[field.id]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}

                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, gender: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <TableRow
                              key={u.accountId}
                              onClick={() => {
                                setSelectedUser(u);
                                setIsDetailDialogOpen(true);
                              }}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {u.username}
                              </TableCell>

                              <TableCell>{u.fullName}</TableCell>

                              <TableCell>{u.phone || "—"}</TableCell>

                              <TableCell>{u.email}</TableCell>

                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${getRoleColor(
                                    u.roleName?.toLowerCase()
                                  )} text-white`}
                                >
                                  {getRoleLabel(u.roleName?.toLowerCase())}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={
                                    u.enabled ? "bg-green-500" : "bg-red-500"
                                  }
                                >
                                  {u.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </TableCell>

                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(u)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => toggleUserStatus(u)}
                                    >
                                      <Power
                                        className={`mr-2 h-4 w-4 ${
                                          u.enabled
                                            ? "text-red-500"
                                            : "text-green-500"
                                        }`}
                                      />
                                      {u.enabled ? "Disable" : "Enable"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-gray-500"
                            >
                              No users found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog
              open={!!editingUser}
              onOpenChange={(open) => !open && setEditingUser(null)}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update account information
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                  {/* Username */}
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. john_doe"
                    />
                  </div>

                  {/* Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0987654321"
                    />
                  </div>

                  {/* Gender */}
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, gender: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditUser}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AdminUserDetail
              open={isDetailDialogOpen}
              onClose={() => setIsDetailDialogOpen(false)}
              user={selectedUser}
              onToggleStatus={toggleUserStatus}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}

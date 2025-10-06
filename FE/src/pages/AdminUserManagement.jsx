import Sidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import profile from "../assets/profile.jpg";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Edit, Trash2, Shield } from "lucide-react";
import { mockUsers } from "@/lib/Mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function AdminUserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sc_technician",
    phone: "",
    serviceCenter: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      phone: user.phone || "",
      serviceCenter: user.serviceCenter || "",
    });
  };

  function cancelEdit(params) {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "sc_technician",
      phone: "",
      serviceCenter: "",
    });
  }

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

  useEffect(() => {
    document.title = "Users Management";
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar name={"Pham Nhut Nam"} image={profile} role={"Admin"} />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header
          name={"Pham Nhut Nam"}
          image={profile}
          email={"nam.admin@gmail.com"}
        />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  User Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage system users and permissions
                </p>
              </div>
              {/* Form Add User */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account with specific role and
                      permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyen Van A"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="*********"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        name="role"
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="evm_staff">EVM Staff</SelectItem>
                          <SelectItem value="sc_staff">SC Staff</SelectItem>
                          <SelectItem value="sc_technician">
                            SC Technician
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(formData.role === "sc_staff" ||
                      formData.role === "sc_technician") && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="serviceCenter">Service Center</Label>
                          <Input
                            id="serviceCenter"
                            name="serviceCenter"
                            value={formData.serviceCenter}
                            onChange={handleChange}
                            placeholder="SC Hanoi Central"
                          />
                        </div>
                      </>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="1900150xxx"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {/* Stats */}
            <div className="grid gap-5 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Admin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    EVM Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    SC Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    SC Technician
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
            </div>
            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Service Center</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-sm">{u.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getRoleColor(u.role)} text-white`}
                            >
                              {getRoleLabel(u.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {u.serviceCenter || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
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
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Edit Dialog */}
            <Dialog
              open={!!editingUser}
              onOpenChange={(open) => !open && setEditingUser(null)}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update user information and permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-password">Password</Label>
                    <Input
                      id="edit-password"
                      name="password"
                      type="text"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      name="role"
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="evm_staff">EVM Staff</SelectItem>
                        <SelectItem value="sc_staff">SC Staff</SelectItem>
                        <SelectItem value="sc_technician">
                          SC Technician
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData.role === "sc_staff" ||
                    formData.role === "sc_technician") && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-serviceCenter">Service Center</Label>
                      <Input
                        id="edit-serviceCenter"
                        name="serviceCenter"
                        value={formData.serviceCenter}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => cancelEdit()}>
                    Cancel
                  </Button>
                  <Button>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

import Sidebar from "@/components/admin/AdminSidebar"
import Header from "@/components/header"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axiosPrivate from "@/api/axios"
import axios from "axios"
import useAuth from "@/hook/useAuth"

const USERS_URL = "/api/accounts/"
const REGISTER_URL = "/api/auth/register"

export default function AdminUserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { auth } = useAuth()

  const filteredUsers = users.filter(
    (u) =>
      u.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    fullname: "",
    gender: "male",
    email: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddUser = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.fullname) {
      console.log("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(REGISTER_URL, {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullname: formData.fullname,
        gender: formData.gender,
        phone: formData.phone,
      })

      setUsers([...users, response.data])
      console.log("User added successfully")

      setIsAddDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Add User Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!formData.fullname || !formData.email) {
      console.log("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosPrivate.put(`${USERS_URL}${editingUser.id}`, {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        phone: formData.phone,
      })

      setUsers(users.map((u) => (u.id === editingUser.id ? response.data : u)))
      console.log("User updated successfully")

      setEditingUser(null)
      resetForm()
    } catch (err) {
      console.error("Edit User Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    setIsLoading(true)
    try {
      await axiosPrivate.delete(`${USERS_URL}${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
      console.log("User deleted successfully")
    } catch (err) {
      console.error("Delete User Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (user) => {
    setEditingUser(user)
    setFormData({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      password: user.password,
      gender: user.gender || "male",
      phone: user.phone || "",
      username: user.username || "",
    })
  }

  const resetForm = () => {
    setFormData({
      id: "",
      username: "",
      password: "",
      fullname: "",
      gender: "male",
      email: "",
      phone: "",
    })
  }

  function cancelEdit() {
    setEditingUser(null)
    resetForm()
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axiosPrivate.get(USERS_URL)
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data)
        }
      } catch (err) {
        console.error("Fetch Users Error:", err.message)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
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
                    <DialogDescription>Create a new user account</DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Nguyen Van An"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="AnVN02"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nguyenvanan@example.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="id">Account Id</Label>
                      <Input
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="AnNV"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0912345678"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="*********"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        resetForm()
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-5 md:grid-cols-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage user accounts</CardDescription>
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
                        <TableHead>Username</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-sm">{u.fullname}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{u.username}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{u.phone || "-"}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isLoading}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(u)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(u.id)}>
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
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>Update user information</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-fullname">Full Name</Label>
                    <Input id="edit-fullname" name="fullname" value={formData.fullname} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-password">Password</Label>
                    <Input
                      id="edit-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => cancelEdit()} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditUser} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

// FE/src/components/admin/AdUserTable.jsx

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Edit,
  Power,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const ROLE_PRIORITY = {
  admin: 1,
  evm_staff: 2,
  sc_staff: 3,
  sc_technician: 4,
  default: 99,
};

const getRolePriority = (role) =>
  ROLE_PRIORITY[role?.toLowerCase()] || ROLE_PRIORITY.default;

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-red-500 hover:bg-red-600";
    case "evm_staff":
      return "bg-blue-500 hover:bg-blue-600";
    case "sc_staff":
      return "bg-green-500 hover:bg-green-600";
    case "sc_technician":
      return "bg-orange-500 hover:bg-orange-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const getRoleLabel = (role) => {
  switch (role?.toLowerCase()) {
    case "evm_staff":
      return "EVM Staff";
    case "sc_staff":
      return "SC Staff";
    case "sc_technician":
      return "Technician";
    default:
      return role?.charAt(0).toUpperCase() + role?.slice(1);
  }
};

export default function AdUserTable({
  users = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onSelectUser,
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const sortedUsers = [...users].sort(
    (a, b) => getRolePriority(a.roleName) - getRolePriority(b.roleName)
  );

  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayUsers = sortedUsers.slice(startIndex, startIndex + rowsPerPage);

  return (
    <Card className="pt-4 px-2 sm:px-4 pb-4">
      <CardHeader className="px-2 sm:px-6">
        {/* CHỈNH SỬA: Responsive Header Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Click on a row to view details.</CardDescription>
          </div>

          {/* Stack filters on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[160px]">
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

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-0 sm:px-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading user data...</span>
          </div>
        ) : (
          <>
            {/* CHỈNH SỬA: Responsive Table Wrapper */}
            <div className="rounded-md border overflow-x-auto mx-4 sm:mx-0">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Username</TableHead>
                    <TableHead className="w-1/5">Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="text-right w-[80px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {displayUsers.length > 0 ? (
                    displayUsers.map((u) => (
                      <TableRow
                        key={u.accountId}
                        onClick={() => onSelectUser?.(u)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-semibold text-gray-600">
                          {u.username}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {u.fullName}
                        </TableCell>
                        <TableCell>{u.phone || "—"}</TableCell>
                        <TableCell title={u.email}>
                          {u.email?.length > 25
                            ? u.email.slice(0, 25) + "..."
                            : u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getRoleColor(
                              u.roleName?.toLowerCase()
                            )} text-white`}
                          >
                            {getRoleLabel(u.roleName?.toLowerCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`gap-1 ${
                              u.enabled ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                u.enabled ? "bg-green-300" : "bg-red-300"
                              }`}
                            ></div>
                            {u.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4 text-gray-500 hover:text-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit?.(u);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleStatus?.(u);
                                }}
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
                        colSpan={7}
                        className="text-center text-gray-500"
                      >
                        <div className="p-10 text-center">
                          <h3 className="text-xl font-semibold text-muted-foreground">
                            No Users Found
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            The current filter and search settings did not match
                            any users.
                          </p>
                          {(searchQuery || filterRole !== "all") && (
                            <Button
                              variant="link"
                              onClick={() => {
                                setSearchQuery("");
                                setFilterRole("all");
                              }}
                              className="mt-2"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {sortedUsers.length > rowsPerPage && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <span className="mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

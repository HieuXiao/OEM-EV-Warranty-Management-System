// FE/src/components/admin/AdUserTable.jsx

// ======================= IMPORTS =======================
import React, { useState } from "react";
// UI Component Imports
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

// Role priority map for sorting (Lower number means higher priority/appears first)
const ROLE_PRIORITY = {
  admin: 1,
  evm_staff: 2,
  sc_staff: 3,
  sc_technician: 4,
  default: 99,
};

/**
 * AdUserTable Component
 * Displays a paginated table of users with actions (Edit, Toggle Status).
 * The list is sorted primarily by Role Priority and secondarily by Account ID (as a proxy for newest).
 * @param {Object[]} users - Array of user objects (already filtered by the parent component).
 * @param {boolean} loading - Loading state.
 * @param {function} onEdit - Handler to set user for editing.
 * @param {function} onToggleStatus - Handler to change user's enabled status.
 * @param {function} onSelectUser - Handler to view user details.
 * @param {string} searchQuery - Current search query string.
 * @param {function} setSearchQuery - Setter for search query state.
 * @param {string} filterRole - Currently selected role filter.
 * @param {function} setFilterRole - Setter for role filter state.
 */
export default function AdUserTable({
  users = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onSelectUser,
  // Props for Filter and Search functionality
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
}) {
  // ================== PAGINATION STATE ==================
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6); // Keep rows per page constant

  // ================== SORTING LOGIC ==================
  
  // 1. Sort the received user list: Role (Priority Ascending) -> Newest (ID Descending)
  const sortedUsers = [...users].sort((a, b) => {
    const roleA = a.roleName?.toLowerCase() || 'default';
    const roleB = b.roleName?.toLowerCase() || 'default';
    const priorityA = ROLE_PRIORITY[roleA] || ROLE_PRIORITY.default;
    const priorityB = ROLE_PRIORITY[roleB] || ROLE_PRIORITY.default;

    // Primary Sort: By Role Priority (Ascending: Admin first)
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Secondary Sort: Newest First (Assuming higher accountId/order is newer)
    if (a.accountId < b.accountId) return 1; 
    if (a.accountId > b.accountId) return -1; 

    return 0;
  });

  // ================== PAGINATION CALCULATION ==================
  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  // Use currentUsers for display
  const displayUsers = currentUsers; 

  // ================== UTILITY FUNCTIONS ==================

  /** Maps role name to a Tailwind background color class */
  const getRoleColor = (role) => {
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
  };

  /** Maps role name to a user-friendly label */
  const getRoleLabel = (role) => {
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
  };

  // ================== UI RENDERING ==================
  return (
    <Card className="pt-4 px-4 pb-4">
      
      {/* CardHeader */}
      <CardHeader> 
        <div className="flex flex-row items-center justify-between">
          
          {/* Left Block: Title and Description (Matched AdServTable) */}
          <div>
            <CardTitle>
              All Users
            </CardTitle>
            <CardDescription>
              Click on a row to view details.
            </CardDescription>
          </div>

          {/* Right Block: Filter and Search */}
          <div className="flex items-center gap-2">
            
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
            
            {/* Search box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      {/* CardContent */}
      <CardContent className="pt-0 px-4"> 
        
        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Loading user data...</span>
          </div>
        ) : (
          <>
            {/* User Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Username</TableHead>
                    <TableHead className="w-1/5">Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {displayUsers.length > 0 ? (
                    displayUsers.map((u) => (
                      <TableRow
                        key={u.accountId}
                        // Clicking the row shows user details
                        onClick={() => onSelectUser?.(u)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        {/* Username */}
                        <TableCell className="font-semibold text-gray-600">{u.username}</TableCell>
                        {/* Full Name */}
                        <TableCell className="font-medium text-foreground">{u.fullName}</TableCell>
                        <TableCell>{u.phone || "—"}</TableCell>
                        <TableCell title={u.email}>
                          {/* Truncate long emails */}
                          {u.email?.length > 25
                            ? u.email.slice(0, 25) + "..."
                            : u.email}
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell>
                          <Badge
                            className={`${getRoleColor(
                              u.roleName?.toLowerCase()
                            )} text-white`}
                          >
                            {getRoleLabel(u.roleName?.toLowerCase())}
                          </Badge>
                        </TableCell>

                        {/* Status Badge */}
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

                        {/* Action Dropdown */}
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
                    // No users found row (Empty State)
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
                        <div className="p-10 text-center">
                          <h3 className="text-xl font-semibold text-muted-foreground">No Users Found</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            The current filter and search settings did not match any users.
                          </p>
                          {(searchQuery || filterRole !== 'all') && (
                              <Button variant="link" onClick={() => { setSearchQuery(''); setFilterRole('all'); }} className="mt-2">
                                  Clear Search and Filters
                              </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls (MOVED TO BOTTOM & CENTERED, ADJUSTED SPACING) */}
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
                
                {/* Placed Page X of Y between buttons */}
                <span className="mx-2"> 
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

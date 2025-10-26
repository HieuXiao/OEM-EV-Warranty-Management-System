import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { MoreVertical, Edit, Power, Loader2 } from "lucide-react";

export default function AdUserTable({
  users,
  loading,
  onEdit,
  onToggleStatus,
  onSelectUser,
}) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-600">Đang tải dữ liệu người dùng...</span>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length ? (
                  users.map((u) => (
                    <TableRow
                      key={u.accountId}
                      onClick={() => onSelectUser(u)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.fullName}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>

                      <TableCell>
                        <Badge className={`${getRoleColor(u.roleName?.toLowerCase())} text-white`}>
                          {getRoleLabel(u.roleName?.toLowerCase())}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={u.enabled ? "bg-green-500" : "bg-red-500"}>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(u);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(u);
                              }}
                            >
                              <Power
                                className={`mr-2 h-4 w-4 ${
                                  u.enabled ? "text-red-500" : "text-green-500"
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
                    <TableCell colSpan={7} className="text-center text-gray-500">
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
  );
}

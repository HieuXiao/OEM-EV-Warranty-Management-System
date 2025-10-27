// FE/src/components/admin/AdServDetail.jsx

import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Component hiển thị chi tiết trung tâm dịch vụ và danh sách nhân viên
 * @param {Object} props
 * @param {Object} props.center - Thông tin trung tâm được chọn
 * @param {Function} props.onBack - Hàm callback khi nhấn "Back"
 */
export default function AdServDetail({ center, onBack }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    if (!center?.centerId) return;
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/accounts/");
      const data = res.data || [];

      const filtered = data.filter(
        (acc) => acc.serviceCenter?.centerId === center.centerId
      );
      setStaffList(filtered);
    } catch (err) {
      console.error("Failed to load staff:", err);
      alert("Không thể tải danh sách nhân viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [center]);

  if (!center) return <p>No center selected.</p>;

  return (
    <Card className="p-4">
      {/* Header */}
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl">{center.centerName}</CardTitle>
          <CardDescription>
            ID: {center.centerId} — {center.location}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
      </CardHeader>

      <Separator className="my-4" />

      {/* Staff list */}
      <CardContent>
        <h3 className="text-lg font-semibold mb-3">Staff Members</h3>

        {loading ? (
          <p>Loading staff...</p>
        ) : staffList.length === 0 ? (
          <p className="text-muted-foreground">
            No staff assigned to this center.
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((s) => (
                  <TableRow key={s.accountId}>
                    <TableCell>{s.accountId}</TableCell>
                    <TableCell>{s.fullName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.roleName}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          s.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {s.enabled ? "Active" : "Disabled"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

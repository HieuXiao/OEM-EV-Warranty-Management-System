import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function AdminServiceCenter() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Fetch danh sách users và warehouse
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, warehouseRes] = await Promise.all([
          axiosPrivate.get("/api/accounts"),
          axiosPrivate.get("/api/warehouseAreas"),
        ]);
        const staff = userRes.data.filter(
          (u) => u.roleName === "SC_STAFF" || u.roleName === "SC_TECHNICIAN"
        );
        setUsers(staff);
        setWarehouses(warehouseRes.data);
      } catch (err) {
        console.error("Fetch failed:", err);
        setMessage({
          type: "error",
          text: "Không thể tải danh sách nhân sự hoặc khu vực kho.",
        });
      }
    };
    fetchData();
  }, []);

  // 🔹 Gửi yêu cầu assign nhân lực
  const handleAssign = async (accountId) => {
    const warehouseId = assignments[accountId];
    if (!warehouseId) {
      setMessage({ type: "error", text: "Vui lòng chọn kho trước khi điều động." });
      return;
    }

    try {
      await axiosPrivate.post("/api/service_center/assign", {
        accountId,
        warehouseId,
      });
      setMessage({
        type: "success",
        text: `✅ Điều động thành công: ${accountId} → Kho ${warehouseId}`,
      });
      console.log(`[AdminServiceCenter] Assigned ${accountId} to ${warehouseId}`);
    } catch (err) {
      console.error("[AdminServiceCenter] Assign failed:", err);
      setMessage({
        type: "error",
        text: "❌ Điều động thất bại. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold text-foreground">
            Service Center Management
          </h1>

          {/* Thông báo */}
          {message.text && (
            <div
              className={`p-3 rounded-md text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Assign Staff & Technicians</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.accountId}
                  className="flex items-center justify-between border-b py-3"
                >
                  <div>
                    <p className="font-medium">
                      {u.fullName} ({u.roleName})
                    </p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={assignments[u.accountId] || ""}
                      onValueChange={(value) =>
                        setAssignments({ ...assignments, [u.accountId]: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => handleAssign(u.accountId)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

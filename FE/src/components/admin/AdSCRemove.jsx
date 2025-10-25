import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge"; 
import { AlertCircle } from "lucide-react"; 

export default function AdSCRemove({ center, onRemoved, onCancel }) {
  const [accountId, setAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // State mới để quản lý danh sách nhân viên, trạng thái tải và lỗi
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [assignedStaff, setAssignedStaff] = useState([]); 
  const [error, setError] = useState("");

  // Hàm lấy danh sách nhân viên đã được gán cho trung tâm (Yêu cầu 2: Hiện danh sách)
  const fetchAssignedStaff = async () => {
    try {
      setLoadingStaff(true);
      // GIẢ ĐỊNH API: Cần thay thế bằng endpoint thực tế của bạn
      const res = await axiosPrivate.get(`/api/service_centers/${center.centerId}/staff`); 
      setAssignedStaff(res.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch assigned staff:", err);
      // Có thể muốn thông báo lỗi tải danh sách
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchAssignedStaff();
  }, [center.centerId]);

  const handleRemove = async () => {
    if (!accountId) {
        setError("Vui lòng nhập Account ID.");
        return;
    }
    setError("");

    // 4. Kiểm tra Account ID có tồn tại trong danh sách nhân viên đang làm (Client-side check)
    const isAssigned = assignedStaff.some(
      (staff) => staff.accountId.toLowerCase() === accountId.toLowerCase()
    );

    if (!isAssigned) {
      // Yêu cầu 4: Hiện thông báo Not Have This AccountID nếu sai
      setError("Not Have This AccountID");
      return;
    }

    try {
      setSubmitting(true);
      // Gọi API Remove (API đã có sẵn trong file gốc)
      await axiosPrivate.delete(`/api/account-center/remove/${accountId}`);
      onRemoved(accountId);
    } catch (err) {
      console.error("Remove failed:", err);
      const backendMessage = err?.response?.data?.message || err.message;

      // Xử lý lỗi từ backend (ví dụ: lỗi mạng, lỗi phân quyền,...)
      setError(`Lỗi xóa tài khoản: ${backendMessage}`);
      
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Điều kiện để nút Remove xám đi nếu không có người
  const isRemoveDisabled = submitting || !accountId || assignedStaff.length === 0 || loadingStaff;

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Remove Account from {center.centerName}</DialogTitle>
        <DialogDescription>
          Nhập Account ID cần loại bỏ khỏi trung tâm này. Sau khi xóa thành công, hệ thống sẽ trả về HTTP 200.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Yêu cầu 2: Hiện danh sách các nhân viên đang làm */}
        <div className="grid gap-2">
            <Label>Nhân viên đang làm ({assignedStaff.length})</Label>
            {loadingStaff ? (
                <p>Đang tải danh sách...</p>
            ) : assignedStaff.length === 0 ? (
                <p className="text-sm text-red-500 font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Không có nhân viên nào được gán cho trung tâm này. Nút "Xóa Account" sẽ bị vô hiệu hóa.
                </p>
            ) : (
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                    {assignedStaff.map((staff) => (
                        <Badge key={staff.accountId} variant="secondary" className="mr-1 mb-1">
                            {staff.accountId} — {staff.fullName || staff.username}
                        </Badge>
                    ))}
                </div>
            )}
        </div>

        {/* Yêu cầu 3: Người dùng có quyền tự viết accountid */}
        <div className="grid gap-2">
          <Label htmlFor="accountId">Account ID cần loại bỏ</Label>
          <Input 
            id="accountId" 
            value={accountId} 
            onChange={(e) => {
                setAccountId(e.target.value);
                setError(""); // Xóa lỗi khi người dùng bắt đầu gõ lại
            }} 
            placeholder="e.g. sc0001" 
            disabled={assignedStaff.length === 0 || submitting || loadingStaff}
          />
          
          {/* Yêu cầu 4: Hiện thông báo Not Have This AccountID nếu sai */}
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}

        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
            Hủy
        </Button>
        {/* Yêu cầu 1: Nút Remove xám đi nếu không có người (assignedStaff.length === 0) */}
        <Button onClick={handleRemove} disabled={isRemoveDisabled}>
          {submitting ? "Đang Xóa..." : assignedStaff.length === 0 ? "Không có nhân viên" : "Xóa Account"}
        </Button>
      </DialogFooter>
    </div>
  );
}
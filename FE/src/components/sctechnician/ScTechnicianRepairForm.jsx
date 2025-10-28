import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Wrench, CheckCircle } from "lucide-react";
import axiosPrivate from "@/api/axios";

const API_ENDPOINTS = {
  FILE_UPLOAD: "/api/warranty-files/combined/upload-create",
  CLAIM_WORKFLOW: "/api/warranty-claims/workflow",
};

const ScTechnicianRepairForm = ({ job, onClose, onComplete }) => {
  const [repairParts, setRepairParts] = useState([]);
  const [serialInputs, setSerialInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  // Lấy danh sách part cần sửa và thông tin part kho (chỉ whId = 1)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimPartsRes, partsRes] = await Promise.all([
          axiosPrivate.get("/api/claim-part-check/all"),
          axiosPrivate.get("/api/parts"),
        ]);

        const allClaimParts = Array.isArray(claimPartsRes?.data)
          ? claimPartsRes.data
          : [];

        const allParts = Array.isArray(partsRes?.data) ? partsRes.data : [];

        // Lọc các part repair thuộc claimId hiện tại
        const filtered = allClaimParts.filter(
          (p) => p.warrantyClaim === job?.claimId && p.repair === true
        );

        // Lọc kho whId = 1
        const validParts = allParts.filter((p) => p?.warehouse?.whId === 1);

        // Ghép tên part
        const merged = filtered.map((r) => {
          const match = validParts.find((p) => p.partSerial === r.partNumber);
          return {
            ...r,
            namePart: match?.namePart || r.partNumber,
          };
        });

        setRepairParts(merged);
      } catch (err) {
        console.error("[RepairForm] Load parts failed:", err);
      }
    };
    fetchData();
  }, [job]);

  // Xử lý nhập serial numbers (ngăn cách bằng ;)
  const handleSerialChange = (partNumber, value) => {
    setSerialInputs((prev) => ({ ...prev, [partNumber]: value }));
  };

  // Gửi API hoàn tất Repair
  const handleCompleteRepair = async () => {
    try {
      const claimId = job?.claimId || job?.id;
      const technicianId = job?.serviceCenterTechnician?.accountId;

      // Kiểm tra nhập serial hợp lệ
      for (const part of repairParts) {
        const input = serialInputs[part.partNumber]?.trim();
        const serials = input ? input.split(";").map((s) => s.trim()) : [];

        if (serials.length < part.quantity) {
          alert(
            `Bộ phận ${part.namePart} yêu cầu nhập đủ ${part.quantity} serial number (ngăn cách bằng dấu ;)`
          );
          return;
        }
      }

      setLoading(true);

      // Upload evidence file nếu có
      if (file) {
        const formData = new FormData();
        formData.append("claimId", claimId);
        formData.append("files", file);
        try {
          await axiosPrivate.post(API_ENDPOINTS.FILE_UPLOAD, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (e) {
          console.error("[RepairForm] file upload failed:", e);
          // không bắt dừng — vẫn tiếp tục workflow
        }
      }

      // Gọi API cập nhật workflow: technician done
      await axiosPrivate.post(
        `${API_ENDPOINTS.CLAIM_WORKFLOW}/${claimId}/technician/done`,
        {
          claimId,
          technicianId,
          done: true,
        }
      );

      alert("Đã hoàn tất Repair. Trạng thái claim chuyển sang HANDOVER.");
      onComplete?.();
    } catch (e) {
      console.error("[RepairForm] Complete Repair failed:", e.response || e);
      alert(
        "Lỗi khi hoàn tất Repair.\n" +
          (e.response?.status ? `Mã lỗi: ${e.response.status}` : "") +
          "\n" +
          (e.response?.data ? JSON.stringify(e.response.data) : "")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
            <Wrench className="h-5 w-5" /> REPAIR TASK - Claim #{job?.claimId}
          </h2>
          <Button variant="destructive" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {repairParts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có bộ phận nào cần sửa cho claim này.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repairParts.map((part) => (
                <div
                  key={part.partNumber}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{part.namePart}</h4>
                    <span className="text-xs text-muted-foreground">
                      Qty: {part.quantity}
                    </span>
                  </div>

                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Serial Numbers (ngăn cách bằng dấu ;)
                  </Label>
                  <Input
                    value={serialInputs[part.partNumber] || ""}
                    onChange={(e) =>
                      handleSerialChange(part.partNumber, e.target.value)
                    }
                    placeholder="VD: A123; B456; C789"
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <Label className="text-sm">Upload evidence (optional)</Label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
          </div>

          {repairParts.length > 0 && (
            <div className="flex justify-end mt-6 gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCompleteRepair}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? "Saving..." : "Complete Repair"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScTechnicianRepairForm;

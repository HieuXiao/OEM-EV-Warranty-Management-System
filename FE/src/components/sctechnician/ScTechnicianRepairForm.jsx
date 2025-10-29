import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Wrench } from "lucide-react";
import axiosPrivate from "@/api/axios";

const API_ENDPOINTS = {
  CLAIM_PART_CHECK: "/api/claim-part-check/search/warranty",
  ADD_SERIALS: "/api/claim-part-check/add-serials",
  CLAIM_WORKFLOW: "/api/warranty-claims/workflow",
  PARTS: "/api/parts",
};

export default function ScTechnicianRepairForm({ job, onClose, onComplete }) {
  const [repairParts, setRepairParts] = useState([]);
  const [serialInputs, setSerialInputs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!job?.claimId) return;

    const fetchRepairParts = async () => {
      try {
        const res = await axiosPrivate.get(
          `${API_ENDPOINTS.CLAIM_PART_CHECK}/${job.claimId}`
        );
        const claimParts = Array.isArray(res.data) ? res.data : [];

        // lọc part có repair:true
        const repairList = claimParts.filter((p) => p.isRepair === true);
        if (repairList.length === 0) {
          setRepairParts([]);
          return;
        }

        // lấy thêm partName từ /api/parts
        const partRes = await axiosPrivate.get(API_ENDPOINTS.PARTS);
        const allParts = Array.isArray(partRes.data) ? partRes.data : [];

        const merged = repairList.map((p) => {
          const found = allParts.find(
            (x) =>
              x.partNumber?.toUpperCase() === p.partNumber?.toUpperCase()
          );
          return {
            ...p,
            partName: found?.namePart || found?.partName || p.partNumber,
          };
        });

        setRepairParts(merged);
      } catch (err) {
        console.error("[RepairForm] Fetch repair parts failed:", err);
      }
    };

    fetchRepairParts();
  }, [job]);

  const handleSerialChange = (partNumber, index, value) => {
    setSerialInputs((prev) => ({
      ...prev,
      [partNumber]: {
        ...(prev[partNumber] || {}),
        [index]: value,
      },
    }));
  };

  const handleCompleteRepair = async () => {
    if (!job?.claimId) return;

    try {
      setLoading(true);
      const claimId = job.claimId;
      const technicianId =
        job?.rawClaim?.serviceCenterTechnicianId ||
        job?.serviceCenterTechnicianId ||
        job?.technicianId;

      if (!technicianId) {
        alert("❌ Không tìm thấy technicianId hợp lệ để cập nhật workflow!");
        setLoading(false);
        return;
      }

      // kiểm tra đủ serial
      for (const part of repairParts) {
        const serials = Object.values(serialInputs[part.partNumber] || {}).filter(
          (s) => s && s.trim() !== ""
        );
        if (serials.length < part.quantity) {
          alert(
            `❌ Part "${part.partName}" cần nhập đủ ${part.quantity} serial number.`
          );
          setLoading(false);
          return;
        }
      }

      // gửi serials cho từng part
      for (const part of repairParts) {
        const serialArray = Object.values(serialInputs[part.partNumber] || {});
        await axiosPrivate.post(
          `${API_ENDPOINTS.ADD_SERIALS}/${claimId}/${part.partNumber}`,
          serialArray
        );
      }

      const url = `${API_ENDPOINTS.CLAIM_WORKFLOW}/${claimId}/technician/done?technicianId=${encodeURIComponent(
        technicianId
      )}&done=true`;

      console.log("[RepairForm] Workflow URL:", url);
      await axiosPrivate.post(url);

      onComplete?.();
      window.location.reload();

    } catch (e) {
      console.error("[RepairForm] Complete Repair failed:", e);
      alert(
        `❌ Lỗi khi hoàn tất Repair.\n${
          e.response?.status ? `Mã lỗi: ${e.response.status}` : ""
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Repair Form — Claim #{job?.claimId}
          </h2>
          <Button variant="destructive" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {repairParts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Không có bộ phận nào cần repair trong claim này.
            </p>
          ) : (
            repairParts.map((part) => (
              <div
                key={part.partNumber}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base">{part.partName}</h4>
                  <span className="text-sm text-muted-foreground">
                    Quantity: {part.quantity}
                  </span>
                </div>

                {/* Input serial theo quantity */}
                <div className="space-y-2 mt-2">
                  {Array.from({ length: part.quantity }).map((_, idx) => (
                    <div key={idx}>
                      <Label className="text-xs text-muted-foreground">
                        Serial #{idx + 1}
                      </Label>
                      <Input
                        value={serialInputs[part.partNumber]?.[idx] || ""}
                        onChange={(e) =>
                          handleSerialChange(
                            part.partNumber,
                            idx,
                            e.target.value
                          )
                        }
                        placeholder={`Nhập serial ${idx + 1}`}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Actions */}
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
}

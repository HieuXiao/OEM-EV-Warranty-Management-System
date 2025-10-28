import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosPrivate from "@/api/axios";
import { cn } from "@/lib/utils";
import useAuth from "@/hook/useAuth";

const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  PARTS: "/api/parts",
  FILE_UPLOAD: (claimId) =>
    `/api/warranty-files/combined/upload-create?fileId=${claimId}&claimId=${claimId}`,
  CLAIM_PART_CHECK_CREATE: "/api/claim-part-check/create",
  SKIP_REPAIR: (claimId, technicianId) =>
    `/api/warranty-claims/workflow/${claimId}/technician/skip-repair?technicianId=${technicianId}`,
};

export default function ScTechnicianCheckForm({ job, onClose, onComplete }) {
  const { auth } = useAuth();
  const technicianId = auth?.accountId || auth?.id || "";

  const [checkStarted, setCheckStarted] = useState(false);
  const [claimInfo, setClaimInfo] = useState(null);
  const [partsList, setPartsList] = useState([]);
  const [partSelections, setPartSelections] = useState({});
  const [partQuantities, setPartQuantities] = useState({});
  const [partImages, setPartImages] = useState({});
  const [uploading, setUploading] = useState(false);

  const claimId = job?.claimId || job?.id;

  // 🔹 Fetch claim info
  useEffect(() => {
    const fetchClaimInfo = async () => {
      if (!claimId) return;
      try {
        const res = await axiosPrivate.get(`${API_ENDPOINTS.CLAIMS}/${claimId}`);
        setClaimInfo(res.data);
      } catch (err) {
        console.error("[CheckForm] fetchClaimInfo failed:", err);
      }
    };
    fetchClaimInfo();
  }, [claimId]);

  // 🔹 Fetch parts
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const resParts = await axiosPrivate.get(API_ENDPOINTS.PARTS);
        const filteredParts = Array.isArray(resParts.data)
          ? resParts.data.filter((p) => p?.warehouse?.whId === 1)
          : [];

        if (claimInfo?.warrantyClaimParts?.length > 0) {
          setPartsList(claimInfo.warrantyClaimParts);
        } else {
          setPartsList(filteredParts);
        }
      } catch (e) {
        console.error("[CheckForm] fetchParts failed:", e);
      }
    };
    fetchParts();
  }, [claimInfo]);

  // -------------------- HANDLERS ---------------------
  const handleStartCheck = () => setCheckStarted(true);

  const handleSelectionChange = (key, val) =>
    setPartSelections((p) => ({ ...p, [key]: val }));

  const handleQuantityChange = (key, val) =>
    setPartQuantities((p) => ({ ...p, [key]: Number(val) || 0 }));

  const handleImageUpload = (key, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const current = partImages[key] || [];
    if (current.length + files.length > 3) {
      alert("Mỗi bộ phận chỉ được upload tối đa 3 ảnh.");
      return;
    }
    const newFiles = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPartImages((prev) => ({
      ...prev,
      [key]: [...current, ...newFiles].slice(0, 3),
    }));
  };

  const handleDeleteImage = (key, idx) => {
    setPartImages((prev) => {
      const updated = [...(prev[key] || [])];
      updated.splice(idx, 1);
      const copy = { ...prev, [key]: updated };
      if (!updated.length) delete copy[key];
      return copy;
    });
  };

  const allPartsSelected =
    partsList.length > 0 && partsList.every((p) => !!partSelections[p.namePart]);

  // -------------------- COMPLETE CHECK ---------------------
  const handleCompleteCheck = async () => {
    if (!claimId) return;
    setUploading(true);

    try {
      console.log("[CheckForm] Auth info:", auth);

      // ✅ Chuẩn bị payload claim-part-check
      const payloads = partsList
        .filter((p) => partSelections[p.namePart])
        .map((p) => ({
          partNumber: p.partNumber,
          warrantyId: claimId,
          vin: claimInfo?.vin || "UNKNOWN",
          quantity: partQuantities[p.namePart] || 1,
          isRepair: partSelections[p.namePart] === "REPAIR",
        }));

      const hasRepair = payloads.some((p) => p.isRepair);

      // 🔹 1. Gửi danh sách part check
      for (const payload of payloads) {
        console.log("%c[Claim-Part-Check] Payload:", "color: cyan;", payload);
        await axiosPrivate.post(API_ENDPOINTS.CLAIM_PART_CHECK_CREATE, payload);
      }

      // 🔹 2. Nếu có part cần sửa (REPAIR) → upload ảnh theo claimId
      if (hasRepair) {
        for (const key in partImages) {
          const imgs = partImages[key];
          if (!imgs.length) continue;

          const formData = new FormData();
          imgs.forEach((img) => img.file && formData.append("files", img.file));

          const uploadUrl = API_ENDPOINTS.FILE_UPLOAD(claimId);
          console.log("[CheckForm] Uploading images for:", key, "→", uploadUrl);

          await axiosPrivate.post(uploadUrl, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        // 🔹 3. Nếu KHÔNG có part cần sửa, gọi skip-repair
        const skipURL = API_ENDPOINTS.SKIP_REPAIR(claimId, technicianId);
        console.log("[CheckForm] Skip-Repair URL:", skipURL);
        await axiosPrivate.post(skipURL);
      }

      try {
        await axiosPrivate.post("/api/warranty-claims/assign-evm/auto");
        console.log("[CheckForm] Auto-assign EVM success");
      } catch (autoErr) {
        console.warn("[CheckForm] Auto-assign EVM failed:", autoErr);
      }

      console.log("[CheckForm] Complete success for claim:", claimId);
      onComplete?.(claimId);
      onClose?.();
    } catch (err) {
      console.error("[CheckForm] Complete failed:", err.response || err);
      alert("Hoàn tất kiểm tra thất bại! Kiểm tra console để xem chi tiết.");
    } finally {
      setUploading(false);
    }
  };

  // -------------------- UI ---------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-cyan-600">
            REPORT CHECK — Claim #{claimInfo?.claimId || claimId}
          </h2>
          <Button variant="destructive" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Claim Info */}
        <div className="px-6 pt-6">
          {claimInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
              <div>
                <Label>VIN</Label>
                <p>{claimInfo.vin}</p>
              </div>
              <div>
                <Label>Claim Date</Label>
                <p>{claimInfo.claimDate}</p>
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <div className="p-3 bg-gray-50 border rounded-md text-sm">
                  {claimInfo.description || "No description"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Loading claim info...</p>
          )}
        </div>

        {/* Check Form */}
        <div className="p-6 space-y-6">
          {!checkStarted ? (
            <div className="flex justify-center py-8">
              <Button
                size="lg"
                onClick={handleStartCheck}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
              >
                Start Check
              </Button>
            </div>
          ) : (
            <>
              {/* Parts List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partsList.map((part) => {
                  const key = part.namePart;
                  const selection = partSelections[key];
                  const isRepair = selection === "REPAIR";
                  const imgs = partImages[key] || [];
                  return (
                    <div
                      key={key}
                      className={cn(
                        "rounded-lg border p-5 transition-all shadow-sm",
                        isRepair
                          ? "border-amber-400 bg-amber-50"
                          : selection === "CHECKED"
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-cyan-300"
                      )}
                    >
                      <div className="flex justify-between mb-3">
                        <span className="font-semibold text-sm">{part.namePart}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="text-xs"
                          onChange={(e) => handleImageUpload(key, e)}
                          disabled={imgs.length >= 3}
                        />
                      </div>

                      <div className="flex gap-3 mb-2 items-center">
                        <Label>Status</Label>
                        <select
                          value={selection || ""}
                          onChange={(e) => handleSelectionChange(key, e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-32"
                        >
                          <option value="">Select...</option>
                          <option value="CHECKED">CHECKED</option>
                          <option value="REPAIR">REPAIR</option>
                        </select>
                      </div>

                      {isRepair && (
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={partQuantities[key] || ""}
                            onChange={(e) => handleQuantityChange(key, e.target.value)}
                            className="h-8 w-20 text-sm"
                          />
                        </div>
                      )}

                      {imgs.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            {imgs.length}/3 image(s)
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {imgs.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img
                                  src={img.url}
                                  alt={`img-${idx}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <button
                                  onClick={() => handleDeleteImage(key, idx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-[5px]"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-6 gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={handleCompleteCheck}
                  disabled={!allPartsSelected || uploading}
                >
                  {uploading ? "Saving..." : "Complete Check"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosPrivate from "@/api/axios";
import { cn } from "@/lib/utils";

const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  PARTS: "/api/parts",
  FILE_UPLOAD: "/api/warranty-files/combined/upload-create",
  CLAIM_PART_CHECK_CREATE: "/api/claim-part-check/create",
};

export default function ScTechnicianCheckForm({ job, onClose, onComplete }) {
  const [checkStarted, setCheckStarted] = useState(false);
  const [claimInfo, setClaimInfo] = useState(null);
  const [partsList, setPartsList] = useState([]);
  const [partSelections, setPartSelections] = useState({});
  const [partQuantities, setPartQuantities] = useState({});
  const [partImages, setPartImages] = useState({});
  const [uploading, setUploading] = useState(false);

  const claimId = job?.claimId || job?.id;

  // Lấy thông tin claim
  useEffect(() => {
    const fetchClaimInfo = async () => {
      try {
        const res = await axiosPrivate.get(API_ENDPOINTS.CLAIMS);
        const all = Array.isArray(res.data) ? res.data : [];
        const found = all.find((c) => c.claimId === claimId || c.id === claimId);
        setClaimInfo(found || null);
      } catch (err) {
        console.error("[CheckForm] fetchClaimInfo failed:", err);
      }
    };
    if (claimId) fetchClaimInfo();
  }, [claimId]);

  // Lấy danh sách part (lọc theo whId = 1)
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await axiosPrivate.get(API_ENDPOINTS.PARTS);
        const filtered =
          Array.isArray(res?.data) && res.data.length > 0
            ? res.data.filter((p) => p?.warehouse?.whId === 1)
            : [];
        setPartsList(filtered);
      } catch (e) {
        console.error("[CheckForm] fetchParts failed:", e);
      }
    };
    fetchParts();
  }, []);

  const handleStartCheck = () => setCheckStarted(true);

  // Upload ảnh tạm
  const handleImageUpload = (partKey, event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const current = partImages[partKey] || [];
    if (current.length + files.length > 3) {
      alert("Mỗi bộ phận chỉ được upload tối đa 3 ảnh.");
      return;
    }
    const newFiles = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setPartImages((prev) => ({
      ...prev,
      [partKey]: [...current, ...newFiles].slice(0, 3),
    }));
  };

  const handleDeleteImage = (partKey, idx) => {
    setPartImages((prev) => {
      const updated = [...(prev[partKey] || [])];
      updated.splice(idx, 1);
      const copy = { ...prev, [partKey]: updated };
      if (updated.length === 0) delete copy[partKey];
      return copy;
    });
  };

  const handleSelectionChange = (partKey, value) => {
    setPartSelections((prev) => ({ ...prev, [partKey]: value }));
    if (value === "CHECKED") {
      setPartQuantities((prev) => ({ ...prev, [partKey]: 0 }));
    }
  };

  const handleQuantityChange = (partKey, value) => {
    const num = Number.parseInt(value) || 0;
    if (num >= 0) setPartQuantities((prev) => ({ ...prev, [partKey]: num }));
  };

  const allPartsSelected =
    partsList.length > 0 && partsList.every((p) => !!partSelections[p.namePart]);

  // Hoàn tất kiểm tra (Tạo claim-part-check + upload ảnh)
  const handleCompleteCheck = async () => {
    if (!claimId) return;

    setUploading(true);

    console.log("=== DEBUG COMPLETE CHECK ===");
    console.log("claimId:", claimId);
    console.log("claimInfo:", claimInfo);
    console.log("partsList:", partsList);
    console.log("partSelections:", partSelections);
    console.log("partQuantities:", partQuantities);
    console.log("partImages:", partImages);
    console.log("=============================");

    try {
      // 1. Upload ảnh cho từng part (nếu có)
      for (const partKey in partImages) {
        if (partImages[partKey].length > 0) {
          const formData = new FormData();
          formData.append("fileId", claimId);
          formData.append("claimId", claimId);

          // Append files (sử dụng file object thay vì URL)
          partImages[partKey].forEach((img) => {
            if (img.file) {
              formData.append("files", img.file);
            }
          });

          // Nếu không có file mới, bỏ qua
          if (formData.getAll("files").length === 0) continue;

          try {
            await axiosPrivate.post(API_ENDPOINTS.FILE_UPLOAD, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(`✅ Upload ảnh cho ${partKey} thành công.`);
          } catch (err) {
            console.error("❌ Upload ảnh lỗi:", err.response || err);
            alert(`Upload ảnh cho ${partKey} thất bại. Vui lòng thử lại.`);
            // Không throw, cho phép tiếp tục với các part khác
          }
        }
      }

      // 2. Gửi Part Check cho mỗi part được chọn
      for (const [index, part] of partsList.entries()) {
        const partKey = `${part.partNumber}_${part.vin}_${part.quantity}`;
        const selection = partSelections[partKey] || partSelections[part.namePart] || "";
        const isRepair = selection === "REPAIR" || selection === "repair" || selection === "Repair";

        if (!selection) continue; // Bỏ qua phần chưa chọn

        // Nếu backend yêu cầu trường partSerial, bạn có thể lấy từ UI — hiện đặt rỗng
        const partSerialValue = "";

        const payload = {
          partNumber: part.partNumber || part.namePart || `PART-${index + 1}`,
          claimId, // dùng đúng field mà backend cần
          vin: claimInfo?.vehicle?.vin || "UNKNOWN",
          quantity: partQuantities[partKey] || 1,
          partSerial: "Null",
          repair: isRepair,
        };

        console.log(
          "%c📦 Payload gửi lên /api/claim-part-check/create:",
          "color: cyan; font-weight: bold;"
        );
        console.log(JSON.stringify(payload, null, 2));

        try {
          await axiosPrivate.post(API_ENDPOINTS.CLAIM_PART_CHECK_CREATE, payload);
          console.log(`✅ Tạo part-check cho ${part.namePart} thành công.`);
        } catch (err) {
          console.error("❌ Error at part", part.namePart, err.response || err);
          alert(
            `Lỗi khi tạo part-check cho ${part.namePart}: ${
              err.response?.data?.message || err.message
            }\nMã lỗi HTTP: ${err.response?.status || "Unknown"}`
          );
          throw err; // Dừng toàn bộ nếu tạo part-check lỗi
        }
      }

      // 3. (Tùy) cập nhật trạng thái claim — bạn có thể gọi API nếu cần
      // await axiosPrivate.put(`${API_ENDPOINTS.CLAIMS}/${claimId}/complete-check`);

      alert("Hoàn tất kiểm tra thành công!");
      onComplete(claimId);
      onClose();
    } catch (err) {
      console.error("[CheckForm] Complete failed:", err.response || err);
      const status = err.response?.status;
      const data = err.response?.data;

      let message = "Lỗi khi hoàn tất kiểm tra.";
      if (status) message += `\nMã lỗi: HTTP ${status}`;
      if (data && typeof data === "object") {
        message += `\nChi tiết: ${JSON.stringify(data, null, 2)}`;
      } else if (data) {
        message += `\nChi tiết: ${data}`;
      }
      alert(message);
    } finally {
      setUploading(false);
    }
  };

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
                <Label className="text-gray-500 text-sm">VIN</Label>
                <p className="text-base font-semibold">{claimInfo.vehicle?.vin}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Model</Label>
                <p className="text-base font-semibold">{claimInfo.vehicle?.model}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Claim Date</Label>
                <p className="text-base font-semibold">{claimInfo.claimDate}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">SC Staff</Label>
                <p className="text-base font-semibold">
                  {claimInfo.serviceCenterStaff?.fullName}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-500 text-sm">Description</Label>
                <div className="p-3 bg-gray-50 border rounded-md text-sm">
                  {claimInfo.description || "No description"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Loading claim information...</p>
          )}
        </div>

        {/* Body */}
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
              {/* Danh sách parts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partsList.map((part) => {
                  const partKey = part.namePart;
                  const selection = partSelections[partKey];
                  const isRepair = selection === "REPAIR";
                  const images = partImages[partKey] || [];

                  return (
                    <div
                      key={partKey}
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
                          onChange={(e) => handleImageUpload(partKey, e)}
                          disabled={images.length >= 3}
                        />
                      </div>

                      <div className="flex gap-3 mb-2 items-center">
                        <Label>Status</Label>
                        <select
                          value={selection || ""}
                          onChange={(e) => handleSelectionChange(partKey, e.target.value)}
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
                            value={partQuantities[partKey] || ""}
                            onChange={(e) =>
                              handleQuantityChange(partKey, e.target.value)
                            }
                            className="h-8 w-20 text-sm"
                          />
                        </div>
                      )}

                      {/* Preview ảnh */}
                      {images.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            {images.length}/3 image(s)
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {images.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img
                                  src={img.url}
                                  alt={`img-${idx}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <button
                                  onClick={() => handleDeleteImage(partKey, idx)}
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

import { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Wrench, ImagePlus, Trash2 } from "lucide-react";
import axiosPrivate from "@/api/axios";

const API = {
  CLAIM_PART_CHECK: "/api/claim-part-check/search/warranty",
  ADD_SERIALS: "/api/claim-part-check/add-serials",
  CLAIM_WORKFLOW: "/api/warranty-claims/workflow",
  PARTS_UNDER_WARRANTY: "/api/part-under-warranty-controller",
  CLAIMS: "/api/warranty-claims",
  FILE_UPLOAD: "/api/warranty-files/combined/upload-create",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_PARTS":
      return action.parts.map((p) => ({
        ...p,
        serials: Array.from({ length: p.quantity }).map(() => ""),
        images: Array.from({ length: p.quantity }).map(() => null),
        error: "",
      }));

    case "UPDATE_SERIAL":
      return state.map((part) =>
        part.partNumber === action.partNumber
          ? {
              ...part,
              serials: part.serials.map((s, i) =>
                i === action.index ? action.value : s
              ),
            }
          : part
      );

    case "ADD_IMAGE":
      return state.map((part) =>
        part.partNumber === action.partNumber
          ? {
              ...part,
              images: part.images.map((img, i) =>
                i === action.index ? action.file : img
              ),
            }
          : part
      );

    case "REMOVE_IMAGE":
      return state.map((part) =>
        part.partNumber === action.partNumber
          ? {
              ...part,
              images: part.images.map((img, i) =>
                i === action.index ? null : img
              ),
            }
          : part
      );

    case "SET_ERROR":
      return state.map((part) =>
        part.partNumber === action.partNumber
          ? { ...part, error: action.error }
          : part
      );

    default:
      return state;
  }
}

export default function ScTechnicianRepairForm({ job, onClose, onComplete }) {
  const [state, dispatch] = useReducer(reducer, []);
  const [claimInfo, setClaimInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!job?.claimId) return;
    const fetchData = async () => {
      try {
        const [claimRes, checkRes, warrantyRes] = await Promise.all([
          axiosPrivate.get(`${API.CLAIMS}/${job.claimId}`),
          axiosPrivate.get(`${API.CLAIM_PART_CHECK}/${job.claimId}`),
          axiosPrivate.get(API.PARTS_UNDER_WARRANTY),
        ]);

        setClaimInfo(claimRes.data);
        const claimParts = Array.isArray(checkRes.data)
          ? checkRes.data.filter((p) => p.isRepair === true)
          : [];

        const underWarranty = Array.isArray(warrantyRes.data)
          ? warrantyRes.data
          : [];

        const merged = claimParts.map((p) => {
          const found = underWarranty.find(
            (u) => u.partId?.toUpperCase() === p.partNumber?.toUpperCase()
          );
          return {
            ...p,
            partName: found?.partName || p.partNumber,
            partId: found?.partId || p.partNumber,
            description: found?.description || "",
            quantity: p.quantity || 1,
          };
        });

        dispatch({ type: "SET_PARTS", parts: merged });
      } catch (err) {
        console.error("[RepairForm] Fetch data failed:", err);
      }
    };
    fetchData();
  }, [job]);

  const handleSerialChange = (partNumber, index, value) => {
    dispatch({ type: "UPDATE_SERIAL", partNumber, index, value });
  };

  const handleImageUpload = async (part, index, file) => {
    if (!file || !job?.claimId) return;
    const serialSuffix = part.serials[index]?.trim();
    if (!serialSuffix) {
      dispatch({
        type: "SET_ERROR",
        partNumber: part.partNumber,
        error: `Serial #${index + 1} chưa nhập!`,
      });
      return;
    }

    try {
      const fullSerial = `${part.partId}-${serialSuffix}`;
      const fileId = `${job.claimId}-${fullSerial}`;

      const formData = new FormData();
      formData.append("files", file);
      formData.append("fileId", fileId);
      formData.append("claimId", job.claimId);

      await axiosPrivate.post(API.FILE_UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch({ type: "ADD_IMAGE", partNumber: part.partNumber, index, file });
    } catch (err) {
      console.error("Upload image failed:", err);
      alert("Lỗi upload ảnh! Vui lòng thử lại hoặc kiểm tra server log.");
    }
  };

  const handleDeleteImage = (part, index) => {
    dispatch({ type: "REMOVE_IMAGE", partNumber: part.partNumber, index });
  };

  const validateBeforeSubmit = () => {
    for (const part of state) {
      for (let i = 0; i < part.quantity; i++) {
        if (!part.serials[i]?.trim()) {
          dispatch({
            type: "SET_ERROR",
            partNumber: part.partNumber,
            error: `Part "${part.partName}" thiếu serial #${i + 1}`,
          });
          return false;
        }
        if (!part.images[i]) {
          dispatch({
            type: "SET_ERROR",
            partNumber: part.partNumber,
            error: `Serial #${i + 1} của "${part.partName}" chưa có ảnh!`,
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleCompleteRepair = async () => {
    if (!job?.claimId || loading) return;
    if (!validateBeforeSubmit()) return;

    setLoading(true);
    try {
      const claimId = job.claimId;
      const technicianId =
        job?.rawClaim?.serviceCenterTechnicianId ||
        job?.serviceCenterTechnicianId ||
        job?.technicianId;

      for (const part of state) {
        const serialArray = part.serials.map(
          (s) => `${part.partId}-${s.trim()}`
        );
        await axiosPrivate.post(
          `${API.ADD_SERIALS}/${claimId}/${part.partNumber}`,
          serialArray
        );
      }

      const url = `${API.CLAIM_WORKFLOW}/${claimId}/technician/done?technicianId=${encodeURIComponent(
        technicianId
      )}&done=true`;
      await axiosPrivate.post(url);

      onComplete?.();
      onClose?.();
    } catch (err) {
      console.error("[RepairForm] Complete Repair failed:", err);
      alert("Hoàn tất Repair thất bại. Kiểm tra console để biết chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Repair Form — Claim #{job?.claimId}
          </h2>
          <Button variant="destructive" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Close
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

        {/* Parts Section */}
        <div className="p-6 space-y-6">
          {state.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Không có bộ phận nào cần repair trong claim này.
            </p>
          ) : (
            state.map((part) => (
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

                {/* Input Serial & Image */}
                <div className="space-y-2 mt-2">
                  {Array.from({ length: part.quantity }).map((_, idx) => {
                    const serial = part.serials[idx];
                    const hasImage = !!part.images[idx];
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Serial #{idx + 1}
                            </Label>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400 select-none">
                                {part.partId}-
                              </span>
                              <Input
                                value={serial}
                                onChange={(e) =>
                                  handleSerialChange(
                                    part.partNumber,
                                    idx,
                                    e.target.value
                                  )
                                }
                                placeholder={`000${idx + 1}`}
                                className="text-sm flex-1"
                              />
                            </div>
                          </div>

                          {/* Upload image */}
                          <div className="flex flex-col items-center">
                            <label className="cursor-pointer flex flex-col items-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(
                                    part,
                                    idx,
                                    e.target.files?.[0]
                                  )
                                }
                              />
                              <span
                                className={`p-2 rounded-md border ${
                                  hasImage
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-300"
                                }`}
                              >
                                <ImagePlus className="w-4 h-4 text-gray-700" />
                              </span>
                            </label>
                            {hasImage && (
                              <span className="text-[10px] text-green-600 mt-1">
                                Added
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hiển thị ảnh preview */}
                        {hasImage && (
                          <div className="relative mt-2 w-28 h-28 border rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(part.images[idx])}
                              alt={`Serial ${idx + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(part, idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              title="Xóa ảnh"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {part.error && (
                  <p className="text-xs text-red-500 mt-1">{part.error}</p>
                )}
              </div>
            ))
          )}

          {/* Actions */}
          {state.length > 0 && (
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

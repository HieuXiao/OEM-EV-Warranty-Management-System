import { useReducer, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosPrivate from "@/api/axios";
import { cn } from "@/lib/utils";
import useAuth from "@/hook/useAuth";
import { ImagePlus } from "lucide-react";

const API = {
  CLAIMS: "/api/warranty-claims",
  VEHICLE: (vin) => `/api/vehicles/${vin}`,
  PARTS: "/api/part-under-warranty-controller",
  CREATE_CHECK: "/api/claim-part-check/create",
  UPLOAD_FILES: (claimId, fileId) =>
    `/api/warranty-files/combined/upload-create?fileId=${fileId}&claimId=${claimId}`,
  SKIP_REPAIR: (claimId, techId) =>
    `/api/warranty-claims/workflow/${claimId}/technician/skip-repair?technicianId=${techId}`,
  ASSIGN_EVM: "/api/warranty-claims/assign-evm/auto",
};

function partsReducer(state, action) {
  switch (action.type) {
    case "SET_PARTS":
      return action.parts.map((p) => ({
        key: p.namePart,
        partNumber: p.partNumber,
        selection: "",
        quantity: 1,
        images: [],
        error: "",
      }));
    case "SET_SELECTION":
      return state.map((p) =>
        p.key === action.key ? { ...p, selection: action.value, error: "" } : p
      );
    case "SET_QUANTITY":
      return state.map((p) =>
        p.key === action.key ? { ...p, quantity: Number(action.value) || 1 } : p
      );
    case "ADD_IMAGES":
      return state.map((p) =>
        p.key === action.key
          ? { ...p, images: [...p.images, ...action.newImages].slice(0, 3), error: "" }
          : p
      );
    case "DELETE_IMAGE":
      return state.map((p) =>
        p.key === action.key
          ? { ...p, images: p.images.filter((_, i) => i !== action.index) }
          : p
      );
    case "SET_ERROR":
      return state.map((p) =>
        p.key === action.key ? { ...p, error: action.error } : p
      );
    default:
      return state;
  }
}

/* --------------------------- 🔹 Main Component --------------------------- */
export default function ScTechnicianCheckForm({ job, onClose, onComplete }) {
  const { auth } = useAuth();
  const technicianId = auth?.accountId || auth?.id || "";
  const claimId = job?.claimId || job?.id;

  const [claimInfo, setClaimInfo] = useState(null);
  const [vehiclePlate, setVehiclePlate] = useState("UNKNOWN");
  const [checkStarted, setCheckStarted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parts, dispatch] = useReducer(partsReducer, []);
  const [formError, setFormError] = useState("");

  // Fetch claim info
  useEffect(() => {
    if (!claimId) return;
    const fetchClaimInfo = async () => {
      try {
        const res = await axiosPrivate.get(`${API.CLAIMS}/${claimId}`);
        setClaimInfo(res.data);

        // Fetch vehicle plate
        if (res.data.vin) {
          try {
            const vehicleRes = await axiosPrivate.get(API.VEHICLE(res.data.vin));
            setVehiclePlate(vehicleRes.data.plate || "UNKNOWN");
          } catch (err) {
            console.error("Fetch vehicle plate failed:", err);
            setVehiclePlate("UNKNOWN");
          }
        }
      } catch (err) {
        console.error("fetchClaimInfo failed:", err);
      }
    };
    fetchClaimInfo();
  }, [claimId]);

  // Fetch parts
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await axiosPrivate.get(API.PARTS);
        const formatted = (Array.isArray(res.data) ? res.data : []).map((p) => ({
          namePart: p.partName || p.partId,
          partNumber: p.partId,
        }));
        const list = claimInfo?.warrantyClaimParts?.length
          ? claimInfo.warrantyClaimParts
          : formatted;
        dispatch({ type: "SET_PARTS", parts: list });
      } catch (e) {
        console.error("fetchParts failed:", e);
      }
    };
    fetchParts();
  }, [claimInfo]);

  const handleImageUpload = (key, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const invalid = files.filter((f) => !f.type.startsWith("image/"));
    if (invalid.length > 0) {
      dispatch({
        type: "SET_ERROR",
        key,
        error: "Only image files are allowed",
      });
      return;
    }

    const valid = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    dispatch({ type: "ADD_IMAGES", key, newImages: valid });
    e.target.value = "";
  };

  const validateAllParts = () => {
    let valid = true;
    parts.forEach((p) => {
      if (!p.selection) {
        dispatch({
          type: "SET_ERROR",
          key: p.key,
          error: "Please select a status.",
        });
        valid = false;
      } else if (p.selection === "REPAIR") {
        if (p.images.length === 0) {
          dispatch({
            type: "SET_ERROR",
            key: p.key,
            error: "Please add at least one image.",
          });
          valid = false;
        }
        if (!p.quantity || p.quantity < 1) {
          dispatch({
            type: "SET_ERROR",
            key: p.key,
            error: "Quantity must be at least 1.",
          });
          valid = false;
        }
      }
    });
    return valid;
  };

  const handleUploadAllParts = async () => {
    for (const p of parts) {
      if (p.selection !== "REPAIR" || p.images.length === 0) continue;
      const formData = new FormData();
      p.images.forEach((img) => img.file && formData.append("files", img.file));
      const fileId = `${claimId}-${p.key}`;
      await axiosPrivate.post(API.UPLOAD_FILES(claimId, fileId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  };

  const handleCompleteCheck = async () => {
    if (!claimId || uploading) return;
    if (!validateAllParts()) {
      setFormError("Please complete all required fields before submitting.");
      return;
    }

    setUploading(true);
    setFormError("");
    try {
      const payloads = parts
        .filter((p) => p.selection)
        .map((p) => ({
          partNumber: p.partNumber,
          partId: p.partNumber,
          warrantyId: claimInfo?.claimId || claimId,
          vin: vehiclePlate, // dùng vehicle plate
          quantity: p.quantity,
          isRepair: p.selection === "REPAIR",
        }));

      const hasRepair = payloads.some((p) => p.isRepair);

      for (const data of payloads)
        await axiosPrivate.post(API.CREATE_CHECK, data);

      if (hasRepair) await handleUploadAllParts();
      else await axiosPrivate.post(API.SKIP_REPAIR(claimId, technicianId));

      await axiosPrivate.post(API.ASSIGN_EVM);

      onComplete?.(claimId);
      onClose?.();
    } catch (err) {
      console.error("[CheckForm] Complete failed:", err);
      setFormError("Failed to complete check. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-cyan-600">
            REPORT CHECK — Claim #{claimInfo?.claimId || claimId}
          </h2>
          <Button variant="destructive" onClick={onClose}>
            Close
          </Button>
        </div>

        {claimInfo ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border-b">
            <div><Label>Vehicle Plate</Label><p>{vehiclePlate}</p></div>
            <div><Label>Claim Date</Label><p>{claimInfo.claimDate}</p></div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <div className="p-3 bg-gray-50 border rounded-md text-sm">
                {claimInfo.description || "No description"}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 p-6">Loading claim info...</p>
        )}

        <div className="p-6 space-y-6">
          {!checkStarted ? (
            <div className="flex justify-center py-8">
              <Button size="lg" onClick={() => setCheckStarted(true)} className="bg-cyan-600 text-white">
                Start Check
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parts.map((part) => (
                  <div
                    key={part.key}
                    className={cn(
                      "rounded-lg border p-5 shadow-sm transition-all",
                      part.selection === "REPAIR"
                        ? "border-amber-400 bg-amber-50"
                        : part.selection === "CHECKED"
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:border-cyan-300"
                    )}
                  >
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-sm">{part.key}</span>
                      {part.selection === "REPAIR" && (
                        <label className="cursor-pointer text-cyan-600 flex items-center gap-1">
                          <ImagePlus className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(part.key, e)}
                            disabled={part.images.length >= 3}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex gap-3 mb-2 items-center">
                      <Label>Status</Label>
                      <select
                        value={part.selection}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_SELECTION",
                            key: part.key,
                            value: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 text-sm w-32"
                      >
                        <option value="">Select...</option>
                        <option value="CHECKED">CHECKED</option>
                        <option value="REPAIR">REPAIR</option>
                      </select>
                    </div>

                    {part.selection === "REPAIR" && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={part.quantity}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_QUANTITY",
                                key: part.key,
                                value: e.target.value,
                              })
                            }
                            className="h-8 w-20 text-sm"
                          />
                        </div>

                        {part.images.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {part.images.length}/3 image(s)
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {part.images.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={img.url}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() =>
                                      dispatch({
                                        type: "DELETE_IMAGE",
                                        key: part.key,
                                        index: idx,
                                      })
                                    }
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-[5px]"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {part.error && (
                      <p className="text-xs text-red-500 mt-1">{part.error}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-end mt-6 gap-2">
                {formError && (
                  <p className="text-red-500 text-sm font-medium">{formError}</p>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-cyan-600 text-white"
                    onClick={handleCompleteCheck}
                    disabled={uploading}
                  >
                    {uploading ? "Saving..." : "Complete Check"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

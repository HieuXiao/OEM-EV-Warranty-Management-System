import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosPrivate from "@/api/axios";
import axios from "axios";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/drkr6zecu/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "Part_Requirment";

// Chuẩn hóa text để so sánh
const simplify = (text = "") =>
  text
    .replace(/\d+/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Map tên parts sang tiếng Việt
const PART_NAME_MAP = {
  volang: "Vô Lăng",
  taylai: "Tay Lái",
  dongco: "Động Cơ",
  acquy: "Ắc Quy",
  pin: "Pin",
};

const normalizePartName = (raw = "") => {
  const simplified = simplify(raw);
  return PART_NAME_MAP[simplified] || raw;
};

const ReportCheck = ({ job, onClose, onComplete }) => {
  const [checkStarted, setCheckStarted] = useState(false);
  const [checkedParts, setCheckedParts] = useState({});
  const [partImages, setPartImages] = useState({});
  const [partQuantities, setPartQuantities] = useState({});
  const [repairParts, setRepairParts] = useState({});
  const [partsList, setPartsList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔹 Lấy danh sách parts và lọc trùng
  const fetchParts = async () => {
    try {
      const res = await axiosPrivate.get("/api/parts/");
      const data = Array.isArray(res?.data) ? res.data : [];

      const seen = new Set();
      const unique = [];

      for (const p of data) {
        const simplified = simplify(p.name);
        if (!simplified) continue;
        if (!seen.has(simplified)) {
          seen.add(simplified);
          unique.push({
            ...p,
            name: normalizePartName(p.name),
            _key: simplified,
          });
        }
      }

      setPartsList(unique);
    } catch (e) {
      console.error("[ReportCheck] fetchParts failed:", e);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleStartCheck = () => setCheckStarted(true);

  const handleTogglePartCheck = (partName) => {
    setCheckedParts((prev) => ({ ...prev, [partName]: !prev[partName] }));
  };

  // Upload ảnh lên Cloudinary
  const handleImageUpload = async (partName, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        form.append("format", "png"); // ép sang PNG

        const cloudRes = await axios.post(CLOUDINARY_UPLOAD_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const secureUrl = cloudRes?.data?.secure_url;
        if (secureUrl) {
          setPartImages((prev) => ({
            ...prev,
            [partName]: [...(prev[partName] || []), secureUrl],
          }));
          setCheckedParts((prev) => ({ ...prev, [partName]: true }));
        }
      }
    } catch (e) {
      console.error("[ReportCheck] upload error:", e);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (partName, index) => {
    setPartImages((prev) => {
      const updated = [...(prev[partName] || [])];
      updated.splice(index, 1);
      const copy = { ...prev, [partName]: updated };
      if (updated.length === 0) delete copy[partName];
      return copy;
    });
  };

  const handleQuantityChange = (partName, value) => {
    const num = Number.parseInt(value) || 0;
    if (num >= 0) setPartQuantities((prev) => ({ ...prev, [partName]: num }));
  };

  const hasImages = (partName) =>
    !!(partImages[partName] && partImages[partName].length > 0);

  const allPartsChecked =
    partsList.length > 0 && partsList.every((p) => checkedParts[p.name]);

  // 🔹 Complete Check -> gửi parts cần repair
  const handleCompleteCheck = async () => {
    try {
      const claimId = job.claimId || job.id;

      // 1️⃣ Lấy danh sách attachment hiện có
      const existRes = await axiosPrivate.get("/api/claimAttachment");
      const existing = Array.isArray(existRes?.data) ? existRes.data : [];
      const usedIds = new Set(
        existing.filter((a) => a.claimId === claimId).map((a) => a.attachmentId)
      );

      // 2️⃣ Gom các part có check "Do you want repair?"
      const attachments = [];
      for (const [partName, needRepair] of Object.entries(repairParts)) {
        if (!needRepair) continue;

        // tạo ID mới không trùng
        let newId = Math.floor(Math.random() * 100000);
        while (usedIds.has(newId)) {
          newId = Math.floor(Math.random() * 100000);
        }
        usedIds.add(newId);

        attachments.push({
          attachmentId: newId,
          fileType: normalizePartName(partName),
          filePath: "manual", // hoặc "abc" nếu bạn muốn
          claimId,
        });
      }

      // 3️⃣ Gửi qua API
      if (attachments.length > 0) {
        await Promise.all(
          attachments.map((a) =>
            axiosPrivate.post("/api/claimAttachment/create", a)
          )
        );
      }

      console.log("[ReportCheck] Repair attachments created:", attachments);
      onComplete?.();
    } catch (e) {
      console.error("[ReportCheck] Failed to create repair attachments:", e);
    }
  };

  const canClose = !checkStarted || allPartsChecked;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-cyan-500">
            REPORT CHECK - Claim #{job?.claimId || job?.id}
          </h2>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClose}
            disabled={!canClose}
            title={!canClose ? "Complete all checks before closing" : ""}
          >
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Vehicle Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">VIN:</Label>
                <Input
                  value={job?.vin || ""}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Model vehicle:
                </Label>
                <Input
                  value={job?.vehicleModel || ""}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Note:</Label>
              <Input
                value={job?.description || ""}
                disabled
                className="mt-1 bg-muted"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-sm text-muted-foreground">Date:</Label>
                <Input
                  value={job?.claimDate || ""}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">SC Staff:</Label>
                <Input
                  value={job?.scStaff?.fullName || job?.scStaffId || ""}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Start Button */}
          {!checkStarted && (
            <div className="flex justify-center py-4">
              <Button
                onClick={handleStartCheck}
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
              >
                Start Check
              </Button>
            </div>
          )}

          {/* Parts Checklist */}
          {checkStarted && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Parts Checklist
                </h3>
                <span className="text-sm text-muted-foreground">
                  {Object.values(checkedParts).filter(Boolean).length} /{" "}
                  {partsList.length} checked
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {partsList.map((part) => (
                  <div
                    key={part._key}
                    className={cn(
                      "border rounded-lg p-5 transition-all hover:shadow-md",
                      checkedParts[part.name] && !hasImages(part.name)
                        ? "border-green-500 bg-green-500/5 shadow-sm"
                        : hasImages(part.name)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePartCheck(part.name)}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            checkedParts[part.name]
                              ? "bg-green-500 border-green-500"
                              : "border-muted-foreground hover:border-green-500"
                          )}
                        >
                          {checkedParts[part.name] && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                        </button>
                        <div>
                          <span className="text-sm font-semibold">
                            {part.name}
                          </span>
                        </div>
                      </div>

                      <label className="cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                        <Camera className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(part.name, e)}
                          disabled={uploading}
                        />
                      </label>
                    </div>

                    {/* Do you want repair? */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={repairParts[part.name] || false}
                        onChange={(e) =>
                          setRepairParts((prev) => ({
                            ...prev,
                            [part.name]: e.target.checked,
                          }))
                        }
                      />
                      <label className="text-sm text-muted-foreground">
                        Do you want repair?
                      </label>
                    </div>

                    {/* Images */}
                    {hasImages(part.name) && (
                      <div className="space-y-3 mt-3">
                        <div className="flex flex-wrap gap-2">
                          {partImages[part.name].map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`${part.name}-${idx}`}
                                className="w-16 h-16 object-cover rounded border border-border"
                              />
                              <button
                                onClick={() =>
                                  handleDeleteImage(part.name, idx)
                                }
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Label className="text-xs font-medium">Quantity:</Label>
                          <Input
                            type="number"
                            min="0"
                            value={partQuantities[part.name] || 0}
                            onChange={(e) =>
                              handleQuantityChange(part.name, e.target.value)
                            }
                            className="h-8 w-20 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Button */}
          {checkStarted && (
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={!canClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCompleteCheck}
                disabled={!allPartsChecked}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Complete Check
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCheck;

// <<< BEGIN EVMStaffDetailWarranty.jsx (UPDATED - IMAGE OUTSIDE FORM) >>>
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";
import { Folder, X } from "lucide-react";

// 🔹 API CONFIG
const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  PARTS: "/api/parts",
  VEHICLES: "/api/vehicles",
  CLAIM_PART_CHECK_SEARCH: (claimId) => `/api/claim-part-check/search/warranty/${claimId}`,
  CLAIM_PART_CHECK_UPDATE: (claimId, partNumber) =>
    `/api/claim-part-check/update/${claimId}/${partNumber}`,
  EVMDESCRIPTION: (claimId) => `/api/warranty-claims/workflow/${claimId}/evm/description`,
  DECISION_HANDOVER: (claimId) => `/api/warranty-claims/workflow/${claimId}/evm/decision-handover`,
  WARRANTY_FILES: (claimId) => `/api/warranty-files/search/claim?value=${claimId}`,
};

export default function EVMStaffDetailWarranty({ open, onOpenChange, warranty }) {
  const { auth } = useAuth();
  const evmId = auth?.accountId || auth?.id || "";
  const [comment, setComment] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [partApprovals, setPartApprovals] = useState({});
  const [approveAllActive, setApproveAllActive] = useState(false);
  const [rejectAllActive, setRejectAllActive] = useState(false);
  const [claimDetails, setClaimDetails] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [mergedParts, setMergedParts] = useState([]);
  const [warrantyFiles, setWarrantyFiles] = useState([]);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const claimId = warranty?.claimId;

  // 🔸 Load data
  useEffect(() => {
    if (open) {
      setComment("");
      setPartApprovals({});
      setApproveAllActive(false);
      setRejectAllActive(false);
      setImagesModalOpen(false);
      setFullscreenImage(null);
    }
    
    const loadAll = async () => {
      if (!claimId) return;
      try {
        const [claimRes, checkRes, partsRes, vehiclesRes, filesRes] = await Promise.all([
          axiosPrivate.get(`${API_ENDPOINTS.CLAIMS}/${encodeURIComponent(claimId)}`),
          axiosPrivate.get(API_ENDPOINTS.CLAIM_PART_CHECK_SEARCH(claimId)),
          axiosPrivate.get(API_ENDPOINTS.PARTS),
          axiosPrivate.get(API_ENDPOINTS.VEHICLES),
          axiosPrivate.get(API_ENDPOINTS.WARRANTY_FILES(claimId)),
        ]);

        const claimData = claimRes?.data ?? null;
        setClaimDetails(claimData);
        if (claimData?.evmDescription) setComment(claimData.evmDescription);

        const checks = Array.isArray(checkRes?.data) ? checkRes.data : [];
        const partsList = Array.isArray(partsRes?.data)
          ? partsRes.data.filter((p) => p?.warehouse?.whId === 1)
          : [];

        const repairChecks = checks.filter((c) => c.isRepair === true);
        const merged = repairChecks.map((c) => {
          const found = partsList.find((p) => p.partNumber === c.partNumber);
          return {
            ...c,
            namePart: found?.namePart || c.partNumber,
            price: found?.price ?? 0,
          };
        });
        setMergedParts(merged);

        const vehicles = Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
        const matchedVehicle = vehicles.find((v) => v.vin === (claimData?.vin || warranty?.vin));
        setVehicle(matchedVehicle || null);

        const files = Array.isArray(filesRes?.data) ? filesRes.data : [];
        setWarrantyFiles(files);

        const initialApprovals = {};
        merged.forEach((_, idx) => {
          initialApprovals[idx] = { approved: false, rejected: false };
        });
        setPartApprovals(initialApprovals);
      } catch (err) {
        console.error("[EVMDetail] Fetch error:", err?.response || err);
      }
    };
    if (open) loadAll();
  }, [claimId, open, warranty]);

  useEffect(() => {
    setIsFormValid(Boolean(claimDetails && comment && comment.trim().length > 0));
  }, [comment, claimDetails]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount ?? 0);

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    const map = {
      CHECK: "text-blue-700 border-blue-400",
      REPAIR: "text-amber-700 border-amber-400",
      DECIDE: "text-indigo-700 border-indigo-400",
      HANDOVER: "text-cyan-700 border-cyan-400",
      DONE: "text-green-700 border-green-400",
    };
    const cls = map[s] || "text-gray-700 border-gray-300";
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[110px] ${cls}`}
      >
        {status}
      </span>
    );
  };

  const handleApprovalChange = (index, type) => {
    setPartApprovals((prev) => ({
      ...prev,
      [index]: {
        approved: type === "approved" ? !prev[index]?.approved : false,
        rejected: type === "rejected" ? !prev[index]?.rejected : false,
      },
    }));
  };

  const handleApproveAll = () => {
    const newState = !approveAllActive;
    setApproveAllActive(newState);
    setRejectAllActive(false);
    const updated = {};
    mergedParts.forEach((_, i) => (updated[i] = { approved: newState, rejected: false }));
    setPartApprovals(updated);
  };

  const handleRejectAll = () => {
    const newState = !rejectAllActive;
    setRejectAllActive(newState);
    setApproveAllActive(false);
    const updated = {};
    mergedParts.forEach((_, i) => (updated[i] = { approved: false, rejected: newState }));
    setPartApprovals(updated);
  };

  const totalCost = mergedParts.reduce((sum, p, idx) => {
    if (partApprovals[idx]?.approved) return sum + (p.price ?? 0) * (p.quantity ?? 1);
    return sum;
  }, 0);

  const handleDone = async () => {
    if (!claimId || !evmId) return;
    try {
      const approvedIndexes = [];
      const rejectedIndexes = [];
      mergedParts.forEach((_, idx) => {
        if (partApprovals[idx]?.approved) approvedIndexes.push(idx);
        else if (partApprovals[idx]?.rejected) rejectedIndexes.push(idx);
      });

      for (const idx of rejectedIndexes) {
        const part = mergedParts[idx];
        const body = {
          partNumber: part.partNumber,
          warrantyId: claimId,
          vin: part.vehicle?.vin || claimDetails?.vin || warranty?.vin || "",
          quantity: part.quantity || 0,
          isRepair: false,
          partId: part.partId || "",
        };
        await axiosPrivate.put(
          API_ENDPOINTS.CLAIM_PART_CHECK_UPDATE(
            encodeURIComponent(claimId),
            encodeURIComponent(part.partNumber)
          ),
          body
        );
      }

      if (approvedIndexes.length > 0) {
        await axiosPrivate.post(
          `${API_ENDPOINTS.EVMDESCRIPTION(claimId)}?evmId=${encodeURIComponent(
            evmId
          )}&description=${encodeURIComponent(comment || "")}`
        );
      } else {
        await axiosPrivate.post(
          `${API_ENDPOINTS.DECISION_HANDOVER(claimId)}?evmId=${encodeURIComponent(
            evmId
          )}&description=${encodeURIComponent(comment || "")}`
        );
      }

      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("[EVMDetail] ❌ Done failed:", err?.response || err);
    }
  };

  return (
    <>
      <Dialog open={open} modal={false}>
        <DialogContent showCloseButton={false} className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Warranty Claim Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Claim ID</p>
                <p className="font-semibold">{claimDetails?.claimId || warranty?.claimId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(claimDetails?.status || warranty?.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle (VIN)</p>
                <p className="font-semibold">{claimDetails?.vin || vehicle?.vin || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-semibold">{vehicle?.model || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Plate</p>
                <p className="font-semibold">{vehicle?.plate || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold">{vehicle?.customer?.customerName || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-semibold">{claimDetails?.description || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted Date</p>
                <p className="font-semibold">{claimDetails?.claimDate || ""}</p>
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
              <div className="border rounded-md">
                <div className="grid grid-cols-3 font-semibold text-center border-b bg-muted py-2 px-4">
                  <div className="text-left">Part Information</div>
                  <div className="flex justify-center items-center">
                    <Button
                      variant={approveAllActive ? "default" : "outline"}
                      size="sm"
                      className={`transition-all ${
                        approveAllActive
                          ? "bg-green-600 text-white hover:bg-green-700 shadow-md scale-105"
                          : "text-green-700 border-green-600 hover:bg-green-100"
                      }`}
                      onClick={handleApproveAll}
                    >
                      Approve
                    </Button>
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      variant={rejectAllActive ? "default" : "outline"}
                      size="sm"
                      className={`transition-all ${
                        rejectAllActive
                          ? "bg-red-600 text-white hover:bg-red-700 shadow-md scale-105"
                          : "text-red-700 border-red-600 hover:bg-red-100"
                      }`}
                      onClick={handleRejectAll}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {mergedParts.map((part, index) => {
                  const approved = partApprovals[index]?.approved || false;
                  const rejected = partApprovals[index]?.rejected || false;
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-3 items-center border-b last:border-none py-3 px-4 transition-all ${
                        approved
                          ? "bg-green-50"
                          : rejected
                          ? "bg-red-50"
                          : "bg-transparent"
                      }`}
                    >
                      <div className="space-y-1 text-left">
                        <p className="font-semibold text-base">
                          {part.namePart || part.partNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">Qty: {part.quantity}</p>
                        <p className="text-base font-semibold text-primary">
                          {formatCurrency(part.price)}
                        </p>
                      </div>

                      <div className="flex justify-center items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-green-600 cursor-pointer mx-auto"
                          checked={approved}
                          onChange={() => handleApprovalChange(index, "approved")}
                        />
                      </div>

                      <div className="flex justify-center items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-red-600 cursor-pointer mx-auto"
                          checked={rejected}
                          onChange={() => handleApprovalChange(index, "rejected")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-lg pt-4">
                <p className="font-bold">Total Cost</p>
                <p className="font-bold text-primary text-xl">{formatCurrency(totalCost)}</p>
              </div>
            </div>

            {/* 🔹 Attached Images */}
            {warrantyFiles.length > 0 && (
              <div>
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold mb-3">Attached Images</h3>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setImagesModalOpen(true)}
                  onKeyDown={(e) =>
                    e.key === "Enter" || e.key === " " ? setImagesModalOpen(true) : null
                  }
                  className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted transition-all shadow-sm hover:shadow-md"
                >
                  <Folder className="w-8 h-8 text-amber-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{claimId || "Claim images"}</span>
                    <span className="text-sm text-muted-foreground">
                      {warrantyFiles.reduce(
                        (acc, f) => acc + (f.mediaUrls?.length || 0),
                        0
                      )}{" "}
                      image(s)
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Click to view images
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Enter your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="destructive" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleDone} disabled={!isFormValid}>
                Done
              </Button>
            </div>
          </div>

          {/* 🔹 Claim Images Viewer — tách khỏi form */}
          {imagesModalOpen && (
            <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-6 overflow-y-auto">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setImagesModalOpen(false)}
                className="absolute top-6 right-6 text-white z-50"
              >
                <X className="w-6 h-6" />
              </Button>

              <h2 className="text-white text-2xl font-bold mb-6">Claim Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
                {warrantyFiles
                  .flatMap((f) => f.mediaUrls || [])
                  .map((url, i) => (
                    <div
                      key={`claim-image-${i}`}
                      className="relative overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => setFullscreenImage(url)}
                    >
                      <img
                        src={url}
                        alt={`claim-image-${i}`}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {fullscreenImage &&
      createPortal(
          <div
              className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center"
              onClick={(e) => {
                  if (e.target === e.currentTarget) setFullscreenImage(null);
              }}
          >
              <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                      setFullscreenImage(null);
                  }}
                  className="absolute top-4 right-4 text-white z-[99999] p-2 w-10 h-10 hover:bg-white/20"
              >
                  <X className="w-6 h-6" />
              </Button>
              <img
                  src={fullscreenImage}
                  alt="fullscreen"
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg pointer-events-none" 
              />
          </div>,
          document.body
      )}
    </>
  );
}
// <<< END EVMStaffDetailWarranty.jsx >>>

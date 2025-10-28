// <<< BEGIN EVMStaffDetailWarranty.jsx (updated with full fields) >>>
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

// 🔹 API CONFIG
const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  PARTS: "/api/parts",
  VEHICLES: "/api/vehicles",
  CLAIM_PART_CHECK_SEARCH: (claimId) => `/api/claim-part-check/search/warranty/${claimId}`,
  CLAIM_PART_CHECK_GET: (claimId, partName) => `/api/claim-part-check/get/${claimId}/${partName}`,
  CLAIM_PART_CHECK_UPDATE: (claimId, partNumber) => `/api/claim-part-check/update/${claimId}/${partNumber}`,
  FILE_UPLOAD: "/api/warranty-files/combined/upload-create",
  EVMDESCRIPTION: (claimId) => `/api/warranty-claims/workflow/${claimId}/evm/description`,
  DECISION_HANDOVER: (claimId) => `/api/warranty-claims/workflow/${claimId}/evm/decision-handover`,
  SKIP_REPAIR: (claimId) => `/api/warranty-claims/workflow/${claimId}/technician/skip-repair`,
};

export default function EVMStaffDetailWarranty({ open, onOpenChange, warranty }) {
  const { auth } = useAuth();
  const evmId = auth?.accountId || auth?.id || "";

  // form / UI state
  const [comment, setComment] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [partApprovals, setPartApprovals] = useState({});
  const [approveAllActive, setApproveAllActive] = useState(false);
  const [rejectAllActive, setRejectAllActive] = useState(false);

  // fetched data
  const [claimDetails, setClaimDetails] = useState(null); // /api/warranty-claims/{claimId}
  const [vehicle, setVehicle] = useState(null); // enriched from /api/vehicles
  const [partChecks, setPartChecks] = useState([]); // from claim-part-check/search
  const [availableParts, setAvailableParts] = useState([]); // /api/parts filtered whId===1
  const [mergedParts, setMergedParts] = useState([]); // merged parts to show (only isRepair === true)
  const [loading, setLoading] = useState(false);

  const claimId = warranty?.claimId;

  // -------------------- FETCH DATA LOGIC --------------------
  useEffect(() => {
    const loadAll = async () => {
      if (!claimId) return;
      try {
        console.log("[EVMDetail] Loading data for claimId:", claimId);
        const [claimRes, checkRes, partsRes, vehiclesRes] = await Promise.all([
          axiosPrivate.get(`${API_ENDPOINTS.CLAIMS}/${encodeURIComponent(claimId)}`),
          axiosPrivate.get(API_ENDPOINTS.CLAIM_PART_CHECK_SEARCH(claimId)),
          axiosPrivate.get(API_ENDPOINTS.PARTS),
          axiosPrivate.get(API_ENDPOINTS.VEHICLES),
        ]);

        const claimData = claimRes?.data ?? null;
        setClaimDetails(claimData);
        // set default comment to evmDescription if exists (but UI shows description elsewhere)
        if (claimData?.evmDescription) setComment(claimData.evmDescription);

        const checks = Array.isArray(checkRes?.data) ? checkRes.data : [];
        setPartChecks(checks);

        const partsList = Array.isArray(partsRes?.data) ? partsRes.data.filter(p => p?.warehouse?.whId === 1) : [];
        setAvailableParts(partsList);

        const vehicles = Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
        const matchedVehicle = vehicles.find(v => v.vin === (claimData?.vin || warranty?.vin));
        setVehicle(matchedVehicle || null);

        // merge: only show parts where check.isRepair === true
        const repairChecks = checks.filter(c => c.isRepair === true);
        const merged = repairChecks.map((c) => {
          const found = partsList.find(p => p.partNumber === c.partNumber);
          return {
            ...c,
            namePart: found?.namePart || c.partNumber,
            price: found?.price ?? 0,
          };
        });

        setMergedParts(merged);

        // init approvals state based on merged parts
        const initialApprovals = {};
        merged.forEach((_, idx) => {
          initialApprovals[idx] = { approved: false, rejected: false };
        });
        setPartApprovals(initialApprovals);

        console.log("[EVMDetail] Fetched:", {
          claim: claimData?.claimId,
          mergedPartsCount: merged.length,
          vehicle: matchedVehicle?.vin,
        });
      } catch (err) {
        console.error("[EVMDetail] Error fetching data:", err?.response || err);
      }
    };

    if (open) loadAll();
    // re-run when claimId or open changes
  }, [claimId, open, warranty]);

  // form validity: require comment (per your earlier requirement)
  useEffect(() => {
    setIsFormValid(Boolean(claimDetails && comment && comment.trim().length > 0));
  }, [comment, claimDetails]);

  // reset when dialog closes
  useEffect(() => {
    if (!open) {
      setComment("");
      setPartApprovals({});
      setApproveAllActive(false);
      setRejectAllActive(false);
      setClaimDetails(null);
      setVehicle(null);
      setPartChecks([]);
      setAvailableParts([]);
      setMergedParts([]);
    }
  }, [open]);

  // -------------------- HELPERS / UI UTIL --------------------
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
      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[110px] ${cls}`}>
        {status}
      </span>
    );
  };

  const handleApprovalChange = (index, type) => {
    setPartApprovals(prev => ({
      ...prev,
      [index]: {
        approved: type === "approved" ? !prev[index]?.approved : false,
        rejected: type === "rejected" ? !prev[index]?.rejected : false,
      }
    }));
  };

  const handleApproveAll = () => {
    const newState = !approveAllActive;
    setApproveAllActive(newState);
    setRejectAllActive(false);
    const updated = {};
    mergedParts.forEach((_, i) => updated[i] = { approved: newState, rejected: false });
    setPartApprovals(updated);
  };

  const handleRejectAll = () => {
    const newState = !rejectAllActive;
    setRejectAllActive(newState);
    setApproveAllActive(false);
    const updated = {};
    mergedParts.forEach((_, i) => updated[i] = { approved: false, rejected: newState });
    setPartApprovals(updated);
  };

  const totalCost = mergedParts.reduce((sum, p, idx) => {
    if (partApprovals[idx]?.approved) return sum + ((p.price ?? 0) * (p.quantity ?? 1));
    return sum;
  }, 0);

  // -------------------- HANDLE DONE LOGIC --------------------
  /**
   * Sequence:
   * 1) Build approved/rejected lists from partApprovals
   * 2) For each rejected -> PUT /api/claim-part-check/update/{claimId}/{partNumber} with isRepair=false
   * 3) If >=1 approved -> POST evm/description
   * 4) If none approved -> POST evm/decision-handover
   * 5) All console.log / console.error only
   */
  const handleDone = async () => {
    if (!claimId || !evmId) {
      console.error("[EVMDetail] Missing claimId or evmId, abort.");
      return;
    }

    setLoading?.(true);
    setLoading?.(false); // ensure defined if needed

    try {
      console.log("[EVMDetail] Done pressed for claim:", claimId, "evmId:", evmId);

      const approvedIndexes = [];
      const rejectedIndexes = [];
      mergedParts.forEach((_, idx) => {
        if (partApprovals[idx]?.approved) approvedIndexes.push(idx);
        else if (partApprovals[idx]?.rejected) rejectedIndexes.push(idx);
      });

      // 2) Update rejected parts -> isRepair: false
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
        try {
          console.log("[EVMDetail] PUT claim-part-check update:", body);
          const res = await axiosPrivate.put(API_ENDPOINTS.CLAIM_PART_CHECK_UPDATE(encodeURIComponent(claimId), encodeURIComponent(part.partNumber)), body);
          console.log("[EVMDetail] PUT response:", res?.data ?? res);
        } catch (err) {
          console.error("[EVMDetail] PUT failed for part:", part.partNumber, err?.response || err);
        }
      }

      // 3) If has >=1 approved -> POST evm/description
      if (approvedIndexes.length > 0) {
        const payload = { claimId, evmId, description: comment || "" };
        try {
          console.log("[EVMDetail] POST evm/description payload:", payload);
          const res = await axiosPrivate.post(API_ENDPOINTS.EVMDESCRIPTION(encodeURIComponent(claimId)), payload);
          console.log("[EVMDetail] evm/description response:", res?.data ?? res);
        } catch (err) {
          console.error("[EVMDetail] POST evm/description failed:", err?.response || err);
        }
      } else {
        // 4) no approved -> POST decision-handover
        const payload = { claimId, evmId, description: comment || "" };
        try {
          console.log("[EVMDetail] POST decision-handover payload:", payload);
          const res = await axiosPrivate.post(API_ENDPOINTS.DECISION_HANDOVER(encodeURIComponent(claimId)), payload);
          console.log("[EVMDetail] decision-handover response:", res?.data ?? res);
        } catch (err) {
          console.error("[EVMDetail] POST decision-handover failed:", err?.response || err);
        }
      }

      console.log("[EVMDetail] Done flow finished for claim:", claimId);
      onOpenChange(false);
    } catch (err) {
      console.error("[EVMDetail] Workflow error:", err?.response || err);
    } finally {
      // no UI notifications per requirement
    }
  };

  const handleCancel = () => {
    console.log("[EVMDetail] Cancel pressed. Closing.");
    onOpenChange(false);
  };

  // -------------------- UI (KEPT ORIGINAL STRUCTURE) --------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <p className="font-semibold">{claimDetails?.vin || warranty?.vin || vehicle?.vin || ""}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-semibold">{vehicle?.model || warranty?.model || ""}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Vehicle Plate</p>
              <p className="font-semibold">{vehicle?.plate || claimDetails?.plate || ""}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">{vehicle?.customer?.customerName || claimDetails?.customerName || warranty?.customerName || ""}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-semibold">{claimDetails?.description || warranty?.description || ""}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Submitted Date</p>
              <p className="font-semibold">{claimDetails?.claimDate || warranty?.claimDate || ""}</p>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>

            <div className="border rounded-md">
              {/* Header */}
              <div className="grid grid-cols-3 font-semibold text-center border-b bg-muted py-2 px-4">
                <div className="text-left">Part Information</div>
                <div className="flex justify-center items-center">
                  <Button
                    variant={approveAllActive ? "default" : "outline"}
                    size="sm"
                    className={`transition-all ${approveAllActive ? "bg-green-600 text-white hover:bg-green-700 shadow-md scale-105" : "text-green-700 border-green-600 hover:bg-green-100"}`}
                    onClick={handleApproveAll}
                  >
                    Approve
                  </Button>
                </div>
                <div className="flex justify-center items-center">
                  <Button
                    variant={rejectAllActive ? "default" : "outline"}
                    size="sm"
                    className={`transition-all ${rejectAllActive ? "bg-red-600 text-white hover:bg-red-700 shadow-md scale-105" : "text-red-700 border-red-600 hover:bg-red-100"}`}
                    onClick={handleRejectAll}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Rows */}
              {mergedParts.map((part, index) => {
                const approved = partApprovals[index]?.approved || false;
                const rejected = partApprovals[index]?.rejected || false;
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-3 items-center border-b last:border-none py-3 px-4 transition-all ${approved ? "bg-green-50" : rejected ? "bg-red-50" : "bg-transparent"}`}
                  >
                    <div className="space-y-1 text-left">
                      <p className="font-semibold text-base">{part.namePart || part.partNumber}</p>
                      <p className="text-sm text-muted-foreground">Qty: {part.quantity}</p>
                      <p className="text-base font-semibold text-primary">{formatCurrency(part.price)}</p>
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

            {/* Total Cost */}
            <div className="flex justify-between items-center text-lg pt-4">
              <p className="font-bold">Total Cost</p>
              <p className="font-bold text-primary text-xl">{formatCurrency(totalCost)}</p>
            </div>
          </div>

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
            <Button variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleDone} disabled={!isFormValid}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// <<< END EVMStaffDetailWarranty.jsx (updated with full fields) >>>

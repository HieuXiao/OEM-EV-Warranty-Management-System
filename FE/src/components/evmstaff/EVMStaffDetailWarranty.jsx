import { useState, useEffect, useReducer } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";
import { Folder, X } from "lucide-react";

const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  PARTS: "/api/parts",
  PARTS_UNDER_WARRANTY: "/api/part-under-warranty-controller",
  VEHICLES: "/api/vehicles",
  CLAIM_PART_CHECK_SEARCH: (claimId) =>
    `/api/claim-part-check/search/warranty/${claimId}`,
  CLAIM_PART_CHECK_UPDATE: (claimId, partNumber) =>
    `/api/claim-part-check/update/${claimId}/${partNumber}`,
  EVMDESCRIPTION: (claimId) =>
    `/api/warranty-claims/workflow/${claimId}/evm/description`,
  DECISION_HANDOVER: (claimId) =>
    `/api/warranty-claims/workflow/${claimId}/evm/decision-handover`,
  WARRANTY_FILES: (claimId) =>
    `/api/warranty-files/search/claim?value=${claimId}`,
  REPAIR_PARTS_ADD_QUANTITY: "/api/repair-parts/add-quantity",
};

const initialState = {
  fullscreenImage: null,
  partApprovals: {},
  approveAllActive: false,
  rejectAllActive: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FULLSCREEN_IMAGE":
      return { ...state, fullscreenImage: action.payload };
    case "SET_PART_APPROVAL":
      return {
        ...state,
        partApprovals: { ...state.partApprovals, [action.index]: action.payload },
      };
    case "SET_APPROVE_ALL":
      return {
        ...state,
        approveAllActive: action.payload,
        rejectAllActive: false,
        partApprovals: Object.fromEntries(
          Object.keys(state.partApprovals).map((i) => [
            i,
            { approved: action.payload, rejected: false },
          ])
        ),
      };
    case "SET_REJECT_ALL":
      return {
        ...state,
        rejectAllActive: action.payload,
        approveAllActive: false,
        partApprovals: Object.fromEntries(
          Object.keys(state.partApprovals).map((i) => [
            i,
            { approved: false, rejected: action.payload },
          ])
        ),
      };
    case "SET_PARTS":
      const approvals = {};
      action.payload.forEach(
        (_, i) => (approvals[i] = { approved: false, rejected: false })
      );
      return { ...state, partApprovals: approvals };
    default:
      return state;
  }
}

export default function EVMStaffDetailWarranty({ open, onOpenChange, warranty }) {
  const { auth } = useAuth();
  const evmId = auth?.accountId || auth?.id || "";

  const [state, dispatch] = useReducer(reducer, initialState);
  const [claimDetails, setClaimDetails] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [mergedParts, setMergedParts] = useState([]);
  const [warrantyFiles, setWarrantyFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [openImagePart, setOpenImagePart] = useState(null);

  const claimId = warranty?.claimId;

  useEffect(() => {
    if (open) {
      setComment("");
      dispatch({ type: "SET_FULLSCREEN_IMAGE", payload: null });
      dispatch({ type: "SET_PARTS", payload: mergedParts });
    }

    const loadAll = async () => {
      if (!claimId) return;
      try {
        const [claimRes, checkRes, underPartRes, vehiclesRes, filesRes] =
          await Promise.all([
            axiosPrivate.get(`${API_ENDPOINTS.CLAIMS}/${encodeURIComponent(claimId)}`),
            axiosPrivate.get(API_ENDPOINTS.CLAIM_PART_CHECK_SEARCH(claimId)),
            axiosPrivate.get(API_ENDPOINTS.PARTS_UNDER_WARRANTY),
            axiosPrivate.get(API_ENDPOINTS.VEHICLES),
            axiosPrivate.get(API_ENDPOINTS.WARRANTY_FILES(claimId)),
          ]);

        const claimData = claimRes?.data ?? null;
        setClaimDetails(claimData);
        if (claimData?.evmDescription) setComment(claimData.evmDescription);

        const checks = Array.isArray(checkRes?.data) ? checkRes.data : [];
        const underParts = Array.isArray(underPartRes?.data) ? underPartRes.data : [];

        const repairChecks = checks.filter((c) => c.isRepair === true);

        const merged = repairChecks.map((c) => {
          const found = underParts.find((p) => p.partId === c.partNumber);
          return {
            ...c,
            namePart: found?.partName || c.partNumber,
            price: found?.price ?? 0,
            vehicleModel: found?.vehicleModel || "",
            description: found?.description || "",
            brand: found?.partBrand || "",
          };
        });
        setMergedParts(merged);
        dispatch({ type: "SET_PARTS", payload: merged });

        if (claimData?.vin || warranty?.vin) {
          const vehicleRes = await axiosPrivate.get(
            `${API_ENDPOINTS.VEHICLES}/${encodeURIComponent(
              claimData?.vin || warranty?.vin
            )}`
          );
          setVehicle(vehicleRes?.data || null);
        }

        const files = Array.isArray(filesRes?.data) ? filesRes.data : [];
        setWarrantyFiles(files);
      } catch (err) {
        console.error("[EVMDetail] Fetch error:", err?.response || err);
      }
    };

    if (open) loadAll();
  }, [claimId, open, warranty]);

  useEffect(() => {
    const isCommentValid = comment && comment.trim().length > 0;
    setIsFormValid(Boolean(claimDetails && isCommentValid));
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
      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[110px] ${cls}`}>
        {status}
      </span>
    );
  };

  const handleApprovalChange = (index, type) => {
    const prev = state.partApprovals[index] || { approved: false, rejected: false };
    if (type === "approved")
      dispatch({
        type: "SET_PART_APPROVAL",
        index,
        payload: { approved: !prev.approved, rejected: false },
      });
    else if (type === "rejected")
      dispatch({
        type: "SET_PART_APPROVAL",
        index,
        payload: { approved: false, rejected: !prev.rejected },
      });
  };

  const totalCost = mergedParts.reduce((sum, p, idx) => {
    if (state.partApprovals[idx]?.approved)
      return sum + (p.price ?? 0) * (p.quantity ?? 1);
    return sum;
  }, 0);

  const allPartsReviewed = mergedParts.every((_, idx) => {
    const ap = state.partApprovals[idx];
    return ap && (ap.approved || ap.rejected);
  });

  const handleDone = async () => {
    if (!claimId || !evmId) return;
    if (processing) return;
    setProcessing(true);
    try {
      const approvedIndexes = [];
      const rejectedIndexes = [];
      mergedParts.forEach((_, idx) => {
        if (state.partApprovals[idx]?.approved) approvedIndexes.push(idx);
        else if (state.partApprovals[idx]?.rejected) rejectedIndexes.push(idx);
      });

      // reject parts
      for (const idx of rejectedIndexes) {
        const part = mergedParts[idx];
        await axiosPrivate.put(
          API_ENDPOINTS.CLAIM_PART_CHECK_UPDATE(
            encodeURIComponent(claimId),
            encodeURIComponent(part.partNumber)
          ),
          {
            partNumber: part.partNumber,
            warrantyId: claimId,
            vin: part.vehicle?.vin || claimDetails?.vin || warranty?.vin || "",
            quantity: part.quantity || 0,
            isRepair: false,
            partId: part.partId || "",
          }
        );
      }

      if (approvedIndexes.length > 0) {
        const centerMatch = claimId.match(/WC-(\d+)-/);
        const centerId = centerMatch ? parseInt(centerMatch[1], 10) : null;
        const partsRes = await axiosPrivate.get(API_ENDPOINTS.PARTS);
        const allParts = Array.isArray(partsRes.data) ? partsRes.data : [];
        const groupedParts = {};
        for (const idx of approvedIndexes) {
          const part = mergedParts[idx];
          if (!groupedParts[part.partNumber])
            groupedParts[part.partNumber] = Number(part.quantity || 0);
        }

        for (const [partNumber, totalQty] of Object.entries(groupedParts)) {
          const foundPart = allParts.find((p) => p.partNumber === partNumber);
          const foundWarehouse = foundPart?.warehouse;
          if (foundPart && foundWarehouse && centerId === foundWarehouse.whId) {
            const patchUrl = `${API_ENDPOINTS.REPAIR_PARTS_ADD_QUANTITY}?partNumber=${encodeURIComponent(
              partNumber
            )}&quantity=-${totalQty}&warehouseId=${foundWarehouse.whId}`;
            await axiosPrivate.patch(patchUrl);
          }
        }

        await axiosPrivate.post(
          `${API_ENDPOINTS.EVMDESCRIPTION(claimId)}?evmId=${encodeURIComponent(
            evmId
          )}&description=${encodeURIComponent(comment || "")}`
        );
      } else {
        await axiosPrivate.post(
          `${API_ENDPOINTS.DECISION_HANDOVER(
            claimId
          )}?evmId=${encodeURIComponent(
            evmId
          )}&description=${encodeURIComponent(comment || "")}`
        );
      }

      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("[EVMDetail] Done failed:", err?.response || err);
      alert("Hoàn tất xử lý thất bại. Vui lòng kiểm tra console để xem chi tiết.");
    } finally {
      setProcessing(false);
    }
  };

  const getPartImages = (partName) => {
    if (!partName) return [];
    const lowerName = partName.toLowerCase();
    return warrantyFiles
      .filter((f) => f.fileId?.toLowerCase().includes(lowerName))
      .flatMap((f) => f.mediaUrls || []);
  };

  return (
    <>
      <Dialog open={open} modal={false}>
        <DialogContent showCloseButton={false} className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                <p className="text-sm text-muted-foreground">Vehicle Plate</p>
                <p className="font-semibold">{vehicle?.plate || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-semibold">{vehicle?.model || ""}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
              <div className="border rounded-md">
                <div className="grid grid-cols-4 font-semibold text-center border-b bg-muted py-2 px-4">
                  <div className="text-left">Part Information</div>
                  <div>Image</div>
                  <div>
                    <Button
                      variant={state.approveAllActive ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        dispatch({
                          type: "SET_APPROVE_ALL",
                          payload: !state.approveAllActive,
                        })
                      }
                      className={`transition-all ${
                        state.approveAllActive
                          ? "bg-green-600 text-white hover:bg-green-700 shadow-md scale-105"
                          : "text-green-700 border-green-600 hover:bg-green-100"
                      }`}
                    >
                      Approve
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant={state.rejectAllActive ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        dispatch({
                          type: "SET_REJECT_ALL",
                          payload: !state.rejectAllActive,
                        })
                      }
                      className={`transition-all ${
                        state.rejectAllActive
                          ? "bg-red-600 text-white hover:bg-red-700 shadow-md scale-105"
                          : "text-red-700 border-red-600 hover:bg-red-100"
                      }`}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {mergedParts.map((part, index) => {
                  const approved = state.partApprovals[index]?.approved || false;
                  const rejected = state.partApprovals[index]?.rejected || false;
                  const partImages = getPartImages(part.namePart || part.partNumber);

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-4 items-center border-b last:border-none py-3 px-4 transition-all ${
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
                        <p className="text-sm text-muted-foreground">
                          Qty: {part.quantity}
                        </p>
                        <p className="text-base font-semibold text-primary">
                          {formatCurrency(part.price)}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        {partImages.length > 0 ? (
                          <Folder
                            className="w-6 h-6 text-amber-600 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setOpenImagePart(index)}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No images
                          </span>
                        )}
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

                      {openImagePart === index && (
                        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-6 overflow-y-auto">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setOpenImagePart(null)}
                            className="absolute top-6 right-6 text-white z-50"
                          >
                            <X className="w-6 h-6" />
                          </Button>

                          <h2 className="text-white text-2xl font-bold mb-6">
                            {part.namePart || part.partNumber}
                          </h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
                            {partImages.map((url, i) => (
                              <div
                                key={`part-image-${i}`}
                                className="relative overflow-hidden rounded-lg"
                              >
                                <img
                                  src={url}
                                  alt={`part-image-${i}`}
                                  className="w-full h-64 object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => dispatch({ type: "SET_FULLSCREEN_IMAGE", payload: url })}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-lg pt-4">
                <p className="font-bold">Total Cost</p>
                <p className="font-bold text-primary text-xl">
                  {formatCurrency(totalCost)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />
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

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDone}
                disabled={!isFormValid || !allPartsReviewed || processing}
                className="bg-primary text-white px-6"
              >
                {processing ? "Processing..." : "Done"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {state.fullscreenImage &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => dispatch({ type: "SET_FULLSCREEN_IMAGE", payload: null })}
          >
            <img
              src={state.fullscreenImage}
              alt="fullscreen"
              className="max-w-full max-h-full object-contain"
            />
          </div>,
          document.body
        )}
    </>
  );
}

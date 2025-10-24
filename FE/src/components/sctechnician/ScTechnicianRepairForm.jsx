"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, CheckCircle } from "lucide-react";
import axiosPrivate from "@/api/axios";

/**
 * - Receives `job` shaped as in pages (job.claimId, job.vin, job.vehicleModel, job.claimDate, job.comment, job.scStaff)
 * - Keeps original logic: store serials in localStorage keyed by claimId/jobNumber, disallow editing after complete
 * - On Complete: POST /api/warranty_claims/manage/{claimId}/technician/done { done: true }
 */

const ReportRepair = ({ job, onClose, onComplete }) => {
  const repairParts = job?.rawClaim?.claimReplacementParts?.reduce((acc, r) => {
    // create a map partName -> quantity if part info present; fallback if not exist
    // backend structure used earlier had partId not names; we will use partId as key when necessary
    // but original UI expects keys as strings; keep as-is if rawClaim provides reason/description
    // For safety, try map claimReplacementParts to name-like keys if available:
    // Here we assume claimReplacementParts may include a 'partUserId' or 'partId' — we convert to 'Part-<id>'
    acc = acc || {};
    return acc;
  }, {});

  // Build a fallback repairParts map: if rawClaim.claimReplacementParts exists, map by partId -> quantity
  let computedRepairParts = {};
  if (job?.rawClaim?.claimReplacementParts && Array.isArray(job.rawClaim.claimReplacementParts)) {
    job.rawClaim.claimReplacementParts.forEach((p) => {
      const key = p.partId ? `Part-${p.partId}` : `PartUser-${p.partUserId || Math.random().toString(36).slice(2, 6)}`;
      computedRepairParts[key] = p.quantity || 1;
    });
  } else {
    // If backend didn't supply parts, show empty object (user can still proceed)
    computedRepairParts = {};
  }

  // State: attached serials per part-key
  const [attachedSerials, setAttachedSerials] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const key = `repair_claim_${job.claimId || job.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setAttachedSerials(JSON.parse(saved));
      setIsCompleted(true);
    } else {
      const empty = {};
      Object.entries(computedRepairParts).forEach(([part, qty]) => {
        empty[part] = Array.from({ length: qty }, () => "");
      });
      setAttachedSerials(empty);
      setIsCompleted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.claimId]);

  const ensureSerialArray = (part, qty) => {
    setAttachedSerials((prev) => {
      if (prev[part]?.length === qty) return prev;
      const existing = prev[part] || [];
      const updated = Array.from({ length: qty }, (_, i) => existing[i] || "");
      return { ...prev, [part]: updated };
    });
  };

  const handleSerialChange = (part, index, value) => {
    if (isCompleted) return;
    setAttachedSerials((prev) => {
      const arr = prev[part] ? [...prev[part]] : [];
      arr[index] = value;
      return { ...prev, [part]: arr };
    });
  };

  const handleComplete = async () => {
    const key = `repair_claim_${job.claimId || job.id}`;
    localStorage.setItem(key, JSON.stringify(attachedSerials));
    setIsCompleted(true);

    // prepare payload if needed by backend — here we only call technician/done
    try {
      await axiosPrivate.post(`/api/warranty_claims/manage/${encodeURIComponent(job.claimId || job.id)}/technician/done`, { done: true });
      console.log("[ReportRepair] technician done success for claim:", job.claimId || job.id);
      onComplete?.({ jobNumber: job.jobNumber, attachedParts: attachedSerials });
    } catch (e) {
      console.error("[ReportRepair] mark done failed:", e);
      // optionally show UI error / toast
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-500">REPORT REPAIR - Claim #{job?.claimId || job?.id}</h2>
          <Button variant="destructive" size="sm" onClick={onClose}><X className="h-4 w-4 mr-1" /> Close</Button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Vehicle Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">VIN:</Label>
                    <Input value={job?.vin || ""} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Model vehicle:</Label>
                    <Input value={job?.vehicleModel || ""} disabled className="mt-1 bg-muted" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Note:</Label>
                  <Input value={job?.comment || job?.rawClaim?.description || ""} disabled className="mt-1 bg-muted" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Date:</Label>
                    <Input value={job?.claimDate || job?.rawClaim?.claimDate || ""} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">SC Staff:</Label>
                    <Input value={job?.scStaff?.fullName || job?.scStaff?.username || ""} disabled className="mt-1 bg-muted" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Repair Parts Checklist</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(computedRepairParts).length === 0 ? (
                  <div className="col-span-2 text-sm text-muted-foreground">No replacement parts recorded for this claim.</div>
                ) : (
                  Object.entries(computedRepairParts).map(([part, qty]) => {
                    ensureSerialArray(part, qty);
                    return (
                      <div key={part} className="border border-border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{part}</span>
                          <span className="text-lg font-bold text-primary">{qty}</span>
                        </div>
                        <div>
                          {Array.from({ length: qty }).map((_, i) => (
                            <Input key={i} type="text" placeholder={`Serial #${i + 1}`} className={`mt-1 ${isCompleted ? "bg-muted cursor-not-allowed" : ""}`} value={attachedSerials[part]?.[i] || ""} disabled={isCompleted} onChange={(e) => handleSerialChange(part, i, e.target.value)} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {!isCompleted && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleComplete} className="bg-cyan-500 hover:bg-cyan-600">
                <CheckCircle className="h-4 w-4 mr-1" /> Complete Repair
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportRepair;

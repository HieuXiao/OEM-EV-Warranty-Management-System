import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosPrivate from "@/api/axios";
import ScsWarrPart from "@/components/scstaff/ScsWarrPart"; // ✅ Import phần mới

// 🔹 API endpoints
const API_CLAIMS = "/api/warranty-claims";
const API_VEHICLES = "/api/vehicles";
const API_ACCOUNTS = "/api/accounts/";
const API_APPOINTMENTS = "/api/service-appointments";

const getStatusColor = (status) => {
  const colors = {
    CHECK: "bg-blue-100 text-blue-800 border-blue-300",
    DECIDE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    REPAIR: "bg-orange-100 text-orange-700 border-orange-300",
    HANDOVER: "bg-purple-100 text-purple-800 border-purple-300",
    DONE: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
};

export default function ScsWarrDetail({ isOpen, onOpenChange, selectedClaim }) {
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (!selectedClaim?.claimId || !isOpen) return;
      try {
        setFetching(true);

        const [claimsRes, vehiclesRes, accountsRes] = await Promise.all([
          axiosPrivate.get(API_CLAIMS),
          axiosPrivate.get(API_VEHICLES),
          axiosPrivate.get(API_ACCOUNTS),
        ]);

        const foundClaim = claimsRes.data.find(
          (c) => c.claimId === selectedClaim.claimId
        );
        if (!foundClaim) return setClaim(null);

        setClaim(foundClaim);

        const foundVehicle = vehiclesRes.data.find(
          (v) => v.vin === foundClaim.vin
        );
        setVehicle(foundVehicle || null);

        setAccounts(accountsRes.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchAll();
  }, [selectedClaim, isOpen]);

  const handleMarkComplete = async () => {
    if (!claim || claim.status !== "HANDOVER") return;

    try {
      setLoading(true);
      const staffId = claim.serviceCenterStaffId;

      await axiosPrivate.post(
        `${API_CLAIMS}/workflow/${claim.claimId}/staff/done`,
        null,
        { params: { staffId, done: true } }
      );

      if (claim.campaignIds?.length > 0 && claim.vin) {
        try {
          const campaignId = claim.campaignIds[0];
          const appointmentsRes = await axiosPrivate.get(API_APPOINTMENTS);

          const matchedAppointment = appointmentsRes.data.find(
            (a) =>
              a?.vehicle?.vin === claim.vin &&
              a?.campaign?.campaignId === campaignId
          );

          if (matchedAppointment && matchedAppointment.status === "Scheduled") {
            await axiosPrivate.put(
              `${API_APPOINTMENTS}/${matchedAppointment.appointmentId}/status`,
              null,
              { params: { status: "Completed" } }
            );
          }
        } catch (err) {
          console.error("Error updating appointment status:", err);
        }
      }

      setClaim({ ...claim, status: "DONE", staffDone: true });
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error marking claim complete:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = (accountId) => {
    const acc = accounts.find((a) => a.accountId === accountId);
    return acc ? acc.fullName : "—";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">
              Claim #{claim?.claimId || selectedClaim?.claimId}
            </DialogTitle>
            {claim?.status && (
              <Badge variant="outline" className={getStatusColor(claim.status)}>
                {claim.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Warranty claim details and actions
          </p>
        </DialogHeader>

        {fetching ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Loading claim details...
          </p>
        ) : claim ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">VIN</h4>
                <p className="font-medium">{claim.vin}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Model</h4>
                <p className="font-medium">{vehicle?.model || "—"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                <p className="font-medium">{vehicle?.type || "—"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Claim Date</h4>
                <p className="font-medium">{claim.claimDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Technician</h4>
                <p className="font-medium">{getAccountName(claim.serviceCenterTechnicianId)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">SC Staff</h4>
                <p className="font-medium">{getAccountName(claim.serviceCenterStaffId)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">EVM Staff</h4>
                <p className="font-medium">{getAccountName(claim.evmId)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{claim.description || "—"}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">EVM Description</h4>
              <p className="text-sm">{claim.evmDescription || "—"}</p>
            </div>

            {claim.campaignIds?.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Campaign</h4>
                <p className="text-sm">Campaign ID: {claim.campaignIds[0]}</p>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No campaign associated.</p>
            )}

            {/* ✅ Gọi form ScsWarrPart */}
            <ScsWarrPart warrantyId={claim?.claimId} />

            <Button
              onClick={handleMarkComplete}
              disabled={claim.status !== "HANDOVER" || loading}
              className="w-full bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : claim.status === "HANDOVER"
                ? "Mark Complete"
                : "Can only mark complete when status is HANDOVER"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-10">
            No claim selected.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
import ScsWarrPart from "@/components/scstaff/ScsWarrPart";
import useAuth from "@/hook/useAuth";

const API = {
  CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
  APPOINTMENTS: "/api/service-appointments",
};

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
  const { auth } = useAuth();

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

        const [claimsRes, vehiclesRes, accountsRes, appointmentsRes] =
          await Promise.all([
            axiosPrivate.get(API.CLAIMS),
            axiosPrivate.get(API.VEHICLES),
            axiosPrivate.get(API.ACCOUNTS),
            axiosPrivate.get(API.APPOINTMENTS),
          ]);

        // Claim
        const foundClaim = claimsRes.data.find(
          (c) => c.claimId === selectedClaim.claimId
        );
        if (!foundClaim) return setClaim(null);
        setClaim(foundClaim);

        // Vehicle
        const foundVehicle = vehiclesRes.data.find(
          (v) => v.vin === foundClaim.vin
        );
        setVehicle(foundVehicle || null);

        // Accounts
        setAccounts(accountsRes.data);

        // Map campaignName từ appointment
        if (foundClaim.campaignIds?.length > 0 && foundClaim.vin) {
          const matchedApp = appointmentsRes.data.find(
            (a) =>
              a.vehicle?.vin === foundClaim.vin &&
              foundClaim.campaignIds.includes(a.campaign?.campaignId)
          );
          if (matchedApp) {
            foundClaim.campaignName = matchedApp.campaign?.campaignName || "—";
          }
        }
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
    if (
      claim.serviceCenterStaffId.toUpperCase() !==
      auth?.accountId?.toUpperCase()
    )
      return;

    try {
      setLoading(true);
      const staffId = claim.serviceCenterStaffId;

      await axiosPrivate.post(
        `${API.CLAIMS}/workflow/${claim.claimId}/staff/done`,
        null,
        { params: { staffId, done: true } }
      );

      // Update appointment status
      if (claim.campaignIds?.length > 0 && claim.vin) {
        try {
          const matchedAppointment = await axiosPrivate.get(API.APPOINTMENTS);
          const appointment = matchedAppointment.data.find(
            (a) =>
              a.vehicle?.vin === claim.vin &&
              claim.campaignIds.includes(a.campaign?.campaignId)
          );

          if (appointment && appointment.status === "Scheduled") {
            await axiosPrivate.put(
              `${API.APPOINTMENTS}/${appointment.appointmentId}/status`,
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
      {/* CHỈNH SỬA: w-[95vw] cho mobile, max-w-3xl cho desktop */}
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <DialogTitle className="text-xl">
              Claim #{claim?.claimId || selectedClaim?.claimId}
            </DialogTitle>
            {claim?.status && (
              <Badge
                variant="outline"
                className={`${getStatusColor(claim.status)} w-fit`}
              >
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
            {/* CHỈNH SỬA: Grid 1 cột mobile, 2 cột desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Vehicle Plate
                </h4>
                <p className="font-medium">{vehicle?.plate || "—"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Model
                </h4>
                <p className="font-medium">{vehicle?.model || "—"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Type
                </h4>
                <p className="font-medium">{vehicle?.type || "—"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Claim Date
                </h4>
                <p className="font-medium">{claim.claimDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Technician
                </h4>
                <p className="font-medium">
                  {getAccountName(claim.serviceCenterTechnicianId)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  SC Staff
                </h4>
                <p className="font-medium">
                  {getAccountName(claim.serviceCenterStaffId)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  EVM Staff
                </h4>
                <p className="font-medium">{getAccountName(claim.evmId)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h4>
              <p className="text-sm p-2 bg-muted/30 rounded">
                {claim.description || "—"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                EVM Description
              </h4>
              <p className="text-sm p-2 bg-muted/30 rounded">
                {claim.evmDescription || "—"}
              </p>
            </div>

            {claim.campaignIds?.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Campaign
                </h4>
                <p className="text-sm">{claim.campaignName || "—"}</p>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No campaign associated.
              </p>
            )}

            <ScsWarrPart warrantyId={claim?.claimId} autoLoad={true} />

            <Button
              onClick={handleMarkComplete}
              disabled={
                claim.status !== "HANDOVER" ||
                loading ||
                claim.serviceCenterStaffId.toUpperCase() !==
                  auth?.accountId?.toUpperCase()
              }
              className="w-full bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading
                ? "Processing..."
                : claim.status === "HANDOVER"
                ? "Mark Complete"
                : claim.status === "DONE"
                ? "Completed"
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

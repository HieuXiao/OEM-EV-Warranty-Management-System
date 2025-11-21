import { useEffect, useState } from "react";
import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import axiosPrivate from "@/api/axios";
import ScsDashTable from "@/components/scstaff/ScsDashTable";
import useAuth from "@/hook/useAuth";

const API = {
  CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
  CAMPAIGNS: "/api/campaigns/all",
  APPOINTMENTS: "/api/service-appointments"
};

export default function SCStaffDashboard() {
  const { auth } = useAuth();

  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [campaigns, setCampaigns] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    document.title = "SC Staff Dashboard";

    const fetchData = async () => {
      try {
        const [
          claimsRes,
          vehiclesRes,
          accountsRes,
          campaignsRes,
          appointmentsRes
        ] = await Promise.all([
          axiosPrivate.get(API.CLAIMS),
          axiosPrivate.get(API.VEHICLES),
          axiosPrivate.get(API.ACCOUNTS),
          axiosPrivate.get(API.CAMPAIGNS),
          axiosPrivate.get(API.APPOINTMENTS)
        ]);

        setClaims(claimsRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setAccounts(accountsRes.data || []);
        setCampaigns(campaignsRes.data || []);
        setAppointments(appointmentsRes.data || []);

      } catch (err) {
        console.error("[Dashboard] Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth]);

  const filteredClaims = claims
    .filter(
      (claim) =>
        claim.serviceCenterStaffId?.toUpperCase() ===
        auth?.accountId?.toUpperCase()
    )
    .sort((a, b) => {
      const dateA = new Date(a.claimDate);
      const dateB = new Date(b.claimDate);

      const serialA = parseInt(a.claimId?.split("-").pop()) || 0;
      const serialB = parseInt(b.claimId?.split("-").pop()) || 0;

      if (dateB - dateA !== 0) return dateB - dateA;
      return serialB - serialA;
    });

  const mergedData = filteredClaims.map((claim) => {
    const vehicle = vehicles.find((v) => v.vin === claim.vin);
    const staff = accounts.find(
      (a) => a.accountId === claim.serviceCenterStaffId
    );

    return {
      ...claim,
      vehicleModel: vehicle?.model || "",
      vehiclePlate: vehicle?.plate || "",
      issueDescription: claim.description,
      staffName: staff?.fullName || "",
    };
  });

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const completedThisMonth = mergedData.filter(c => {
    const isOwner =
      c.serviceCenterStaffId?.toUpperCase() === auth?.accountId?.toUpperCase();
    const isDone = c.status?.toUpperCase() === "DONE";

    if (!isOwner || !isDone) return false;

    const d = new Date(c.claimDate);

    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const activeCampaigns = campaigns.filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return today >= start && today <= end;
  }).length;

  const todayAppointments = appointments.filter((app) => {
    const appDate = new Date(app.date);
    const isToday =
      appDate.getFullYear() === today.getFullYear() &&
      appDate.getMonth() === today.getMonth() &&
      appDate.getDate() === today.getDate();

    const sameCenter =
      app.vehicle?.customer?.serviceCenter?.centerId ===
      auth?.centerId;

    return isToday && sameCenter;
  }).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSibebar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
      <div className="lg:pl-64">
        <Header onMenuClick={handleOpenMenu} />
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <Card className="p-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <ScsDashTable
                claims={mergedData}
                activeCampaigns={activeCampaigns}
                todayAppointments={todayAppointments}
                completedThisMonth={completedThisMonth}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

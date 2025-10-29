import { useEffect, useState } from "react";
import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import axiosPrivate from "@/api/axios";
import ScsDashTable from "@/components/scstaff/ScsDashTable";
import useAuth from "@/hook/useAuth";

const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
};

export default function SCStaffDashboard() {
  const { auth } = useAuth(); // ✅ lấy user hiện tại
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "SC Staff Dashboard";
    const fetchData = async () => {
      try {
        const [claimsRes, vehiclesRes, accountsRes] = await Promise.all([
          axiosPrivate.get(API_ENDPOINTS.CLAIMS),
          axiosPrivate.get(API_ENDPOINTS.VEHICLES),
          axiosPrivate.get(API_ENDPOINTS.ACCOUNTS),
        ]);
        setClaims(claimsRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setAccounts(accountsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClaims = claims.filter(
    (claim) => claim.serviceCenterStaffId === auth?.accountId
  );

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

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSibebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <Card className="p-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <ScsDashTable claims={mergedData} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

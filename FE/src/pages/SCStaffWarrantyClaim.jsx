import { useState, useEffect } from "react";
import { Search, Filter, Eye, Plus } from "lucide-react";
import SCStaffSidebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import ScsWarrCreate from "@/components/scstaff/ScsWarrCreate";
import ScsWarrDetail from "@/components/scstaff/ScsWarrDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/hook/useAuth";
import axiosPrivate from "@/api/axios";

const API = {
  CLAIMS: "/api/warranty-claims",
  ACCOUNTS: "/api/accounts/",
  VEHICLES: "/api/vehicles",
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

const getDefaultDateFrom = () => {
  const date = new Date();
  date.setDate(date.getDate() - 10);
  return date.toISOString().split("T")[0];
};

const getDefaultDateTo = () => {
  return new Date().toISOString().split("T")[0];
};

const WarrantyTimeline = ({ timeline = [], currentStatus }) => {
  const STATUS_ORDER = ["CHECK", "DECIDE", "REPAIR", "HANDOVER", "DONE"];
  const STATUS_COLORS = {
    CHECK: "bg-blue-500",
    DECIDE: "bg-yellow-500",
    REPAIR: "bg-orange-500",
    HANDOVER: "bg-purple-500",
    DONE: "bg-green-500",
  };

  const statusTimes = timeline.reduce((acc, item) => {
    const match = item.match(
      /^(CHECK|DECIDE|REPAIR|HANDOVER|DONE)\s*:\s*([\d\-T:\.]+)/
    );
    if (match) {
      const status = match[1];
      const timeStr = match[2];
      acc[status] = new Date(timeStr);
    }
    return acc;
  }, {});

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const formatTime = (date) => {
    if (!date) return null;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      day: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  return (
    <div className="flex items-center mt-4 gap-2">
      {STATUS_ORDER.map((status, index) => {
        const hasTime = !!statusTimes[status];

        let type = "future";
        if (hasTime) type = "reached";
        else if (index < currentIndex) type = "skipped";
        else type = "future";

        return (
          <div
            key={status}
            className="flex-1 flex flex-col items-center relative"
          >
            <div className="relative flex items-center justify-center w-full">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  type === "reached"
                    ? STATUS_COLORS[status]
                    : "border-gray-300 bg-gray-200 opacity-50"
                }`}
              />

              {type === "skipped" && (
                <div
                  aria-hidden
                  className="absolute"
                  style={{
                    width: 20,
                    height: 2,
                    backgroundColor: "#9CA3AF",
                    transform: "rotate(45deg)",
                  }}
                />
              )}
            </div>

            {index < STATUS_ORDER.length && (
              <div
                className={`h-1 w-full mt-1 ${
                  type === "reached"
                    ? STATUS_COLORS[status]
                    : "bg-gray-200 opacity-50"
                }`}
              />
            )}

            <div className="text-[10px] text-muted-foreground text-center">
              <div className="mt-1 text-xs text-center font-semibold">
                {status}
              </div>
              {hasTime ? (
                <>
                  <div>{formatTime(statusTimes[status]).day}</div>
                  <div>{formatTime(statusTimes[status]).time}</div>
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function SCStaffWarrantyClaim() {
  const { auth } = useAuth();
  const currentUser = {
    id: auth?.accountId,
    name: auth?.fullName,
    role: auth?.role,
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState(getDefaultDateTo());
  const [sortBy, setSortBy] = useState("date-desc");
  const [userCenterId, setUserCenterId] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const [claimsRes, vehiclesRes] = await Promise.all([
          axiosPrivate.get(API.CLAIMS, { params: { dateFrom, dateTo } }),
          axiosPrivate.get(API.VEHICLES),
        ]);
        const claimsData = Array.isArray(claimsRes.data) ? claimsRes.data : [];
        const vehiclesData = Array.isArray(vehiclesRes.data)
          ? vehiclesRes.data
          : [];

        const vehicleMap = Object.fromEntries(
          vehiclesData.map((v) => [v.vin, v.plate || "—"])
        );
        const merged = claimsData.map((c) => ({
          ...c,
          plate: vehicleMap[c.vin] || "—",
        }));

        setClaims(merged);
      } catch (error) {
        console.error("Failed to fetch claims:", error);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const fetchCenterId = async () => {
      try {
        const res = await axiosPrivate.get(API.ACCOUNTS);
        const account = Array.isArray(res.data)
          ? res.data.find(
              (a) =>
                a.accountId.toUpperCase() === auth?.accountId?.toUpperCase()
            )
          : null;
        if (account?.serviceCenter?.centerId) {
          setUserCenterId(account.serviceCenter.centerId);
          console.log(
            "[WarrantyClaim] Found centerId:",
            account.serviceCenter.centerId
          );
        } else {
          console.warn(
            "[WarrantyClaim] No centerId found for account:",
            auth?.accountId
          );
        }
      } catch (err) {
        console.error("Failed to fetch account info:", err);
      }
    };
    if (auth?.accountId) fetchCenterId();
  }, [auth?.accountId]);

  const filteredClaims = claims
    .filter((claim) => {
      if (userCenterId && claim.claimId?.includes("-")) {
        const parts = claim.claimId.split("-");
        const claimCenterId = parseInt(parts[1]) || 0;
        return claimCenterId === userCenterId;
      }
      return (
        claim.serviceCenterStaffId?.toUpperCase() ===
        auth?.accountId?.toUpperCase()
      );
    })
    .filter((claim) => {
      const matchesSearch =
        claim.claimId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.vin?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;
      const claimDate = new Date(claim.claimDate);
      const matchesDateFrom = !dateFrom || claimDate >= new Date(dateFrom);
      const matchesDateTo =
        !dateTo || claimDate <= new Date(dateTo + "T23:59:59");
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.claimDate);
      const dateB = new Date(b.claimDate);
      const serialA = parseInt(a.claimId?.split("-").pop()) || 0;
      const serialB = parseInt(b.claimId?.split("-").pop()) || 0;
      switch (sortBy) {
        case "date-desc":
          if (dateB.getTime() === dateA.getTime()) return serialB - serialA;
          return dateB - dateA;
        case "date-asc":
          if (dateA.getTime() === dateB.getTime()) return serialA - serialB;
          return dateA - dateB;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const userClaims = claims.filter((claim) => {
    if (userCenterId && claim.claimId?.includes("-")) {
      const parts = claim.claimId.split("-");
      const claimCenterId = parseInt(parts[1]) || 0;
      return claimCenterId === userCenterId;
    }
    return (
      claim.serviceCenterStaffId?.toUpperCase() ===
      auth?.accountId?.toUpperCase()
    );
  });

  const totalClaims = userClaims.length;
  const checkClaims = userClaims.filter((c) => c.status === "CHECK").length;
  const decideClaims = userClaims.filter((c) => c.status === "DECIDE").length;
  const repairClaims = userClaims.filter((c) => c.status === "REPAIR").length;
  const doneClaims = userClaims.filter((c) => c.status === "DONE").length;

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim);
    setIsDetailDialogOpen(true);
  };

  const handleClaimCreated = async () => {
    try {
      const response = await axiosPrivate.get(API.CLAIMS, {
        params: { dateFrom, dateTo },
      });
      setClaims(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to refresh claims:", error);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
      <div className="lg:pl-64">
        <Header onMenuClick={handleOpenMenu} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Total Claims", value: totalClaims },
                { label: "Check", value: checkClaims },
                { label: "Decide", value: decideClaims },
                { label: "Repair", value: repairClaims },
                { label: "Done", value: doneClaims },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-end gap-4 w-full">
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Date From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[160px]"
                  max={dateTo}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground mb-1">
                  Date To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[160px]"
                  min={dateFrom}
                />
              </div>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim number or VIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="w-[150px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="CHECK">Check</SelectItem>
                    <SelectItem value="DECIDE">Decide</SelectItem>
                    <SelectItem value="REPAIR">Repair</SelectItem>
                    <SelectItem value="HANDOVER">Handover</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground mt-6">
                Loading claims...
              </p>
            ) : filteredClaims.length === 0 ? (
              <p className="text-center text-muted-foreground mt-6">
                No claims found for your service center.
              </p>
            ) : (
              filteredClaims.map((claim) => (
                <Card
                  key={claim.claimId}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">
                            Claim #{claim.claimId}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(claim.status)}
                          >
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Vehicle Plate:{" "}
                            </span>
                            <span className="font-medium">{claim.plate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Date:{" "}
                            </span>
                            <span className="font-medium">
                              {claim.claimDate}
                            </span>
                          </div>
                        </div>
                        {claim.timeline && claim.timeline.length > 0 && (
                          <WarrantyTimeline
                            timeline={claim.timeline}
                            currentStatus={claim.status}
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClaim(claim)}
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <ScsWarrCreate
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        currentUser={currentUser}
        onClaimCreated={handleClaimCreated}
      />
      <ScsWarrDetail
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        selectedClaim={selectedClaim}
      />
    </div>
  );
}

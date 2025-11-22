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

// Màu sắc cho Badge trạng thái
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

// Component Timeline (Mô phỏng hình 3)
const WarrantyTimeline = ({ timeline = [], currentStatus }) => {
  const STATUS_ORDER = ["CHECK", "DECIDE", "REPAIR", "HANDOVER", "DONE"];
  // Màu sắc cho các chấm tròn timeline
  const STATUS_DOT_COLORS = {
    CHECK: "bg-blue-500 border-blue-500",
    DECIDE: "bg-yellow-500 border-yellow-500",
    REPAIR: "bg-orange-500 border-orange-500",
    HANDOVER: "bg-purple-500 border-purple-500",
    DONE: "bg-green-500 border-green-500",
  };

  // Parse timeline string từ backend (nếu có)
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
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  return (
    <div className="w-full overflow-x-auto pb-2 pt-2">
      <div className="flex items-start min-w-[300px] justify-between relative">
        {/* Line background connecting dots */}
        <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 -z-10" />

        {STATUS_ORDER.map((status, index) => {
          const hasTime = !!statusTimes[status];
          const isReached = index <= currentIndex; // Status đã qua hoặc đang ở đó

          const dateInfo = formatTime(statusTimes[status]);

          return (
            <div
              key={status}
              className="flex flex-col items-center gap-1 z-0 bg-transparent px-1"
            >
              {/* Dot */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isReached || hasTime
                    ? STATUS_DOT_COLORS[status] || "bg-gray-500 border-gray-500"
                    : "bg-white border-gray-300"
                }`}
              />

              {/* Label */}
              <span
                className={`text-[10px] font-bold uppercase ${
                  isReached ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {status}
              </span>

              {/* Date/Time (if available) */}
              {hasTime ? (
                <div className="text-[9px] text-muted-foreground text-center leading-tight">
                  <div>{dateInfo.date}</div>
                  <div>{dateInfo.time}</div>
                </div>
              ) : (
                <div className="h-[22px]"></div> // Spacer để giữ chiều cao
              )}
            </div>
          );
        })}
      </div>
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

  // Sidebar mobile state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  // Data state
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter state
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState(getDefaultDateTo());
  const [sortBy, setSortBy] = useState("date-desc");
  const [userCenterId, setUserCenterId] = useState(null);

  // Dialog state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const [claimsRes, vehiclesRes] = await Promise.all([
          axiosPrivate.get(API.CLAIMS, { params: { dateFrom, dateTo } }),
          axiosPrivate.get("/api/vehicles"),
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

  // Fetch user center
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
        }
      } catch (err) {
        console.error("Failed to fetch account info:", err);
      }
    };
    if (auth?.accountId) fetchCenterId();
  }, [auth?.accountId]);

  // Filter & Sort logic
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
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.claimDate);
      const dateB = new Date(b.claimDate);
      if (sortBy === "date-desc") return dateB - dateA;
      return 0;
    });

  // Stats calculation
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

  // Handlers
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
      <div className="lg:pl-64 transition-all duration-200">
        <Header onMenuClick={handleOpenMenu} />
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* 1. Thống kê Cards (Giống Hình 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Claims", value: totalClaims },
              { label: "Check", value: checkClaims },
              { label: "Decide", value: decideClaims },
              { label: "Repair", value: repairClaims },
              { label: "Done", value: doneClaims },
            ].map((item) => (
              <Card key={item.label} className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 2. Bộ lọc & Tìm kiếm (Hình 1 - Responsive) */}
          <div className="flex flex-col lg:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
            {/* Date Range */}
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                  max={dateTo}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                  min={dateFrom}
                />
              </div>
            </div>

            {/* Search & Filter & Button */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 items-end">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Claim ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
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
                className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {/* 3. Danh sách Claims (Kiểu Card như Hình 3) */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-10">
                Loading claims...
              </p>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No claims found.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
                {filteredClaims.map((claim) => (
                  <Card
                    key={claim.claimId}
                    className="hover:shadow-md transition-all border flex flex-col overflow-hidden"
                  >
                    <CardContent className="p-5 flex-1 flex flex-col gap-4">
                      {/* Header: ID & Status */}
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-foreground break-all">
                          Claim #{claim.claimId}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            claim.status
                          )} shrink-0 text-xs uppercase font-semibold px-2 py-1`}
                        >
                          {claim.status}
                        </Badge>
                      </div>

                      {/* Info: Plate & Date */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs">
                            Vehicle Plate
                          </span>
                          <span className="font-semibold text-foreground">
                            {claim.plate}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">
                            Date
                          </span>
                          <span className="font-semibold text-foreground">
                            {claim.claimDate}
                          </span>
                        </div>
                      </div>

                      {/* Timeline (Mô phỏng Hình 3) */}
                      <div className="pt-2 border-t">
                        <WarrantyTimeline
                          timeline={claim.timeline}
                          currentStatus={claim.status}
                        />
                      </div>

                      {/* Button View (Ở dưới cùng) */}
                      <div className="mt-auto pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-300 hover:bg-muted/50 text-foreground"
                          onClick={() => handleViewClaim(claim)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

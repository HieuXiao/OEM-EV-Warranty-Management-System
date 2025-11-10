import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useReducer, useCallback } from "react";
import {
  ShieldAlert,
  Clock,
  TriangleAlert,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosPrivate from "@/api/axios";

const CAMPAIGN_URL = "/api/campaigns/all";
const VEHICLE_URL = "/api/vehicles";
const APPOINTMENT_URL = "/api/service-appointments";
const ACCOUNT_URL = "/api/accounts/current";

const initialState = {
  status: "idle", // 'idle', 'loading', 'success', 'error'
  campaigns: [],
  vehicles: [], // Vẫn giữ nếu bạn cần dùng ở nơi khác
  currentAccount: null,
  error: null,
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "success",
        campaigns: action.payload.campaigns,
        vehicles: action.payload.vehicles,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
        campaigns: [],
        vehicles: [],
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default function SCStaffCampaignSummary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  const { status, campaigns, error } = state;

  const getCampaignDateStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Chuẩn hóa 'hôm nay' về 0h:00

    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);

    if (startDate && now < startDate) {
      return "not yet";
    }
    if (endDate && now > endDate) {
      return "completed";
    }
    return "on going";
  };

  const fetchAllData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const [
        accountRes,
        campaignResponse,
        vehicleResponse,
        appointmentResponse,
      ] = await Promise.all([
        axiosPrivate.get(ACCOUNT_URL),
        axiosPrivate.get(CAMPAIGN_URL),
        axiosPrivate.get(VEHICLE_URL),
        axiosPrivate.get(APPOINTMENT_URL),
      ]);

      const currentAccount = accountRes.data;
      const rawCampaigns = campaignResponse.data;
      const allVehicles = vehicleResponse.data;
      const allAppointments = appointmentResponse.data;

      const transformedData = rawCampaigns.map((campaign) => {
        // Tính toán status
        const status = getCampaignDateStatus(
          campaign.startDate,
          campaign.endDate
        );

        // Tính Affected Vehicles
        const campaignModelSet = new Set(campaign.model);
        const affectedVehiclesCount = allVehicles.filter(
          (vehicle) =>
            campaignModelSet.has(vehicle.model) &&
            vehicle.customer.serviceCenter?.centerId ===
              currentAccount.serviceCenter?.centerId
        ).length;

        // Tính Completed Vehicles (Giả định)
        const completedVehiclesCount = allAppointments.filter(
          (app) =>
            app.campaign.campaignId === campaign.campaignId &&
            app.status === "Completed" &&
            app.vehicle.customer.serviceCenter?.centerId ===
              currentAccount.serviceCenter?.centerId
        ).length;

        return {
          ...campaign,
          status: status,
          affectedVehicles: affectedVehiclesCount,
          completedVehicles: completedVehiclesCount,
        };
      });

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          campaigns: transformedData,
          vehicles: allVehicles,
          currentAccount, // Lưu nếu cần
        },
      });
    } catch (err) {
      console.error("API Error: " + err.message);
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const campaignCounts = campaigns.reduce(
    (counts, campaign) => {
      // Chỉ cần đọc trường đã tính toán sẵn
      if (campaign.status === "not yet") {
        counts.notYet++;
      } else if (campaign.status === "on going") {
        counts.onGoing++;
      } else if (campaign.status === "completed") {
        counts.completed++;
      }
      return counts;
    },
    { notYet: 0, onGoing: 0, completed: 0 }
  );

  const totalCampaigns = campaigns.length;
  // --- Kết thúc logic đếm ---

  // --- Logic lọc danh sách ---
  const filteredCampaigns = campaigns
    .filter((campaign) => {
      // <-- Lọc từ 'campaigns' (state)
      const matchesSearch = campaign.campaignName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 1. Định nghĩa thứ tự ưu tiên
      const statusPriority = {
        "on going": 1,
        "not yet": 2,
        completed: 3,
      };

      // 2. Lấy độ ưu tiên của a và b (nếu không tìm thấy, cho xuống cuối)
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;

      // 3. So sánh
      return priorityA - priorityB;
    });

  const handleViewCampaign = (campaign) => {
    setViewingCampaign(campaign);
  };

  function getStatusColor(status) {
    switch (status) {
      case "not yet":
        return "bg-yellow-500";
      case "on going":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }

  return (
    <>
      {/* ====== HEADER SUMMARY ====== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ===CARD 1: Total Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaign
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
          </CardContent>
        </Card>
        {/* ===CARD 2: Active Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Campaign
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignCounts.notYet}</div>
          </CardContent>
        </Card>
        {/* ===CARD 3: Pending Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On going Campaign
            </CardTitle>
            <TriangleAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignCounts.onGoing}</div>
          </CardContent>
        </Card>
        {/* ===CARD 4: Complete Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Campaign
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignCounts.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* ===== BODY SUMMMARY ===== */}
      <Card>
        {/* SECTION 1 - BODY */}
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>Campaign detatails and process</CardDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Campaign..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not yet">Not yet</SelectItem>
                  <SelectItem value="on going">On going</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* SECTION 2 - BODY */}
        <CardContent>
          {status === "loading" && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-40 text-destructive">
              <AlertCircle className="w-6 h-6 mb-2" />
              <p className="font-semibold">Error loading campaigns</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {status === "success" && (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <Card
                  key={campaign.campaignName}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">
                            {campaign.campaignName}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(campaign.status)}
                          >
                            {campaign.status.toUpperCase()}
                          </Badge>
                        </div>

                        <h4 className="font-medium mb-2">{campaign.title}</h4>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">
                              Affected Models:{" "}
                            </span>
                            <span className="font-medium">
                              {campaign.model.join(", ")}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Start Date:{" "}
                            </span>
                            <span className="font-medium">
                              {new Date(
                                campaign.startDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>
                              {campaign.completedVehicles}/
                              {campaign.affectedVehicles} vehicles
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${Math.round(
                                  (campaign.completedVehicles /
                                    campaign.affectedVehicles) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCampaign(campaign)}
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!viewingCampaign}
        onOpenChange={(open) => !open && setViewingCampaign(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Campaign Details</DialogTitle>
            <DialogDescription>
              Complete information about this recall campaign
            </DialogDescription>
          </DialogHeader>

          {viewingCampaign && (
            <div className="space-y-6 py-4">
              {/* Campaign Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">
                    {viewingCampaign.campaignName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusColor(viewingCampaign.status)}
                  >
                    {viewingCampaign.status}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Description</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {viewingCampaign.serviceDescription}
                </p>
              </div>

              {/* Campaign Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(viewingCampaign.startDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {viewingCampaign.endDate
                      ? new Date(viewingCampaign.endDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Ongoing"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Affected Vehicles
                  </p>
                  <p className="font-medium text-lg">
                    {viewingCampaign.affectedVehicles}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Completed Repairs
                  </p>
                  <p className="font-medium text-lg">
                    {viewingCampaign.completedVehicles}
                  </p>
                </div>
              </div>

              {/* Affected Models */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Affected Models</h5>
                <div className="flex flex-wrap gap-2">
                  {viewingCampaign.model.map((model, index) => (
                    <Badge key={index} variant="secondary">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-sm">Completion Progress</h5>
                  <span className="text-sm font-medium">
                    {Math.round(
                      (viewingCampaign.completedVehicles /
                        viewingCampaign.affectedVehicles) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        (viewingCampaign.completedVehicles /
                          viewingCampaign.affectedVehicles) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {/* {viewingCampaign.completedVehicles.toLocaleString()}{" "} */}
                    completed
                  </span>
                  <span>
                    {(
                      viewingCampaign.affectedVehicles -
                      viewingCampaign.completedVehicles
                    ).toLocaleString()}{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              {viewingCampaign.remedy && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Remedy</h5>
                  <p className="text-sm text-muted-foreground">
                    {viewingCampaign.remedy}
                  </p>
                </div>
              )}

              {viewingCampaign.estimatedRepairTime && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Estimated Repair Time
                  </p>
                  <p className="font-medium">
                    {viewingCampaign.estimatedRepairTime}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingCampaign(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

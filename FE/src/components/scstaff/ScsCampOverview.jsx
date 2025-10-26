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
import { useEffect, useState } from "react";
import { ShieldAlert, Clock, TriangleAlert, ShieldCheck } from "lucide-react";
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

const getSeverityColor = (severity) => {
  const colors = {
    low: "bg-gray-100 text-gray-700 border-gray-300",
    medium: "bg-orange-100 text-orange-700 border-orange-300",
    high: "bg-red-100 text-red-700 border-red-300",
  };
  return colors[severity] || "bg-gray-100 text-gray-700 border-gray-300";
};

export default function SCStaffCampaignSummary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingCampaign, setViewingCampaign] = useState(null);

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

  useEffect(() => {
    async function fetchAllData() {
      try {
        // Bước 1: Gọi cả hai API. Có thể dùng Promise.all để gọi song song
        const [campaignResponse, vehicleResponse] = await Promise.all([
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(VEHICLE_URL),
        ]);

        const rawCampaigns = campaignResponse.data;
        const allVehicles = vehicleResponse.data;

        // Bước 2: Xử lý dữ liệu campaigns
        const transformedData = rawCampaigns.map((campaign) => {
          // Tính toán status (như code cũ)
          const status = getCampaignDateStatus(
            campaign.startDate,
            campaign.endDate
          );

          // --- LOGIC MỚI ĐỂ ĐẾM VEHICLES ---
          // Giả sử campaign.model là một mảng, ví dụ: ["Corolla", "Camry"]
          // Tạo một Set để tra cứu model nhanh (hiệu năng tốt hơn)
          const campaignModelSet = new Set(campaign.model);

          // Lọc danh sách 'allVehicles'
          // Giả sử mỗi vehicle có thuộc tính 'model', ví dụ: vehicle.model = "Corolla"
          const matchingVehicleCount = allVehicles.filter((vehicle) =>
            campaignModelSet.has(vehicle.model)
          ).length;
          // --- KẾT THÚC LOGIC MỚI ---

          // Bước 3: Trả về object campaign đã được thêm thông tin
          return {
            ...campaign,
            campaignId: campaign.campaignId,
            campaignName: campaign.campaignName,
            serviceDescription: campaign.serviceDescription,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            model: campaign.model,
            status: status,
            // Thêm thuộc tính mới chứa số lượng đã đếm
            matchingVehicleCount: matchingVehicleCount,
          };
        });

        // Bước 4: Set state với dữ liệu đã xử lý
        setCampaigns(transformedData);
        setVehicles(allVehicles); // Vẫn set state vehicles nếu bạn cần dùng ở nơi khác
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }

    fetchAllData();
  }, []);

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
  const filteredCampaigns = campaigns.filter((campaign) => {
    // <-- Lọc từ 'campaigns' (state)
    const matchesSearch = campaign.campaignName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
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
              Not yet Campaign
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
                          {campaign.status}
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
                            {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{campaign.matchingVehicleCount}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${
                                (campaign.completedVehicles /
                                  campaign.affectedVehicles) *
                                100
                              }%`,
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
                    {viewingCampaign.campaignNumber}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusColor(viewingCampaign.status)}
                  >
                    {viewingCampaign.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getSeverityColor(viewingCampaign.severity)}
                  >
                    {viewingCampaign.severity}
                  </Badge>
                </div>
                <h4 className="text-lg font-semibold text-muted-foreground">
                  {viewingCampaign.title}
                </h4>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Description</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {viewingCampaign.description}
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
                    {viewingCampaign.affectedVehicles.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Completed Repairs
                  </p>
                  <p className="font-medium text-lg">
                    {viewingCampaign.completedVehicles.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Affected Models */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Affected Models</h5>
                <div className="flex flex-wrap gap-2">
                  {viewingCampaign.affectedModels.map((model, index) => (
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
                    {viewingCampaign.completedVehicles.toLocaleString()}{" "}
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

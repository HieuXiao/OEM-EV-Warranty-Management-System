// FE/src/components/scstaff/ScsCampOverview.jsx
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
import { useEffect, useState, useMemo } from "react"; // Xóa useReducer, useCallback
import {
  ShieldAlert,
  Clock,
  TriangleAlert,
  ShieldCheck,
  Loader2, // Giữ lại
  Eye,
  AlertCircle, // Giữ lại
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Xóa import axiosPrivate

// --- XÓA TOÀN BỘ KHỐI dataFetchReducer VÀ initialState ---

// --- CHỈNH SỬA SIGNATURE CỦA COMPONENT ---
export default function SCStaffCampaignSummary({
  allCampaigns = [],
  allVehicles = [],
  myAppointments = [],
  currentAccount = {},
  status, // Nhận status từ cha
  error, // Nhận error từ cha
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingCampaign, setViewingCampaign] = useState(null);

  // --- XÓA state, dispatch, fetchAllData, useEffect(fetchAllData) ---

  // --- HÀM HELPER (Giữ lại) ---
  const getCampaignDateStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

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

  // --- CẬP NHẬT useMemo ĐỂ DÙNG PROPS ---
  const campaignData = useMemo(() => {
    const myCenterId = currentAccount.serviceCenter?.centerId;
    if (!myCenterId || !allCampaigns || allCampaigns.length === 0)
      return {
        counts: { notYet: 0, onGoing: 0, completed: 0, total: 0 },
        list: [],
      };

    const counts = { notYet: 0, onGoing: 0, completed: 0, total: 0 };

    const list = allCampaigns
      .map((campaign) => {
        const status = getCampaignDateStatus(
          campaign.startDate,
          campaign.endDate
        );
        const campaignModelSet = new Set(campaign.model);

        const affectedVehiclesCount = (allVehicles || []).filter(
          (vehicle) =>
            campaignModelSet.has(vehicle.model) &&
            vehicle.customer.serviceCenter?.centerId === myCenterId
        ).length;

        if (affectedVehiclesCount > 0) {
          if (status === "not yet") counts.notYet++;
          else if (status === "on going") counts.onGoing++;
          else if (status === "completed") counts.completed++;
          counts.total++;

          const completedVehiclesCount = (myAppointments || []).filter(
            (app) =>
              app.campaign.campaignId === campaign.campaignId &&
              app.status === "Completed" &&
              app.vehicle.customer.serviceCenter?.centerId === myCenterId
          ).length;

          return {
            ...campaign,
            status: status,
            affectedVehicles: affectedVehiclesCount,
            completedVehicles: completedVehiclesCount,
          };
        }
        return null;
      })
      .filter(Boolean);

    return { counts, list };
  }, [allCampaigns, allVehicles, myAppointments, currentAccount]);

  const filteredCampaigns = campaignData.list
    .filter((campaign) => {
      const matchesSearch = campaign.campaignName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const statusPriority = {
        "on going": 1,
        "not yet": 2,
        completed: 3,
      };
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
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

  // --- GIỮ NGUYÊN JSX GỐC (loading/error/success) ---
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-destructive">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p className="font-semibold">Error loading campaigns</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    status === "success" && (
      <>
        {/* ====== HEADER SUMMARY ====== */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Campaign
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaignData.counts.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Campaign
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaignData.counts.notYet}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                On going Campaign
              </CardTitle>
              <TriangleAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaignData.counts.onGoing}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Campaign
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaignData.counts.completed}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== BODY SUMMMARY ===== */}
        <Card>
          {/* SECTION 1 - BODY */}
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Campaign Information</CardTitle>
                <CardDescription>
                  Campaign detatails and process
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Campaign..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
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
              {filteredCampaigns.length === 0 ? (
                <p className="text-center text-muted-foreground h-40 flex items-center justify-center">
                  No campaigns match your criteria for this service center.
                </p>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <Card
                    key={campaign.campaignId}
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
                                {Array.isArray(campaign.model)
                                  ? campaign.model.join(", ")
                                  : campaign.model}
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
                              <span>Progress (Your Center)</span>
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
                                      (campaign.affectedVehicles || 1)) *
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
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog xem chi tiết (Giữ nguyên) */}
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
                {/* ... (Nội dung Dialog giữ nguyên) ... */}
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
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Description</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {viewingCampaign.serviceDescription}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(viewingCampaign.startDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {viewingCampaign.endDate
                        ? new Date(viewingCampaign.endDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )
                        : "Ongoing"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Affected (Your Center)
                    </p>
                    <p className="font-medium text-lg">
                      {viewingCampaign.affectedVehicles}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Completed (Your Center)
                    </p>
                    <p className="font-medium text-lg">
                      {viewingCampaign.completedVehicles}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Affected Models</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(viewingCampaign.model) &&
                      viewingCampaign.model.map((model, index) => (
                        <Badge key={index} variant="secondary">
                          {model}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewingCampaign(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    ) // Chỉ render khi success
  );
}

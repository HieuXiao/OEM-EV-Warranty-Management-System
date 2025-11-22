// FE/src/components/scstaff/ScsCampParticipant.jsx
import { useState, useMemo, useEffect } from "react"; // Xóa useReducer, useCallback
import {
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleAppointmentDialog } from "@/components/scstaff/ScsCampAppSchedule";
// Xóa import axiosPrivate
// Xóa các hằng số API_URL

// --- XÓA TOÀN BỘ dataFetchReducer VÀ initialState ---

// --- CHỈNH SỬA SIGNATURE CỦA COMPONENT ---
export default function ScsCampaignPraticipants({
  allCampaigns = [],
  allVehicles = [],
  myAppointments = [],
  currentAccount = {}, // Thêm currentAccount
  status, // Thêm status
  error, // Thêm error
  onRefreshData, // Thêm onRefreshData
}) {
  // --- Giữ lại state cục bộ của giao diện này ---
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [campaignPage, setCampaignPage] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(0);

  // --- XÓA state, dispatch, fetchAllData ---

  const CAMPAIGNS_PER_PAGE = 3;
  const VEHICLES_PER_PAGE = 10;

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

  // --- CẬP NHẬT LOGIC: Biến đổi dữ liệu từ props ---
  // (Logic này lấy từ hàm fetchAllData gốc của bạn)
  const transformedCampaigns = useMemo(() => {
    const myCenterId = currentAccount.serviceCenter?.centerId;
    if (!myCenterId) return [];

    const transformedData = (allCampaigns || [])
      .map((campaign) => {
        const status = getCampaignDateStatus(
          campaign.startDate,
          campaign.endDate
        );
        const campaignModelSet = new Set(campaign.model);

        // Lọc xe thuộc trung tâm này
        const matchingVehicles = (allVehicles || []).filter(
          (vehicle) =>
            campaignModelSet.has(vehicle.model) &&
            vehicle.customer.serviceCenter?.centerId === myCenterId
        );

        const matchingVehicleCount = matchingVehicles.length;

        // Lọc lịch hẹn thuộc trung tâm này
        const completedVehicles = (myAppointments || []).filter(
          (appt) =>
            appt.campaign?.campaignId === campaign.campaignId &&
            matchingVehicles.some((v) => v.vin === appt.vehicle?.vin) // Đảm bảo xe thuộc SC
        ).length;

        return {
          ...campaign,
          status: status,
          matchingVehicleCount: matchingVehicleCount, // Số xe bị ảnh hưởng CỦA TRUNG TÂM NÀY
          completedVehicles: completedVehicles, // Số xe đã lên lịch CỦA TRUNG TÂM NÀY
        };
      })
      // Lọc các campaign có xe liên quan đến trung tâm này
      .filter((c) => c.matchingVehicleCount > 0);

    const statusPriority = {
      "on going": 1,
      "not yet": 2,
      completed: 3,
    };

    transformedData.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      return priorityA - priorityB;
    });

    return transformedData;
  }, [allCampaigns, allVehicles, myAppointments, currentAccount]);

  // --- THÊM MỚI: useEffect để set campaign mặc định khi props đã sẵn sàng ---
  useEffect(() => {
    if (
      status === "success" &&
      transformedCampaigns.length > 0 &&
      !selectedCampaign
    ) {
      setSelectedCampaign(transformedCampaigns[0]);
    }
    // Nếu selectedCampaign còn tồn tại, cập nhật nó với dữ liệu mới
    if (selectedCampaign) {
      const updatedSelected = transformedCampaigns.find(
        (c) => c.campaignId === selectedCampaign.campaignId
      );
      setSelectedCampaign(
        updatedSelected ||
          (transformedCampaigns.length > 0 ? transformedCampaigns[0] : null)
      );
    }
  }, [status, transformedCampaigns, selectedCampaign]); // Chạy khi data thay đổi

  const scheduledVehiclePlates = useMemo(() => {
    if (!selectedCampaign) return new Set();
    const campaignAppointments = (myAppointments || []).filter(
      (appt) => appt.campaign?.campaignId === selectedCampaign.campaignId
    );
    return new Set(campaignAppointments.map((appt) => appt.vehicle?.plate));
  }, [myAppointments, selectedCampaign]);

  const selectedCampaignModelSet = new Set(selectedCampaign?.model || []);
  const myCenterId = currentAccount.serviceCenter?.centerId;

  const filteredVehicles = useMemo(() => {
    return (allVehicles || [])
      .filter(
        (v) =>
          // 1. Lọc theo model của campaign đã chọn
          selectedCampaignModelSet.has(v.model) &&
          // 2. Lọc theo trung tâm dịch vụ của user
          v.customer.serviceCenter?.centerId === myCenterId &&
          // 3. Lọc theo search query
          (searchQuery === "" ||
            (v.customer.customerName &&
              v.customer.customerName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (v.customer.customerPhone &&
              v.customer.customerPhone.includes(searchQuery)) ||
            (v.plate &&
              v.plate.toLowerCase().includes(searchQuery.toLowerCase())))
      )
      .filter((v) => {
        if (scheduleFilter === "all") {
          return true;
        }
        const isScheduled = scheduledVehiclePlates.has(v.plate);
        if (scheduleFilter === "scheduled") {
          return isScheduled;
        }
        if (scheduleFilter === "needsSchedule") {
          return !isScheduled;
        }
        return true;
      });
  }, [
    allVehicles,
    selectedCampaignModelSet,
    myCenterId,
    searchQuery,
    scheduleFilter,
    scheduledVehiclePlates,
  ]);

  const paginatedCampaigns = transformedCampaigns.slice(
    campaignPage * CAMPAIGNS_PER_PAGE,
    (campaignPage + 1) * CAMPAIGNS_PER_PAGE
  );

  const totalCampaignPages =
    Math.ceil(transformedCampaigns.length / CAMPAIGNS_PER_PAGE) === 0
      ? 1
      : Math.ceil(transformedCampaigns.length / CAMPAIGNS_PER_PAGE);

  const paginatedVehicles = filteredVehicles.slice(
    vehiclePage * VEHICLES_PER_PAGE,
    (vehiclePage + 1) * VEHICLES_PER_PAGE
  );
  const totalVehiclePages =
    Math.ceil(filteredVehicles.length / VEHICLES_PER_PAGE) === 0
      ? 1
      : Math.ceil(filteredVehicles.length / VEHICLES_PER_PAGE);

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    setVehiclePage(0);
    setSearchQuery("");
    setScheduleFilter("all");
  };

  const handleScheduleAppointment = (vehicle) => {
    setSelectedVehicle(vehicle);
    setScheduleDialogOpen(true);
  };

  function getStatusColor(status) {
    // ... (logic giữ nguyên)
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
          Loading participant data...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return status === "success" ? (
    <div className="space-y-6">
      {/* Campaign Selection */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-lg font-semibold text-card-foreground">
            Select Campaign
          </h3>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={() => setCampaignPage(Math.max(0, campaignPage - 1))}
              variant="outline"
              size="sm"
              disabled={campaignPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {campaignPage + 1} / {totalCampaignPages}
            </span>
            <Button
              onClick={() =>
                setCampaignPage(
                  Math.min(totalCampaignPages - 1, campaignPage + 1)
                )
              }
              variant="outline"
              size="sm"
              disabled={
                campaignPage === totalCampaignPages - 1 ||
                totalCampaignPages === 0
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCampaigns.map((campaign) => (
            <button
              key={campaign.campaignId}
              onClick={() => handleCampaignSelect(campaign)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedCampaign?.campaignId === campaign.campaignId
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-card-foreground">
                  {campaign.campaignName}
                </h4>
                <Badge
                  variant="outline"
                  className={getStatusColor(campaign.status)}
                >
                  {campaign.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                  {new Date(campaign.endDate).toLocaleDateString()}
                </p>
                <p>
                  Vehicles: {campaign.matchingVehicleCount} | Scheduled:{" "}
                  {campaign.completedVehicles || 0}
                </p>
              </div>
            </button>
          ))}
          {/* Xử lý trường hợp không có campaign nào */}
          {paginatedCampaigns.length === 0 && (
            <p className="text-muted-foreground col-span-3 text-center py-4">
              No campaigns assigned to this service center.
            </p>
          )}
        </div>
      </div>

      {selectedCampaign && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-semibold text-card-foreground">
                Vehicles - {selectedCampaign?.campaignName}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setVehiclePage(Math.max(0, vehiclePage - 1))}
                  variant="outline"
                  size="sm"
                  disabled={vehiclePage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {vehiclePage + 1} / {totalVehiclePages}
                </span>
                <Button
                  onClick={() =>
                    setVehiclePage(
                      Math.min(totalVehiclePages - 1, vehiclePage + 1)
                    )
                  }
                  variant="outline"
                  size="sm"
                  disabled={
                    vehiclePage === totalVehiclePages - 1 ||
                    totalVehiclePages === 0
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by owner, phone, or license plate..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVehiclePage(0);
                  }}
                  className="pl-10 w-full"
                />
              </div>
              <Select
                value={scheduleFilter}
                onValueChange={(value) => {
                  setScheduleFilter(value);
                  setVehiclePage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="needsSchedule">Schedule</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TABLE */}
          <div className="px-0 sm:px-6 pb-6 overflow-hidden">
            <div className="overflow-x-auto border rounded-md sm:border-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">Owner</TableHead>
                    <TableHead className="w-[25%]">License Plate</TableHead>
                    <TableHead className="w-[25%]">Phone</TableHead>
                    <TableHead className="w-[25%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Cập nhật logic khi không có xe */}
                  {paginatedVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        {filteredVehicles.length === 0 && searchQuery !== ""
                          ? "No vehicles match your search."
                          : "No vehicles found for this filter."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.vehicleId}>
                        <TableCell className="px-4 py-3">
                          {vehicle.customer.customerName}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {vehicle.plate}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {vehicle.customer.customerPhone}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleAppointment(vehicle)}
                            disabled={scheduledVehiclePlates.has(vehicle.plate)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {scheduledVehiclePlates.has(vehicle.plate)
                              ? "Scheduled"
                              : "Schedule"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      <ScheduleAppointmentDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        vehicle={selectedVehicle}
        campaign={selectedCampaign}
        onScheduleSuccess={onRefreshData} // <-- Dùng hàm refresh từ props
      />
    </div>
  ) : null;
}

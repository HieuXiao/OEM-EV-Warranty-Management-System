import { useState, useReducer, useCallback } from "react";
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
import { useEffect, useMemo } from "react";
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
import axiosPrivate from "@/api/axios";

const CAMPAIGN_URL = "/api/campaigns/all";
const VEHICLE_URL = "/api/vehicles";
const APPOINTMENT_URL = "/api/service-appointments";

const initialState = {
  status: "idle",
  campaigns: [],
  vehicles: [],
  appointments: [],
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
        appointments: action.payload.appointments,
      };
    case "FETCH_ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default function CampaignsSection() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [campaignPage, setCampaignPage] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(0);

  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  const { status, campaigns, vehicles, appointments, error } = state;

  const CAMPAIGNS_PER_PAGE = 3;
  const VEHICLES_PER_PAGE = 10;

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
    // Chỉ set loading nếu chưa ở state success (tránh giật lag khi refresh)
    if (status !== "success") {
      dispatch({ type: "FETCH_START" });
    }

    try {
      const [campaignResponse, vehicleResponse, appointmentResponse] =
        await Promise.all([
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(VEHICLE_URL),
          axiosPrivate.get(APPOINTMENT_URL),
        ]);

      const rawCampaigns = campaignResponse.data;
      const allVehicles = vehicleResponse.data;
      const allAppointments = appointmentResponse.data;

      const transformedData = rawCampaigns.map((campaign) => {
        const status = getCampaignDateStatus(
          campaign.startDate,
          campaign.endDate
        );
        const campaignModelSet = new Set(campaign.model);
        const matchingVehicleCount = allVehicles.filter((vehicle) =>
          campaignModelSet.has(vehicle.model)
        ).length;

        const completedVehicles = allAppointments.filter(
          (appt) => appt.campaign?.campaignId === campaign.campaignId
        ).length;

        return {
          ...campaign,
          status: status,
          matchingVehicleCount: matchingVehicleCount,
          completedVehicles: completedVehicles,
        };
      });

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          campaigns: transformedData,
          vehicles: allVehicles,
          appointments: allAppointments,
        },
      });

      // Logic cập nhật selectedCampaign (giữ nguyên từ bản gốc)
      if (transformedData.length > 0) {
        if (selectedCampaign) {
          const currentCampaignId = selectedCampaign.campaignId;
          const updatedSelectedCampaign = transformedData.find(
            (c) => c.campaignId === currentCampaignId
          );
          setSelectedCampaign(updatedSelectedCampaign || transformedData[0]);
        } else {
          setSelectedCampaign(transformedData[0]);
        }
      }
    } catch (err) {
      console.error("API Error: " + err.message);
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, [selectedCampaign, status]);

  const scheduledVehiclePlates = useMemo(() => {
    if (!selectedCampaign) return new Set();
    const campaignAppointments = appointments.filter(
      (appt) => appt.campaign?.campaignId === selectedCampaign.campaignId
    );
    return new Set(campaignAppointments.map((appt) => appt.vehicle?.plate));
  }, [appointments, selectedCampaign]);

  const selectedCampaignModelSet = new Set(selectedCampaign?.model || []);

  const filteredVehicles = vehicles
    .filter(
      (v) =>
        // 1. Lọc theo model
        selectedCampaignModelSet.has(v.model) &&
        // 2. Lọc theo search query
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
    // <-- THÊM MỚI: Lọc theo trạng thái Schedule/Scheduled
    .filter((v) => {
      if (scheduleFilter === "all") {
        return true;
      }
      const isScheduled = scheduledVehiclePlates.has(v.plate);
      if (scheduleFilter === "scheduled") {
        return isScheduled; // Chỉ hiện xe ĐÃ lên lịch
      }
      if (scheduleFilter === "needsSchedule") {
        return !isScheduled; // Chỉ hiện xe CẦN lên lịch (Schedule)
      }
      return true;
    });

  const paginatedCampaigns = campaigns.slice(
    campaignPage * CAMPAIGNS_PER_PAGE,
    (campaignPage + 1) * CAMPAIGNS_PER_PAGE
  );

  const totalCampaignPages =
    Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE) === 0
      ? 1
      : Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE);

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
    setScheduleFilter("all"); // <-- THÊM MỚI: Reset filter khi đổi campaign
  };

  const handleScheduleAppointment = (vehicle) => {
    setSelectedVehicle(vehicle);
    setScheduleDialogOpen(true);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Select Campaign
          </h3>
          <div className="flex items-center gap-2">
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
              disabled={campaignPage === totalCampaignPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {selectedCampaign && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
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
                  disabled={vehiclePage === totalVehiclePages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* <-- THÊM MỚI: Bọc Search và Filter bằng flex-wrap --> */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[300px] max-w-[550px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by owner, phone, or license plate..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVehiclePage(0); // Reset trang khi search
                  }}
                  className="pl-10"
                />
              </div>
              {/* <-- THÊM MỚI: Filter Dropdown --> */}
              <Select
                value={scheduleFilter}
                onValueChange={(value) => {
                  setScheduleFilter(value);
                  setVehiclePage(0); // Reset trang khi filter
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
            {/* <-- KẾT THÚC THÊM MỚI --> */}
          </div>

          <div className="px-6 pb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%] px-4 py-3">Owner</TableHead>
                    <TableHead className="w-[20%] px-4 py-3">
                      License Plate
                    </TableHead>
                    <TableHead className="w-[20%] px-4 py-3">Phone</TableHead>
                    <TableHead className="w-[20%] px-4 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVehicles.map((vehicle) => (
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
                  ))}
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
        onScheduleSuccess={fetchAllData}
      />
    </div>
  ) : null;
}

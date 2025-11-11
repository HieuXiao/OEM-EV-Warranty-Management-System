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
const ACCOUNT_URL = "/api/accounts/current";

const initialState = {
  status: "idle",
  campaigns: [],
  vehicles: [],
  appointments: [],
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
        appointments: action.payload.appointments,
        currentAccount: action.payload.currentAccount,
        error: null,
      };
    case "FETCH_FAILURE":
      return { ...state, status: "error", error: action.payload };
    default:
      return state;
  }
};

export default function ScsCampParticipant() {
  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  const { status, campaigns, vehicles, appointments, error, currentAccount } =
    state;

  const [selectedCampaignId, setSelectedCampaignId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchAllData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const [campaignsRes, vehiclesRes, appointmentsRes, accountRes] =
        await Promise.all([
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(VEHICLE_URL),
          axiosPrivate.get(APPOINTMENT_URL),
          axiosPrivate.get(ACCOUNT_URL), // <-- Gọi API tài khoản
        ]);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          campaigns: campaignsRes.data,
          vehicles: vehiclesRes.data,
          appointments: appointmentsRes.data,
          currentAccount: accountRes.data, // <-- Truyền tài khoản vào
        },
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      dispatch({
        type: "FETCH_FAILURE",
        payload: error.message || "Failed to load data",
      });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Map các phương tiện đã tham gia campaign (Giữ nguyên)
  const campaignVehiclesMap = useMemo(() => {
    const map = new Map();
    campaigns.forEach((campaign) => {
      const vehicleSet = new Set(
        campaign.vehicles.map((vehicle) => vehicle.plate)
      );
      map.set(campaign.id, vehicleSet);
    });
    return map;
  }, [campaigns]);

  // Map các phương tiện đã được đặt lịch (Giữ nguyên)
  const scheduledVehiclePlates = useMemo(() => {
    return new Set(appointments.map((app) => app.vehicle.plate));
  }, [appointments]);

  const serviceCenterVehicles = useMemo(() => {
    // Nếu chưa có thông tin tài khoản hoặc SC, trả về mảng rỗng
    if (!currentAccount || !currentAccount.serviceCenter) {
      return [];
    }
    const currentScId = currentAccount.serviceCenter.id;

    // Lọc danh sách 'vehicles' đầy đủ
    return vehicles.filter(
      (vehicle) => vehicle.customer?.serviceCenter?.id === currentScId
    );
  }, [vehicles, currentAccount]); // Phụ thuộc vào 'vehicles' và 'currentAccount'

  // Lọc danh sách phương tiện dựa trên campaign và từ khóa tìm kiếm
  const filteredVehicles = useMemo(() => {
    let vehiclesToFilter = serviceCenterVehicles;

    if (selectedCampaignId && selectedCampaignId !== "all") {
      const vehiclePlatesInCampaign =
        campaignVehiclesMap.get(selectedCampaignId) || new Set();
      vehiclesToFilter = vehiclesToFilter.filter((vehicle) =>
        vehiclePlatesInCampaign.has(vehicle.plate)
      );
    }

    if (searchTerm) {
      vehiclesToFilter = vehiclesToFilter.filter(
        (vehicle) =>
          vehicle.customer.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.customer.customerPhone
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return vehiclesToFilter;
  }, [
    serviceCenterVehicles,
    selectedCampaignId,
    campaignVehiclesMap,
    searchTerm,
  ]);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  const handleScheduleAppointment = (vehicle) => {
    if (!selectedCampaign) {
      console.error("No campaign selected for scheduling.");
      return;
    }
    setSelectedVehicle(vehicle);
    setScheduleDialogOpen(true);
  };

  const handleCampaignChange = (campaignId) => {
    setSelectedCampaignId(campaignId);
  };

  const showScheduleButton = selectedCampaignId && selectedCampaignId !== "all";

  return status !== "idle" ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        {/* Filter by Campaign */}
        <div className="flex-1 max-w-xs">
          <Select
            value={selectedCampaignId}
            onValueChange={handleCampaignChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Participants (All Campaigns)
              </SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by name, plate, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {status === "loading" && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-10 bg-destructive/10 border border-destructive text-destructive rounded-md">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto">
            <div className="py-2 align-middle inline-block min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Customer Name</TableHead>
                    <TableHead className="px-4 py-3">Plate Number</TableHead>
                    <TableHead className="px-4 py-3">Phone</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      {showScheduleButton ? "Action" : ""}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.vin}>
                      <TableCell className="px-4 py-3">
                        {vehicle.customer.customerName}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {vehicle.plate}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {vehicle.customer.customerPhone}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {showScheduleButton && (
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
                        )}
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
        campaign={selectedCampaign} // Truyền campaign đã chọn
        onScheduleSuccess={fetchAllData} // Tải lại dữ liệu sau khi đặt lịch
      />
    </div>
  ) : null;
}

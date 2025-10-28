import { useState } from "react";
import { Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScheduleAppointmentDialog } from "@/components/scstaff/ScsCampAppSchedule";
import axiosPrivate from "@/api/axios";

const CAMPAIGN_URL = "/api/campaigns/all";
const VEHICLE_URL = "/api/vehicles";
const APPOINTMENT_URL = "/api/service-appointments";

export default function CampaignsSection() {
  // THAY ĐỔI 1: Khởi tạo là null
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [campaignPage, setCampaignPage] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(0);
  const [appointments, setAppointments] = useState([]);

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

  useEffect(() => {
    async function fetchAllData() {
      try {
        // <-- THAY ĐỔI: Gọi cả 3 API
        const [campaignResponse, vehicleResponse, appointmentResponse] =
          await Promise.all([
            axiosPrivate.get(CAMPAIGN_URL),
            axiosPrivate.get(VEHICLE_URL),
            axiosPrivate.get(APPOINTMENT_URL), // <-- THAY ĐỔI: Lấy appointments
          ]);

        const rawCampaigns = campaignResponse.data;
        const allVehicles = vehicleResponse.data;
        const allAppointments = appointmentResponse.data; // <-- THAY ĐỔI

        setAppointments(allAppointments); // <-- THAY ĐỔI: Lưu appointments
        setVehicles(allVehicles);

        // Xử lý dữ liệu campaigns (giữ nguyên logic của bạn)
        const transformedData = rawCampaigns.map((campaign) => {
          const status = getCampaignDateStatus(
            campaign.startDate,
            campaign.endDate
          );
          const campaignModelSet = new Set(campaign.model);
          const matchingVehicleCount = allVehicles.filter((vehicle) =>
            campaignModelSet.has(vehicle.model)
          ).length;

          // Đếm số xe đã hoàn thành (scheduled) cho chiến dịch này
          const completedVehicles = allAppointments.filter(
            (appt) => appt.campaign?.campaignId === campaign.campaignId
          ).length;

          return {
            ...campaign,
            status: status,
            matchingVehicleCount: matchingVehicleCount,
            completedVehicles: completedVehicles, // Cập nhật số lượng
          };
        });

        setCampaigns(transformedData);

        if (transformedData.length > 0) {
          setSelectedCampaign(transformedData[0]);
        }
      } catch (error) {
        console.error("API Error: " + error.message);
      }
    }

    fetchAllData();
  }, []);

  const scheduledVehiclePlates = useMemo(() => {
    if (!selectedCampaign) return new Set();

    // Lọc các cuộc hẹn chỉ thuộc chiến dịch đang chọn
    const campaignAppointments = appointments.filter(
      (appt) => appt.campaign?.campaignId === selectedCampaign.campaignId
    );

    // Trả về một Set chứa các biển số xe (plate) từ các cuộc hẹn đó
    return new Set(campaignAppointments.map((appt) => appt.vehicle?.plate));
  }, [appointments, selectedCampaign]);

  const selectedCampaignModelSet = new Set(selectedCampaign?.model || []);

  const filteredVehicles = vehicles.filter(
    (v) =>
      // 1. Lọc theo model
      selectedCampaignModelSet.has(v.model) &&
      (searchQuery === "" ||
        (v.customer.customerName &&
          v.customer.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (v.customer.customerPhone &&
          v.customer.customerPhone.includes(searchQuery)) ||
        (v.plate && v.plate.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const paginatedCampaigns = campaigns.slice(
    campaignPage * CAMPAIGNS_PER_PAGE,
    (campaignPage + 1) * CAMPAIGNS_PER_PAGE
  );

  // THAY ĐỔI 4: Tính total pages từ state 'campaigns'
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
  };

  const handleScheduleAppointment = (vehicle) => {
    setSelectedVehicle(vehicle);
    setScheduleDialogOpen(true);
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
                // THAY ĐỔI 5: Thêm optional chaining (?.) và dùng campaignId
                selectedCampaign?.campaignId === campaign.campaignId
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-card-foreground">
                  {/* THAY ĐỔI 6: Dùng campaignName */}
                  {campaign.campaignName}
                </h4>
                <Badge
                  variant="outline"
                  className={getStatusColor(campaign.status)}
                >
                  {campaign.status}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                  {new Date(campaign.endDate).toLocaleDateString()}
                </p>
                <p>
                  {/* THAY ĐỔI 7: Dùng matchingVehicleCount và completedVehicles */}
                  Vehicles: {campaign.matchingVehicleCount} | Scheduled:{" "}
                  {campaign.completedVehicles || 0}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* THAY ĐỔI 8: Chỉ render Vehicle List nếu đã chọn campaign */}
      {selectedCampaign && (
        <div className="bg-card border border-border rounded-lg">
          {/* Đã xóa border-b theo yêu cầu trước */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                {/* THAY ĐỔI 9: Thêm ?. và dùng campaignName */}
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
            <div className="flex gap-4">
              <div className="relative max-w-[550px] w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by owner, phone, or license plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Đã xóa border bao quanh bảng theo yêu cầu trước */}
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
                    <TableHead className="w-[20%] px-4 py-3">
                      Contacted
                    </TableHead>
                    <TableHead className="w-[20%] px-4 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVehicles.map((vehicle) => (
                    // THAY ĐỔI 10: Giả định vehicle có vehicleId
                    <TableRow key={vehicle.vehicleId}>
                      <TableCell className="px-4 py-3">
                        {/* THAY ĐỔI 11: Giả định là ownerName */}
                        {vehicle.customer.customerName}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {vehicle.plate}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {vehicle.customer.customerPhone}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="m-[5px]">
                          <Checkbox
                            checked={scheduledVehiclePlates.has(vehicle.plate)}
                            disabled={true}
                          />
                        </div>
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
      {/* Kết thúc khối render có điều kiện */}

      <ScheduleAppointmentDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        vehicle={selectedVehicle}
        campaign={selectedCampaign}
      />
    </div>
  );
}

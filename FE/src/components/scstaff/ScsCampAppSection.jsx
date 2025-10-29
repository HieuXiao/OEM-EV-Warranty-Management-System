//FE/src/components/scstaff/ScsCampAppSection.jsx
import { useState, useEffect } from "react"; // <-- THAY ĐỔI: Thêm useEffect
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CreateAppointmentDialog } from "@/components/scstaff/ScsCampAppCreate";
import { EditAppointmentDialog } from "@/components/scstaff/ScsCampAppEdit";
import axiosPrivate from "@/api/axios"; // <-- THAY ĐỔI: Thêm axios

// <-- THAY ĐỔI: Thêm URLs
const APPOINTMENT_URL = "/api/service-appointments";
const CAMPAIGN_URL = "/api/campaigns/all";

export default function AppointmentsSection() {
  const [viewMode, setViewMode] = useState("7days");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("0"); // "0" là giá trị cho "All Campaigns"
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // <-- THAY ĐỔI: Khởi tạo state với mảng rỗng
  const [appointments, setAppointments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // <-- THAY ĐỔI: Hàm tải dữ liệu
  async function fetchAllData() {
    try {
      const [appointmentResponse, campaignResponse] = await Promise.all([
        axiosPrivate.get(APPOINTMENT_URL),
        axiosPrivate.get(CAMPAIGN_URL),
      ]);
      setAppointments(appointmentResponse.data);
      setCampaigns(campaignResponse.data);
    } catch (error) {
      console.error("API Error fetching data:", error);
    }
  }

  // <-- THAY ĐỔI: useEffect để tải dữ liệu khi component mount
  useEffect(() => {
    fetchAllData();
  }, []); // Chạy một lần

  const getDateRange = () => {
    // ... (logic getDateRange của bạn giữ nguyên)
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (viewMode === "7days") {
      const dayOfWeek = start.getDay();
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
    } else if (viewMode === "30days") {
      start.setDate(1);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
    }
    return { start, end };
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date); // Giả sử 'apt.date' là chuỗi ISO datetime

    // Kiểm tra các trường dữ liệu trước khi gọi toLowerCase()
    const customerName = apt.vehicle?.customer?.customerName || "";
    const phone = apt.vehicle?.customer?.customerPhone || "";
    const vin = apt.vehicle?.vin || "";
    const licensePlate = apt.vehicle?.plate || "";

    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      licensePlate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCampaign =
      selectedCampaign === "0" || // Logic "All Campaigns"
      apt.campaign?.campaignId === Number.parseInt(selectedCampaign);

    const matchesStatus =
      selectedStatus === "all" || apt.status === selectedStatus;

    const { start, end } = getDateRange();
    const matchesDateRange = aptDate >= start && aptDate <= end;

    return (
      matchesSearch && matchesCampaign && matchesStatus && matchesDateRange
    );
  });

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  // ... (các hàm handleToday, handlePrevious, handleNext, getDateRangeText, getStatusColor giữ nguyên)
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "7days") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === "30days") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "7days") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === "30days") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    const { start, end } = getDateRange();
    const options = { month: "long", day: "numeric" };
    const startStr = start.toLocaleDateString("en-US", options);
    const endStr = end.toLocaleDateString("en-US", {
      ...options,
      year: end.getFullYear() !== start.getFullYear() ? "numeric" : undefined,
    });

    if (viewMode === "30days") {
      return start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return `${startStr} - ${endStr}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
      case "no-show":
        return "destructive";
      case "rescheduled":
        return "secondary";
      default:
        return "outline";
    }
  };

  const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
    // Giả sử 'apt.date' là một chuỗi ISO đầy đủ (YYYY-MM-DDTHH:MM:SS)
    // Chúng ta chỉ cần phần ngày (YYYY-MM-DD)
    const datePart = apt.date.split("T")[0];
    if (!acc[datePart]) acc[datePart] = [];
    acc[datePart].push(apt);
    return acc;
  }, {});

  const sortedDates = Object.keys(appointmentsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, phone, VIN, or license plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* <-- THAY ĐỔI: Cập nhật Select cho Campaigns --> */}
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                {/* Thêm lựa chọn "All" theo logic state "0" */}
                <SelectItem value="0">All Campaigns</SelectItem>
                {/* Tải các chiến dịch từ API */}
                {campaigns.map((campaign) => (
                  <SelectItem
                    key={campaign.campaignId}
                    value={campaign.campaignId.toString()}
                  >
                    {campaign.campaignName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <-- KẾT THÚC THAY ĐỔI --> */}

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Calendar Controls (Giữ nguyên) */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon-sm" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-card-foreground ml-2">
              {getDateRangeText()}
            </span>
          </div>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <Card className="p-8 text-center">
            {/* ... (Nội dung "No appointments found") ... */}
          </Card>
        ) : (
          sortedDates.map((date) => (
            <div
              key={date}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="bg-muted px-6 py-3 border-b border-border">
                <h4 className="font-semibold text-card-foreground">
                  {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                    // Thêm T00:00:00 để tránh lỗi múi giờ
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
              </div>
              <div className="divide-y divide-border">
                {appointmentsByDate[date]
                  .sort((a, b) => a.date.localeCompare(b.date)) // Sắp xếp theo chuỗi datetime đầy đủ
                  .map((appointment) => {
                    // Trích xuất giờ từ chuỗi datetime
                    const time = new Date(appointment.date).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    );

                    return (
                      <div
                        key={appointment.appointmentId} // Dùng ID duy nhất
                        className="p-6 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-card-foreground">
                                {time}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h5 className="font-semibold text-card-foreground">
                                  {appointment.vehicle?.customer?.customerName}
                                </h5>
                                <Badge
                                  variant={getStatusColor(appointment.status)}
                                >
                                  {appointment.status}
                                </Badge>
                                <Badge variant="outline">
                                  {appointment.campaign?.campaignName}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium">Phone:</span>{" "}
                                  {appointment.vehicle?.customer?.customerPhone}
                                </p>
                                <p>
                                  <span className="font-medium">VIN:</span>{" "}
                                  {appointment.vehicle?.vin}
                                </p>
                                <p>
                                  <span className="font-medium">License:</span>{" "}
                                  {appointment.vehicle?.plate}
                                </p>
                              </div>
                              {appointment.description && ( // Dùng 'description' thay vì 'notes'
                                <div className="flex items-start gap-2 mt-2 p-2 bg-muted rounded text-sm">
                                  <p className="text-muted-foreground">
                                    {appointment.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(appointment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* <-- THAY ĐỔI: Truyền hàm refresh vào Dialog --> */}
      <EditAppointmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        appointment={selectedAppointment}
        onSaveSuccess={fetchAllData}
      />
    </div>
  );
}

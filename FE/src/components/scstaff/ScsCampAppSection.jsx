//FE/src/components/scstaff/ScsCampAppSection.jsx
import { useState, useEffect, useMemo } from "react"; // Xóa useReducer, useCallback
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  AlertCircle, // Giữ lại
  Loader2, // Giữ lại
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
// Xóa import axiosPrivate
// Xóa các hằng số API_URL

// --- XÓA TOÀN BỘ dataFetchReducer và initialState ---

export default function AppointmentsSection({
  campaigns = [], // Nhận props
  appointments = [],
  currentAccount = {},
  onRefreshData, // Nhận hàm refresh
  status, // Nhận status
  error, // Nhận error
}) {
  const [viewMode, setViewMode] = useState("7days");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("0");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // --- XÓA state, dispatch, fetchAllData, useEffect(fetchAllData) ---

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

  const filteredAppointments = useMemo(() => {
    const myCenterId = currentAccount.serviceCenter?.centerId;
    if (!myCenterId) return [];

    return (appointments || []).filter((apt) => {
      const matchesCenter =
        apt.vehicle?.customer?.serviceCenter?.centerId === myCenterId;

      const aptDate = new Date(apt.date);
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
        selectedCampaign === "0" ||
        apt.campaign?.campaignId === Number.parseInt(selectedCampaign);

      const matchesStatus =
        selectedStatus === "all" || apt.status === selectedStatus;

      const { start, end } = getDateRange();
      const matchesDateRange = aptDate >= start && aptDate <= end;

      return (
        matchesCenter &&
        matchesSearch &&
        matchesCampaign &&
        matchesStatus &&
        matchesDateRange
      );
    });
  }, [
    appointments,
    currentAccount,
    searchQuery,
    selectedCampaign,
    selectedStatus,
    currentDate,
    viewMode,
  ]);

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
      case "Scheduled":
        return "default";
      case "Completed":
        return "secondary";
      case "Cancelled":
      case "No-Show": // Sửa lại từ "no-show"
        return "destructive";
      case "Rescheduled":
        return "secondary";
      default:
        return "outline";
    }
  };

  const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
    const datePart = apt.date.split("T")[0];
    if (!acc[datePart]) acc[datePart] = [];
    acc[datePart].push(apt);
    return acc;
  }, {});

  const sortedDates = Object.keys(appointmentsByDate).sort();

  // --- TÁI SỬ DỤNG JSX HIỂN THỊ LOADING/ERROR (y hệt file gốc) ---
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
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Campaigns</SelectItem>
                {(campaigns || []).map((campaign) => (
                  <SelectItem
                    key={campaign.campaignId}
                    value={campaign.campaignId.toString()}
                  >
                    {campaign.campaignName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No-Show">No Show</SelectItem>
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

      {/* --- THÊM LẠI LOGIC HIỂN THỊ LOADING/ERROR --- */}
      {status === "loading" && (
        <Card className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading appointments...</p>
        </Card>
      )}

      {status === "error" && (
        <Card className="p-8 text-center text-destructive">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Error loading data</p>
          <p className="text-sm">{error}</p>
        </Card>
      )}

      {/* Appointment List (Chỉ render khi success) */}
      {status === "success" && (
        <div className="space-y-4">
          {sortedDates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No appointments found for this date range and filter.
              </p>
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
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h4>
                </div>
                <div className="divide-y divide-border">
                  {appointmentsByDate[date]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((appointment) => {
                      const time = new Date(
                        appointment.date
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });

                      return (
                        <div
                          key={appointment.appointmentId}
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
                                    {
                                      appointment.vehicle?.customer
                                        ?.customerName
                                    }
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
                                    {
                                      appointment.vehicle?.customer
                                        ?.customerPhone
                                    }
                                  </p>
                                  <p>
                                    <span className="font-medium">VIN:</span>{" "}
                                    {appointment.vehicle?.vin}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      License:
                                    </span>{" "}
                                    {appointment.vehicle?.plate}
                                  </p>
                                </div>
                                {appointment.description && (
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
      )}

      <EditAppointmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        appointment={selectedAppointment}
        onSaveSuccess={onRefreshData} // Dùng hàm refresh từ props
      />
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

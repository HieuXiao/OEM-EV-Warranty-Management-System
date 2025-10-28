"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosPrivate from "@/api/axios"; // <-- THÊM MỚI

// URL của API
const APPOINTMENT_URL = "/api/service-appointments";

const statusOptions = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "No-Show", label: "No Show" },
  { value: "Rescheduled", label: "Rescheduled" },
];

// Hàm helper để chuyển đổi chuỗi ISO (từ BE) sang chuỗi cho input datetime-local
const formatDateTimeForInput = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    // Trừ đi phần chênh lệch múi giờ để `toISOString` phản ánh đúng giờ địa phương
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    // Trả về 16 ký tự đầu tiên (YYYY-MM-DDTHH:MM)
    return d.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Invalid date string:", isoString);
    return "";
  }
};

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSaveSuccess, // <-- THÊM MỚI: Nhận hàm refresh
}) {
  // --- CẬP NHẬT STATE ---
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm state tải
  // --- KẾT THÚC CẬP NHẬT ---

  useEffect(() => {
    if (appointment) {
      // Cập nhật để dùng state và định dạng mới
      setDateTime(formatDateTimeForInput(appointment.date));
      setStatus(appointment.status);
      setDescription(appointment.description || ""); // Dùng 'description'
    }
  }, [appointment]); // Chỉ chạy khi 'appointment' thay đổi

  const handleSave = async () => {
    if (!appointment) return;

    setIsLoading(true);
    try {
      // Dữ liệu payload để gửi lên API
      const updatedData = {
        date: dateTime,
        description: description,
      };

      // Gọi API PUT
      await axiosPrivate.put(
        `${APPOINTMENT_URL}/${appointment.appointmentId}`,
        updatedData
      );

      await axiosPrivate.put(
        `${APPOINTMENT_URL}/${appointment.appointmentId}/status`,
        null,
        { params: { status: status } }
      );

      // Gọi hàm refresh của cha
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      console.error("Failed to update appointment:", error);
      alert("Error saving appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details and status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* --- CẬP NHẬT JSX: Dùng cấu trúc dữ liệu API --- */}
          <div className="space-y-2">
            <Label>Customer Information</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Customer:</span>{" "}
                {appointment.vehicle?.customer?.customerName}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {appointment.vehicle?.customer?.customerPhone}
              </p>
              <p>
                <span className="text-muted-foreground">VIN:</span>{" "}
                {appointment.vehicle?.vin}
              </p>
              <p>
                <span className="text-muted-foreground">License:</span>{" "}
                {appointment.vehicle?.plate}
              </p>
            </div>
          </div>

          {/* --- CẬP NHẬT JSX: Dùng datetime-local --- */}
          <div className="space-y-2">
            <Label htmlFor="edit-datetime">Date and Time</Label>
            <Input
              id="edit-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          {/* --- KẾT THÚC CẬP NHẬT --- */}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue value={status} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* --- CẬP NHẬT JSX: Dùng 'description' --- */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Notes)</Label>
            <Textarea
              id="edit-description"
              placeholder="Add notes about no-show, late arrival, rescheduling, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          {/* --- KẾT THÚC CẬP NHẬT --- */}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {/* Cập nhật nút Save */}
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

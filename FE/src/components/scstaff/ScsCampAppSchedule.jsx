import { useState } from "react";
import { Calendar } from "lucide-react";
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
import axiosPrivate from "@/api/axios";

const APPOINTMENT_URL = "/api/service-appointments";

// Hàm helper để lấy thời gian hiện tại theo múi giờ địa phương
// ở định dạng YYYY-MM-DDTHH:MM cho input "min"
const getLocalISOString = () => {
  const now = new Date();
  // Trừ đi phần chênh lệch múi giờ để `toISOString` phản ánh đúng giờ địa phương
  // thay vì giờ UTC
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  // Trả về 16 ký tự đầu tiên (YYYY-MM-DDTHH:MM)
  return now.toISOString().slice(0, 16);
};

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  vehicle,
  campaign,
  onScheduleSuccess,
}) {
  // --- THAY ĐỔI: Hợp nhất state ---
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  // --- KẾT THÚC THAY ĐỔI ---

  const handleSchedule = async (e) => {
    try {
      const newAppointment = {
        vin: vehicle.vin,
        campaignId: campaign.campaignId,
        date: dateTime, // <-- THAY ĐỔI: Gửi giá trị datetime
        description: notes,
      };

      const response = await axiosPrivate.post(APPOINTMENT_URL, newAppointment);
      onOpenChange(false);
      // --- THAY ĐỔI: Reset state ---
      setDateTime("");
      setNotes("");
      if (onScheduleSuccess) {
        onScheduleSuccess();
      }
      // --- KẾT THÚC THAY ĐỔI ---
    } catch (error) {
      console.error("API Error: " + error.message);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Schedule a warranty service appointment for {vehicle.owner}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Customer Information</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Owner:</span>{" "}
                {vehicle.customer.customerName}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {vehicle.customer.customerPhone}
              </p>
              <p>
                <span className="text-muted-foreground">VIN:</span>{" "}
                {vehicle.vin}
              </p>
              <p>
                <span className="text-muted-foreground">License:</span>{" "}
                {vehicle.plate}
              </p>
            </div>
          </div>

          {/* --- THAY ĐỔI: Sử dụng input datetime-local --- */}
          <div className="space-y-2">
            <Label htmlFor="datetime">Date and Time</Label>
            <Input
              id="datetime"
              type="datetime-local" // <-- Đổi type
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={getLocalISOString()} // <-- Ngăn chọn ngày giờ quá khứ
            />
          </div>
          {/* --- KẾT THÚC THAY ĐỔI --- */}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special notes or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {/* CẬP NHẬT: Vô hiệu hóa nếu dateTime rỗng */}
          <Button onClick={handleSchedule} disabled={!dateTime}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

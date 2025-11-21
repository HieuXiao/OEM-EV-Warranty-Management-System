// FE/src/components/scstaff/ScsCampAppSchedule.jsx
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

const getLocalISOString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  vehicle,
  campaign,
  onScheduleSuccess,
}) {
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSchedule = async (e) => {
    try {
      const newAppointment = {
        vin: vehicle.vin,
        campaignId: campaign.campaignId,
        date: dateTime,
        description: notes,
      };

      await axiosPrivate.post(APPOINTMENT_URL, newAppointment);
      onOpenChange(false);
      setDateTime("");
      setNotes("");
      if (onScheduleSuccess) {
        onScheduleSuccess();
      }
    } catch (error) {
      console.error("API Error: " + error.message);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* CHỈNH SỬA: w-[95vw] cho mobile, max-h-[90vh] để cuộn */}
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Schedule a warranty service appointment for {vehicle.owner}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Customer Information</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm break-words">
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
                <span className="font-mono text-xs">{vehicle.vin}</span>
              </p>
              <p>
                <span className="text-muted-foreground">License:</span>{" "}
                {vehicle.plate}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Date and Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={getLocalISOString()}
            />
          </div>

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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!dateTime}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

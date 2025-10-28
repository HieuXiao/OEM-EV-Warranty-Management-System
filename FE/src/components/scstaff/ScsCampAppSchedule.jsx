import { useState } from "react";
import { AlertTriangle, Calendar } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosPrivate from "@/api/axios";

const APPOINTMENT_URL = "/api/service-appointments";

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  vehicle,
  campaign,
}) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleSchedule = async (e) => {
    try {
      const newAppointment = {
        vin: vehicle.vin,
        campaignId: campaign.campaignId,
        date: date,
        description: notes,
      };

      const response = await axiosPrivate.post(APPOINTMENT_URL, newAppointment);

      alert(
        `Appointment scheduled for ${vehicle?.customer?.customerName} on ${date}`
      );
      onOpenChange(false);
      setDate("");
      setNotes("");
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

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!date}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

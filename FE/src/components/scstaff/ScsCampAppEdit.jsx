// FE/src/components/scstaff/ScsCampAppEdit.jsx
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
import axiosPrivate from "@/api/axios";

const APPOINTMENT_URL = "/api/service-appointments";

const statusOptions = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "No-Show", label: "No Show" },
  { value: "Rescheduled", label: "Rescheduled" },
];

const formatDateTimeForInput = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
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
  onSaveSuccess,
}) {
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setDateTime(formatDateTimeForInput(appointment.date));
      setStatus(appointment.status);
      setDescription(appointment.description || "");
    }
  }, [appointment]);

  const handleSave = async () => {
    if (!appointment) return;

    setIsLoading(true);
    try {
      const updatedData = {
        date: dateTime,
        description: description,
      };

      await axiosPrivate.put(
        `${APPOINTMENT_URL}/${appointment.appointmentId}`,
        updatedData
      );

      await axiosPrivate.put(
        `${APPOINTMENT_URL}/${appointment.appointmentId}/status`,
        null,
        { params: { status: status } }
      );

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onOpenChange(false);
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
      {/* CHỈNH SỬA: w-[95vw] cho mobile, max-h-[90vh] để cuộn */}
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details and status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Customer Information</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm break-words">
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
                <span className="font-mono text-xs">
                  {appointment.vehicle?.vin}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">License:</span>{" "}
                {appointment.vehicle?.plate}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-datetime">Date and Time</Label>
            <Input
              id="edit-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Notes)</Label>
            <Textarea
              id="edit-description"
              placeholder="Add notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

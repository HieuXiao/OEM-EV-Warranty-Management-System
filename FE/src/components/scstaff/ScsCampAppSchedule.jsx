//FE/src/components/scstaff/ScsCampAppSchedule.jsx
import { useState } from "react"
import { AlertTriangle, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock existing appointments for conflict detection
const existingAppointments = [
  { date: "2024-01-20", time: "09:00", customer: "Nguyen Van D" },
  { date: "2024-01-20", time: "14:00", customer: "Tran Thi E" },
]

export function ScheduleAppointmentDialog({ open, onOpenChange, vehicle }) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [conflict, setConflict] = useState(null)

  const checkConflict = (selectedDate, selectedTime) => {
    const conflictingAppointment = existingAppointments.find(
      (apt) => apt.date === selectedDate && apt.time === selectedTime
    )
    setConflict(conflictingAppointment || null)
  }

  const handleDateChange = (newDate) => {
    setDate(newDate)
    if (time) checkConflict(newDate, time)
  }

  const handleTimeChange = (newTime) => {
    setTime(newTime)
    if (date) checkConflict(date, newTime)
  }

  const handleSchedule = () => {
    alert(`Appointment scheduled for ${vehicle?.owner} on ${date} at ${time}`)
    onOpenChange(false)
    setDate("")
    setTime("")
    setNotes("")
    setConflict(null)
  }

  if (!vehicle) return null

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
                <span className="text-muted-foreground">Owner:</span> {vehicle.owner}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span> {vehicle.phone}
              </p>
              <p>
                <span className="text-muted-foreground">VIN:</span> {vehicle.vin}
              </p>
              <p>
                <span className="text-muted-foreground">License:</span> {vehicle.licensePlate}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>
          </div>

          {conflict && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Time slot conflict! {conflict.customer} already has an appointment at{" "}
                {conflict.time} on {conflict.date}. You can still proceed or choose a different
                time.
              </AlertDescription>
            </Alert>
          )}

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
          <Button onClick={handleSchedule} disabled={!date || !time}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

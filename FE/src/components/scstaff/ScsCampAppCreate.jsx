"use client"

import { useState } from "react"
import { Calendar, AlertTriangle } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { campaigns } from "@/lib/Mock-data"

export function CreateAppointmentDialog({ open, onOpenChange }) {
  const [campaignId, setCampaignId] = useState("")
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [vin, setVin] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
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

  const handleCreate = () => {
    alert(`Appointment created for ${customer}`)
    onOpenChange(false)

    // Reset form
    setCampaignId("")
    setCustomer("")
    setPhone("")
    setVin("")
    setLicensePlate("")
    setDate("")
    setTime("")
    setNotes("")
    setConflict(null)
  }

  const isFormValid = campaignId && customer && phone && vin && licensePlate && date && time

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogDescription>Schedule a new warranty service appointment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign *</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger id="campaign">
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                placeholder="Enter customer name"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN *</Label>
              <Input
                id="vin"
                placeholder="VF8A1234567890123"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License Plate *</Label>
              <Input
                id="license"
                placeholder="29A-12345"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
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
                Time slot conflict! {conflict.customer} already has an appointment at {conflict.time} on {conflict.date}.
                You can still proceed or choose a different time.
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
          <Button onClick={handleCreate} disabled={!isFormValid}>
            <Calendar className="w-4 h-4 mr-2" />
            Create Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

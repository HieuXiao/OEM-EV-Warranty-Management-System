//FE/src/components/scstaff/ScsCampAppSection.jsx
import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { CreateAppointmentDialog } from "@/components/scstaff/ScsCampAppCreate"
import { EditAppointmentDialog } from "@/components/scstaff/ScsCampAppEdit"
import { mockAppointments } from "@/lib/Mock-data"
import { campaigns } from "@/lib/Mock-data"

export default function AppointmentsSection() {
  const [viewMode, setViewMode] = useState("7days")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState("0")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState(mockAppointments)

  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewMode === "day") {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (viewMode === "7days") {
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    } else if (viewMode === "week") {
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    } else if (viewMode === "month") {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
    }

    return { start, end }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery) ||
      apt.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCampaign = selectedCampaign === "0" || apt.campaignId === Number.parseInt(selectedCampaign)
    const matchesStatus = selectedStatus === "all" || apt.status === selectedStatus

    const aptDate = new Date(apt.date + "T00:00:00")
    const { start, end } = getDateRange()
    const matchesDateRange = aptDate >= start && aptDate <= end

    return matchesSearch && matchesCampaign && matchesStatus && matchesDateRange
  })

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment)
    setEditDialogOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      setAppointments(appointments.filter((apt) => apt.id !== id))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === "week" || viewMode === "7days") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === "week" || viewMode === "7days") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDateRangeText = () => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", options)
    } else if (viewMode === "7days") {
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + 6)
      return `${currentDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${startOfWeek.toLocaleDateString("en-US", options)} - ${endOfWeek.toLocaleDateString("en-US", options)}`
    } else {
      return currentDate.toLocaleDateString("en-US", { year: "numeric", month: "long" })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "outline"
      case "no-show":
        return "destructive"
      case "rescheduled":
        return "secondary"
      default:
        return "outline"
    }
  }

  const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) acc[apt.date] = []
    acc[apt.date].push(apt)
    return acc
  }, {})

  const sortedDates = Object.keys(appointmentsByDate).sort()

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
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">{getDateRangeText()}</h3>
          </div>

          <div className="flex gap-2">
            {["day", "7days", "week", "month"].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(mode)}
              >
                {mode === "7days" ? "7 Days" : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No appointments in this period</h3>
            <p className="text-muted-foreground mb-4">
              There are no appointments scheduled for the selected{" "}
              {viewMode === "day" ? "day" : viewMode === "7days" ? "7 days" : viewMode === "week" ? "week" : "month"}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Appointment
            </Button>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="bg-card border border-border rounded-lg overflow-hidden">
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
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold text-card-foreground">{appointment.time}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h5 className="font-semibold text-card-foreground">{appointment.customer}</h5>
                              <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              <Badge variant="outline">{appointment.campaignName}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium">Phone:</span> {appointment.phone}
                              </p>
                              <p>
                                <span className="font-medium">VIN:</span> {appointment.vin}
                              </p>
                              <p>
                                <span className="font-medium">License:</span> {appointment.licensePlate}
                              </p>
                            </div>
                            {appointment.notes && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-muted rounded text-sm">
                                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(appointment.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      <CreateAppointmentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <EditAppointmentDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} appointment={selectedAppointment} />
    </div>
  )
}

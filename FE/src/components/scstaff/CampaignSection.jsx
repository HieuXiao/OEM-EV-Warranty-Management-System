"use client"

import { useState } from "react"
import { Download, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScheduleAppointmentDialog } from "@/components/scstaff/schedule-appointment-dialog"

// Mock data
const campaigns = [
  {
    id: 1,
    name: "Battery Recall 2024",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    totalVehicles: 245,
    contacted: 180,
    scheduled: 120,
  },
  {
    id: 2,
    name: "Software Update Campaign",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-05-31",
    totalVehicles: 156,
    contacted: 98,
    scheduled: 67,
  },
  {
    id: 3,
    name: "Brake System Inspection",
    status: "completed",
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    totalVehicles: 312,
    contacted: 312,
    scheduled: 298,
  },
]

const vehicles = [
  {
    id: 1,
    campaignId: 1,
    vin: "VF8A1234567890123",
    licensePlate: "29A-12345",
    owner: "Nguyen Van A",
    phone: "0901234567",
    model: "VF8",
    year: 2023,
    status: "pending",
  },
  {
    id: 2,
    campaignId: 1,
    vin: "VF8B9876543210987",
    licensePlate: "30B-67890",
    owner: "Tran Thi B",
    phone: "0912345678",
    model: "VF8",
    year: 2023,
    status: "scheduled",
  },
  {
    id: 3,
    campaignId: 1,
    vin: "VF9C1122334455667",
    licensePlate: "51C-11223",
    owner: "Le Van C",
    phone: "0923456789",
    model: "VF9",
    year: 2024,
    status: "contacted",
  },
]

export function CampaignsSection() {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.campaignId === selectedCampaign.id &&
      (statusFilter === "all" || v.status === statusFilter) &&
      (v.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleScheduleAppointment = (vehicle) => {
    setSelectedVehicle(vehicle)
    setScheduleDialogOpen(true)
  }

  const handleExportExcel = () => {
    alert("Exporting campaign data to Excel...")
  }

  return (
    <div className="space-y-6">
      {/* Campaign Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Select Campaign</h3>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => setSelectedCampaign(campaign)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedCampaign.id === campaign.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-card-foreground">{campaign.name}</h4>
                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {campaign.startDate} - {campaign.endDate}
                </p>
                <p>
                  Vehicles: {campaign.totalVehicles} | Scheduled: {campaign.scheduled}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Vehicles - {selectedCampaign.name}</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by owner, phone, VIN, or license plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>VIN</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-mono text-sm">{vehicle.vin}</TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.owner}</TableCell>
                <TableCell>{vehicle.phone}</TableCell>
                <TableCell>
                  {vehicle.model} {vehicle.year}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vehicle.status === "scheduled"
                        ? "default"
                        : vehicle.status === "contacted"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => handleScheduleAppointment(vehicle)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ScheduleAppointmentDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        vehicle={selectedVehicle}
      />
    </div>
  )
}

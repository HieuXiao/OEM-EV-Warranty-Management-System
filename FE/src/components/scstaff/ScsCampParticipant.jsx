// FE/src/components/scstaff/ScsCampParticipant.jsx
import { useState } from "react"
import { Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScheduleAppointmentDialog } from "@/components/scstaff/ScsCampAppSchedule"
import { campaignsDetail } from "@/lib/Mock-data"
import { vehicles } from "@/lib/Mock-data"

export default function CampaignsSection() {
  const [selectedCampaign, setSelectedCampaign] = useState(campaignsDetail[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [campaignPage, setCampaignPage] = useState(0)
  const [vehiclePage, setVehiclePage] = useState(0)
  const [contactedVehicles, setContactedVehicles] = useState(new Set())

  const CAMPAIGNS_PER_PAGE = 3
  const VEHICLES_PER_PAGE = 10

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.campaignId === selectedCampaign.id &&
      (statusFilter === "all" || v.status === statusFilter) &&
      (v.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const paginatedCampaigns = campaignsDetail.slice(
    campaignPage * CAMPAIGNS_PER_PAGE,
    (campaignPage + 1) * CAMPAIGNS_PER_PAGE,
  )
  const totalCampaignPages = Math.ceil(campaignsDetail.length / CAMPAIGNS_PER_PAGE)

  const paginatedVehicles = filteredVehicles.slice(
    vehiclePage * VEHICLES_PER_PAGE,
    (vehiclePage + 1) * VEHICLES_PER_PAGE,
  )
  const totalVehiclePages = Math.ceil(filteredVehicles.length / VEHICLES_PER_PAGE)

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign)
    setVehiclePage(0)
  }

  const handleScheduleAppointment = (vehicle) => {
    setSelectedVehicle(vehicle)
    setScheduleDialogOpen(true)
  }

  const handleContactedToggle = (vehicleId) => {
    const newContacted = new Set(contactedVehicles)
    if (newContacted.has(vehicleId)) {
      newContacted.delete(vehicleId)
    } else {
      newContacted.add(vehicleId)
    }
    setContactedVehicles(newContacted)
  }

  return (
    <div className="space-y-6">
      {/* Campaign Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Select Campaign</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCampaignPage(Math.max(0, campaignPage - 1))}
              variant="outline"
              size="sm"
              disabled={campaignPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {campaignPage + 1} / {totalCampaignPages}
            </span>
            <Button
              onClick={() => setCampaignPage(Math.min(totalCampaignPages - 1, campaignPage + 1))}
              variant="outline"
              size="sm"
              disabled={campaignPage === totalCampaignPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paginatedCampaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => handleCampaignSelect(campaign)}
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setVehiclePage(Math.max(0, vehiclePage - 1))}
                variant="outline"
                size="sm"
                disabled={vehiclePage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {vehiclePage + 1} / {totalVehiclePages}
              </span>
              <Button
                onClick={() => setVehiclePage(Math.min(totalVehiclePages - 1, vehiclePage + 1))}
                variant="outline"
                size="sm"
                disabled={vehiclePage === totalVehiclePages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by owner, phone, or license plate..."
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

        <div className="mx-6 mb-6 border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="w-12 text-center">Contacted</TableHead>
                  <TableHead className="pr-2">Actions</TableHead> */}
                  <TableHead>Contacted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.owner}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{vehicle.phone}</TableCell>
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
                    {/* <TableCell className="w-12">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={contactedVehicles.has(vehicle.id)}
                          onCheckedChange={() => handleContactedToggle(vehicle.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="pr-2">
                      <Button size="sm" variant="outline" onClick={() => handleScheduleAppointment(vehicle)}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                    </TableCell> */}
                    <TableCell>
                      <div className="m-[5px]">
                        <Checkbox
                          checked={contactedVehicles.has(vehicle.id)}
                          onCheckedChange={() => handleContactedToggle(vehicle.id)}
                        />
                      </div>
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
        </div>
      </div>

      <ScheduleAppointmentDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        vehicle={selectedVehicle}
      />
    </div>
  )
}

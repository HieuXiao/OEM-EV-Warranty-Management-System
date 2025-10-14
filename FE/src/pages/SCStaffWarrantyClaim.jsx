"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Eye, Plus, ArrowUpDown, Calendar } from "lucide-react"
import SCStaffSidebar from "@/components/scstaff/SCStaffSidebar"
import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { mockWarrantyClaims, vehicleModels, mockUsers } from "@/lib/Mock-data"

const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in progress": "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-gray-100 text-gray-700 border-gray-300",
    medium: "bg-orange-100 text-orange-700 border-orange-300",
    high: "bg-red-100 text-red-700 border-red-300",
  }
  return colors[priority] || "bg-gray-100 text-gray-700 border-gray-300"
}

const getStatisticsClaims = (dateFrom, dateTo) => {
  return mockWarrantyClaims.filter((claim) => {
    const claimDate = new Date(claim.createdAt)
    const matchesDateFrom = !dateFrom || claimDate >= new Date(dateFrom)
    const matchesDateTo = !dateTo || claimDate <= new Date(dateTo + "T23:59:59")
    return matchesDateFrom && matchesDateTo
  })
}

const getDefaultDateFrom = () => {
  const date = new Date()
  date.setDate(date.getDate() - 10)
  return date.toISOString().split("T")[0]
}

const getDefaultDateTo = () => {
  return new Date().toISOString().split("T")[0]
}

export default function SCStaffWarrantyClaim() {
  const [currentUser] = useState({
    name: "Tran Thi B",
    role: "SC Staff",
    serviceCenter: "SC Hanoi Central",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom())
  const [dateTo, setDateTo] = useState(getDefaultDateTo())
  const [vehicleModelFilter, setVehicleModelFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [newClaimTechnician, setNewClaimTechnician] = useState("")

  const scTechnicians = mockUsers.filter((user) => user.role === "sc_technician")

  const statisticsClaims = getStatisticsClaims(dateFrom, dateTo)
  const totalClaims = statisticsClaims.length
  const pendingClaims = statisticsClaims.filter((claim) => claim.status === "pending").length
  const inProgressClaims = statisticsClaims.filter((claim) => claim.status === "in progress").length
  const completedClaims = statisticsClaims.filter((claim) => claim.status === "completed").length

  useEffect(() => {
    document.title = `Warranty`
  }, [])

  const handleSetToday = () => {
    setDateFrom(getDefaultDateFrom())
    setDateTo(getDefaultDateTo())
  }

  const filteredClaims = mockWarrantyClaims
    .filter((claim) => {
      const matchesSearch =
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || claim.status === statusFilter

      const matchesVehicleModel = vehicleModelFilter === "all" || claim.vehicleModel === vehicleModelFilter

      const claimDate = new Date(claim.createdAt)
      const matchesDateFrom = !dateFrom || claimDate >= new Date(dateFrom)
      const matchesDateTo = !dateTo || claimDate <= new Date(dateTo + "T23:59:59")

      return matchesSearch && matchesStatus && matchesVehicleModel && matchesDateFrom && matchesDateTo
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "priority-high":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "priority-low":
          const priorityOrderLow = { high: 3, medium: 2, low: 1 }
          return priorityOrderLow[a.priority] - priorityOrderLow[b.priority]
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim)
    setIsDialogOpen(true)
  }

  const handleMarkComplete = () => {
    console.log("[v0] Marking claim as complete:", selectedClaim?.claimNumber)
    setIsDialogOpen(false)
  }

  const handleCreateClaim = () => {
    setIsCreateDialogOpen(true)
  }

  const handleSubmitNewClaim = (e) => {
    e.preventDefault()
    console.log("[v0] Creating new warranty claim with technician:", newClaimTechnician)
    setIsCreateDialogOpen(false)
    setNewClaimTechnician("")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSidebar name={currentUser.name} role={currentUser.role} />

      <div className="lg:pl-64">
        <Header name={currentUser.name} email={"tranthib@sc.com"} />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClaims}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingClaims}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressClaims}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active claims</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedClaims}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully resolved</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim number, plate, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateClaim} className="bg-black hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="date-from" className="text-sm font-medium whitespace-nowrap">
                  From:
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[160px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="date-to" className="text-sm font-medium whitespace-nowrap">
                  To:
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[160px]"
                />
              </div>

              <Button variant="outline" size="sm" onClick={handleSetToday} className="gap-2 bg-transparent">
                <Calendar className="h-4 w-4" />
                Today
              </Button>

              <Select value={vehicleModelFilter} onValueChange={setVehicleModelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="priority-high">Priority (High to Low)</SelectItem>
                  <SelectItem value="priority-low">Priority (Low to High)</SelectItem>
                  <SelectItem value="status">Status (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredClaims.length} of {totalClaims} claims
              </p>
            </div>

            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <Card key={claim.claimNumber} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{claim.claimNumber}</h3>
                          <Badge variant="outline" className={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(claim.priority)}>
                            {claim.priority}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Vehicle: </span>
                            <span className="font-medium">
                              {claim.vehicleModel} - {claim.vehiclePlate}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Customer: </span>
                            <span className="font-medium">{claim.customerName}</span>
                            <span className="block text-muted-foreground text-xs mt-1">{claim.customerPhone}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => handleViewClaim(claim)} className="ml-4">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{selectedClaim?.claimNumber}</DialogTitle>
              <Badge variant="outline" className={getStatusColor(selectedClaim?.status)}>
                {selectedClaim?.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Warranty claim details and actions</p>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Vehicle</h4>
                  <p className="font-medium">
                    {selectedClaim.vehicleModel} - {selectedClaim.vehiclePlate}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                  <p className="font-medium">{selectedClaim.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedClaim.customerPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Service Center</h4>
                  <p className="font-medium">{selectedClaim.serviceCenter}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Kilometers</h4>
                  <p className="font-medium">{selectedClaim.kilometers.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Priority</h4>
                  <Badge variant="outline" className={getPriorityColor(selectedClaim.priority)}>
                    {selectedClaim.priority}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                  <p className="font-medium">{selectedClaim.createdAt}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Assigned Technician</h4>
                  <p className="font-medium">
                    {selectedClaim.assignedTechnician || (
                      <span className="text-muted-foreground italic">Not assigned yet</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Issue Description</h4>
                <p className="text-sm">{selectedClaim.issueDescription}</p>
              </div>

              {selectedClaim.estimatedCost && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Estimated Cost</h4>
                  <p className="text-lg font-semibold">{selectedClaim.estimatedCost.toLocaleString()} VND</p>
                </div>
              )}

              <Button onClick={handleMarkComplete} className="w-full bg-black hover:bg-gray-800 text-white">
                Mark Complete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Warranty Claim</DialogTitle>
            <p className="text-sm text-muted-foreground">Fill in the details to create a new warranty claim</p>
          </DialogHeader>

          <form onSubmit={handleSubmitNewClaim} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Created By (SC Staff)</label>
                <Input value={currentUser.name} disabled className="bg-muted" />
              </div>
 
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Phone</label>
                <Input placeholder="e.g., 0901234567" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input placeholder="Enter customer name" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Plate</label>
                <Input placeholder="e.g., 30A-12345" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Model</label>
                <Select required>
                  <SelectTrigger
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <SelectValue placeholder="Select vehicle model" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to Technician</label>
                <Select value={newClaimTechnician} onValueChange={setNewClaimTechnician} required>
                  <SelectTrigger
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {scTechnicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.name}>
                        {tech.name}
                      </SelectItem>
                    ))} 
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Previous Warranty Count</label>
                <Input placeholder="e.g., 01;02;10,.." required/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Description</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="Describe the issue in detail..."
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                Create Claim
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

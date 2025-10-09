"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ShieldAlert, Clock, TriangleAlert, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { mockWarrantyClaims, mockParts, mockUsers } from "@/lib/Mock-data"
import { mockRecallCampaigns } from "@/lib/Mock-data"
import { Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const getSeverityColor = (severity) => {
  const colors = {
    low: "bg-gray-100 text-gray-700 border-gray-300",
    medium: "bg-orange-100 text-orange-700 border-orange-300",
    high: "bg-red-100 text-red-700 border-red-300",
  }
  return colors[severity] || "bg-gray-100 text-gray-700 border-gray-300"
}

export default function SCStaffCampaignSummary() {
  const [searchQuery, setSearchQuery] = useState("")
  const totalClaims = mockWarrantyClaims.length
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [viewingCampaign, setViewingCampaign] = useState(null)

  const filteredCampaigns = mockRecallCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.campaignNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesSeverity = severityFilter === "all" || campaign.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  const pendingClaims = mockWarrantyClaims.filter((c) => c.status === "pending").length
  const inProgressClaims = mockWarrantyClaims.filter((c) => c.status === "in_progress").length
  const completedClaims = mockWarrantyClaims.filter((c) => c.status === "completed").length
  const totalParts = mockParts.reduce((sum, p) => sum + p.stock, 0)
  const lowStockParts = mockParts.filter((p) => p.status === "low_stock").length
  const activeUsers = mockUsers.filter((u) => u.status === "active").length

  const handleViewCampaign = (campaign) => {
    setViewingCampaign(campaign)
  }

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "in_progress":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "low":
        return "bg-gray-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "urgent":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <>
      {/* ====== HEADER SUMMARY ====== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ===CARD 1: Total Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaign</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
          </CardContent>
        </Card>
        {/* ===CARD 2: Active Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaign</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressClaims}</div>
          </CardContent>
        </Card>
        {/* ===CARD 3: Pending Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Campaign</CardTitle>
            <TriangleAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClaims}</div>
          </CardContent>
        </Card>
        {/* ===CARD 4: Complete Campaign=== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Campaign</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedClaims}</div>
          </CardContent>
        </Card>
      </div>

      {/* ===== BODY SUMMMARY ===== */}
      <Card>
        {/* SECTION 1 - BODY */}
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>Campaign detatails and process</CardDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Campaign..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Severity Filter */}
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* SECTION 2 - BODY */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.campaignNumber} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{campaign.campaignNumber}</h3>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline" className={getSeverityColor(campaign.severity)}>
                        {campaign.severity}
                      </Badge>
                    </div>

                    <h4 className="font-medium mb-2">{campaign.title}</h4>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Affected Models: </span>
                        <span className="font-medium">{campaign.affectedModels.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start Date: </span>
                        <span className="font-medium">{new Date(campaign.startDate).toLocaleDateString()}</span>
                      </div>
                      {/* <div>
                        <span className="text-muted-foreground">Affected Vehicles: </span>
                        <span className="font-medium">{campaign.affectedVehicles.toLocaleString()}</span>
                      </div> */}
                      {/* <div>
                        <span className="text-muted-foreground">Completed: </span>
                        <span className="font-medium">{campaign.completedVehicles.toLocaleString()}</span>
                      </div> */}
                    </div>

                    {/* <p className="text-sm text-muted-foreground">{campaign.description}</p> */}

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{campaign.completedVehicles.toLocaleString()}/{campaign.affectedVehicles.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(campaign.completedVehicles / campaign.affectedVehicles) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => handleViewCampaign(campaign)} className="ml-4">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={!!viewingCampaign} onOpenChange={(open) => !open && setViewingCampaign(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Campaign Details</DialogTitle>
            <DialogDescription>Complete information about this recall campaign</DialogDescription>
          </DialogHeader>

          {viewingCampaign && (
            <div className="space-y-6 py-4">
              {/* Campaign Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">{viewingCampaign.campaignNumber}</h3>
                  <Badge variant="outline" className={getStatusColor(viewingCampaign.status)}>
                    {viewingCampaign.status}
                  </Badge>
                  <Badge variant="outline" className={getSeverityColor(viewingCampaign.severity)}>
                    {viewingCampaign.severity}
                  </Badge>
                </div>
                <h4 className="text-lg font-semibold text-muted-foreground">{viewingCampaign.title}</h4>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Description</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{viewingCampaign.description}</p>
              </div>

              {/* Campaign Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(viewingCampaign.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {viewingCampaign.endDate
                      ? new Date(viewingCampaign.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Ongoing"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Affected Vehicles</p>
                  <p className="font-medium text-lg">{viewingCampaign.affectedVehicles.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Completed Repairs</p>
                  <p className="font-medium text-lg">{viewingCampaign.completedVehicles.toLocaleString()}</p>
                </div>
              </div>

              {/* Affected Models */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Affected Models</h5>
                <div className="flex flex-wrap gap-2">
                  {viewingCampaign.affectedModels.map((model, index) => (
                    <Badge key={index} variant="secondary">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-sm">Completion Progress</h5>
                  <span className="text-sm font-medium">
                    {Math.round((viewingCampaign.completedVehicles / viewingCampaign.affectedVehicles) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(viewingCampaign.completedVehicles / viewingCampaign.affectedVehicles) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{viewingCampaign.completedVehicles.toLocaleString()} completed</span>
                  <span>
                    {(viewingCampaign.affectedVehicles - viewingCampaign.completedVehicles).toLocaleString()} remaining
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              {viewingCampaign.remedy && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Remedy</h5>
                  <p className="text-sm text-muted-foreground">{viewingCampaign.remedy}</p>
                </div>
              )}

              {viewingCampaign.estimatedRepairTime && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estimated Repair Time</p>
                  <p className="font-medium">{viewingCampaign.estimatedRepairTime}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingCampaign(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

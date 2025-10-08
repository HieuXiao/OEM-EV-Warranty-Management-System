"use client"

import { useState } from "react"
import { Search, Filter, Eye } from "lucide-react"
import SCStaffSidebar from "@/components/SCStaffSidebar"
import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockRecallCampaigns } from "@/lib/Mock-data"
import profile from "../assets/profile.jpg"

const getStatusColor = (status) => {
  const colors = {
    active: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    planned: "bg-gray-100 text-gray-800 border-gray-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

const getSeverityColor = (severity) => {
  const colors = {
    low: "bg-gray-100 text-gray-700 border-gray-300",
    medium: "bg-orange-100 text-orange-700 border-orange-300",
    high: "bg-red-100 text-red-700 border-red-300",
  }
  return colors[severity] || "bg-gray-100 text-gray-700 border-gray-300"
}

export default function SCStaffCampaign() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)

  const totalCampaigns = mockRecallCampaigns.length
  const activeCampaigns = mockRecallCampaigns.filter((campaign) => campaign.status === "active").length
  const completedCampaigns = mockRecallCampaigns.filter((campaign) => campaign.status === "completed").length

  const filteredCampaigns = mockRecallCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.campaignNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewCampaign = (campaign) => {
    setSelectedCampaign(campaign)
    setIsCampaignDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSidebar name={"Nam"} image={profile} role={"SC Staff"} />

      <div className="lg:pl-64">
        <Header name={"Pham Nhut Nam"} image={profile} email={"nam.admin@gmail.com"} />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCampaigns}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ongoing campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCampaigns}</div>
                  <p className="text-xs text-muted-foreground mt-1">Finished campaigns</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by campaign number or title..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                          <div>
                            <span className="text-muted-foreground">Affected Vehicles: </span>
                            <span className="font-medium">{campaign.affectedVehicles.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completed: </span>
                            <span className="font-medium">{campaign.completedVehicles.toLocaleString()}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{campaign.description}</p>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{Math.round((campaign.completedVehicles / campaign.affectedVehicles) * 100)}%</span>
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
          </div>
        </div>
      </div>

      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{selectedCampaign?.campaignNumber}</DialogTitle>
              <Badge variant="outline" className={getStatusColor(selectedCampaign?.status)}>
                {selectedCampaign?.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Campaign service details</p>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">{selectedCampaign.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Severity</h4>
                  <Badge variant="outline" className={getSeverityColor(selectedCampaign.severity)}>
                    {selectedCampaign.severity}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Start Date</h4>
                  <p className="font-medium">{new Date(selectedCampaign.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Affected Models</h4>
                  <p className="font-medium">{selectedCampaign.affectedModels.join(", ")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Badge variant="outline" className={getStatusColor(selectedCampaign.status)}>
                    {selectedCampaign.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed Vehicles</span>
                    <span className="font-medium">
                      {selectedCampaign.completedVehicles.toLocaleString()} /{" "}
                      {selectedCampaign.affectedVehicles.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(selectedCampaign.completedVehicles / selectedCampaign.affectedVehicles) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round((selectedCampaign.completedVehicles / selectedCampaign.affectedVehicles) * 100)}%
                    complete
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

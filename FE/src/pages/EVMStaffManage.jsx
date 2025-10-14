"use client"

import { useState } from "react";
import { Search, Filter, FileText, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EVMStaffDetailWarranty from "@/components/evmstaff/EVMStaffDetailWarranty";
import EVMStaffFormCampaign from "@/components/evmstaff/EVMStaffFormCampaign";
import { mockEVMWarrantyClaims, mockEVMCampaigns } from "@/lib/Mock-data";

export default function EVMStaffManage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [showWarrantyDetail, setShowWarrantyDetail] = useState(false)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [campaigns, setCampaigns] = useState(mockEVMCampaigns)

  const [warrantyPage, setWarrantyPage] = useState(1)
  const [campaignPage, setCampaignPage] = useState(1)
  const itemsPerPage = 10

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  }

  const filteredWarranties = mockEVMWarrantyClaims.filter((claim) => {
    const matchesSearch =
      claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || claim.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalWarrantyPages = Math.ceil(filteredWarranties.length / itemsPerPage)
  const paginatedWarranties = filteredWarranties.slice((warrantyPage - 1) * itemsPerPage, warrantyPage * itemsPerPage)

  const filteredCampaigns = campaigns.filter((campaign) => {
    return (
      campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.campaignId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalCampaignPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const paginatedCampaigns = filteredCampaigns.slice((campaignPage - 1) * itemsPerPage, campaignPage * itemsPerPage)

  const handleViewWarranty = (warranty) => {
    setSelectedWarranty(warranty)
    setShowWarrantyDetail(true)
  }

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign)
    setShowCampaignDialog(true)
  }

  const handleSaveCampaign = (campaignData) => {
    if (editingCampaign) {
      setCampaigns(campaigns.map((c) => (c.id === editingCampaign.id ? { ...c, ...campaignData } : c)))
    } else {
      setCampaigns([...campaigns, { id: String(campaigns.length + 1), ...campaignData }])
    }
    setEditingCampaign(null)
  }

  const getStatusBadge = (status) => {
    const variants = {
      done: "bg-green-500 min-w-[100px] justify-center",
      "to do": "bg-blue-500 min-w-[100px] justify-center",
      "in progress": "bg-yellow-500 min-w-[100px] justify-center",
      // Campaign statuses
      cancel: "bg-red-500",
      to_do: "bg-blue-500",
      process: "bg-yellow-500",
    }
    return <Badge className={variants[status] || "bg-gray-500"}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Warranty Claim Management</h1>

            <Tabs defaultValue="warranty" className="space-y-6">
              <TabsList>
                <TabsTrigger value="warranty">Manage Warranty</TabsTrigger>
                <TabsTrigger value="campaign">Manage Campaign</TabsTrigger>
              </TabsList>

              {/* Warranty Tab */}
              <TabsContent value="warranty" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="to do">To Do</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claim ID</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Issue number</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWarranties.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.claimId}</TableCell>
                          <TableCell>{claim.vehicle}</TableCell>
                          <TableCell>{claim.model}</TableCell>
                          <TableCell>{claim.issueNumber}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleViewWarranty(claim)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWarrantyPage((p) => Math.max(1, p - 1))}
                    disabled={warrantyPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {warrantyPage} of {totalWarrantyPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWarrantyPage((p) => Math.min(totalWarrantyPages, p + 1))}
                    disabled={warrantyPage === totalWarrantyPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Campaign Tab */}
              <TabsContent value="campaign" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setEditingCampaign(null)
                      setShowCampaignDialog(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign ID</TableHead>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.campaignId}</TableCell>
                          <TableCell>{campaign.campaignName}</TableCell>
                          <TableCell className="max-w-xs truncate">{campaign.description}</TableCell>
                          <TableCell>{campaign.start}</TableCell>
                          <TableCell>{campaign.end}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignPage((p) => Math.max(1, p - 1))}
                    disabled={campaignPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {campaignPage} of {totalCampaignPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignPage((p) => Math.min(totalCampaignPages, p + 1))}
                    disabled={campaignPage === totalCampaignPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <EVMStaffDetailWarranty
        open={showWarrantyDetail}
        onOpenChange={setShowWarrantyDetail}
        warranty={selectedWarranty}
      />

      <EVMStaffFormCampaign
        open={showCampaignDialog}
        onOpenChange={setShowCampaignDialog}
        onSave={handleSaveCampaign}
        campaign={editingCampaign}
      />
    </div>
  )
}

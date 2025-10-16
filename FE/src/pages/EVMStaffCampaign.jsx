"use client"

import { useState } from "react";
import { Search, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EVMStaffFormCampaign from "@/components/evmstaff/EVMStaffFormCampaign";
import { mockEVMCampaigns } from "@/lib/Mock-data";

export default function EVMStaffCampaign() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [campaigns, setCampaigns] = useState(mockEVMCampaigns)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    return (
      campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.campaignId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
      cancel: "bg-red-500 min-w-[100px] justify-center",
      done: "bg-green-500 min-w-[100px] justify-center",
      to_do: "bg-blue-500 min-w-[100px] justify-center",
      process: "bg-yellow-500 min-w-[100px] justify-center",
    }
    return <Badge className={variants[status] || "bg-gray-500"}>{status.toUpperCase().replace("_", " ")}</Badge>
  }

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Campaign Management</h1>

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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      <EVMStaffFormCampaign
        open={showCampaignDialog}
        onOpenChange={setShowCampaignDialog}
        onSave={handleSaveCampaign}
        campaign={editingCampaign}
      />
    </div>
  )
}

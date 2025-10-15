// FE/src/components/scstaff/ScsReportSection.jsx

import { useState } from "react"
import { FileText, Plus, Edit, Eye, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateReportDialog } from "@/components/scstaff/ScsRepoCreate"
import { ViewReportDialog } from "@/components/scstaff/ScsRepoView"
import { EditReportDialog } from "@/components/scstaff/ScsRepoEdit"
import { mockReports } from "@/lib/Mock-data"
import { campaigns } from "@/lib/Mock-data"

export default function ReportsSection() {
  const [reports, setReports] = useState(mockReports)
  const [expandedReports, setExpandedReports] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState("0")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCampaign = selectedCampaign === "0" || report.campaignId === Number.parseInt(selectedCampaign)
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus

    return matchesSearch && matchesCampaign && matchesStatus
  })

  const toggleExpand = (reportId) => {
    const newExpanded = new Set(expandedReports)
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId)
    } else {
      newExpanded.add(reportId)
    }
    setExpandedReports(newExpanded)
  }

  const handleView = (report) => {
    setSelectedReport(report)
    setViewDialogOpen(true)
  }

  const handleEdit = (report) => {
    setSelectedReport(report)
    setEditDialogOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const getCompletionPercentage = (report) => {
    return Math.round((report.completedServices / report.totalVehicles) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by campaign or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new report</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedReports.has(report.id)
            const completionPercentage = getCompletionPercentage(report)

            return (
              <Card key={report.id} className="overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-card-foreground">{report.campaignName}</h3>
                        <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                        <Badge variant="outline">{report.reportType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(report.createdDate).toLocaleDateString()}</span>
                        <span>Updated: {new Date(report.updatedDate).toLocaleDateString()}</span>
                        <span>By: {report.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(report)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Total Vehicles</p>
                      <p className="text-2xl font-bold text-card-foreground">{report.totalVehicles}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Completed</p>
                      <p className="text-2xl font-bold text-card-foreground">{report.completedServices}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Pending</p>
                      <p className="text-2xl font-bold text-card-foreground">{report.pendingServices}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-card-foreground">Completion Progress</span>
                      <span className="text-sm font-medium text-card-foreground">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-card-foreground mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      {report.issues && (
                        <div>
                          <h4 className="text-sm font-semibold text-card-foreground mb-2">Issues Identified</h4>
                          <p className="text-sm text-muted-foreground">{report.issues}</p>
                        </div>
                      )}
                      {report.recommendations && (
                        <div>
                          <h4 className="text-sm font-semibold text-card-foreground mb-2">Recommendations</h4>
                          <p className="text-sm text-muted-foreground">{report.recommendations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(report.id)} className="w-full mt-2">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show More Details
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <CreateReportDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewReportDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} report={selectedReport} />
      <EditReportDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} report={selectedReport} />
    </div>
  )
}

"use client"

import { useState } from "react"
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar"
import Header from "@/components/Header"
import ReportCheck from "@/components/sctechnician/ScTechnicianCheckForm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockJobs, mockUsers } from "@/lib/Mock-data"

export default function SCTechnicianCheck() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobs, setJobs] = useState(mockJobs.filter((job) => job.type === "check"))
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return date
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "")
  }

  function getTypeColor(type) {
    switch (type) {
      case "check":
        return "bg-blue-500 text-white"
      default:
        return
    }
  }

  const handleCardClick = (job) => {
    setSelectedJob(job)
  }

  const handleCloseReport = () => {
    setSelectedJob(null)
  }

  const handleCompleteCheck = () => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === selectedJob.id ? { ...job, status: "completed", hasReport: true } : job)),
    )
    setSelectedJob(null)
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobs = filteredJobs.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar name={mockUsers[5].name} role={mockUsers[5].role} />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header name={mockUsers[5].name} email={mockUsers[5].email} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Check Jobs</h1>
                <p className="text-muted-foreground mt-2 text-lg">Diagnostic and inspection tasks</p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by job number or vehicle plate..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                {/* <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full md:w-[200px] h-12">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Pagination info */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} job(s)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentJobs.length > 0 ? (
                      currentJobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => handleCardClick(job)}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-lg">{job.jobNumber}</p>
                              <Badge variant="outline" className={cn("text-xs capitalize", getTypeColor(job.type))}>
                                {job.type.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Vehicle:</span> {job.vehicleModel} - {job.vehiclePlate}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">Date:</span> {formatDateTime(job.createdAt)}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">SC Staff:</span> {job.assignedStaff}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No jobs found matching your criteria
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedJob && <ReportCheck job={selectedJob} onClose={handleCloseReport} onComplete={handleCompleteCheck} />}
    </div>
  )
}

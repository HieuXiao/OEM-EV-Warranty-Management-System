import { useState } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import ReportCheck from "@/components/sctechnician/ScTechnicianCheckForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockJobs, mockUsers } from "@/lib/Mock-data";

export default function SCTechnicianCheck() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobs, setJobs] = useState(mockJobs.filter((job) => job.type === "check"))
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
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

  const handleOpenReport = (job) => {
    setSelectedJob(job)
  }

  const handleCloseReport = () => {
    setSelectedJob(null)
  }

  const handleCompleteCheck = () => {
    // Update job status and mark as having report
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

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar name={mockUsers[5].name} role={mockUsers[5].role} />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header name={mockUsers[5].name} email={mockUsers[5].email} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Check Jobs</h1>
              <p className="text-muted-foreground mt-1">Diagnostic and inspection tasks</p>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by job number or vehicle plate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle>Check Jobs List</CardTitle>
                <CardDescription>{filteredJobs.length} job(s) found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{job.jobNumber}</p>
                            <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(job.status))}>
                              {job.status.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn("text-xs capitalize", getPriorityColor(job.priority))}
                            >
                              {job.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {job.type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-muted-foreground">
                              <span className="font-medium">Vehicle:</span> {job.vehicleModel} - {job.vehiclePlate}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Date:</span> {formatDateTime(job.createdAt)}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">SC Staff:</span> {job.assignedStaff}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Technician:</span> {job.assignedTechnician}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenReport(job)}>
                            <FileText className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                          <Button size="sm" disabled={!job.hasReport} className="bg-cyan-500 hover:bg-cyan-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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

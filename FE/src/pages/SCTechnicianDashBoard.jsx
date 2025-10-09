import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar"
import Header from "@/components/Header"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ClipboardCheck, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockJobs, mockUsers } from "@/lib/Mock-data"

export default function SCTechnicianDashboard() {
  const checkJobs = mockJobs
    .filter((job) => job.type === "check" && (job.priority === "urgent" || job.priority === "high"))
    .slice(0, 2)

  const repairJobs = mockJobs
    .filter((job) => job.type === "repair" && (job.priority === "urgent" || job.priority === "high"))
    .slice(0, 2)

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

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar name={mockUsers[5].name} role={mockUsers[5].role} />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header name={mockUsers[5].name} email={mockUsers[5].email} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">My Job</h1>
              <p className="text-muted-foreground mt-1">High priority tasks requiring immediate attention</p>
            </div>

            {/* Check Jobs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-cyan-500" />
                    <div>
                      <CardTitle>Check Jobs</CardTitle>
                      <CardDescription>Diagnostic and inspection tasks</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/sctechnician/check">
                      View all
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{job.jobNumber}</p>
                          <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(job.status))}>
                            {job.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs capitalize", getPriorityColor(job.priority))}>
                            {job.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.vehicleModel} - {job.vehiclePlate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(job.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Repair Jobs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-500" />
                    <div>
                      <CardTitle>Repair Jobs</CardTitle>
                      <CardDescription>Active repair and maintenance tasks</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/sctechnician/repair">
                      View all
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repairJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{job.jobNumber}</p>
                          <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(job.status))}>
                            {job.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs capitalize", getPriorityColor(job.priority))}>
                            {job.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.vehicleModel} - {job.vehiclePlate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(job.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

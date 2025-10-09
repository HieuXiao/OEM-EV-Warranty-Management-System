// FE/src/components/scstaff/ScsRepView.jsx
import { Calendar, User, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import React from "react"

export function ViewReportDialog({ open, onOpenChange, report }) {
  if (!report) return null

  const completionPercentage = Math.round((report.completedServices / report.totalVehicles) * 100)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{report.campaignName}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
              <Badge variant="outline">{report.reportType}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="font-medium text-card-foreground">Created</p>
                <p>{new Date(report.createdDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="font-medium text-card-foreground">Updated</p>
                <p>{new Date(report.updatedDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <div>
                <p className="font-medium text-card-foreground">Created By</p>
                <p>{report.createdBy}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">Campaign Statistics</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Vehicles</p>
                <p className="text-3xl font-bold text-card-foreground">{report.totalVehicles}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-primary">{report.completedServices}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-card-foreground">{report.pendingServices}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground">Completion Progress</span>
                <span className="text-sm font-medium text-card-foreground">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary rounded-full h-3 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-3">Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{report.summary}</p>
          </div>

          {/* Issues */}
          {report.issues && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Issues Identified</h3>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">{report.issues}</p>
                </div>
              </div>
            </>
          )}

          {/* Recommendations */}
          {report.recommendations && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Recommendations</h3>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">{report.recommendations}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

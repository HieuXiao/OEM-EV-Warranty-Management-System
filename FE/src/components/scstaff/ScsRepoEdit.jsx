// FE/src/components/scstaff/ScsRepEdit.jsx
"use client"

import { useState, useEffect } from "react"
import { Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EditReportDialog({ open, onOpenChange, report }) {
  const [status, setStatus] = useState("")
  const [summary, setSummary] = useState("")
  const [totalVehicles, setTotalVehicles] = useState("")
  const [completedServices, setCompletedServices] = useState("")
  const [issues, setIssues] = useState("")
  const [recommendations, setRecommendations] = useState("")

  useEffect(() => {
    if (report) {
      setStatus(report.status)
      setSummary(report.summary)
      setTotalVehicles(report.totalVehicles.toString())
      setCompletedServices(report.completedServices.toString())
      setIssues(report.issues || "")
      setRecommendations(report.recommendations || "")
    }
  }, [report])

  const handleSave = () => {
    alert("Report updated successfully")
    onOpenChange(false)
  }

  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>Update report details for {report.campaignName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-summary">Summary</Label>
            <Textarea
              id="edit-summary"
              placeholder="Provide a brief summary of the campaign status..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-totalVehicles">Total Vehicles</Label>
              <Input
                id="edit-totalVehicles"
                type="number"
                value={totalVehicles}
                onChange={(e) => setTotalVehicles(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-completedServices">Completed Services</Label>
              <Input
                id="edit-completedServices"
                type="number"
                value={completedServices}
                onChange={(e) => setCompletedServices(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-issues">Issues Identified</Label>
            <Textarea
              id="edit-issues"
              placeholder="Describe any issues or challenges encountered during the campaign..."
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-recommendations">Recommendations</Label>
            <Textarea
              id="edit-recommendations"
              placeholder="Provide recommendations for improvement or future campaigns..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

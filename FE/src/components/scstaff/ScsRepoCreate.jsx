// FE/src/components/scstaff/ScsRepCreate.jsx
import { useState } from "react"
import { FileText } from "lucide-react"
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

const campaigns = [
  { id: 1, name: "Battery Recall 2024" },
  { id: 2, name: "Software Update Campaign" },
  { id: 3, name: "Brake System Inspection" },
]

export function CreateReportDialog({ open, onOpenChange }) {
  const [campaignId, setCampaignId] = useState("")
  const [reportType, setReportType] = useState("")
  const [summary, setSummary] = useState("")
  const [totalVehicles, setTotalVehicles] = useState("")
  const [completedServices, setCompletedServices] = useState("")
  const [issues, setIssues] = useState("")
  const [recommendations, setRecommendations] = useState("")

  const handleCreate = () => {
    alert("Report created successfully")
    onOpenChange(false)
    // Reset form
    setCampaignId("")
    setReportType("")
    setSummary("")
    setTotalVehicles("")
    setCompletedServices("")
    setIssues("")
    setRecommendations("")
  }

  const isFormValid = campaignId && reportType && summary && totalVehicles && completedServices

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>Create a progress or completion report for a campaign</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign *</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger id="campaign">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress Report</SelectItem>
                  <SelectItem value="completion">Completion Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              placeholder="Provide a brief summary of the campaign status..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalVehicles">Total Vehicles *</Label>
              <Input
                id="totalVehicles"
                type="number"
                placeholder="245"
                value={totalVehicles}
                onChange={(e) => setTotalVehicles(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completedServices">Completed Services *</Label>
              <Input
                id="completedServices"
                type="number"
                placeholder="120"
                value={completedServices}
                onChange={(e) => setCompletedServices(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues">Issues Identified (Optional)</Label>
            <Textarea
              id="issues"
              placeholder="Describe any issues or challenges encountered during the campaign..."
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations (Optional)</Label>
            <Textarea
              id="recommendations"
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
          <Button onClick={handleCreate} disabled={!isFormValid}>
            <FileText className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

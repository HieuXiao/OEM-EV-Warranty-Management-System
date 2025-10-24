// FE/src/components/admin/AdPoliCreate.jsx

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreatePolicyForm({ parts, policies, onSubmit, onCancel }) {
  const [selectedPart, setSelectedPart] = useState("")
  const [formData, setFormData] = useState({
    policyId: "",
    policyName: "",
    availableYear: "",
    kilometer: "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (
      selectedPart &&
      formData.policyId &&
      formData.policyName &&
      formData.availableYear &&
      formData.kilometer
    ) {
      onSubmit({
        policyId: formData.policyId,
        policyName: formData.policyName,
        availableYear: Number(formData.availableYear),
        kilometer: Number(formData.kilometer),
        enabled: true,
        partId: selectedPart,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Part *</Label>
          <Select value={selectedPart} onValueChange={setSelectedPart}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a part" />
            </SelectTrigger>
            <SelectContent>
              {parts.map((part) => (
                <SelectItem key={part.id} value={part.id}>
                  {part.partName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Policy ID *</Label>
          <Input
            placeholder="e.g., P003"
            value={formData.policyId}
            onChange={(e) => handleChange("policyId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Policy Name *</Label>
          <Input
            placeholder="e.g., Premium Warranty"
            value={formData.policyName}
            onChange={(e) => handleChange("policyName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Available Year *</Label>
          <Input
            type="number"
            placeholder="e.g., 3"
            value={formData.availableYear}
            onChange={(e) => handleChange("availableYear", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Kilometer *</Label>
          <Input
            type="number"
            placeholder="e.g., 100000"
            value={formData.kilometer}
            onChange={(e) => handleChange("kilometer", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Policy</Button>
      </div>
    </div>
  )
}

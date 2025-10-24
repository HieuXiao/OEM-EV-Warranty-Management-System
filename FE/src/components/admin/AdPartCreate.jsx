// FE/src/components/admin/AdPartCreate.jsx

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const BRANCHES = ["VinFast", "Bosch", "Continental", "Denso"]

export default function CreatePartForm({ onSubmit, onCancel }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    partName: "",
    partBranch: "",
    price: "",
    vehicleModel: "",
    description: "",
    policyId: "",
    policyName: "",
    availableYear: "",
    kilometer: "",
  })

  const [newBranch, setNewBranch] = useState("")
  const [showNewBranch, setShowNewBranch] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (formData.partName && formData.partBranch && formData.price && formData.vehicleModel) {
        setStep(2)
      }
    }
  }

  const handleSubmit = () => {
    if (formData.policyId && formData.policyName && formData.availableYear && formData.kilometer) {
      onSubmit({
        partName: formData.partName,
        partBranch: formData.partBranch,
        price: Number(formData.price),
        vehicleModel: formData.vehicleModel,
        description: formData.description,
        policyId: formData.policyId,
        policyName: formData.policyName,
        availableTime: `${formData.availableYear} years / ${formData.kilometer}km`,
      })
    }
  }

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Part Name *</Label>
              <Input
                placeholder="e.g., Engine Oil Filter"
                value={formData.partName}
                onChange={(e) => handleChange("partName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Part Branch *</Label>
              {!showNewBranch ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.partBranch}
                    onValueChange={(value) => {
                      if (value === "new") {
                        setShowNewBranch(true)
                      } else {
                        handleChange("partBranch", value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new branch name"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (newBranch) {
                        handleChange("partBranch", newBranch)
                        setShowNewBranch(false)
                        setNewBranch("")
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Price (VND) *</Label>
              <Input
                type="number"
                placeholder="e.g., 150000"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Model *</Label>
              <Input
                placeholder="e.g., VF8"
                value={formData.vehicleModel}
                onChange={(e) => handleChange("vehicleModel", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Part description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="font-semibold">Policy Information</h3>

            <div className="space-y-2">
              <Label>Policy ID *</Label>
              <Input
                placeholder="e.g., P001"
                value={formData.policyId}
                onChange={(e) => handleChange("policyId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Policy Name *</Label>
              <Input
                placeholder="e.g., Standard Warranty"
                value={formData.policyName}
                onChange={(e) => handleChange("policyName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Available Year *</Label>
              <Input
                type="number"
                placeholder="e.g., 2"
                value={formData.availableYear}
                onChange={(e) => handleChange("availableYear", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kilometer *</Label>
              <Input
                type="number"
                placeholder="e.g., 50000"
                value={formData.kilometer}
                onChange={(e) => handleChange("kilometer", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create Part</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

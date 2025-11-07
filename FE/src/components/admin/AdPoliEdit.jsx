// FE/src/components/admin/AdPoliEdit.jsx

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/**
 * @function formatNumber
 * @param {number|string} num - The number value to format.
 * @returns {string} The formatted number string (e.g., "4,000,000").
 */
const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return "";
  // Ensure input is treated as a number before formatting
  const numberValue = Number(num);
  if (isNaN(numberValue)) return String(num); 
  // Using "en-US" locale for comma separation
  return numberValue.toLocaleString("en-US"); 
};

/**
 * @component
 * @description Modal for editing policy details and enabled status.
 * @param {object} policy - The current policy data.
 * @param {boolean} open - The display state of the modal.
 * @param {function} onOpenChange - Callback when modal state changes.
 * @param {function} onSave - Callback when policy changes are saved.
 * @param {number} activePoliciesCount - Count of other active policies for validation (1 active policy rule).
 */
export default function PolicyEditModal({ policy, open, onOpenChange, onSave, activePoliciesCount }) {
  const [formData, setFormData] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [formattedKilometer, setFormattedKilometer] = useState("")

  useEffect(() => {
    if (policy) {
      const initialData = {
        policyId: policy.policyId,
        policyName: policy.policyName,
        availableYear: policy.availableYear,
        kilometer: policy.kilometer,
        enabled: policy.isEnable,
      }
      setFormData(initialData)
      setFormattedKilometer(formatNumber(policy.kilometer))
    }
    setHasChanges(false)
  }, [policy, open])

  if (!formData) return null

  /**
     * @function handleChange
     * @param {string} field - The key of the field to update.
     * @param {*} value - The new value for the field.
     * @description Updates form data and checks if any changes have occurred compared to the original policy.
     */
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)

    // Check against original policy props
    const isChanged =
      updated.policyName !== policy.policyName ||
      Number(updated.availableYear) !== policy.availableYear ||
      Number(updated.kilometer) !== policy.kilometer ||
      updated.enabled !== policy.isEnable // Compare against original 'isEnable' (policy.enabled)

    setHasChanges(isChanged)
  }

  /**
     * @function handleKilometerDisplayChange
     * @param {Object} e - Event object from the input field.
     * @description Handles input for the Kilometer field, formats the display value,
     * and saves the raw numeric string to formData for correct submission.
     */
  const handleKilometerDisplayChange = (e) => {
    const inputStr = e.target.value;
    const rawNumberStr = inputStr.replace(/[^0-9]/g, "");
    const numericValue = rawNumberStr ? parseInt(rawNumberStr, 10) : "";
    // Update formData with the raw numeric value
    handleChange("kilometer", String(numericValue));
    // Update formatted state for display
    setFormattedKilometer(formatNumber(numericValue));
  };


  /**
     * @function handleSave
     * @description Enforces the business rule (max 1 active policy per part) and calls the parent onSave handler.
     */
  const handleSave = () => {
    // BUSINESS RULE CHECK: Prevent enabling if another policy is already active (activePoliciesCount > 0)
    if (formData.enabled && !policy.isEnable) {
      // If trying to enable the policy, check if others are active
      if (activePoliciesCount > 0) {
        alert(
          `Business Rule Violation: The associated part already has ${activePoliciesCount} other active policies. Please disable the current active policy before enabling this one.`,
        )
        // Prevent save and keep the 'enabled' switch state reset to false visually
        setFormData((prev) => ({ ...prev, enabled: policy.isEnable })) // Reset enabled to original state
        setHasChanges(false) 
        return
      }
    }
    
    // Convert availableYear and kilometer to Number for API consistency
    const savedData = {
      ...policy, // Keep unseen properties
      policyName: formData.policyName,
      availableYear: Number(formData.availableYear),
      kilometer: Number(formData.kilometer),
      isEnable: formData.enabled, // API uses isEnable
    };

    // Call the parent save function
    onSave(savedData)

    onOpenChange(false)
  }

  /**
     * @function handleCancel
     * @description Closes the modal without saving changes.
     */
  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Policy: {formData.policyId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Policy Name</Label>
              <Input 
                value={formData.policyName} 
                onChange={(e) => handleChange("policyName", e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Available Year</Label>
              <Input
                type="number"
                value={formData.availableYear}
                onChange={(e) => handleChange("availableYear", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kilometer</Label>
              <Input
                type="text" // Input type text for formatted display
                value={formattedKilometer} // Use formatted value for display
                onChange={handleKilometerDisplayChange} // Use custom handler
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-md">
            <Label htmlFor="policy-enabled-switch">Status: {formData.enabled ? "Active" : "Disabled"}</Label>
            <Switch
              id="policy-enabled-switch"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleChange("enabled", checked)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
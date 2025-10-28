// FE/src/components/admin/AdPartDetail.jsx

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch" // Import Switch cho isEnable

export default function PartDetailModal({ part, open, onOpenChange, onUpdate, onDelete }) {
  const [formData, setFormData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (part) {
      setFormData({
        partId: part.partId,
        partName: part.partName,
        partBrand: part.partBrand,
        price: part.price,
        vehicleModel: part.vehicleModel,
        description: part.description,
        isEnable: part.isEnable,
      })
      setIsEditing(false)
      setHasChanges(false)
    }
  }, [part, open])

  if (!formData) return null

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    const originalPartData = {
      partId: part.partId,
      partName: part.partName,
      partBrand: part.partBrand,
      price: part.price,
      vehicleModel: part.vehicleModel,
      description: part.description,
      isEnable: part.isEnable,
    }
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPartData))
  }

  const handleSave = () => {
    const updatedPartWithAdmin = {
      ...part,
      ...formData,
    }
    onUpdate(updatedPartWithAdmin)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setFormData({
      partId: part.partId,
      partName: part.partName,
      partBrand: part.partBrand,
      price: part.price,
      vehicleModel: part.vehicleModel,
      description: part.description,
      isEnable: part.isEnable,
    })
    setIsEditing(false)
    setHasChanges(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Part Details - ID: {formData.partId}</DialogTitle>
          <DialogDescription>View and manage part information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Part Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Part Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Name</Label>
                <Input
                  value={formData.partName}
                  onChange={(e) => handleChange("partName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Part Brand</Label>
                <Input
                  value={formData.partBrand}
                  onChange={(e) => handleChange("partBrand", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (VND)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", Number(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Model</Label>
                <Input
                  value={formData.vehicleModel}
                  onChange={(e) => handleChange("vehicleModel", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          {/* Status and Admin Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Status and Administration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between col-span-1">
                <Label htmlFor="detail-isEnable">Enabled</Label>
                <Switch
                  id="detail-isEnable"
                  checked={formData.isEnable}
                  onCheckedChange={(checked) => handleChange("isEnable", checked)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label>Created By (Admin)</Label>
                <Input
                  value={part.admin.fullName || part.admin.accountId}
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>
          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="destructive" size="sm" onClick={() => onDelete(formData.partId)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={!hasChanges}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!hasChanges}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

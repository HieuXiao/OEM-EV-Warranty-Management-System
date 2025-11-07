"use client"

// FE/src/components/admin/AdPartDetailPage.jsx

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, Edit, ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PartDetailPage({ part, onBack, onUpdate, onDelete, partPolicies, onEditPolicy }) {
  const [formData, setFormData] = useState({
    partId: part.partId,
    partName: part.partName,
    partBrand: part.partBrand,
    price: part.price,
    vehicleModel: part.vehicleModel,
    description: part.description,
    isEnable: part.isEnable,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
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
  }, [part])

  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
    setHasChanges(false)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between pb-4 mb-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parts List
          </Button>
          <h1 className="text-2xl font-bold">Part Details - {formData.partName}</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Part Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Part Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Part Name</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.partName}
                  onChange={(e) => handleChange("partName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Part Brand</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.partBrand}
                  onChange={(e) => handleChange("partBrand", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (VND)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", Number(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Vehicle Model</Label>
                <Input
                  className="h-8 text-sm"
                  value={formData.vehicleModel}
                  onChange={(e) => handleChange("vehicleModel", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                className="h-8 text-sm"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status and Administration */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status & Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="detail-isEnable" className="text-sm">
                Enabled
              </Label>
              <Switch
                id="detail-isEnable"
                checked={formData.isEnable}
                onCheckedChange={(checked) => handleChange("isEnable", checked)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Created By (Admin)</Label>
              <p className="text-sm">{part.admin?.fullName || part.admin?.accountId || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Policies List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Part Policies ({partPolicies?.length || 0})</h3>
            <Button variant="outline" size="sm">
              Add Policy
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {partPolicies && partPolicies.length > 0 ? (
              partPolicies.map((policy) => (
                <Card key={policy.policyId} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between gap-0 p-3 pb-2">
                    <div>
                      <CardTitle className="text-sm font-semibold">{policy.policyName}</CardTitle>
                      <p className="text-xs text-muted-foreground">ID: {policy.policyId}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditPolicy(policy)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-muted-foreground">Years:</p>
                        <p className="font-medium">{policy.availableYear}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kilometers:</p>
                        <p className="font-medium">{policy.kilometer.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t">
                      <p className="text-muted-foreground">Status:</p>
                      <span className={`text-xs font-semibold ${policy.enabled ? "text-green-600" : "text-red-600"}`}>
                        {policy.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground md:col-span-2 lg:col-span-3">No warranty policies found.</p>
            )}
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
                <Button variant="outline" onClick={handleCancel}>
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
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { vehicleModels, mockUsers } from "@/lib/Mock-data"

export default function WarrantyDetail({ warranty, onBack, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(warranty)

  const scTechnicians = mockUsers.filter(
    (user) => user.role === "sc_technician"
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(warranty)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{warranty.warrantyId}</h1>
          <p className="text-sm text-muted-foreground">{warranty.customer}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Warranty Information</CardTitle>
                  <CardDescription>
                    View and manage warranty details
                  </CardDescription>
                </div>
                {/* {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Edit
                  </Button>
                )} */}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Name</label>
                    <Input
                      name="customer"
                      value={formData.customer}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Plate</label>
                    <Input
                      name="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Model</label>
                    {isEditing ? (
                      <Select
                        value={formData.vehicleModel}
                        onValueChange={(val) =>
                          handleSelectChange("vehicleModel", val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select vehicle model" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.vehicleModel}
                        disabled
                        className="bg-muted"
                      />
                    )}
                  </div>
                </div>

                {/* Technician Assignment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Assigned Technician
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.technician}
                      onValueChange={(val) =>
                        handleSelectChange("technician", val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {scTechnicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.name}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={formData.technician}
                      disabled
                      className="bg-muted"
                    />
                  )}
                </div>

                {/* Issue Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Issue Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input ${
                      isEditing ? "bg-background" : "bg-muted"
                    }`}
                  />
                </div>

                {/* Previous Warranty Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Previous Warranty Count
                  </label>
                  <Input
                    name="previousCount"
                    value={formData.previousCount || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Current Status
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {formData.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Created By</p>
                <p className="font-medium">{formData.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Warranty ID</p>
                <p className="font-medium">{formData.warrantyId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

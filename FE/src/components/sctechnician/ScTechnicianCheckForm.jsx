"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PARTS_LIST } from "@/lib/Mock-data"

const ReportCheck = ({ job, onClose, onComplete }) => {
  const [partImages, setPartImages] = useState({})
  const [partQuantities, setPartQuantities] = useState({})

  const handleImageUpload = (partName, event) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setPartImages((prev) => ({
        ...prev,
        [partName]: [...(prev[partName] || []), ...newImages],
      }))
      // Initialize quantity to 0 when first image is uploaded
      if (!partQuantities[partName]) {
        setPartQuantities((prev) => ({ ...prev, [partName]: 0 }))
      }
    }
  }

  const handleDeleteImage = (partName, imageIndex) => {
    setPartImages((prev) => {
      const updatedImages = [...(prev[partName] || [])]
      updatedImages.splice(imageIndex, 1)
      if (updatedImages.length === 0) {
        // Remove quantity when no images left
        setPartQuantities((prevQty) => {
          const newQty = { ...prevQty }
          delete newQty[partName]
          return newQty
        })
        const newImages = { ...prev }
        delete newImages[partName]
        return newImages
      }
      return { ...prev, [partName]: updatedImages }
    })
  }

  const handleQuantityChange = (partName, value) => {
    const numValue = Number.parseInt(value) || 0
    if (numValue >= 0) {
      setPartQuantities((prev) => ({ ...prev, [partName]: numValue }))
    }
  }

  const hasImages = (partName) => {
    return partImages[partName] && partImages[partName].length > 0
  }

  const canComplete = Object.keys(partImages).length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-500">REPORT CHECK - Job #{job?.jobNumber}</h2>
          <Button variant="destructive" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Vehicle Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Vehicle plate:</Label>
                    <Input value={job?.vehiclePlate || ""} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Model vehicle:</Label>
                    <Input value={job?.vehicleModel || ""} disabled className="mt-1 bg-muted" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Note:</Label>
                  <Input value={job?.comment || ""} disabled className="mt-1 bg-muted" />
                </div>
              </div>
            </div>

            {/* Image Checklist */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Image Checklist</h3>
              <div className="grid grid-cols-2 gap-3">
                {PARTS_LIST.map((part) => (
                  <div
                    key={part}
                    className={cn(
                      "border rounded-lg p-3 transition-colors",
                      hasImages(part) ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{part}</span>
                      <div className="flex gap-1">
                        <label className="cursor-pointer">
                          <Camera className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleImageUpload(part, e)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Image thumbnails */}
                    {hasImages(part) && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {partImages[part].map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img || "/placeholder.svg"}
                                alt={`${part}-${idx}`}
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <button
                                onClick={() => handleDeleteImage(part, idx)}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Quantity input - only shown when images exist */}
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Qty:</Label>
                          <Input
                            type="number"
                            min="0"
                            value={partQuantities[part] || 0}
                            onChange={(e) => handleQuantityChange(part, e.target.value)}
                            className="h-7 w-16 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={onComplete} disabled={!canComplete} className="bg-cyan-500 hover:bg-cyan-600">
              Complete Check
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportCheck

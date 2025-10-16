"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, X, Trash2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PARTS_LIST } from "@/lib/Mock-data"

const ReportCheck = ({ job, onClose, onComplete }) => {
  const [checkStarted, setCheckStarted] = useState(false)
  const [checkedParts, setCheckedParts] = useState({})
  const [partImages, setPartImages] = useState({})
  const [partQuantities, setPartQuantities] = useState({})

  const handleStartCheck = () => {
    setCheckStarted(true)
    // Update job status to "on_going" / "in_progress"
    console.log("[v0] Starting check for job:", job.jobNumber)
    console.log("[v0] Status changed from 'requested' to 'on_going'")
    // In a real app, this would send an API request to update the job status
  }

  const handleTogglePartCheck = (partName) => {
    setCheckedParts((prev) => ({
      ...prev,
      [partName]: !prev[partName],
    }))
  }

  const handleImageUpload = (partName, event) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setPartImages((prev) => ({
        ...prev,
        [partName]: [...(prev[partName] || []), ...newImages],
      }))
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

  const allPartsChecked = PARTS_LIST.every((part) => checkedParts[part])

  const hasRepairNeeded = Object.keys(partImages).length > 0

  const handleCompleteCheck = () => {
    if (hasRepairNeeded) {
      console.log("[v0] Job type changed to 'repair' - parts need repair")
      // In a real app, update job type to "repair"
    } else {
      console.log("[v0] Job status changed to 'completed' - no repairs needed")
      // In a real app, update job status to "completed"
    }
    onComplete()
  }

  const canClose = !checkStarted || allPartsChecked

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-cyan-500">REPORT CHECK - Job #{job?.jobNumber}</h2>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClose}
            disabled={!canClose}
            title={!canClose ? "Complete all checks before closing" : ""}
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Vehicle Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Vehicle Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {!checkStarted && (
              <div className="flex justify-center py-4">
                <Button onClick={handleStartCheck} size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8">
                  Start Check
                </Button>
              </div>
            )}

            {checkStarted && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Parts Checklist</h3>
                  <span className="text-sm text-muted-foreground">
                    {Object.values(checkedParts).filter(Boolean).length} / {PARTS_LIST.length} checked
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {PARTS_LIST.map((part) => (
                    <div
                      key={part}
                      className={cn(
                        "border rounded-lg p-5 transition-all hover:shadow-md",
                        checkedParts[part] && !hasImages(part)
                          ? "border-green-500 bg-green-500/5 shadow-sm"
                          : hasImages(part)
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30",
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePartCheck(part)}
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              checkedParts[part]
                                ? "bg-green-500 border-green-500"
                                : "border-muted-foreground hover:border-green-500",
                            )}
                          >
                            {checkedParts[part] && <CheckCircle2 className="h-4 w-4 text-white" />}
                          </button>
                          <span className="text-sm font-semibold">{part}</span>
                        </div>
                        <label className="cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                          <Camera className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleImageUpload(part, e)}
                          />
                        </label>
                      </div>

                      {/* Image thumbnails */}
                      {hasImages(part) && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {partImages[part].map((img, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={img || "/placeholder.svg"}
                                  alt={`${part}-${idx}`}
                                  className="w-16 h-16 object-cover rounded border border-border"
                                />
                                <button
                                  onClick={() => handleDeleteImage(part, idx)}
                                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Quantity input */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <Label className="text-xs font-medium">Quantity:</Label>
                            <Input
                              type="number"
                              min="0"
                              value={partQuantities[part] || 0}
                              onChange={(e) => handleQuantityChange(part, e.target.value)}
                              className="h-8 w-20 text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {!hasImages(part) && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {checkedParts[part] ? "Part checked - OK" : "Check part and upload images if repair needed"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {checkStarted && (
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={!canClose}
                title={!canClose ? "Complete all checks before closing" : ""}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteCheck}
                disabled={!allPartsChecked}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                {hasRepairNeeded ? "Complete & Create Repair Job" : "Complete Check"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportCheck

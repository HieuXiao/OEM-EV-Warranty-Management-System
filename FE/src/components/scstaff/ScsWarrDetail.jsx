import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import axiosPrivate from "@/api/axios"

const getStatusColor = (status) => {
  const colors = {
    CHECK: "bg-blue-100 text-blue-800 border-blue-300",
    DECIDE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    REPAIR: "bg-orange-100 text-orange-700 border-orange-300",
    HANDOVER: "bg-purple-100 text-purple-800 border-purple-300",
    DONE: "bg-green-100 text-green-800 border-green-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

export default function ScsWarrDetail({ isOpen, onOpenChange, selectedClaim }) {
  const [loading, setLoading] = useState(false)
  const [claim, setClaim] = useState(selectedClaim)

  useEffect(() => {
    setClaim(selectedClaim)
  }, [selectedClaim])

  const handleMarkComplete = async () => {
    if (!claim || claim.status !== "HANDOVER") {
      return
    }

    try {
      setLoading(true)
      await axiosPrivate.put(`/api/warranty_claims/${claim.claimId}/complete`)

      // Update local state
      setClaim({ ...claim, status: "DONE" })
      onOpenChange(false)
    } catch (error) {
      console.error("Error marking claim complete:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">Claim #{claim?.claimId}</DialogTitle>
            <Badge variant="outline" className={getStatusColor(claim?.status)}>
              {claim?.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Warranty claim details and actions</p>
        </DialogHeader>

        {claim && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">VIN</h4>
                <p className="font-medium">{claim.vin}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Policy ID</h4>
                <p className="font-medium">{claim.policyId}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Claim Date</h4>
                <p className="font-medium">{claim.claimDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                <Badge variant="outline" className={getStatusColor(claim.status)}>
                  {claim.status}
                </Badge>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">SC Staff ID</h4>
                <p className="font-medium">{claim.scStaffId}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Technician ID</h4>
                <p className="font-medium">{claim.scTechnicianId}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{claim.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">EVM Description</h4>
              <p className="text-sm">{claim.evmDescription}</p>
            </div>

            <Button
              onClick={handleMarkComplete}
              disabled={claim.status !== "HANDOVER" || loading}
              className="w-full bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : claim.status === "HANDOVER"
                  ? "Mark Complete"
                  : "Can only mark complete when status is HANDOVER"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

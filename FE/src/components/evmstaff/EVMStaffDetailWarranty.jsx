import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EVMStaffDetailWarranty({ open, onOpenChange, warranty }) {
  const [comment, setComment] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [partApprovals, setPartApprovals] = useState({})
  const [approveAllActive, setApproveAllActive] = useState(false)
  const [rejectAllActive, setRejectAllActive] = useState(false)

  // derive parts for the current warranty; support legacy string entries
  const normalizeParts = (parts) => {
    if (!parts) return []
    return parts.map((p) => {
      if (typeof p === "string") return { name: p, quantity: 1, cost: 0 }
      // assume object with { name, quantity, cost }
      return {
        name: p.name || p.partName || "Part",
        quantity: typeof p.quantity === "number" ? p.quantity : p.qty || 1,
        cost: typeof p.cost === "number" ? p.cost : p.unitPrice || 0,
      }
    })
  }

  const partCosts = normalizeParts(warranty?.parts)

  useEffect(() => {
    if (warranty && comment.trim().length > 0) {
      setIsFormValid(true)
    } else {
      setIsFormValid(false)
    }
  }, [comment, warranty])

  useEffect(() => {
    if (!open) {
      setComment("")
      setPartApprovals({})
      setApproveAllActive(false)
      setRejectAllActive(false)
    }
  }, [open])

  useEffect(() => {
    if (warranty) {
      const initialApprovals = {}
      partCosts.forEach((_, index) => {
        initialApprovals[index] = { approved: false, rejected: false }
      })
      setPartApprovals(initialApprovals)
    }
  }, [warranty])

  if (!warranty) return null

  const handleApprovalChange = (index, type) => {
    setPartApprovals((prev) => ({
      ...prev,
      [index]: {
        approved: type === "approved" ? !prev[index]?.approved : false,
        rejected: type === "rejected" ? !prev[index]?.rejected : false,
      },
    }))
  }

  const handleApproveAll = () => {
    const newState = !approveAllActive
    setApproveAllActive(newState)
    setRejectAllActive(false)

    const updated = {}
    partCosts.forEach((_, i) => {
      updated[i] = { approved: newState, rejected: false }
    })
    setPartApprovals(updated)
  }

  const handleRejectAll = () => {
    const newState = !rejectAllActive
    setRejectAllActive(newState)
    setApproveAllActive(false)

    const updated = {}
    partCosts.forEach((_, i) => {
      updated[i] = { approved: false, rejected: newState }
    })
    setPartApprovals(updated)
  }

  const totalCost = partCosts.reduce((sum, part, index) => {
    if (partApprovals[index]?.approved) {
      return sum + part.cost * part.quantity
    }
    return sum
  }, 0)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  const getStatusBadge = (decision) => {
    const s = String(decision || "").toLowerCase();
    const map = {
      done: "text-green-700 border-green-400",
      cancel: "text-red-700 border-red-400",
      'on going': "text-yellow-700 border-yellow-400",
      'to do': "text-blue-700 border-blue-400",
    };
    const cls = map[s] || "text-gray-700 border-gray-300";
    return (
      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[100px] ${cls}`}>
        {decision}
      </span>
    )
  }

  const handleDone = () => {
    console.log("Warranty completed:", warranty.claimId, "Comment:", comment)
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Close the dialog without submitting
    onOpenChange(false)
  }

  return (
    // Disable the close icon and overlay click-to-close by hiding the close button
    // The Dialog primitive still closes via the controlled `open` and `onOpenChange` props.
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Warranty Claim Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Claim ID</p>
              <p className="font-semibold">{warranty.claimId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusBadge(warranty.decision)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-semibold">{""}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-semibold">{warranty.vehicle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Plate</p>
              <p className="font-semibold">{warranty.vehiclePlate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">{warranty.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issue Number</p>
              <p className="font-semibold">{warranty.issueNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted Date</p>
              <p className="font-semibold">{warranty.submittedDate}</p>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>

            <div className="border rounded-md">
              {/* Header */}
              {/* add same horizontal padding as rows (px-4) so columns align */}
              <div className="grid grid-cols-3 font-semibold text-center border-b bg-muted py-2 px-4">
                <div className="text-left">Part Information</div>
                <div className="flex justify-center items-center">
                  <Button
                    variant={approveAllActive ? "default" : "outline"}
                    size="sm"
                    className={`transition-all ${
                      approveAllActive
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-md scale-105"
                        : "text-green-700 border-green-600 hover:bg-green-100"
                    }`}
                    onClick={handleApproveAll}
                  >
                    Approve
                  </Button>
                </div>
                <div className="flex justify-center items-center">
                  <Button
                    variant={rejectAllActive ? "default" : "outline"}
                    size="sm"
                    className={`transition-all ${
                      rejectAllActive
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-md scale-105"
                        : "text-red-700 border-red-600 hover:bg-red-100"
                    }`}
                    onClick={handleRejectAll}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Rows */}
              {partCosts.map((part, index) => {
                const approved = partApprovals[index]?.approved || false
                const rejected = partApprovals[index]?.rejected || false
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-3 items-center border-b last:border-none py-3 px-4 transition-all ${
                      approved
                        ? "bg-green-50"
                        : rejected
                        ? "bg-red-50"
                        : "bg-transparent"
                    }`}
                  >
                    {/* Column 1 */}
                    <div className="space-y-1 text-left">
                      <p className="font-semibold text-base">{part.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {part.quantity}
                      </p>
                      <p className="text-base font-semibold text-primary">
                        {formatCurrency(part.cost)}
                      </p>
                    </div>

                    {/* Approve */}
                    <div className="flex justify-center items-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 cursor-pointer mx-auto"
                        checked={approved}
                        onChange={() => handleApprovalChange(index, "approved")}
                      />
                    </div>

                    {/* Reject */}
                    <div className="flex justify-center items-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-red-600 cursor-pointer mx-auto"
                        checked={rejected}
                        onChange={() => handleApprovalChange(index, "rejected")}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total Cost */}
            <div className="flex justify-between items-center text-lg pt-4">
              <p className="font-bold">Total Cost</p>
              <p className="font-bold text-primary text-xl">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Enter your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleDone} disabled={!isFormValid}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

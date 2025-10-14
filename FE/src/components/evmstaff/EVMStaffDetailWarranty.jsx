"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function EVMStaffDetailWarranty({ open, onOpenChange, warranty }) {
  const [comment, setComment] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [partApprovals, setPartApprovals] = useState({})

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

  const partCosts = [
    { name: "Battery Module", quantity: 1, cost: 45000000 },
    { name: "Controller Unit", quantity: 1, cost: 3000000 },
  ]

  const handleApprovalChange = (index, type) => {
    setPartApprovals((prev) => ({
      ...prev,
      [index]: {
        approved: type === "approved" ? !prev[index]?.approved : false,
        rejected: type === "rejected" ? !prev[index]?.rejected : false,
      },
    }))
  }

  const totalCost = partCosts.reduce((sum, part, index) => {
    if (partApprovals[index]?.approved) {
      return sum + part.cost * part.quantity
    }
    return sum
  }, 0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusColor = (status) => {
    const colors = {
      done: "bg-green-500",
      "to do": "bg-blue-500",
      "in progress": "bg-yellow-500",
    }
    return colors[status] || "bg-gray-500"
  }

  const handleCancel = () => {
    console.log("Warranty cancelled:", warranty.claimId)
    onOpenChange(false)
  }

  const handlePending = () => {
    console.log("Warranty set to pending:", warranty.claimId, "Comment:", comment)
    onOpenChange(false)
  }

  const handleDone = () => {
    console.log("Warranty completed:", warranty.claimId, "Comment:", comment)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Warranty Claim Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Claim ID</p>
              <p className="font-semibold">{warranty.claimId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(warranty.status)}>{warranty.status.toUpperCase()}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-semibold">{warranty.vehicle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-semibold">{warranty.model}</p>
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

          <div>
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              {/* Table Header */}
              {partCosts.map((part, index) => (
              <div
                key={index}
                className="flex justify-between items-start border-b pb-3 gap-8"
              >
                {/* Left column */}
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-base">{part.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity:{" "}
                    <span className="font-medium text-foreground">{part.quantity}</span>
                  </p>
                  <p className="text-base font-semibold text-primary">
                    {formatCurrency(part.cost)}
                  </p>
                </div>

                {/* Right column - improved checkbox alignment */}
                <div className="flex flex-col items-end justify-start w-[140px] shrink-0 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <span>Approve</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600"
                      checked={partApprovals[index]?.approved || false}
                      onChange={() => handleApprovalChange(index, "approved")}
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <span>Reject</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-red-600"
                      checked={partApprovals[index]?.rejected || false}
                      onChange={() => handleApprovalChange(index, "rejected")}
                    />
                  </label>
                </div>
              </div>
            ))}


              {/* Total Cost */}
              <div className="flex justify-between items-center text-lg pt-4">
                <p className="font-bold">Total Cost</p>
                <p className="font-bold text-primary text-xl">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </div>

          <Separator />

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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="destructive" onClick={handleCancel} disabled={!isFormValid}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handlePending} disabled={!isFormValid}>
              Pending
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

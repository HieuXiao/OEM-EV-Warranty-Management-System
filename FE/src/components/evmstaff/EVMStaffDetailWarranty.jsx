"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

export default function EVMStaffDetailWarranty({ open, onOpenChange, warranty }) {
  if (!warranty) return null

  const partCosts = [
    { name: "Battery Module", cost: 45000000, quantity: 1 },
    { name: "Controller Unit", cost: 3000000, quantity: 1 },
  ]

  const laborCost = 2000000
  const totalPartsCost = partCosts.reduce((sum, part) => sum + part.cost * part.quantity, 0)
  const totalCost = totalPartsCost + laborCost

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusColor = (status) => {
    const colors = {
      approved: "bg-green-500",
      pending: "bg-yellow-500",
      in_review: "bg-blue-500",
      rejected: "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <Badge className={getStatusColor(warranty.status)}>
                {warranty.status.replace("_", " ").toUpperCase()}
              </Badge>
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

          {/* Parts List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Parts Required</h3>
            <div className="space-y-2">
              {warranty.parts.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{part}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
            <div className="space-y-3">
              {partCosts.map((part, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {part.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(part.cost)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <p className="font-medium">Labor Cost</p>
                <p className="font-semibold">{formatCurrency(laborCost)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <p className="font-bold">Total Cost</p>
                <p className="font-bold text-primary">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {warranty.status === "pending" && (
              <>
                <Button variant="destructive">Reject</Button>
                <Button>Approve</Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

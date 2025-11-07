// FE/src/components/evmstaff/EvmWareDetaReceive.jsx

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import useAuth from "@/hook/useAuth"
import axios from "axios"

// === CONSTANTS ===
const ADD_QUANTITY_API_URL = "/api/repair-parts/add-quantity"; 

export default function EvmWareDetailReceive({ part, warehouse, partCatalog, onSuccess, onClose }) {
  const { auth } = useAuth()

  // === FORM STATE ===
  const [additionalQuantity, setAdditionalQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Handles the submission of the receive form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!part || additionalQuantity <= 0) {
      setError("Invalid quantity.")
      return
    }

    // Find the corresponding part from the main catalog to get all details
    const catalogPart = partCatalog.find((p) => p.partId === part.partNumber)
    if (!catalogPart) {
      setError("Could not find part details in catalog.")
      return
    }

    setIsSubmitting(true)

    try {
      // --- Prepare Payload as Query Parameters for PATCH ---
      const params = {
        // partNumber là string (partId)
        partNumber: catalogPart.partId, 

        quantity: parseInt(additionalQuantity, 10), 

        // warehouseId là integer (whId)
        warehouseId: warehouse.whId, 
      };

      await axios.patch(ADD_QUANTITY_API_URL, null, {
        params: params,
        headers: { Authorization: `Bearer ${auth.token}` },
      });


      // Success!
      onSuccess() // This will close all modals and refresh data
    } catch (err) {
      console.error("Error receiving stock (detail form):", err)
      setError(err.response?.data?.message || "Failed to update stock.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // === RENDER ===
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Receive: {part?.namePart}</DialogTitle>
        <DialogDescription>Add new stock for {part?.partNumber}.</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Quantity</Label>
            <Input value={part?.quantity || 0} disabled className="font-medium text-blue-600" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mini-additional-quantity">Quantity to Receive</Label>
            <Input
              id="mini-additional-quantity"
              type="number"
              min="1"
              value={additionalQuantity}
              onChange={(e) => setAdditionalQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="font-medium"
              autoFocus
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Receive Stock
        </Button>
      </DialogFooter>
    </form>
  )
}
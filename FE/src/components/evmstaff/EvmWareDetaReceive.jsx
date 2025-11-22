import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import useAuth from "@/hook/useAuth";
import axios from "axios";

const ADD_QUANTITY_API_URL = "/api/repair-parts/add-quantity";

export default function EvmWareDetailReceive({
  part,
  warehouse,
  partCatalog,
  onSuccess,
  onClose,
}) {
  const { auth } = useAuth();
  const [additionalQuantity, setAdditionalQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const quantityToSend = parseInt(additionalQuantity, 10) || 0;

    if (!part || quantityToSend <= 0) {
      setError("Quantity to receive must be at least 1.");
      return;
    }

    if (!part.partNumber) {
      setError("Missing part number information.");
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        partNumber: part.partNumber,
        quantity: quantityToSend,
        warehouseId: warehouse.whId,
      };

      await axios.patch(ADD_QUANTITY_API_URL, null, {
        params: params,
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      onSuccess();
    } catch (err) {
      console.error("Error receiving stock (detail form):", err);
      const message =
        err.response?.data?.message ||
        "Failed to update stock. Please check server logs.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Receive Stock</DialogTitle>
        <DialogDescription className="truncate">
          Add stock for{" "}
          <span className="font-medium text-foreground">{part?.namePart}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Responsive Grid for Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Quantity</Label>
            <Input
              value={part?.quantity || 0}
              disabled
              className="font-medium text-blue-600 bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mini-additional-quantity">
              Quantity to Receive
            </Label>
            <Input
              id="mini-additional-quantity"
              type="number"
              min="1"
              value={additionalQuantity}
              onChange={(e) => setAdditionalQuantity(e.target.value)}
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

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting || (parseInt(additionalQuantity, 10) || 0) <= 0
          }
          className="w-full sm:w-auto"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Receive Stock
        </Button>
      </DialogFooter>
    </form>
  );
}

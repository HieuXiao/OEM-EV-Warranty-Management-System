// FE/src/components/evmstaff/EvmWareReceive.jsx

// === IMPORTS ===
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import useAuth from "@/hook/useAuth";
import axios from "axios";

// === API ENDPOINT ===
const UPDATE_PART_API_URL = "/api/parts";
/**
 * EvmWareReceive Component
 *
 * @param {Object[]} warehouses - List of all available warehouses.
 * @param {Object[]} partCatalog - List of all possible parts (from /api/part-under-warranty-controller).
 * @param {Object[]} partsInventory - List of parts currently in stock (from /api/parts).
 * @param {function} onSuccess - Callback function to run on successful submission.
 * @param {function} onClose - Callback function to close the modal.
 */
export default function EvmWareReceive({
  warehouses,
  partCatalog,
  partsInventory,
  onSuccess,
  onClose,
}) {
  const { auth } = useAuth();

  // === FORM STATES ===
  const [selectedWhId, setSelectedWhId] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [additionalQuantity, setAdditionalQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // === DERIVED STATE ===
  const selectedCatalogPart = useMemo(() => {
    return partCatalog.find((p) => p.partId === selectedPartId);
  }, [partCatalog, selectedPartId]);

  const selectedInventoryPart = useMemo(() => {
    if (!selectedPartId || !selectedWhId) return null;
    return partsInventory.find(
      (p) =>
        p.partNumber === selectedPartId &&
        p.warehouse?.whId === parseInt(selectedWhId, 10)
    );
  }, [partsInventory, selectedPartId, selectedWhId]);

  const currentQuantity = useMemo(() => {
    return selectedInventoryPart?.quantity || 0;
  }, [selectedInventoryPart]);

  // === HANDLERS ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- Validation ---
    if (!selectedWhId || !selectedCatalogPart || additionalQuantity <= 0) {
      setError(
        "Please select a warehouse, a part, and enter a valid quantity."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // --- Calculate New Quantity ---
      const newTotalQuantity =
        currentQuantity + parseInt(additionalQuantity, 10);

      // --- Prepare Payload ---
      const payload = {
        partNumber: selectedCatalogPart.partId,
        namePart: selectedCatalogPart.partName,
        quantity: newTotalQuantity,
        price: selectedCatalogPart.price,
        whId: parseInt(selectedWhId, 10),
      };

      // --- API Call ---
      await axios.put(`${UPDATE_PART_API_URL}/${selectedPartId}`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // --- Success ---
      onSuccess();
    } catch (err) {
      console.error("Error receiving stock:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update stock. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // === RENDER ===
  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* --- Warehouse Selector --- */}
      <div className="space-y-2">
        <Label htmlFor="warehouse">Select Warehouse</Label>
        <Select
          onValueChange={(value) => {
            setSelectedWhId(value);
          }}
          value={selectedWhId}
        >
          <SelectTrigger id="warehouse">
            <SelectValue placeholder="Choose a warehouse..." />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((wh) => (
              <SelectItem key={wh.whId} value={String(wh.whId)}>
                {wh.name} ({wh.location})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Part Selector --- */}
      <div className="space-y-2">
        <Label htmlFor="part">Select Part (from Catalog)</Label>
        <Select onValueChange={setSelectedPartId} value={selectedPartId}>
          <SelectTrigger id="part" disabled={!selectedWhId}>
            <SelectValue
              placeholder={
                !selectedWhId
                  ? "Select a warehouse first"
                  : "Choose a part to restock..."
              }
            />
          </SelectTrigger>
          <SelectContent>
            {partCatalog.map((part) => (
              <SelectItem key={part.partId} value={part.partId}>
                <div className="flex items-center justify-between w-full">
                  <span>
                    {part.partName} ({part.partId})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Quantity Inputs (Conditional) --- */}
      {selectedWhId && selectedCatalogPart && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Quantity (in selected warehouse)</Label>
            <Input
              value={currentQuantity}
              disabled
              className="font-medium text-blue-600"
            />
            {currentQuantity < 50 && (
              <div className="flex items-center text-red-500 text-xs pt-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Warning: Low stock
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="additional-quantity">Quantity to Receive</Label>
            <Input
              id="additional-quantity"
              type="number"
              min="1"
              value={additionalQuantity}
              onChange={(e) =>
                setAdditionalQuantity(
                  Math.max(1, parseInt(e.target.value, 10) || 1)
                )
              }
              className="font-medium"
            />
          </div>
        </div>
      )}

      {/* --- Error Message --- */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- Action Buttons --- */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedCatalogPart || !selectedWhId}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Receive Stock
        </Button>
      </div>
    </form>
  );
}

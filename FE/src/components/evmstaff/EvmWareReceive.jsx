// FE/src/components/evmstaff/EvmWareReceive.jsx

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, PackageOpen } from "lucide-react";
import useAuth from "@/hook/useAuth";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// API Endpoint for adding stock to an existing part in a warehouse.
// It requires partNumber, quantity, and warehouseId as query parameters.
const ADD_QUANTITY_API_URL = "/api/repair-parts/add-quantity"; 
const LOW_STOCK_THRESHOLD = 50;

/**
 * Form for receiving new stock into a warehouse (incrementing existing stock).
 *
 * @param {object[]} warehouses - List of all warehouses (from /api/warehouses), each includes 'parts' array.
 * @param {object[]} partCatalog - Master list of all available part models (for names/details).
 * @param {Function} onSuccess - Callback function on successful submission.
 * @param {Function} onClose - Callback function to close the modal.
 */
export default function EvmWareReceive({
  warehouses,
  partCatalog,
  onSuccess,
  onClose,
}) {
  const { auth } = useAuth();

  const [selectedWhId, setSelectedWhId] = useState("");
  const [quantitiesToReceive, setQuantitiesToReceive] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------------------------
  // 1. DATA PROCESSING
  // ----------------------------------------------------

  /**
   * Get the current warehouse object with its parts data.
   */
  const currentWarehouse = useMemo(() => {
    const whIdInt = parseInt(selectedWhId, 10);
    return warehouses.find(wh => wh.whId === whIdInt);
  }, [selectedWhId, warehouses]);


  /**
   * Get a list of parts currently existing (quantity > 0) in the selected warehouse.
   * This list is displayed for receiving stock.
   */
  const partsCurrentlyInStock = useMemo(() => {
    if (!currentWarehouse) return [];

    // Filter parts that currently have stock (quantity > 0)
    return (currentWarehouse.parts || [])
      .filter(p => (p.quantity || 0) > 0)
      .map((part) => {
        // Find Part Name from Catalog (or use part name from warehouse API)
        const catalog = partCatalog.find((c) => c.partNumber === part.partNumber);
        
        return {
          partNumber: part.partNumber,
          // Prioritize name from Catalog
          partName: catalog?.partName || part.namePart || `Part ${part.partNumber}`, 
          currentQuantity: part.quantity || 0,
        };
      });
  }, [currentWarehouse, partCatalog]);


  /**
   * Get a list of part names that are either missing or have low stock.
   * Uses the pre-calculated 'lowPart' array from the /api/warehouses response.
   */
  const partsLowOrMissing = useMemo(() => {
    if (!currentWarehouse) return [];
    
    // Use the 'lowPart' array directly from the warehouse object
    return currentWarehouse.lowPart || [];
      
  }, [currentWarehouse]);

  // ----------------------------------------------------
  // 2. FORM HANDLERS
  // ----------------------------------------------------

  /**
   * Updates the state for the quantity to be received for a specific part.
   */
  const handleQuantityChange = (partId, value) => {
    // Ensure quantity is a non-negative integer
    const quantity = Math.max(0, parseInt(value, 10) || 0);
    setQuantitiesToReceive((prev) => ({
      ...prev,
      [partId]: quantity,
    }));
  };

  /**
   * Handles warehouse selection change and resets quantities.
   */
  const handleWarehouseChange = (value) => {
    setSelectedWhId(value);
    setQuantitiesToReceive({}); // Reset quantities when warehouse changes
    setError(null);
  };

  /**
   * Handles the form submission, making multiple API calls for each part update.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedWhId) {
      setError("Please select a warehouse.");
      return;
    }

    // Filter parts where the received quantity is greater than 0
    const partsToUpdate = Object.entries(quantitiesToReceive).filter(
      ([, quantity]) => quantity > 0
    );

    if (partsToUpdate.length === 0) {
      setError(
        "Please enter a valid quantity (greater than 0) for at least one part."
      );
      return;
    }

    setIsSubmitting(true);
    const warehouseId = parseInt(selectedWhId, 10);

    try {
      // Send multiple PATCH requests concurrently (using Promise.all)
      await Promise.all(
        partsToUpdate.map(([partNumber, quantity]) => {
          const params = {
            partNumber,
            quantity: parseInt(quantity, 10),
            warehouseId: warehouseId,
          };
          
          // API Call to /api/repair-parts/add-quantity
          return axios.patch(
            ADD_QUANTITY_API_URL, // The API endpoint
            {}, // Empty body, parameters are passed via query string
            {
              params: params,
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
        })
      );

      // Successfully updated all parts
      onSuccess(warehouseId);
    } catch (err) {
      console.error("Error updating stock for one or more parts:", err);
      const errorStatus = err.response?.status;
      let errorMessage = `Failed to process stock update (Status: ${
        errorStatus || "Network Error"
      }). Please try again.`;
      if (err.response?.data?.message) {
         // Use detailed error message from API if available
         errorMessage = `Update failed: ${err.response.data.message}`;
      } else if (errorStatus === 401 || errorStatus === 403) {
        errorMessage =
          "Authentication failed or insufficient permissions. Please re-login.";
      } 
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 3. RENDER LOGIC
  // ----------------------------------------------------

  const partsDisplayList = partsCurrentlyInStock;


  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* --- Warehouse Selector --- */}
      <div className="space-y-2">
        <Label htmlFor="warehouse">Select Warehouse</Label>
        <Select onValueChange={handleWarehouseChange} value={selectedWhId}>
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

      {/* --- Low/Missing Stock Warning --- */}
      {selectedWhId && partsLowOrMissing.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low/Missing Stock Warning</AlertTitle>
          <AlertDescription className="text-sm">
            The following parts are currently missing or low in this
            warehouse:
            <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5">
              {partsLowOrMissing.slice(0, 5).map((name, index) => (
                <li key={index}>{name}</li>
              ))}
              {partsLowOrMissing.length > 5 && (
                <li>and {partsLowOrMissing.length - 5} more...</li>
              )}
            </ul>

            <p className="font-semibold mt-2">
              This form is only for adding stock to parts that
              already exist (Quantity &gt; 0).
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* --- Existing Parts List --- */}
      {selectedWhId && partsDisplayList.length > 0 ? (
        <div className="space-y-2">

          <Label className="text-md font-bold block mb-3">
            Update Quantity for Existing Stock ({partsDisplayList.length} items)
          </Label>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead className="text-right">Current Qty</TableHead>

                  <TableHead className="w-[150px]">
                    Quantity to Receive
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>
                {partsDisplayList.map((part) => (
                  <TableRow key={part.partNumber}>

                    <TableCell className="font-medium">
                      {part.partName}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {part.partNumber}
                    </TableCell>

                    <TableCell className="font-bold text-blue-600 text-right">
                      {part.currentQuantity}
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={quantitiesToReceive[part.partNumber] || ""}
                        onChange={(e) =>
                          handleQuantityChange(part.partNumber, e.target.value)
                        }
                        className="w-full text-center"
                      />
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </div>

        </div>
      ) : selectedWhId &&
        partsDisplayList.length === 0 &&
        partsLowOrMissing.length === 0 ? (
        <Alert className="mt-4 bg-yellow-50 border-yellow-300 text-yellow-800">
          <PackageOpen className="h-4 w-4" />
          <AlertTitle>Warehouse Empty</AlertTitle>
          <AlertDescription>
            There are no existing parts in this warehouse to receive
            new stock for.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* --- Error Message --- */}
      {error && (
        <Alert variant="destructive" className="mt-4">
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
          disabled={
            isSubmitting ||
            !selectedWhId ||
            Object.values(quantitiesToReceive).every((q) => q <= 0)
          }
        >

          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Receive Stock ({Object.values(quantitiesToReceive).filter((q) => q > 0).length})

        </Button>

      </div>

    </form>
  );
}
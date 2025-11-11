// FE/src/components/evmstaff/EvmWareDetaReceive.jsx

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

// === CONSTANTS ===
const ADD_QUANTITY_API_URL = "/api/repair-parts/add-quantity";

export default function EvmWareDetailReceive({
  part,
  warehouse,
  partCatalog,
  onSuccess,
  onClose,
}) {
  const { auth } = useAuth();

  // === FORM STATE ===
  // Dùng state là string để cho phép giá trị rỗng khi người dùng xóa (sửa bug)
  const [additionalQuantity, setAdditionalQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles the submission of the receive form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Lấy giá trị số lượng an toàn từ state string
    const quantityToSend = parseInt(additionalQuantity, 10) || 0;

    if (!part || quantityToSend <= 0) {
      setError("Quantity to receive must be at least 1.");
      return;
    }

    const partNumber = part.partNumber;

    if (!partNumber) {
      setError("Missing part number information.");
      return;
    }

    setIsSubmitting(true);

    try {
      // --- Prepare Payload as Query Parameters for PATCH ---
      const params = {
        partNumber: partNumber,
        quantity: quantityToSend, // Gửi giá trị số đã được kiểm tra
        warehouseId: warehouse.whId,
      };

      await axios.patch(ADD_QUANTITY_API_URL, null, {
        params: params,
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // Success!
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

  // === RENDER ===
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Receive: {part?.namePart}</DialogTitle>
        <DialogDescription>
          Add new stock for {part?.partNumber} in {warehouse?.name}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Quantity</Label>
            <Input
              value={part?.quantity || 0}
              disabled
              className="font-medium text-blue-600"
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
              // SỬA BUG: Chỉ lưu giá trị string (e.target.value) vào state
              value={additionalQuantity}
              onChange={(e) => {
                // Chỉ cho phép nhập số hoặc chuỗi rỗng, không áp đặt min/max ngay lập tức
                const value = e.target.value;
                setAdditionalQuantity(value);
              }}
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
          // Disable nếu đang submit, hoặc nếu giá trị số lượng sau khi parse <= 0
          disabled={
            isSubmitting || (parseInt(additionalQuantity, 10) || 0) <= 0
          }
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Receive Stock
        </Button>
      </DialogFooter>
    </form>
  );
}

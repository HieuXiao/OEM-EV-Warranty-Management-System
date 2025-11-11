// FE/src/components/evmstaff/EvmWareDetaRegister.jsx

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API Endpoint for registering a new part type into a warehouse
const REGISTER_PART_API_URL = "/api/parts";

// Helper function to format currency (giống như trong EvmWareDetail.jsx)
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "";
  const num = parseFloat(amount);
  if (isNaN(num)) return "";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

/**
 * Form for registering a completely new part into a specific warehouse,
 * allowing selection from the master part catalog.
 * @param {object} warehouse - The current warehouse object (from /api/warehouses/{id}).
 * @param {object[]} partCatalog - Master list of all available part models (from /api/part-under-warranty-controller).
 * @param {Function} onSuccess - Callback function on successful registration.
 * @param {Function} onClose - Callback function to close the modal.
 */
export default function EvmWareDetaRegister({
  warehouse,
  partCatalog,
  onSuccess,
  onClose,
}) {
  const { auth } = useAuth();

  // === FORM STATE ===
  const [formData, setFormData] = useState({
    partNumber: "",
    namePart: "",
    quantity: "1",
    price: "0.00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------------------------
  // 1. DATA PROCESSING
  // ----------------------------------------------------

  // Map các part đã có trong kho hiện tại để dễ dàng kiểm tra
  const existingPartNumbers = useMemo(() => {
    return new Set((warehouse.parts || []).map((p) => p.partNumber));
  }, [warehouse]);

  // Danh sách các part từ catalog CHƯA tồn tại trong kho này
  const availablePartsToRegister = useMemo(() => {
    if (!partCatalog || partCatalog.length === 0) {
      return [];
    }
    return partCatalog.filter((part) => !existingPartNumbers.has(part.partId));
  }, [partCatalog, existingPartNumbers]);

  // Map catalog partId -> part object để tra cứu nhanh
  const catalogMap = useMemo(() => {
    if (!partCatalog) return new Map();
    return new Map(partCatalog.map((p) => [p.partId, p]));
  }, [partCatalog]);

  // ----------------------------------------------------
  // 2. HANDLERS
  // ----------------------------------------------------

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * Handles selection of a Part Number from the dropdown.
   */
  const handlePartSelect = (selectedPartNumber) => {
    const selectedPart = catalogMap.get(selectedPartNumber);

    if (selectedPart) {
      setFormData((prev) => ({
        ...prev,
        partNumber: selectedPart.partId,
        // Tự động điền Name và Price từ Catalog
        namePart: selectedPart.partName,
        price: String(parseFloat(selectedPart.price) || 0),
      }));
    } else {
      // Reset fields if selection is invalid or cleared
      setFormData((prev) => ({
        ...prev,
        partNumber: selectedPartNumber,
        namePart: "",
        price: "0.00",
      }));
    }
    setError(null); // Clear error on new selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { partNumber, namePart, quantity, price } = formData;

    // Input validation
    if (!partNumber || partNumber === "" || !namePart || !warehouse.whId) {
      setError(
        "Please select a Part Number and ensure all required fields are filled."
      );
      return;
    }

    const quantityInt = parseInt(quantity, 10);
    const priceFloat = parseFloat(price);

    if (
      quantityInt <= 0 ||
      isNaN(quantityInt) ||
      priceFloat < 0 ||
      isNaN(priceFloat)
    ) {
      setError(
        "Quantity must be a positive integer (>=1), and Price must be zero or positive."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        partNumber: partNumber.trim(),
        namePart: namePart.trim(),
        quantity: quantityInt,
        price: priceFloat,
        whId: warehouse.whId, // Warehouse ID
      };

      // Call API POST /api/parts
      await axios.post(REGISTER_PART_API_URL, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // Success! Pass warehouse ID back to refresh detail page
      onSuccess(warehouse.whId);
    } catch (err) {
      console.error("Error registering new part:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to register new part. Check network/server response.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 3. RENDER
  // ----------------------------------------------------

  const isNoPartsAvailable = availablePartsToRegister.length === 0;

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Register New Part</DialogTitle>
        <DialogDescription>
          Register a new part type into:{" "}
          <span className="font-semibold text-foreground">
            {warehouse.name}
          </span>
          .
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Part Number (SELECT DROPDOWN) */}
        <div className="space-y-1">
          <Label htmlFor="partSelect">Part Number (Select)</Label>
          <Select
            onValueChange={handlePartSelect}
            value={formData.partNumber}
            required={!isNoPartsAvailable}
            disabled={isNoPartsAvailable}
          >
            <SelectTrigger id="partSelect">
              <SelectValue placeholder="Select a part code..." />
            </SelectTrigger>
            <SelectContent>
              {isNoPartsAvailable ? (
                // FIX: Dùng giá trị không phải chuỗi rỗng khi không có item nào để chọn
                <SelectItem value="NO_PARTS_AVAILABLE" disabled>
                  All available parts are already registered in this warehouse.
                </SelectItem>
              ) : (
                availablePartsToRegister.map((part) => (
                  <SelectItem key={part.partId} value={part.partId}>
                    {part.partId} - {part.partName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {isNoPartsAvailable && (
            <p className="text-sm text-red-500">
              No new parts available for registration in this warehouse.
            </p>
          )}
        </div>

        {/* Part Name (AUTO-FILLED) */}
        <div className="space-y-1">
          <Label htmlFor="namePart">Part Name</Label>
          <Input
            id="namePart"
            value={formData.namePart}
            disabled
            className="bg-muted/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Quantity */}
          <div className="space-y-1">
            <Label htmlFor="quantity">Initial Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>
          {/* Price (AUTO-FILLED & DISPLAY FORMATTED) */}
          <div className="space-y-1">
            <Label htmlFor="price">Unit Price (VND)</Label>
            <Input
              id="price-display" // Dùng id khác để tránh xung đột
              type="text" // Đổi sang text để hiển thị định dạng tiền tệ
              value={formatCurrency(formData.price)} // 💡 CHỈNH SỬA: Hiển thị giá trị đã format
              disabled
              className="bg-muted/50 font-medium text-right"
            />
            {/* Vẫn giữ giá trị gốc trong formData.price (string) */}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
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
          // Disable nếu chưa chọn part hoặc đang submit
          disabled={
            isSubmitting ||
            !formData.partNumber ||
            parseFloat(formData.quantity) <= 0
          }
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Register Part
        </Button>
      </DialogFooter>
    </form>
  );
}

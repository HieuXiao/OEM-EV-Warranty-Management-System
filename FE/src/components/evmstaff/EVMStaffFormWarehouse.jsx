"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Assuming these are defined elsewhere
import { mockWarehouses, mockParts } from "@/lib/Mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EVMStaffFormWarehouse({ open, onOpenChange, onCreate }) {
  const [formState, setFormState] = useState({
    warehouse: "",
    parts: [],
  });

  const [currentPart, setCurrentPart] = useState("");
  // Change initial state to string to accommodate text input
  const [currentQty, setCurrentQty] = useState("1"); 

  const reset = () => {
    setFormState({ warehouse: "", parts: [] });
    setCurrentPart("");
    setCurrentQty("1"); // Reset to string "1"
  };

  const handleAddPart = () => {
    // Basic validation: must select a part and the quantity must be a positive number
    const quantity = Number(currentQty);
    if (!currentPart || !Number.isInteger(quantity) || quantity <= 0) return;
    
    const partObj = mockParts.find((p) => p.id === currentPart || p.id === String(currentPart));
    const name = partObj ? partObj.name || partObj.partName || partObj.serialNumber : currentPart;
    
    setFormState((s) => ({
      ...s,
      parts: [...s.parts, { id: currentPart, name, quantity: quantity }],
    }));
    
    setCurrentPart("");
    setCurrentQty("1"); // Reset part selection and quantity
  };

  const handleRemovePart = (index) => {
    setFormState((s) => ({ ...s, parts: s.parts.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.warehouse || formState.parts.length === 0) return;
    if (onCreate) onCreate(formState);
    reset();
    onOpenChange(false);
  };

  // Function to ensure quantity input only accepts digits, used for onChange
  const handleQtyChange = (e) => {
    const value = e.target.value;
    // Allow empty string (for clearing the input) or only digits
    if (value === "" || /^\d+$/.test(value)) {
      setCurrentQty(value);
    }
  };

  const isAddPartDisabled = 
    !currentPart || 
    !/^\d+$/.test(currentQty) || 
    Number(currentQty) <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">CREATE WAREHOUSE ENTRY</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* 1. Warehouse Selection - Separate Row */}
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select value={formState.warehouse} onValueChange={(v) => setFormState({ ...formState, warehouse: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {mockWarehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} — {w.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Part Selection and Quantity Input - Separate Row */}
            <div className="space-y-2">
              <Label htmlFor="part">Add Part</Label>
              <div className="flex items-center gap-4"> {/* Increased gap for separation */}
                {/* Part Select - Takes up more space */}
                <div className="flex-grow"> 
                  <Select value={currentPart} onValueChange={(v) => setCurrentPart(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockParts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name || p.partName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Quantity Input - Changed to type="text" and using a digit-only handler */}
                <Input
                  id="qty"
                  type="text" 
                  placeholder="Qty"
                  value={currentQty}
                  onChange={handleQtyChange} // Use custom handler for digit-only
                  className="w-24 text-right" // Make input smaller and right-aligned
                />
                
                <Button 
                  type="button" 
                  onClick={handleAddPart} 
                  disabled={isAddPartDisabled} // Disable button if validation fails
                >
                  Add
                </Button>
              </div>
            </div>

            {/* 3. Display Added Parts - Separate Row */}
            <div className="space-y-2 pt-2">
              <Label>Parts to add</Label>
              <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-12">
                {formState.parts.length === 0 && <p className="text-sm text-muted-foreground">No parts added</p>}
                {formState.parts.map((p, i) => (
                  <Badge key={`${p.id}-${i}`} className="flex items-center gap-2">
                    <span>{p.name} × {p.quantity}</span>
                    <button type="button" className="ml-2 text-xs font-semibold text-white/80 hover:text-white" onClick={() => handleRemovePart(i)}>✕</button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="destructive" onClick={() => { reset(); onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formState.warehouse || formState.parts.length === 0}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { vehicleModels } from "@/lib/Mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EVMStaffFormNewPart({ open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    serial: "",
    partName: "",
    branch: "",
    price: "",
    vehicleType: [],
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      serial: "",
      partName: "",
      branch: "",
      price: "",
      vehicleType: [],
      description: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            CREATE NEW PARTS
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial">Part serial</Label>
              <Input
                id="serial"
                value={formData.serial}
                onChange={(e) =>
                  setFormData({ ...formData, serial: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partName">Part name</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) =>
                  setFormData({ ...formData, partName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Part branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Part price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle type</Label>
              <Select
                value={
                  formData.vehicleType[formData.vehicleType.length - 1] || ""
                }
                onValueChange={(value) => {
                  if (!formData.vehicleType.includes(value)) {
                    setFormData({
                      ...formData,
                      vehicleType: [...formData.vehicleType, value],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select models" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.vehicleType.map((model) => (
                  <Badge
                    key={model}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        vehicleType: formData.vehicleType.filter(
                          (m) => m !== model
                        ),
                      })
                    }
                  >
                    {model} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

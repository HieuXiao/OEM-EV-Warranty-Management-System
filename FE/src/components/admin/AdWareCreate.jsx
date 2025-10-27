// FE/src/components/admin/AdWareCreate.jsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { provinces } from "@/lib/provinces"; // ✅ import danh sách tỉnh thành

export default function AdWareCreate({ onAdd }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    province: "",
    district: "",
    addressDetail: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nếu chọn lại province thì reset district
    if (name === "province") {
      setFormData({
        ...formData,
        province: value,
        district: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.province || !formData.district || !formData.addressDetail) return;

    const fullLocation = `${formData.addressDetail}, ${formData.district}, ${formData.province}`;
    await onAdd({ name: formData.name, location: fullLocation });

    setFormData({ name: "", province: "", district: "", addressDetail: "" });
    setIsAddDialogOpen(false);
  };

  const districtOptions = formData.province ? provinces[formData.province] || [] : [];

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Warehouse
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Warehouse</DialogTitle>
          <DialogDescription>Enter warehouse information</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Warehouse name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Warehouse Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Gear Garage"
            />
          </div>

          {/* Province selection */}
          <div className="grid gap-2">
            <Label>Province / City</Label>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Select a province</option>
              {Object.keys(provinces).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* District selection */}
          <div className="grid gap-2">
            <Label>District / Area</Label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
              disabled={!formData.province}
            >
              <option value="">
                {formData.province ? "Select a district" : "Select province first"}
              </option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed address */}
          <div className="grid gap-2">
            <Label>Detailed Address</Label>
            <Input
              name="addressDetail"
              value={formData.addressDetail}
              onChange={handleChange}
              placeholder="e.g., 123 Nguyen Trai"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Warehouse</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

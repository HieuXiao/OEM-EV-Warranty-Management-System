// FE/src/components/admin/AdWareCreate.jsx

// ===============IMPORT================
// Import React Hooks
import { useState } from "react";

// Import Shadcn UI Components
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

// Import Data
import { provinces } from "@/lib/provinces";

// Initial state for form data
const initialFormData = {
  name: "",
  province: "",
  district: "",
  addressDetail: "",
};


export default function AdWareCreate({ onAdd }) {
  // ===============STATE MANAGEMENT================
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);


  // ===============HANDLERS================
  /**
   * Handles input changes for all form fields.
   * Resets 'district' if a new 'province' is selected.
   * @param {object} e - The change event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

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

  /**
   * Handles the warehouse creation process.
   * Validates data, formats location, calls parent's API handler, and resets state.
   */
  const handleAdd = async () => {
    // Basic frontend validation: check if all fields are filled
    if (
      !formData.name ||
      !formData.province ||
      !formData.district ||
      !formData.addressDetail
    )
      return;

    // Combine address parts into the required 'location' format
    const fullLocation = `${formData.addressDetail}, ${formData.district}, ${formData.province}`;

    // Call the parent component's function to handle the API POST request
    await onAdd({ name: formData.name, location: fullLocation });

    // Reset form and close dialog upon successful addition (assuming onAdd succeeds)
    setFormData(initialFormData);
    setIsAddDialogOpen(false);
  };
  
  /**
   * Resets the form data and closes the dialog.
   */
  const handleCancel = () => {
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
  };

  // Dynamically compute district options based on the currently selected province
  const districtOptions = formData.province
    ? provinces[formData.province] || []
    : [];


  // ===============RENDER================
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        {/* Button to open the dialog */}
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
          {/* Warehouse name input */}
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

          {/* Province selection dropdown */}
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

          {/* District selection dropdown */}
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
                {formData.province
                  ? "Select a district"
                  : "Select province first"}
              </option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed address input */}
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Warehouse</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
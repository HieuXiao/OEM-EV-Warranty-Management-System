// FE/src/components/admin/AdPartCreate.jsx

import { useState } from "react";
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
import { ArrowLeft, ArrowRight } from "lucide-react";

// Import list of Vehicle Models for the multi-select field
import { vehicleModels } from "@/lib/Mock-data"; 

const BRANDS = ["VinFast", "Bosch", "Continental", "Denso"];

const INITIAL_FORM_DATA = {
  // Part Fields
  adminId: null,
  partId: "",
  partName: "",
  partBrand: "",
  price: "",
  vehicleModel: [], // Changed to ARRAY to store multiple selected models (Multi-Choice)
  description: "",
  isPartEnable: true,

  // Policy Fields
  policyName: "",
  availableYear: "",
  kilometer: "", // Giá trị gốc là string số
  isPolicyEnable: true,
};

export default function CreatePartForm({
  onSubmit,
  onCancel,
  currentAdminId,
  currentAdminName,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    adminId: currentAdminId,
  });

  const [newBrand, setNewBrand] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);

  const [formattedPrice, setFormattedPrice] = useState("");
  // 💡 THÊM STATE ĐỂ FORMAT TRƯỜNG KILOMETER
  const [formattedKilometer, setFormattedKilometer] = useState("");


  // Sử dụng cùng hàm format cho Price và Kilometer
  const formatNumber = (num) => {
    if (!num || isNaN(Number(num))) return "";
    // Dùng toLocaleString("en-US") để format 4,000,000
    return Number(num).toLocaleString("en-US");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // LOGIC FOR MULTI-SELECT Vehicle Model FIELD
  const handleVehicleModelChange = (model) => {
    setFormData((prev) => {
      const currentModels = prev.vehicleModel;
      if (currentModels.includes(model)) {
        // Deselect if already present
        return {
          ...prev,
          vehicleModel: currentModels.filter((m) => m !== model),
        };
      } else {
        // Select new model
        return {
          ...prev,
          vehicleModel: [...currentModels, model],
        };
      }
    });
  };
  
  // LOGIC FOR SELECT ALL
  const handleSelectAll = () => {
    setFormData((prev) => {
      // If all models are currently selected, deselect all. Otherwise, select all.
      const allSelected = prev.vehicleModel.length === vehicleModels.length;
      return {
        ...prev,
        vehicleModel: allSelected ? [] : vehicleModels,
      };
    });
  };
  // END MULTI-SELECT LOGIC

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM_DATA,
      adminId: currentAdminId,
    });
    setStep(1);
    setFormattedPrice(""); // Reset formattedPrice
    setFormattedKilometer(""); // 💡 RESET formattedKilometer
  };

  const handleNext = () => {
    if (
      formData.partId &&
      formData.partName &&
      formData.partBrand &&
      formData.price &&
      formData.vehicleModel.length > 0 // Validate: Must select at least one model
    ) {
      setStep(2);
    } else {
      alert("Please fill in all required Part fields and select at least one Vehicle Model before proceeding.");
    }
  };

  const handlePriceChange = (e) => {
    const inputStr = e.target.value;
    const rawNumberStr = inputStr.replace(/[^0-9]/g, "");
    const numericValue = rawNumberStr ? parseInt(rawNumberStr, 10) : "";
    handleChange("price", String(numericValue));
    setFormattedPrice(formatNumber(numericValue));
  };
    
  // 💡 HÀM XỬ LÝ ĐỊNH DẠNG SỐ CHO KILOMETER
  const handleKilometerChange = (e) => {
    const inputStr = e.target.value;
    const rawNumberStr = inputStr.replace(/[^0-9]/g, "");
    const numericValue = rawNumberStr ? parseInt(rawNumberStr, 10) : "";
    handleChange("kilometer", String(numericValue));
    setFormattedKilometer(formatNumber(numericValue));
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    if (
      !(formData.policyName && formData.availableYear && formData.kilometer)
    ) {
      alert("Please fill in all required Policy fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Convert the array of vehicle models into a comma-separated string for the API payload
    const vehicleModelString = formData.vehicleModel.join(', ');

    const partData = {
      partId: formData.partId,
      adminId: formData.adminId,
      partName: formData.partName,
      partBrand: formData.partBrand,
      price: Number(formData.price),
      vehicleModel: vehicleModelString, // API expects a string
      description: formData.description,
      isEnable: true,
    };

    const policyData = {
      policyName: formData.policyName,
      availableYear: Number(formData.availableYear),
      kilometer: Number(formData.kilometer), // Gửi giá trị số đã lưu trong formData
      isEnable: true,
    };

    try {
      await onSubmit({ partData, policyData });
      resetForm();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Form body is now scrollable to prevent overflow
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4"> 
      {/* Admin Information */}
      <div className="border p-3 rounded-md bg-muted/30">
        <div className="space-y-2">
          <Label>Creator Name</Label>
          <Input
            value={currentAdminName}
            readOnly
            disabled
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Admin ID</Label>
          <Input
            value={currentAdminId}
            readOnly
            disabled
            className="bg-muted/50"
          />
        </div>
      </div>

      <hr className="my-4" />

      {step === 1 ? (
        <>
          <h3 className="font-semibold text-lg">Step 1: Part Information</h3>
          {/* Part Details */}
          <div className="space-y-4">
            {/* Part ID field */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part ID *</Label>
                <Input
                  placeholder="e.g., VF8-ENG-001"
                  value={formData.partId}
                  onChange={(e) => handleChange("partId", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {/* Part Name */}
              <div className="space-y-2">
                <Label>Part Name *</Label>
                <Input
                  placeholder="e.g., Engine Oil Filter"
                  value={formData.partName}
                  onChange={(e) => handleChange("partName", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Part Brand selection/creation */}
              <div className="space-y-2">
                <Label>Part Brand *</Label>
                {!showNewBrand ? (
                  <Select
                    value={formData.partBrand}
                    onValueChange={(value) =>
                      value === "new"
                        ? setShowNewBrand(true)
                        : handleChange("partBrand", value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Brand</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new brand name"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (newBrand) {
                          handleChange("partBrand", newBrand);
                          setShowNewBrand(false);
                          setNewBrand("");
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Vehicle Model Multi-Select Field */}
              <div className="space-y-2">
                <Label>Vehicle Model *</Label>
                <Select
                  value={""} // Value must be controlled externally for Multi-select behavior
                  onValueChange={handleVehicleModelChange} // Custom handler for array manipulation
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.vehicleModel.length > 0 
                      ? `${formData.vehicleModel.length} models selected` 
                      : "Select one or more models"} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Select All Option */}
                    <SelectItem 
                        key="select-all" 
                        value="select-all" 
                        onSelect={(e) => {
                            e.preventDefault(); 
                            handleSelectAll(); // Call the Select All logic
                        }}
                        className="font-bold text-primary"
                    >
                        {formData.vehicleModel.length === vehicleModels.length ? "Deselect All" : "Select All"}
                        {formData.vehicleModel.length === vehicleModels.length && (
                          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center text-primary">✔</span>
                        )}
                    </SelectItem>
                    <hr className="my-1" />
                    {/* Individual Model Options */}
                    {vehicleModels.map((model) => (
                      <SelectItem 
                        key={model} 
                        value={model} 
                        onSelect={(e) => {
                          e.preventDefault(); 
                          handleVehicleModelChange(model);
                        }}
                      >
                        {model}
                        {formData.vehicleModel.includes(model) && (
                          // Checkmark icon to indicate selection
                          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center text-primary">✔</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Display selected models as chips/tokens */}
                {/* Use max-h-24 and overflow-y-auto to fix height overflow */}
                {formData.vehicleModel.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 max-h-24 overflow-y-auto border p-2 rounded-md bg-white/50">
                    {formData.vehicleModel.map((model) => (
                      <Button
                        key={model}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleVehicleModelChange(model)} // Click to remove
                        className="h-7 text-xs"
                      >
                        {model}
                        <span className="ml-1 font-bold">×</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label>Price (VND) *</Label>
                <Input
                  type="text"
                  placeholder="e.g., 1,500,000"
                  value={formattedPrice}
                  onChange={handlePriceChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Part description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-lg">Step 2: Warranty Policy</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Policy Name *</Label>
              <Input
                placeholder="e.g., Standard 2 Year Warranty"
                value={formData.policyName}
                onChange={(e) => handleChange("policyName", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available Year *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2 (years)"
                  value={formData.availableYear}
                  onChange={(e) =>
                    handleChange("availableYear", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Kilometer *</Label>
                <Input
                  type="text" // 💡 Đổi sang type="text" để format số
                  placeholder="e.g., 50,000 (km)"
                  value={formattedKilometer} // 💡 Sử dụng state đã format
                  onChange={handleKilometerChange} // 💡 Sử dụng hàm xử lý mới
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Part & Policy"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

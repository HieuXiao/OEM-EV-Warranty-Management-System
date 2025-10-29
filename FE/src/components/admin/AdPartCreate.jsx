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

const BRANDS = ["VinFast", "Bosch", "Continental", "Denso"];

const INITIAL_FORM_DATA = {
  // Part Fields
  adminId: null,
  partId: "",
  partName: "",
  partBrand: "",
  price: "",
  vehicleModel: "",
  description: "",
  isPartEnable: true,

  // Policy Fields
  policyName: "",
  availableYear: "",
  kilometer: "",
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

  const formatNumber = (num) => {
    if (!num || isNaN(Number(num))) return "";
    return Number(num).toLocaleString("en-US");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM_DATA,
      adminId: currentAdminId,
    });
    setStep(1);
    setFormattedPrice(""); // Reset formattedPrice
  };

  const handleNext = () => {
    if (
      formData.partId &&
      formData.partName &&
      formData.partBrand &&
      formData.price &&
      formData.vehicleModel
    ) {
      setStep(2);
    } else {
      alert("Please fill in all required Part fields before proceeding.");
    }
  };

  const handlePriceChange = (e) => {
    const inputStr = e.target.value;
    const rawNumberStr = inputStr.replace(/[^0-9]/g, "");
    const numericValue = rawNumberStr ? parseInt(rawNumberStr, 10) : "";
    handleChange("price", String(numericValue));
    setFormattedPrice(formatNumber(numericValue));
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

    const partData = {
      partId: formData.partId,
      adminId: formData.adminId,
      partName: formData.partName,
      partBrand: formData.partBrand,
      price: Number(formData.price),
      vehicleModel: formData.vehicleModel,
      description: formData.description,
      isEnable: true,
    };

    const policyData = {
      policyName: formData.policyName,
      availableYear: Number(formData.availableYear),
      kilometer: Number(formData.kilometer),
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
    <div className="space-y-6">
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
      </div>

      <hr className="my-4" />

      {step === 1 ? (
        <>
          <h3 className="font-semibold text-lg">Step 1: Part Information</h3>
          {/* Part Details */}
          <div className="space-y-4">
            {/* THÊM TRƯỜNG partId */}
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
              {/* Part Brand */}
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

              <div className="space-y-2">
                <Label>Vehicle Model *</Label>
                <Input
                  placeholder="e.g., VF8"
                  value={formData.vehicleModel}
                  onChange={(e) => handleChange("vehicleModel", e.target.value)}
                  disabled={isSubmitting}
                />
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
                  type="number"
                  placeholder="e.g., 50000 (km)"
                  value={formData.kilometer}
                  onChange={(e) => handleChange("kilometer", e.target.value)}
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

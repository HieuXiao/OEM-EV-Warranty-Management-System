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
import { vehicleModels } from "@/lib/Mock-data";

const BRANDS = ["VinFast", "Bosch", "Continental", "Denso"];

const INITIAL_FORM_DATA = {
  adminId: null,
  partId: "",
  partName: "",
  partBrand: "",
  price: "",
  vehicleModel: [],
  description: "",
  isPartEnable: true,
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
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    if (field === "price" || field === "kilometer") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue)) {
        setFormData((prev) => ({ ...prev, [field]: rawValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const formatNumber = (num) => {
    if (!num) return "";
    return Number(num).toLocaleString("en-US");
  };

  const handleNext = () => {
    // Basic validation for step 1
    if (!formData.partId || !formData.partName || !formData.price) {
      alert("Please fill in all required fields in Step 1.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalData = {
      ...formData,
      adminId: currentAdminId,
      vehicleModel: Array.isArray(formData.vehicleModel)
        ? formData.vehicleModel
        : [formData.vehicleModel],
    };
    await onSubmit(finalData);
    setIsSubmitting(false);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {step === 1 ? "Step 1: Part Information" : "Step 2: Warranty Policy"}
        </h2>
        <span className="text-sm text-muted-foreground">Step {step} of 2</span>
      </div>

      <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
        <p className="text-sm font-medium">Admin Info</p>
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div>
            <span className="text-muted-foreground">ID:</span> {currentAdminId}
          </div>
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            {currentAdminName}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            {/* CHỈNH SỬA: Grid responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part ID *</Label>
                <Input
                  placeholder="e.g., P-001"
                  value={formData.partId}
                  onChange={(e) => handleChange("partId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Part Name *</Label>
                <Input
                  placeholder="e.g., Brake Pad"
                  value={formData.partName}
                  onChange={(e) => handleChange("partName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={formData.partBrand}
                  onValueChange={(val) => handleChange("partBrand", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANDS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vehicle Model</Label>
                <Select
                  value={formData.vehicleModel[0] || ""}
                  onValueChange={(val) => handleChange("vehicleModel", [val])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price (VND) *</Label>
              <Input
                type="text"
                placeholder="e.g., 1,000,000"
                value={formatNumber(formData.price)}
                onChange={(e) => handleChange("price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Part details..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Policy Name</Label>
              <Input
                placeholder="e.g., Standard Warranty"
                value={formData.policyName}
                onChange={(e) => handleChange("policyName", e.target.value)}
              />
            </div>

            {/* CHỈNH SỬA: Grid responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available Year *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2 (years)"
                  value={formData.availableYear}
                  onChange={(e) =>
                    handleChange("availableYear", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Kilometer *</Label>
                <Input
                  type="text"
                  placeholder="e.g., 50,000 (km)"
                  value={formatNumber(formData.kilometer)}
                  onChange={(e) => handleChange("kilometer", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons Responsive */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}

            {step === 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Creating..." : "Create Part & Policy"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { vehicleModels } from "@/lib/Mock-data";

const BRANDS = ["VinFast", "Bosch", "Continental", "Denso"];

const INITIAL_FORM_DATA = {
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
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    adminId: currentAdminId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModelToggle = (model) => {
    setFormData((prev) => {
      const exists = prev.vehicleModel.includes(model);
      return {
        ...prev,
        vehicleModel: exists
          ? prev.vehicleModel.filter((m) => m !== model)
          : [...prev.vehicleModel, model],
      };
    });
  };

  const handleNext = () => {
    // Simple validation for step 1
    if (!formData.partId || !formData.partName || !formData.price) {
      alert("Please fill in required fields (ID, Name, Price)");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Prepare data logic here
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
        <span className={step === 1 ? "text-primary font-bold" : ""}>
          1. Part Info
        </span>
        <span>/</span>
        <span className={step === 2 ? "text-primary font-bold" : ""}>
          2. Policy Info
        </span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Part ID *</Label>
              <Input
                value={formData.partId}
                onChange={(e) => handleChange("partId", e.target.value)}
                placeholder="e.g. P-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Part Name *</Label>
              <Input
                value={formData.partName}
                onChange={(e) => handleChange("partName", e.target.value)}
                placeholder="e.g. Brake Pad"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select onValueChange={(val) => handleChange("partBrand", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
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
              <Label>Price (VND) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vehicle Models</Label>
            <Select onValueChange={handleModelToggle}>
              <SelectTrigger>
                <SelectValue placeholder="Add models..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {vehicleModels.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.vehicleModel.map((m) => (
                <Badge
                  key={m}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {m}{" "}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleModelToggle(m)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleNext}>Next: Policy</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Policy Name *</Label>
            <Input
              value={formData.policyName}
              onChange={(e) => handleChange("policyName", e.target.value)}
              placeholder="e.g. Standard Warranty"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Years *</Label>
              <Input
                type="number"
                value={formData.availableYear}
                onChange={(e) => handleChange("availableYear", e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div className="space-y-2">
              <Label>Kilometers *</Label>
              <Input
                value={formData.kilometer}
                onChange={(e) => handleChange("kilometer", e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create All"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const formatNumber = (num) => {
  if (num === null || num === undefined || num === "") return "";
  const numberValue = Number(num);
  if (isNaN(numberValue)) return String(num);
  return numberValue.toLocaleString("en-US");
};

export default function AdPoliEdit({
  policy,
  open,
  onOpenChange,
  onSave,
  activePoliciesCount,
}) {
  const [formData, setFormData] = useState({
    policyId: "",
    policyName: "",
    availableYear: "",
    kilometer: "",
    isEnable: false,
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        policyId: policy.policyId,
        policyName: policy.policyName,
        availableYear: policy.availableYear,
        kilometer: policy.kilometer,
        isEnable: policy.enabled,
      });
    }
  }, [policy]);

  const handleChange = (field, value) => {
    if (field === "kilometer") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue)) {
        setFormData((prev) => ({ ...prev, [field]: rawValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    onSave({
      ...policy,
      policyName: formData.policyName,
      availableYear: formData.availableYear,
      kilometer: formData.kilometer,
      enabled: formData.isEnable,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* CHỈNH SỬA: Responsive width & scroll */}
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Policy ID</Label>
            <Input value={formData.policyId} disabled />
          </div>
          <div className="space-y-2">
            <Label>Policy Name</Label>
            <Input
              value={formData.policyName}
              onChange={(e) => handleChange("policyName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Available Year</Label>
            <Input
              type="number"
              value={formData.availableYear}
              onChange={(e) => handleChange("availableYear", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Kilometer</Label>
            <Input
              type="text"
              value={formatNumber(formData.kilometer)}
              onChange={(e) => handleChange("kilometer", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  formData.isEnable ? "text-green-600" : "text-red-600"
                }`}
              >
                {formData.isEnable ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={formData.isEnable}
                onCheckedChange={(checked) => {
                  if (
                    !checked &&
                    activePoliciesCount <= 1 &&
                    formData.isEnable
                  ) {
                    alert("At least one policy must be active.");
                    return;
                  }
                  handleChange("isEnable", checked);
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

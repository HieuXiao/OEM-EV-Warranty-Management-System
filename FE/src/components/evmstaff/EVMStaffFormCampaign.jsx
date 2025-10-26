import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { vehicleModels, mockParts } from "@/lib/Mock-data";
import axiosPrivate from "@/api/axios";

// Thêm imports để hiển thị lỗi API
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

const CAMPAIGN_CREATE_URL = "/api/campaigns/create";

export default function EVMStaffFormCampaign({
  open,
  onOpenChange,
  onSave,
  campaign,
}) {
  const [formData, setFormData] = useState({
    campaignName: "",
    model: [],
    serviceDescription: "",
    startDate: "",
    endDate: "",
  });

  // State lỗi validation (frontend)
  const [errors, setErrors] = useState({});
  // State lỗi API (backend, ví dụ: trùng tên)
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Xóa state 'dateError' và 'startError' không còn dùng

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Kiểm tra Campaign Name
    if (!formData.campaignName.trim()) {
      newErrors.campaignName = "Campaign Name is required.";
    }

    // 2. Kiểm tra Vehicle Models
    if (formData.model.length === 0) {
      newErrors.model = "At least one vehicle model must be selected.";
    }

    // 3. Kiểm tra Description
    if (!formData.serviceDescription.trim()) {
      newErrors.serviceDescription = "Description is required.";
    }

    // 4. Kiểm tra Start Date
    if (!formData.startDate) {
      newErrors.startDate = "Start Date is required.";
    } else {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate.getTime() < today.getTime()) {
        newErrors.startDate = "Start date cannot be in the past.";
      }
    }

    // 5. Kiểm tra End Date
    if (!formData.endDate) {
      newErrors.endDate = "Due Date is required.";
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.endDate);
      const requiredDaysMs = 5 * 24 * 60 * 60 * 1000;
      if (dueDate.getTime() - startDate.getTime() < requiredDaysMs) {
        newErrors.endDate =
          "Due date must be at least five days after Start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setErrors({}); // Xóa lỗi cũ

    // Chạy validation frontend trước
    if (!validateForm()) {
      setIsLoading(false);
      return; // Dừng lại nếu validation thất bại
    }

    const newCampaign = {
      campaignName: formData.campaignName,
      serviceDescription: formData.serviceDescription,
      startDate: formData.startDate,
      endDate: formData.endDate,
      model: formData.model,
    };

    try {
      const response = await axiosPrivate.post(
        CAMPAIGN_CREATE_URL,
        JSON.stringify(newCampaign),
        { headers: { "Content-Type": "application/json" } }
      );

      onSave(response.data);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Cập nhật logic bắt lỗi BE (ví dụ: trùng tên)
      const errorMessage = error.response?.data
        .toLowerCase()
        .includes("campaign")
        ? "Campaign name exist."
        : "An unexpected error occurred. Please try again.";
      setApiError(errorMessage);
      console.error("API Error: " + (error.response?.data || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // compute today's date string in yyyy-mm-dd for input min
  const pad = (n) => n.toString().padStart(2, "0");
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;

  // SỬA LỖI: dùng formData.startDate thay vì formData.start
  const minDueStr = (() => {
    if (!formData.startDate) return undefined;
    const s = new Date(formData.startDate);
    s.setDate(s.getDate() + 5);
    return `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
  })();

  function resetForm() {
    setFormData({
      campaignName: "",
      model: [],
      serviceDescription: "",
      startDate: "",
      endDate: "",
    });
    setErrors({}); // Xóa lỗi validation
    setApiError(null); // Xóa lỗi API
  }

  // Hàm helper để cập nhật form và xóa lỗi
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi cho trường này khi người dùng bắt đầu nhập
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {campaign ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign ID & Name */}

          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              value={formData.campaignName}
              // SỬA LỖI: Dùng handleFormChange
              onChange={(e) => handleFormChange("campaignName", e.target.value)}
            />
            {errors.campaignName && (
              <p className="text-sm text-destructive mt-1">
                {errors.campaignName}
              </p>
            )}
          </div>

          {/* Vehicle Models & Parts (multi-select style) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label htmlFor="vehicleModels">Vehicle Models</Label>
              <Select
                value={
                  formData.model.length
                    ? formData.model[formData.model.length - 1]
                    : ""
                }
                onValueChange={(value) => {
                  let newModels;
                  // SỬA LỖI: dùng vehicleModels
                  if (value === "__ALL_MODELS__") {
                    newModels = [...vehicleModels];
                  } else if (!formData.model.includes(value)) {
                    newModels = [...formData.model, value];
                  } else {
                    newModels = formData.model; // không đổi
                  }
                  // SỬA LỖI: Dùng handleFormChange
                  handleFormChange("model", newModels);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle models" />
                </SelectTrigger>
                <SelectContent className="max-h-56 overflow-auto">
                  <SelectItem key="__ALL_MODELS__" value="__ALL_MODELS__">
                    All vehicle models
                  </SelectItem>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="text-sm text-destructive mt-1">{errors.model}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.model.map((model) => (
                  <Badge
                    key={model}
                    variant="secondary"
                    className="cursor-pointer"
                    // SỬA LỖI: Dùng handleFormChange
                    onClick={() =>
                      handleFormChange(
                        "model",
                        formData.model.filter((m) => m !== model)
                      )
                    }
                  >
                    {model} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.serviceDescription}
              // SỬA LỖI: Dùng handleFormChange
              onChange={(e) =>
                handleFormChange("serviceDescription", e.target.value)
              }
              className="min-h-[80px] min-w-0 max-w-full box-border whitespace-pre-wrap break-words break-all overflow-auto resize-y"
            />
            {errors.serviceDescription && (
              <p className="text-sm text-destructive mt-1">
                {errors.serviceDescription}
              </p>
            )}
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                min={todayStr}
                value={formData.startDate}
                // SỬA LỖI: Dùng handleFormChange và đơn giản hóa logic
                onChange={(e) => {
                  const newStart = e.target.value;
                  handleFormChange("startDate", newStart);

                  // Xóa endDate nếu nó không còn hợp lệ
                  if (newStart && formData.endDate) {
                    const startDate = new Date(newStart);
                    const dueDate = new Date(formData.endDate);
                    const requiredDaysMs = 5 * 24 * 60 * 60 * 1000;
                    if (
                      dueDate.getTime() - startDate.getTime() <
                      requiredDaysMs
                    ) {
                      handleFormChange("endDate", ""); // Xóa endDate
                    }
                  }
                }}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Due Date</Label>
              <Input
                id="end"
                type="date"
                min={minDueStr}
                value={formData.endDate}
                // SỬA LỖI: Dùng handleFormChange
                onChange={(e) => {
                  handleFormChange("endDate", e.target.value);
                }}
                disabled={!formData.startDate} // Giữ lại logic tốt này
              />
              {errors.endDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* THÊM MỚI: Hiển thị lỗi từ BE */}
          {apiError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading} // THÊM MỚI
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {/* THÊM MỚI: Hiển thị trạng thái tải */}
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

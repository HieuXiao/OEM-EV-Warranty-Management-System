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
const CAMPAIGN_URL = "/api/campaigns/all";
const VEHICLE_URL = "/api/vehicles";
const EMAIL_URL = "/api/email";

// --- HÀM HELPER MỚI ---
// Hàm kiểm tra sự chồng chéo của hai khoảng ngày
// Logic: (Bắt đầu A <= Kết thúc B) VÀ (Kết thúc A >= Bắt đầu B)
const checkDateOverlap = (startA, endA, startB, endB) => {
  if (!startA || !endA || !startB || !endB) return false;
  const sA = new Date(startA);
  const eA = new Date(endA);
  const sB = new Date(startB);
  const eB = new Date(endB);
  sA.setHours(0, 0, 0, 0);
  eA.setHours(0, 0, 0, 0);
  sB.setHours(0, 0, 0, 0);
  eB.setHours(0, 0, 0, 0);
  return sA <= eB && eA >= sB;
};
// --- KẾT THÚC HÀM HELPER ---

export default function EVMStaffFormCampaign({
  open,
  onOpenChange,
  onSave,
  campaign,
  allCampaigns = [], // <-- NHẬN PROP MỚI (mặc định là mảng rỗng)
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

  const sendEmailsToAffectedCustomers = async (newCampaign) => {
    try {
      // 1. Lấy danh sách TẤT CẢ các xe
      const vehicleResponse = await axiosPrivate.get(VEHICLE_URL);
      const allVehicles = vehicleResponse.data;

      // 2. Lọc các xe bị ảnh hưởng
      const affectedModels = new Set(newCampaign.model);
      const affectedVehicles = allVehicles.filter((vehicle) =>
        affectedModels.has(vehicle.model)
      );

      // 3. Lấy danh sách khách hàng duy nhất (unique) từ các xe bị ảnh hưởng
      const affectedCustomers = new Map();
      for (const vehicle of affectedVehicles) {
        if (vehicle.customer && vehicle.customer.customerEmail) {
          // Dùng email làm key để đảm bảo mỗi khách hàng chỉ nhận 1 email
          affectedCustomers.set(
            vehicle.customer.customerEmail,
            vehicle.customer
          );
        }
      }
      const uniqueCustomers = Array.from(affectedCustomers.values());

      // 4. [THAY ĐỔI] Tạo payload email với các trường mới
      const emailPayloads = uniqueCustomers.map((customer) => ({
        recipient: customer.customerEmail,
        subject: `Thông báo chiến dịch bảo hành: ${newCampaign.campaignName}`,
        fullName: customer.customerName,
        url: "", // Theo yêu cầu của bạn, không cần giá trị
        campaignName: newCampaign.campaignName,

        // Thêm các trường mới từ Swagger
        modelName: newCampaign.model.join(", "), // Gửi danh sách các model
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
      }));

      // 5. Gửi tất cả email (dùng Promise.allSettled)
      const emailPromises = emailPayloads.map((payload) =>
        axiosPrivate.post(EMAIL_URL, JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        })
      );

      const results = await Promise.allSettled(emailPromises);
    } catch (err) {
      console.error("Background email sending failed:", err);
    }
  };
  // --- KẾT THÚC CẬP NHẬT ---

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

    // --- LOGIC VALIDATION MỚI ---
    // 6. Kiểm tra Model trùng lặp thời gian
    // (Chỉ chạy nếu các trường model và ngày tháng cơ bản đã hợp lệ)
    if (
      formData.model.length > 0 &&
      formData.startDate &&
      formData.endDate &&
      !newErrors.model &&
      !newErrors.startDate &&
      !newErrors.endDate
    ) {
      for (const modelToCheck of formData.model) {
        // Tìm bất kỳ chiến dịch nào *khác* đang dùng model này
        const overlappingCampaign = allCampaigns.find((existingCampaign) => {
          // Bỏ qua nếu đang so sánh với chính nó (trường hợp edit)
          // if (campaign && existingCampaign.id === campaign.id) {
          //   return false;
          // }

          // Kiểm tra xem chiến dịch hiện có chứa model này không
          const modelMatch =
            Array.isArray(existingCampaign.model) &&
            existingCampaign.model.includes(modelToCheck);

          if (modelMatch) {
            // Nếu có, kiểm tra xem ngày có bị chồng chéo không
            return checkDateOverlap(
              formData.startDate,
              formData.endDate,
              existingCampaign.startDate,
              existingCampaign.endDate
            );
          }
          return false;
        });

        if (overlappingCampaign) {
          newErrors.model = `Model "${modelToCheck}" exist in campaign ("${overlappingCampaign.campaignName}") with date overlap.`;
          break; // Dừng ngay khi tìm thấy lỗi đầu tiên
        }
      }
    }
    // --- KẾT THÚC LOGIC MỚI ---

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

      const createdCampaign = response.data;

      onSave(response.data);
      onOpenChange(false);
      resetForm();

      sendEmailsToAffectedCustomers(createdCampaign);
      window.location.reload();
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
      {/* CHỈNH SỬA: Responsive width & scroll */}
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {campaign ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              value={formData.campaignName}
              onChange={(e) => handleFormChange("campaignName", e.target.value)}
            />
            {errors.campaignName && (
              <p className="text-sm text-destructive mt-1">
                {errors.campaignName}
              </p>
            )}
          </div>

          {/* Vehicle Models & Parts (multi-select style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Model */}
            <div className="space-y-2 sm:col-span-2">
              {" "}
              {/* Full width on tablet/desktop as well for better UX with badges */}
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
              className="min-h-[100px] min-w-0 max-w-full box-border whitespace-pre-wrap break-words break-all overflow-auto resize-y bg-background"
            />
            {errors.serviceDescription && (
              <p className="text-sm text-destructive mt-1">
                {errors.serviceDescription}
              </p>
            )}
          </div>

          {/* Start / End - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {/* Lỗi trùng lặp model/thời gian sẽ hiển thị ở đây */}
            {errors.model && (
              <p className="text-sm text-destructive mt-1 sm:col-span-2">
                {errors.model}
              </p>
            )}
          </div>

          {/* THÊM MỚI: Hiển thị lỗi từ BE */}
          {apiError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
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

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosPrivate from "@/api/axios";
import { Loader2, Save, Edit, X } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

const VEHICLE_UPDATE_URL = "/api/vehicles";

export default function CustomerVinCard({ vinData, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(vinData);
  const [status, setStatus] = useState({
    loading: false,
    errors: {}, // { plate: "Biển số đã tồn tại" }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(vinData); // <-- THÊM MỚI: Reset form về dữ liệu gốc
    setStatus({ loading: false, errors: {} }); // <-- THÊM MỚI: Xóa lỗi
  };

  const handleSave = async () => {
    // 1. Bật loading và xóa lỗi cũ
    setStatus({ loading: true, errors: {} });

    try {
      // 2. Gọi API để update.
      // URL thường có dạng: /api/vehicles/{vin}
      const UPDATE_URL = `${VEHICLE_UPDATE_URL}/${form.vin}`;

      // Chúng ta chỉ gửi những gì thay đổi, ví dụ:
      const updatedData = {
        model: form.model,
        plate: form.plate,
        type: form.type,
        color: form.color,
      };

      await axiosPrivate.put(UPDATE_URL, JSON.stringify(updatedData), {
        headers: { "Content-Type": "application/json" },
      });

      // 3. Nếu thành công:
      onUpdate(form); // Cập nhật state ở component cha (ScsProfDetail)
      setEditMode(false);
      setStatus({ loading: false, errors: {} });
    } catch (error) {
      // 4. Nếu thất bại (ví dụ: Lỗi 409 - Biển số trùng)
      console.error("Vehicle Update Error:", error);
      const fieldErrors = {};

      if (error.response && error.response.status === 409) {
        const message = error.response.data?.message || "";
        if (message.toLowerCase().includes("plate")) {
          fieldErrors.plate = "This plate is already registered.";
        } else {
          fieldErrors.api = "Conflict: Vehicle data is duplicated.";
        }
      } else {
        fieldErrors.api = "Failed to save. Please try again.";
      }

      setStatus({ loading: false, errors: fieldErrors });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{form.vin}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div>
          <label className="text-sm font-medium">Model</label>
          <Input
            name="model"
            value={form.model}
            onChange={handleChange}
            disabled={!editMode || status.loading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Plate</label>
          <Input
            name="plate"
            value={form.plate}
            onChange={handleChange}
            disabled={!editMode || status.loading}
          />
          {/* THÊM HIỂN THỊ LỖI */}
          {status.errors.plate && (
            <p className="text-xs text-red-500 mt-1">{status.errors.plate}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select
            value={form.type}
            onValueChange={(value) =>
              setForm({
                ...form,
                type: value,
              })
            }
            disabled={!editMode || status.loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="car" value="Car">
                Car
              </SelectItem>
              <SelectItem key="bike" value="Electric Motorbike">
                Electric Motorbike
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Color</label>
          <Input
            name="color"
            value={form.color}
            onChange={handleChange}
            disabled={!editMode || status.loading}
          />
        </div>
        {status.errors.api && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {status.errors.api}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-2">
          {editMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel} // <-- SỬA (dùng hàm mới)
                disabled={status.loading} // <-- THÊM
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={status.loading} // <-- SỬA
                className="gap-1"
              >
                {/* THÊM ICON LOADING */}
                {status.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

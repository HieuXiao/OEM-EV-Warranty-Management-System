import { useEffect, useState } from "react";
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
} from "@/components/ui/dialog";
// import { useToast } from "@/components/ui/use-toast"; // ❌ Đã loại bỏ
import { provinces } from "@/lib/provinces";
import axiosPrivate from "@/api/axios";

export default function AdWareEdit({ open, formData: parentData, onSave, onCancel }) {
  // const { toast } = useToast(); // ❌ Đã loại bỏ
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(""); // ✅ State để lưu lỗi 409
  const [localData, setLocalData] = useState({
    whId: "",
    name: "",
    province: "",
    district: "",
    addressDetail: "",
  });

  // Khởi tạo/Fetch dữ liệu khi mở dialog
  useEffect(() => {
    // ✅ Reset lỗi khi dialog mở
    setSubmitError("");
    
    const fetchWarehouse = async () => {
      if (open && parentData?.whId) {
        setLoading(true);
        try {
          const res = await axiosPrivate.get(`/api/warehouses/${parentData.whId}`);
          const { name, location } = res.data;

          let province = "";
          let district = "";
          let addressDetail = "";

          if (location) {
            const parts = location.split(",").map((p) => p.trim()).filter(p => p);
            
            if (parts.length >= 3) {
              province = parts[parts.length - 1];
              district = parts[parts.length - 2];
              addressDetail = parts.slice(0, parts.length - 2).join(", "); 
            } else if (parts.length === 2) {
              [district, province] = parts;
              addressDetail = "";
            } else if (parts.length === 1) {
              [province] = parts;
              addressDetail = "";
            }
          }

          const validProvince = provinces[province] ? province : "";
          const validDistrict =
            validProvince && provinces[validProvince]?.includes(district)
              ? district
              : "";

          setLocalData({
            whId: parentData.whId,
            name: name || "",
            province: validProvince,
            district: validDistrict,
            addressDetail: addressDetail || "",
          });
        } catch (err) {
          console.error("Failed to fetch warehouse:", err);
          // Có thể thêm setSubmitError ở đây nếu lỗi fetch
          setSubmitError("Failed to load warehouse details. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWarehouse();
  }, [open, parentData]);

  const handleChange = (e) => {
    setSubmitError(""); // ✅ Xóa lỗi khi người dùng bắt đầu chỉnh sửa lại
    const { name, value } = e.target;
    if (name === "province") {
      setLocalData({ ...localData, province: value, district: "" });
    } else {
      setLocalData({ ...localData, [name]: value });
    }
  };

  const handleSave = async () => {
    setSubmitError(""); // Reset lỗi trước khi lưu
    const { whId, name, province, district, addressDetail } = localData;

    // ✅ Thêm kiểm tra validation frontend cơ bản
    if (!name.trim() || !province) {
        setSubmitError("Warehouse Name and Province are required.");
        return;
    }

    // Ghép lại location
    const locationParts = [addressDetail, district, province].filter(Boolean);
    const fullLocation = locationParts.join(", ");
    
    // Bắt đầu loading button
    setLoading(true);

    try {
      await axiosPrivate.put(`/api/warehouses/${whId}`, {
        name: name.trim(),
        location: fullLocation,
      });

      // Thành công
      onSave({
        whId,
        name: name.trim(),
        location: fullLocation,
      });
      // Không cần toast, onSave sẽ tự động đóng dialog

    } catch (err) {
      console.error("Failed to update warehouse:", err);
      let errorMessage = "An unknown error occurred.";

      // ✅ Xử lý lỗi 409 cụ thể từ server
      if (err.response && err.response.status === 409) {
        // Lấy thông báo lỗi từ body của response nếu có
        errorMessage = err.response.data || 'Warehouse name or location already exists';
      } else if (err.response && err.response.data) {
        // Xử lý các lỗi khác từ server
        errorMessage = err.response.data.message || err.response.data || errorMessage;
      }
      
      setSubmitError(errorMessage); // Hiển thị lỗi trong dialog
    } finally {
        setLoading(false);
    }
  };

  const districtOptions = localData.province ? provinces[localData.province] || [] : [];
  
  // Kiểm tra điều kiện disable button Save
  const isSaveDisabled = loading || !localData.name.trim() || !localData.province;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Warehouse</DialogTitle>
          <DialogDescription>Update warehouse information</DialogDescription>
        </DialogHeader>

        {loading && !submitError ? ( // Chỉ hiện Loading nếu không có lỗi submit (tránh lỗi 409 khi fetch)
          <p className="text-center py-6">Loading warehouse details...</p>
        ) : (
          <div className="grid gap-4 py-4">
            
            {/* ✅ Hiển thị lỗi từ Server (409) hoặc lỗi Validate */}
            {submitError && (
              <div className="text-sm font-medium text-red-700 bg-red-50 border border-red-300 p-3 rounded-md">
                🚨 **Error:** {submitError}
              </div>
            )}
            
            {/* Warehouse Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Warehouse Name</Label>
              <Input
                id="name"
                name="name"
                value={localData.name}
                onChange={handleChange}
                placeholder="Enter warehouse name"
              />
            </div>

            {/* Province */}
            <div className="grid gap-2">
              <Label>Province / City</Label>
              <select
                name="province"
                value={localData.province}
                onChange={handleChange}
                className="border rounded-md px-3 py-2"
              >
                <option value="">Select a province</option>
                {Object.keys(provinces).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="grid gap-2">
              <Label>District / Area</Label>
              <select
                name="district"
                value={localData.district}
                onChange={handleChange}
                disabled={!localData.province}
                className="border rounded-md px-3 py-2"
              >
                <option value="">
                  {localData.province ? "Select a district" : "Select province first"}
                </option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Address Detail */}
            <div className="grid gap-2">
              <Label>Detailed Address</Label>
              <Input
                name="addressDetail"
                value={localData.addressDetail}
                onChange={handleChange}
                placeholder="e.g., 123 Nguyen Trai"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
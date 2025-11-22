// FE/src/components/admin/AdUserEdit.jsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";

export default function AdUserEdit({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  user,
  setFormData,
}) {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // ===== Roles có thể đổi Service Center =====
  const SC_REQUIRED_ROLES = ["sc_staff", "sc_technician"];
  const canChangeCenter = user && SC_REQUIRED_ROLES.includes(user.roleName?.toLowerCase());

  // ===== Fetch service centers =====
  useEffect(() => {
    if (canChangeCenter) {
      const fetchCenters = async () => {
        try {
          setLoadingCenters(true);
          const res = await axiosPrivate.get("/api/service-centers");
          setServiceCenters(res.data || []);
        } catch (err) {
          console.error("Failed to fetch centers:", err);
        } finally {
          setLoadingCenters(false);
        }
      };
      fetchCenters();
    }
  }, [user]);

  // ===== Khi mở Edit → fill dữ liệu user =====
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.accountId,
        username: user.username,
        fullname: user.fullName,
        gender: user.gender ? "male" : "female",
        email: user.email,
        phone: user.phone || "",
        serviceCenter: user.centerId ? user.centerId.toString() : "",
      });
    }
  }, [user]);

  // ====== Gọi API đổi Service Center ======
  const handleChangeCenter = async () => {
    if (!formData.serviceCenter || !user) return;

    try {
      console.log("user:", user.accountId, "change center to", formData.serviceCenter);
      await axiosPrivate.put(
        `/api/accounts/${user.accountId}/change-service-center/${formData.serviceCenter}`
      );
      console.log("Service center updated.");
    } catch (err) {
      console.error("Change center failed:", err);
      alert("Failed to update service center.");
    }
  };

  // ====== Submit tổng ======
  const handleSave = async () => {
    await onSubmit(); // update name, email, phone,...

    // Nếu được phép đổi center → gọi API đổi center
    if (canChangeCenter) {
      await handleChangeCenter();
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update account information</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {[{ id: "fullname", label: "Full Name" },
            { id: "email", label: "Email" },
            { id: "phone", label: "Phone Number" }
          ].map((field) => (
            <div className="grid gap-2" key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={onChange}
                placeholder={field.label}
              />
            </div>
          ))}

          {/* Gender */}
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ===== Assign Service Center (conditional) ===== */}
        {canChangeCenter && (
          <div className="mt-2 space-y-2">
            <Label>Assign Service Center</Label>
            <Select
              value={formData.serviceCenter}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, serviceCenter: v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingCenters ? "Loading centers..." : "Select service center"
                  }
                />
              </SelectTrigger>

              <SelectContent className="max-h-60 w-[540px] overflow-auto">
                {serviceCenters.map((center) => (
                  <SelectItem
                    key={center.centerId}
                    value={center.centerId.toString()}
                    className="py-2 whitespace-normal break-words !flex !flex-col !items-start space-y-1"
                  >
                    <div className="w-full whitespace-normal break-words text-sm !text-left">
                      <span className="font-medium break-words">
                        {center.centerName} - {center.location}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

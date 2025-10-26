// FE/src/components/admin/AdUserCreate.jsx

import { useEffect, useState } from "react";
import axiosPrivate from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdUserCreate({
  open,
  onClose,
  onChange,
  formData,
  onSubmit,
  onReset,
}) {
  // ================= STATE =================
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // ================= FETCH SERVICE CENTERS =================
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoadingCenters(true);
        const res = await axiosPrivate.get("/api/service-centers");
        setServiceCenters(res.data || []);
      } catch (err) {
        console.error("Failed to fetch service centers:", err);
      } finally {
        setLoadingCenters(false);
      }
    };
    fetchCenters();
  }, []);

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit();

      if (formData.serviceCenter) {
        await axiosPrivate.post(
          `/api/accounts/assign-service-center/${formData.id}/${formData.serviceCenter}`
        );
        alert("User assigned to service center successfully!");
      }

      onReset();
      onClose();
    } catch (err) {
      console.error("Error creating user and assigning center:", err);
      alert(
        "Error: " + (err.response?.data?.message || "Something went wrong.")
      );
    }
  };

  // ================= UI =================
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Account ID + Fullname */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input
                name="id"
                value={formData.id}
                onChange={onChange}
                placeholder="Enter Account ID"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                name="fullname"
                value={formData.fullname}
                onChange={onChange}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Row 2: Password + Username */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                name="username"
                value={formData.username}
                onChange={onChange}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Row 3: Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Row 4: Role + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) =>
                  onChange({ target: { name: "role", value: v } })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="evm_staff">EVM Staff</SelectItem>
                  <SelectItem value="sc_staff">SC Staff</SelectItem>
                  <SelectItem value="sc_technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) =>
                  onChange({ target: { name: "gender", value: v } })
                }
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

          {/* Row 5: Assign Service Center */}
          {/* Row 5: Assign Service Center */}
          <div className="space-y-2">
            <Label>Assign Service Center</Label>
            <Select
              value={formData.serviceCenter}
              onValueChange={(v) =>
                onChange({ target: { name: "serviceCenter", value: v } })
              }
            >
              <SelectTrigger className="w-full max-w-full truncate">
                <SelectValue
                  placeholder={
                    loadingCenters
                      ? "Loading centers..."
                      : "Select service center (optional)"
                  }
                />
              </SelectTrigger>

              <SelectContent className="max-h-60 w-[560px] overflow-auto">
                {serviceCenters.map((center) => (
                  <SelectItem
                    key={center.centerId}
                    value={center.centerId.toString()}
                    className="whitespace-normal break-words text-sm leading-snug py-2"
                  >
                    <div className="max-w-full">
                      <span className="font-medium block">
                        {center.centerName} - {center.location}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

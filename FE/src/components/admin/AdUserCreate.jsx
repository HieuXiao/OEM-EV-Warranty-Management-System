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

const ErrorMessage = ({ message }) => (
  <p className="text-sm text-red-500 mt-1">{message}</p>
);

export default function AdUserCreate({
  open,
  onClose,
  onChange,
  formData,
  onSubmit,
  onReset,
}) {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const SC_REQUIRED_ROLES = ["sc_staff", "sc_technician"];
  const shouldShowServiceCenter = SC_REQUIRED_ROLES.includes(formData.role);

  useEffect(() => {
    if (open) {
      fetchServiceCenters();
      setValidationErrors({});
    }
  }, [open]);

  const fetchServiceCenters = async () => {
    setLoadingCenters(true);
    try {
      const response = await axiosPrivate.get("/api/service-centers");
      setServiceCenters(response.data);
    } catch (error) {
      console.error("Error fetching service centers:", error);
    } finally {
      setLoadingCenters(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.fullname?.trim()) errors.fullname = "Full name is required";
    if (!formData.username?.trim()) errors.username = "Username is required";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!formData.email?.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";

    if (!formData.phone?.trim()) errors.phone = "Phone is required";

    if (shouldShowServiceCenter && !formData.serviceCenter) {
      errors.serviceCenter = "Service center is required for this role";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* CHỈNH SỬA: Responsive Modal Width & Scroll */}
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CHỈNH SỬA: Responsive Grid (1 col mobile, 2 cols tablet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={onChange}
                required
              />
              <ErrorMessage message={validationErrors.fullname} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={onChange}
                required
              />
              <ErrorMessage message={validationErrors.username} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
              />
              <ErrorMessage message={validationErrors.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
              />
              <ErrorMessage message={validationErrors.email} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
              />
              <ErrorMessage message={validationErrors.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
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

          {shouldShowServiceCenter && (
            <div className="space-y-2">
              <Label>Assign Service Center</Label>
              <Select
                value={formData.serviceCenter}
                onValueChange={(v) =>
                  onChange({ target: { name: "serviceCenter", value: v } })
                }
              >
                <SelectTrigger
                  className={`w-full ${
                    validationErrors.serviceCenter ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue
                    placeholder={
                      loadingCenters ? "Loading..." : "Select service center"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 max-w-[90vw] overflow-auto">
                  {serviceCenters.map((center) => (
                    <SelectItem
                      key={center.centerId}
                      value={center.centerId.toString()}
                    >
                      {center.centerName} - {center.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorMessage message={validationErrors.serviceCenter} />
            </div>
          )}

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

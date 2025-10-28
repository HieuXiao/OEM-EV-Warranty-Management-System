// FE/src/components/admin/AdUserCreate.jsx

// ======================= IMPORTS =======================
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

// Helper component for displaying validation errors
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
  // ================= STATE =================
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // ================= VISIBILITY LOGIC =================

  // Roles that require Service Center assignment
  const SC_REQUIRED_ROLES = ["sc_staff", "sc_technician"];
  
  // Determines if the Service Center selection should be visible
  const shouldShowServiceCenter = SC_REQUIRED_ROLES.includes(formData.role);

  // ================= VALIDATION LOGIC =================

  /**
   * Performs client-side validation for all required form fields.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const errors = {};

    // --- General Rules: Not Empty ---
    if (!formData.fullname) errors.fullname = "Full Name is required.";
    if (!formData.username) errors.username = "Username is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.phone) errors.phone = "Phone number is required.";

    // --- Full Name Validation (Vietnamese Standard) ---
    if (formData.fullname && formData.fullname.trim().split(/\s+/).length < 2) {
      errors.fullname = "Full Name must contain at least two words (e.g., First Last).";
    }
    // Allowed: letters, Vietnamese diacritics, space, hyphen, single quote.
    const nameRegex = /^[a-zA-Z\s\u00C0-\u1EF9'-]{5,80}$/; 
    if (formData.fullname && !nameRegex.test(formData.fullname.trim())) {
      errors.fullname = "Invalid name (5-80 chars, no numbers or special symbols).";
    }

    // --- Username Validation (International Standard) ---
    // Alphanumeric, underscore, or dot. Min 5, max 30.
    const usernameRegex = /^[a-zA-Z0-9._]{5,30}$/; 
    if (formData.username && !usernameRegex.test(formData.username)) {
      errors.username = "Username must be 5-30 characters (alphanumeric, dot, or underscore).";
    }

    // --- Password Validation (International Complexity) ---
    // Min 8 characters, at least one uppercase, one lowercase, one number, one special character.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      errors.password = "Password must be 8-50 chars: 1 Uppercase, 1 lowercase, 1 number, 1 symbol (@$!%*?&).";
    }

    // --- Email Validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "Invalid email format (e.g., user@domain.com).";
    }

    // --- Phone Validation (Vietnamese Standard: 10 digits, starting with 0) ---
    const phoneRegex = /^0\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = "Invalid phone format (must be 10 digits, starting with 0).";
    }
    
    // --- Conditional Service Center Validation ---
    if (shouldShowServiceCenter && !formData.serviceCenter) {
        errors.serviceCenter = "Service Center is required for SC Staff/Technician roles.";
    }


    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ================= FETCH SERVICE CENTERS =================
  // Fetch list of Service Centers for assignment dropdown
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
  // Calls the onSubmit prop (where user creation and SC assignment logic resides)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        console.log("Validation failed.");
        return;
    }
    
    try {
      await onSubmit();

      // Cleanup on successful submission
      onReset();
      onClose();
    } catch (err) {
      console.error("Error creating user:", err);
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
          {/* Row 1: Fullname + Username */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={onChange}
                placeholder="E.g., Nguyen Van A"
                required
                className={validationErrors.fullname ? "border-red-500" : ""}
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
                placeholder="E.g., van_a.nguyen"
                required
                className={validationErrors.username ? "border-red-500" : ""}
              />
              <ErrorMessage message={validationErrors.username} />
            </div>
          </div>

          {/* Row 2: Password + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Min 8 chars, including 1A, 1a, 1#, 1 number"
                required
                className={validationErrors.password ? "border-red-500" : ""}
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
                placeholder="E.g., user@example.com"
                required
                className={validationErrors.email ? "border-red-500" : ""}
              />
              <ErrorMessage message={validationErrors.email} />
            </div>
          </div>

          {/* Row 3: Phone + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                placeholder="E.g., 0901234567 (10 digits)"
                required
                className={validationErrors.phone ? "border-red-500" : ""}
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

          {/* Row 4: Gender */}
          <div className="grid grid-cols-2 gap-4">
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
            <div></div> {/* Layout alignment spacer */}
          </div>

          {/* Row 5: Assign Service Center (CONDITIONAL DISPLAY) */}
          {shouldShowServiceCenter && (
            <div className="space-y-2">
              <Label>Assign Service Center</Label>
              <Select
                value={formData.serviceCenter}
                onValueChange={(v) =>
                  onChange({ target: { name: "serviceCenter", value: v } })
                }
              >
                <SelectTrigger className={`w-full max-w-full truncate ${validationErrors.serviceCenter ? "border-red-500" : ""}`}>
                  <SelectValue
                    placeholder={
                      loadingCenters
                        ? "Loading centers..."
                        : "Select service center"
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
              <ErrorMessage message={validationErrors.serviceCenter} />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              // Ensure onReset is called on cancel
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

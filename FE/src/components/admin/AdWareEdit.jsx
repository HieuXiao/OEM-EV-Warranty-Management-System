// FE/src/components/admin/AdWareEdit.jsx

// ===============IMPORT================
// Import React Hooks
import { useEffect, useState } from "react";

// Import Shadcn UI Components
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

// Import Data & API
import { provinces } from "@/lib/provinces";
import axiosPrivate from "@/api/axios";

export default function AdWareEdit({ open, formData: parentData, onSave, onCancel }) {
  // ===============State Management================
  const [loading, setLoading] = useState(false);
  // State to hold and display submission errors (e.g., 409 Conflict)
  const [submitError, setSubmitError] = useState(""); 
  const [localData, setLocalData] = useState({
    whId: "",
    name: "",
    province: "",
    district: "",
    addressDetail: "",
  });

  
  // ===============Data Fetching & Initialization================
  /**
   * Fetches the detailed warehouse data when the dialog opens.
   */
  useEffect(() => {
    // Reset error message on dialog open/close
    setSubmitError("");
    
    const fetchWarehouse = async () => {
      if (open && parentData?.whId) {
        setLoading(true);
        try {
          // Fetch detailed data for the specific warehouse ID
          const res = await axiosPrivate.get(`/api/warehouses/${parentData.whId}`);
          const { name, location } = res.data;

          let province = "";
          let district = "";
          let addressDetail = "";

          // Logic to parse the comma-separated 'location' string back into components
          if (location) {
            const parts = location.split(",").map((p) => p.trim()).filter(p => p);
            
            if (parts.length >= 3) {
              // Assumes format: [addressDetail, district, province]
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

          // Validate and set state, ensuring selected province/district exists in the list
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
          setSubmitError("Failed to load warehouse details. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWarehouse();
  }, [open, parentData]);

  // ===============Handlers================
  /**
   * Handles input changes. Resets submit error on any change.
   * If 'province' changes, resets 'district'.
   */
  const handleChange = (e) => {
    setSubmitError("");
    const { name, value } = e.target;
    if (name === "province") {
      setLocalData({ ...localData, province: value, district: "" });
    } else {
      setLocalData({ ...localData, [name]: value });
    }
  };

  /**
   * Handles saving the updated warehouse data via API PUT call.
   */
  const handleSave = async () => {
    setSubmitError("");
    const { whId, name, province, district, addressDetail } = localData;

    // Frontend validation check
    if (!name.trim() || !province) {
        setSubmitError("Warehouse Name and Province are required.");
        return;
    }

    // Reconstruct the location string from form fields
    const locationParts = [addressDetail, district, province].filter(Boolean);
    const fullLocation = locationParts.join(", ");
    
    setLoading(true);

    try {
      // API PUT call to update the warehouse
      await axiosPrivate.put(`/api/warehouses/${whId}`, {
        name: name.trim(),
        location: fullLocation,
      });

      // On success, call parent handler and close dialog
      onSave({
        whId,
        name: name.trim(),
        location: fullLocation,
      });

    } catch (err) {
      console.error("Failed to update warehouse:", err);
      let errorMessage = "An unknown error occurred.";

      // Handle specific API error responses (like the 409 Conflict error)
      if (err.response && err.response.status === 409) {
        errorMessage = err.response.data || 'Warehouse name or location already exists';
      } else if (err.response && err.response.data) {
        errorMessage = err.response.data.message || err.response.data || errorMessage;
      }
      
      setSubmitError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  // Derived state for district options based on selected province
  const districtOptions = localData.province ? provinces[localData.province] || [] : [];
  
  // Determine if the Save button should be disabled
  const isSaveDisabled = loading || !localData.name.trim() || !localData.province;

  // ===============Render================
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Warehouse</DialogTitle>
          <DialogDescription>Update warehouse information</DialogDescription>
        </DialogHeader>

        {/* Loading state indicator */}
        {loading && !submitError ? (
          <p className="text-center py-6">Loading warehouse details...</p>
        ) : (
          <div className="grid gap-4 py-4">
            
            {/* Error Message Display */}
            {submitError && (
              <div className="text-sm font-medium text-red-700 bg-red-50 border border-red-300 p-3 rounded-md">
              🔴 **Error:** {submitError}
              </div>
            )}
            
            {/* Warehouse Name Input */}
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

            {/* Province Selection */}
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

            {/* District Selection */}
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

            {/* Address Detail Input */}
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
// FE/src/components/admin/AdServCreate.jsx

import { useState, useEffect } from "react";
import axiosPrivate from "@/api/axios";
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
import { provinces } from "@/lib/provinces";

export default function AdServCreate({ onCreateSuccess, onCancel }) {
  // ====== State ======
  const [centerName, setCenterName] = useState("");
  const [province, setProvince] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);

  // ====== Update area list when selecting province ======
  useEffect(() => {
    if (province && provinces[province]) {
      setAvailableAreas(provinces[province]);
      setArea("");
    } else {
      setAvailableAreas([]);
      setArea("");
    }
  }, [province]);

  // ====== Submit ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const location = `${address}, ${area}, ${province}`;
      const payload = { centerName, location };

      const res = await axiosPrivate.post("/api/service-centers", payload);

      alert(`Center '${res.data.centerName}' created successfully!`);
      onCreateSuccess(res.data);

      // Reset form
      setCenterName("");
      setProvince("");
      setArea("");
      setAddress("");
    } catch (err) {
      console.error("Failed to create center:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to create service center. Check console for details.";
      alert(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== JSX ======
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Create New Service Center</h2>
      <p className="text-sm text-muted-foreground">
        Fill in the information below to register a new center.
      </p>

      {/* Center Name */}
      <div className="space-y-2">
        <Label htmlFor="centerName">Center Name</Label>
        <Input
          id="centerName"
          required
          value={centerName}
          onChange={(e) => setCenterName(e.target.value)}
          placeholder="e.g., Hanoi Main Center"
        />
      </div>

      {/* Province/City */}
      <div className="space-y-2">
        <Label htmlFor="province">Province / City</Label>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger id="province">
            <SelectValue placeholder="Select a province" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(provinces).map((prov) => (
              <SelectItem key={prov} value={prov}>
                {prov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Area / District */}
      <div className="space-y-2">
        <Label htmlFor="area">District / Area</Label>
        <Select value={area} onValueChange={setArea} disabled={!province}>
          <SelectTrigger id="area">
            <SelectValue
              placeholder={province ? "Select an area" : "Select province first"}
            />
          </SelectTrigger>
          <SelectContent>
            {availableAreas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Detailed address */}
      <div className="space-y-2">
        <Label htmlFor="address">Detailed Address</Label>
        <Input
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., 123 Nguyen Trai"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting || !centerName || !province || !area || !address
          }
        >
          {isSubmitting ? "Creating..." : "Create Center"}
        </Button>
      </div>
    </form>
  );
}

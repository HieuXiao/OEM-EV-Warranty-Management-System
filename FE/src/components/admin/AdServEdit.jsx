// FE/src/components/admin/AdServEdit.jsx

import { useState, useEffect } from "react";
import axiosPrivate from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { provinces } from "@/lib/provinces";

export default function AdServEdit({ center, onSaved, onCancel }) {
  if (!center) return <p>Loading center data...</p>;

  // === Parse location ===
  // Expected format: "123 Nguyen Trai, Thanh Xuan, Ha Noi"
  const parts = center.location?.split(",").map((s) => s.trim()) || [];
  const initialProvince = parts[2] || "";
  const initialArea = parts[1] || "";
  const initialAddress = parts[0] || "";

  const [centerName, setCenterName] = useState(center.centerName);
  const [province, setProvince] = useState(initialProvince);
  const [area, setArea] = useState(initialArea);
  const [address, setAddress] = useState(initialAddress);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update available areas when province changes
  useEffect(() => {
    if (province && provinces[province]) {
      setAvailableAreas(provinces[province]);
      if (!provinces[province].includes(area)) setArea("");
    } else {
      setAvailableAreas([]);
      setArea("");
    }
  }, [province]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullLocation = `${address}, ${area}, ${province}`;
      const payload = { centerName, location: fullLocation };

      const res = await axiosPrivate.put(
        `/api/service-centers/${center.centerId}`,
        payload
      );
      onSaved(res.data);
    } catch (err) {
      console.error("Failed to update center:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update service center. Check console for details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-xl font-bold">
        Edit Service Center: ID {center.centerId}
      </h2>
      <p className="text-sm text-muted-foreground">
        Modify the center's name and location.
      </p>

      {/* Center ID */}
      <div className="space-y-2">
        <Label htmlFor="centerId">Center ID</Label>
        <Input id="centerId" value={center.centerId} disabled className="bg-muted" />
      </div>

      {/* Center Name */}
      <div className="space-y-2">
        <Label htmlFor="centerName">Center Name</Label>
        <Input
          id="centerName"
          required
          value={centerName}
          onChange={(e) => setCenterName(e.target.value)}
        />
      </div>

      {/* Province */}
      <div className="space-y-2">
        <Label htmlFor="province">Province/City</Label>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger id="province">
            <SelectValue placeholder="Select province or city" />
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

      {/* Area */}
      <div className="space-y-2">
        <Label htmlFor="area">District / Area</Label>
        <Select value={area} onValueChange={setArea} disabled={!province}>
          <SelectTrigger id="area">
            <SelectValue placeholder="Select district/area" />
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

      {/* Address */}
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

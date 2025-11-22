import { useState, useEffect } from "react";
import axiosPrivate from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
      // Reset area only if it's not in the new province list
      if (!provinces[province].includes(area)) {
        setArea("");
      }
    } else {
      setAvailableAreas([]);
      setArea("");
    }
  }, [province, area]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const location = `${address}, ${area}, ${province}`;
      await axiosPrivate.put(`/api/service-centers/${center.centerId}`, {
        centerName,
        location,
      });
      onSaved();
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update center");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Service Center</DialogTitle>
        <DialogDescription>Update service center details</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="centerName">Center Name</Label>
          <Input
            id="centerName"
            required
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province */}
          <div className="space-y-2">
            <Label htmlFor="province">Province / City</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
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
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableAreas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Detailed Address</Label>
          <Input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  );
}

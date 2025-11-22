import { useState, useEffect } from "react";
import axiosPrivate from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      await axiosPrivate.post("/api/service-centers", {
        centerName,
        location,
      });
      onCreateSuccess();
    } catch (error) {
      console.error("Create failed", error);
      alert("Failed to create service center");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Service Center</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        {/* Center Name */}
        <div className="space-y-2">
          <Label htmlFor="centerName">Center Name</Label>
          <Input
            id="centerName"
            required
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            placeholder="e.g., VinFast Service Center A"
          />
        </div>

        {/* Grid for Location Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province / City */}
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

          {/* Area / District */}
          <div className="space-y-2">
            <Label htmlFor="area">District / Area</Label>
            <Select value={area} onValueChange={setArea} disabled={!province}>
              <SelectTrigger id="area">
                <SelectValue
                  placeholder={
                    province ? "Select area" : "Select province first"
                  }
                />
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
            className="w-full sm:w-auto"
            disabled={
              isSubmitting || !centerName || !province || !area || !address
            }
          >
            {isSubmitting ? "Creating..." : "Create Center"}
          </Button>
        </div>
      </form>
    </>
  );
}

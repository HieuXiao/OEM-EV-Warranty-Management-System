import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axiosPrivate from "@/api/axios";

export default function AdSCEdit({ center, onSaved, onCancel }) {
  const [form, setForm] = useState({ centerName: center.centerName || "", location: center.location || "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { centerName: form.centerName, location: form.location };
      const res = await axiosPrivate.put(`/api/service_centers/update/${center.centerId}`, payload);
      // backend may return updated center
      const updated = res.data || { ...center, ...payload };
      onSaved(updated);
    } catch (err) {
      console.error("Failed to update center:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Edit Service Center</DialogTitle>
        <DialogDescription>Update center name and location</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="centerName">Center Name</Label>
          <Input id="centerName" name="centerName" value={form.centerName} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" value={form.location} onChange={handleChange} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </DialogFooter>
    </div>
  );
}

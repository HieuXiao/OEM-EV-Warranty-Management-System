import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosPrivate from "@/api/axios";
import { Loader2, Save, Edit, X } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

const VEHICLE_UPDATE_URL = "/api/vehicles";

export default function CustomerVinCard({ vinData, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(vinData);
  const [status, setStatus] = useState({
    loading: false,
    errors: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(vinData);
    setStatus({ loading: false, errors: {} });
  };

  const handleSave = async () => {
    setStatus({ loading: true, errors: {} });

    try {
      const UPDATE_URL = `${VEHICLE_UPDATE_URL}/${form.vin}`;
      const updatedData = {
        model: form.model,
        plate: form.plate,
        type: form.type,
        color: form.color,
      };

      await axiosPrivate.put(UPDATE_URL, JSON.stringify(updatedData), {
        headers: { "Content-Type": "application/json" },
      });

      onUpdate(form);
      setEditMode(false);
      setStatus({ loading: false, errors: {} });
    } catch (error) {
      console.error("Vehicle Update Error:", error);
      const fieldErrors = {};

      if (error.response && error.response.status === 409) {
        const message = error.response.data?.message || "";
        if (message.toLowerCase().includes("plate")) {
          fieldErrors.plate = "This plate is already registered.";
        } else {
          fieldErrors.api = "Conflict: Vehicle data is duplicated.";
        }
      } else {
        fieldErrors.api = "Failed to save. Please try again.";
      }

      setStatus({ loading: false, errors: fieldErrors });
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{form.vin}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Model
          </label>
          <Input
            className="h-8 text-sm"
            name="model"
            value={form.model}
            onChange={handleChange}
            disabled={!editMode || status.loading}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Plate
          </label>
          <Input
            className="h-8 text-sm"
            name="plate"
            value={form.plate}
            onChange={handleChange}
            disabled={!editMode || status.loading}
          />
          {status.errors.plate && (
            <p className="text-xs text-red-500">{status.errors.plate}</p>
          )}
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <Select
            value={form.type}
            onValueChange={(value) =>
              setForm({
                ...form,
                type: value,
              })
            }
            disabled={!editMode || status.loading}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="car" value="Car">
                Car
              </SelectItem>
              <SelectItem key="bike" value="Electric Motorbike">
                Electric Motorbike
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Color
          </label>
          <Input
            className="h-8 text-sm"
            name="color"
            value={form.color}
            onChange={handleChange}
            disabled={!editMode || status.loading}
          />
        </div>
        {status.errors.api && (
          <p className="text-xs text-red-500 text-center">
            {status.errors.api}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {editMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={status.loading}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={status.loading}>
                {status.loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditMode(true)}
              className="w-full border"
            >
              <Edit className="h-3.5 w-3.5 mr-2" /> Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

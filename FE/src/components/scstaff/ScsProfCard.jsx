import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomerVinCard({ vinData, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(vinData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = () => {
    onUpdate(form);
    setEditMode(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{form.vin}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <label className="text-sm font-medium">Model</label>
          <Input
            name="model"
            value={form.model}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Plate</label>
          <Input
            name="plate"
            value={form.plate}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <Input
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          {editMode ? (
            <>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => setEditMode(true)}>
                Edit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

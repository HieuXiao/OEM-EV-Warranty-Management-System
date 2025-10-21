import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Badge } from "../ui/badge";
import { vehicleModels, mockParts } from "@/lib/Mock-data";

export default function EVMStaffFormCampaign({ open, onOpenChange, onSave, campaign }) {
  // initialize from `campaign` when provided, otherwise use defaults
  const [formData, setFormData] = useState(
    campaign || {
      campaignId: "",
      campaignName: "",
      vehicleModels: [],
      parts: [], // will store part IDs
      description: "",
      start: "",
      end: "",
      status: "to_do",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate start date is today or future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.start) {
      const startDate = new Date(formData.start);
      startDate.setHours(0, 0, 0, 0);
      if (startDate.getTime() < today.getTime()) {
        setStartError("Start date cannot be in the past.");
        return;
      }
    }

    // Validate dates: due (end) must be at least 5 days after start
    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const dueDate = new Date(formData.end);
      const requiredDaysMs = 5 * 24 * 60 * 60 * 1000;
      if (dueDate.getTime() - startDate.getTime() < requiredDaysMs) {
        setDateError("Due date must be at least five days after Start date.");
        return;
      }
    }

    setDateError("");
    setStartError("");
    onSave(formData);
    onOpenChange(false);
  };

  const [dateError, setDateError] = useState("");
  const [startError, setStartError] = useState("");

  // compute today's date string in yyyy-mm-dd for input min
  const pad = (n) => n.toString().padStart(2, "0");
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;

  // compute minimum due date (start + 5 days) as yyyy-mm-dd string when start exists
  const minDueStr = (() => {
    if (!formData.start) return undefined;
    const s = new Date(formData.start);
    s.setDate(s.getDate() + 5);
    return `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {campaign ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign ID & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignId">Campaign ID</Label>
              <Input
                id="campaignId"
                value={formData.campaignId}
                onChange={(e) =>
                  setFormData({ ...formData, campaignId: e.target.value })
                }
                required
                disabled={!!campaign}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={formData.campaignName}
                onChange={(e) =>
                  setFormData({ ...formData, campaignName: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Vehicle Models & Parts (multi-select style) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label htmlFor="vehicleModels">Vehicle Models</Label>
              <Select
                // keep trigger empty so selection doesn't insert into the select input
                value={""}
                onValueChange={(value) => {
                  // special value to select all models
                  if (value === "__ALL_MODELS__") {
                    setFormData({
                      ...formData,
                      vehicleModels: [...vehicleModels],
                    });
                    return;
                  }

                  if (!formData.vehicleModels.includes(value)) {
                    setFormData({
                      ...formData,
                      vehicleModels: [...formData.vehicleModels, value],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle models" />
                </SelectTrigger>
                <SelectContent className="max-h-56 overflow-auto">
                  <SelectItem key="__ALL_MODELS__" value="__ALL_MODELS__">
                    All vehicle models
                  </SelectItem>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.vehicleModels.map((model) => (
                  <Badge
                    key={model}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        vehicleModels: formData.vehicleModels.filter(
                          (m) => m !== model
                        ),
                      })
                    }
                  >
                    {model} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Parts */}
            <div className="space-y-2">
              <Label htmlFor="parts">Part ID</Label>
              <Select
                value={
                  formData.parts[formData.parts.length - 1] || ""
                }
                onValueChange={(value) => {
                  if (!formData.parts.includes(value)) {
                    setFormData({
                      ...formData,
                      parts: [...formData.parts, value],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select related parts" />
                </SelectTrigger>
                <SelectContent>
                    {mockParts.map((part) => (
                      <SelectItem key={part.id} value={part.id}>
                        {part.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2 mt-2">
                  {formData.parts.map((partId) => {
                    const p = mockParts.find((x) => x.id === partId);
                    return (
                      <Badge
                        key={partId}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            parts: formData.parts.filter((p) => p !== partId),
                          })
                        }
                      >
                        {p ? p.name : partId} ×
                      </Badge>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[80px] min-w-0 max-w-full box-border whitespace-pre-wrap break-words break-all overflow-auto resize-y"
                required
              />
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                min={todayStr}
                value={formData.start}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setFormData({ ...formData, start: newStart });
                  // validate start not in past
                  if (newStart) {
                    const startDate = new Date(newStart);
                    startDate.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (startDate.getTime() < today.getTime()) {
                      setStartError("Start date cannot be in the past.");
                    } else {
                      setStartError("");
                    }
                  }

                  if (newStart && formData.end) {
                    const startDate = new Date(newStart);
                    const dueDate = new Date(formData.end);
                    const requiredDaysMs = 5 * 24 * 60 * 60 * 1000;
                    if (dueDate.getTime() - startDate.getTime() < requiredDaysMs) {
                      // clear invalid due date so user must reselect
                      setFormData((prev) => ({ ...prev, end: "" }));
                      setDateError(
                        "Due date must be at least five days after Start date."
                      );
                    } else {
                      setDateError("");
                    }
                  }
                }}
                required
              />
              {startError && (
                <p className="text-sm text-destructive mt-1">{startError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Due Date</Label>
              <Input
                id="end"
                type="date"
                min={minDueStr}
                value={formData.end}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  setFormData({ ...formData, end: newEnd });
                  if (formData.start && newEnd) {
                    const startDate = new Date(formData.start);
                    const dueDate = new Date(newEnd);
                    const requiredDaysMs = 5 * 24 * 60 * 60 * 1000;
                    if (dueDate.getTime() - startDate.getTime() < requiredDaysMs) {
                      setDateError(
                        "Due date must be at least five days after Start date."
                      );
                    } else {
                      setDateError("");
                    }
                  }
                }}
                required
              />
              {dateError && (
                <p className="text-sm text-destructive mt-1">{dateError}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

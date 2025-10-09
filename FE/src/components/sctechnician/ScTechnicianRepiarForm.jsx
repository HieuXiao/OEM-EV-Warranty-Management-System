"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, CheckCircle } from "lucide-react";

const ReportRepair = ({ job, onClose, onComplete }) => {
  const repairParts = job?.reportData?.parts || {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-500">
            REPORT REPAIR - Job #{job?.jobNumber}
          </h2>
          <Button variant="destructive" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                Vehicle Details
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Vehicle plate:
                    </Label>
                    <Input
                      value={job?.vehiclePlate || ""}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Model vehicle:
                    </Label>
                    <Input
                      value={job?.vehicleModel || ""}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Note:</Label>
                  <Input
                    value={job?.comment || ""}
                    disabled
                    className="mt-1 bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Repair Parts Checklist */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                Repair Parts Checklist
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(repairParts).map(([part, quantity]) => (
                  <div
                    key={part}
                    className="border border-border rounded-lg p-3 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{part}</span>
                    <span className="text-lg font-bold text-primary">
                      {quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onComplete}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete Repair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportRepair;

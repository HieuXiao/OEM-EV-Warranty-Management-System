"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, CheckCircle } from "lucide-react";

const ReportRepair = ({ job, onClose, onComplete }) => {
  const repairParts = job?.reportData?.parts || {};

  // Lưu serial đã chọn cho từng part
  const [attachedSerials, setAttachedSerials] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Khi mở form, kiểm tra xem job này đã completed chưa
  useEffect(() => {
    const saved = localStorage.getItem(`repair_${job.jobNumber}`);
    if (saved) {
      setAttachedSerials(JSON.parse(saved));
      setIsCompleted(true);
    } else {
      // Khởi tạo rỗng nếu chưa có dữ liệu
      const empty = {};
      Object.entries(repairParts).forEach(([part, qty]) => {
        empty[part] = Array.from({ length: qty }, () => "");
      });
      setAttachedSerials(empty);
      setIsCompleted(false);
    }
  }, [job.jobNumber]);

  // Tạo mảng rỗng theo quantity khi lần đầu render
  const ensureSerialArray = (part, qty) => {
    setAttachedSerials((prev) => {
      if (prev[part]?.length === qty) return prev;
      const existing = prev[part] || [];
      const updated = Array.from({ length: qty }, (_, i) => existing[i] || "");
      return { ...prev, [part]: updated };
    });
  };

  const handleSerialChange = (part, index, value) => {
    if (isCompleted) return; // Không cho sửa nếu đã hoàn thành
    setAttachedSerials((prev) => {
      const current = prev[part] ? [...prev[part]] : [];
      current[index] = value;
      return { ...prev, [part]: current };
    });
  };

  const handleComplete = () => {
    // Lưu vào localStorage
    localStorage.setItem(
      `repair_${job.jobNumber}`,
      JSON.stringify(attachedSerials)
    );
    setIsCompleted(true);

    const repairResult = {
      jobNumber: job.jobNumber,
      attachedParts: Object.entries(repairParts).map(([part, qty]) => ({
        part,
        quantity: qty,
        serials: attachedSerials[part] || [],
      })),
    };

    console.log("✅ Repair Completed:", repairResult);
    onComplete(repairResult);
  };

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
                    className="border border-border rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{part}</span>
                      <span className="text-lg font-bold text-primary">
                        {quantity}
                      </span>
                    </div>

                    {/* Select nằm BÊN DƯỚI */}
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Attach Serial:
                      </Label>
                      {Array.from({ length: quantity }, (_, i) => (
                        <Input
                          key={i}
                          type="text"
                          placeholder={`Serial #${i + 1}`}
                          className={`mt-1 ${
                            isCompleted ? "bg-muted cursor-not-allowed" : ""
                          }`}
                          value={attachedSerials[part]?.[i] || ""}
                          disabled={isCompleted}
                          onChange={(e) =>
                            handleSerialChange(part, i, e.target.value)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complete Button (ẩn nếu đã hoàn tất) */}
          {!isCompleted && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleComplete}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Repair
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportRepair;

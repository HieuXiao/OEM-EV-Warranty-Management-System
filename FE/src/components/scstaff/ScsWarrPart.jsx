import { useState, useEffect } from "react";
import { Folder } from "lucide-react";
import axiosPrivate from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ScsWarrPart({ warrantyId }) {
  const [parts, setParts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !warrantyId) return;

    const fetchParts = async () => {
      try {
        setLoading(true);

        // Lấy parts check và parts trong warehouse 1
        const [checkRes, allPartsRes] = await Promise.all([
          axiosPrivate.get(`/api/claim-part-check/search/warranty/${warrantyId}`),
          axiosPrivate.get("/api/parts"),
        ]);

        const checkedParts = checkRes.data || [];
        const allParts = allPartsRes.data || [];

        // Chỉ lấy part ở warehouse whId = 1
        const wh1Parts = allParts.filter((p) => p.warehouse?.whId === 1);

        // Lọc các part có isRepair = true
        const repairParts = checkedParts
          .filter((p) => p.isRepair)
          .map((p) => {
            const matched = wh1Parts.find((a) => a.partNumber === p.partNumber);
            return {
              partNumber: p.partNumber,
              namePart: matched?.namePart || "—",
              quantity: p.quantity,
            };
          });

        setParts(repairParts);
      } catch (err) {
        console.error("Error loading parts:", err);
        setParts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [open, warrantyId]);

  return (
    <>
      {/* Folder icon mở form */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 border-t pt-4 mt-4"
        onClick={() => setOpen(true)}
      >
        <Folder className="h-5 w-5 text-yellow-600" />
        <h4 className="text-sm font-medium text-muted-foreground">
          Repair Parts ({parts.length})
        </h4>
      </div>

      {/* Dialog hiển thị danh sách part */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Repair Parts List
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="text-sm italic text-muted-foreground py-4">
              Loading parts...
            </p>
          ) : parts.length === 0 ? (
            <p className="text-sm italic text-muted-foreground py-4">
              No repair parts found.
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {parts.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm border rounded-md px-3 py-1.5 bg-muted/40"
                >
                  <span>{p.namePart}</span>
                  <span className="font-medium">x{p.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

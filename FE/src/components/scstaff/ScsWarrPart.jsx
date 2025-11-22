import { useEffect, useReducer } from "react";
import { Folder } from "lucide-react";
import axiosPrivate from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_ENDPOINTS = {
  CLAIM_PART_CHECK: "/api/claim-part-check/search/warranty/",
  PARTS_UNDER_WARRANTY: "/api/part-under-warranty-controller",
  WARRANTY_FILES: "/api/warranty-files/search/claim",
};

const initialState = {
  parts: [],
  loading: false,
  open: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, open: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_PARTS":
      return { ...state, parts: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function ScsWarrPart({ warrantyId, autoLoad = false }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { parts, loading, open } = state;

  useEffect(() => {
    if (!warrantyId) return;

    const fetchParts = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const [checkRes, allPartsRes, fileRes] = await Promise.all([
          axiosPrivate.get(`${API_ENDPOINTS.CLAIM_PART_CHECK}${warrantyId}`),
          axiosPrivate.get(API_ENDPOINTS.PARTS_UNDER_WARRANTY),
          // Fetch files related to this claim
          axiosPrivate.get(
            `${API_ENDPOINTS.WARRANTY_FILES}?value=${warrantyId}`
          ),
        ]);

        const checkedParts = checkRes.data || [];
        const allParts = allPartsRes.data || [];
        const files = fileRes.data || [];

        const repairParts = checkedParts
          .filter((p) => p.isRepair)
          .map((p) => {
            const matched = allParts.find((a) => a.partId === p.partNumber);

            // Find images related to this part
            // Assuming fileId contains partSerial or partId.
            // Adjust this logic based on how files are named/linked in your backend.
            const partImages = files
              .filter(
                (f) =>
                  f.fileId.includes(p.partNumber) ||
                  (p.partSerials &&
                    p.partSerials.some((s) => f.fileId.includes(s)))
              )
              .flatMap((f) => f.mediaUrls);

            return {
              partNumber: p.partNumber,
              namePart: matched?.partName || "—",
              quantity: p.quantity,
              images: partImages,
            };
          });

        dispatch({ type: "SET_PARTS", payload: repairParts });
      } catch (err) {
        console.error("Error loading parts:", err);
        dispatch({ type: "SET_PARTS", payload: [] });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    if (autoLoad) fetchParts();
  }, [warrantyId, autoLoad]);

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 border-t pt-4 mt-4"
        onClick={() => dispatch({ type: "SET_OPEN", payload: true })}
      >
        <Folder className="h-5 w-5 text-yellow-600" />
        <h4 className="text-sm font-medium text-muted-foreground">
          Repair Parts ({parts.length})
        </h4>
      </div>

      <Dialog
        open={open}
        onOpenChange={(val) => dispatch({ type: "SET_OPEN", payload: val })}
      >
        {/* CHỈNH SỬA: w-[95vw] cho mobile */}
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[80vh] overflow-y-auto p-4 rounded-2xl">
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
            <div className="space-y-3">
              {parts.map((p, i) => (
                <div
                  key={i}
                  className="flex flex-col text-sm border rounded-md p-3 bg-muted/40 gap-2"
                >
                  <div className="flex justify-between items-center font-medium">
                    <span>{p.namePart}</span>
                    <span>x{p.quantity}</span>
                  </div>

                  {/* Display Images */}
                  {p.images && p.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {p.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-md overflow-hidden border bg-background"
                        >
                          <img
                            src={imgUrl}
                            alt={`${p.namePart} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

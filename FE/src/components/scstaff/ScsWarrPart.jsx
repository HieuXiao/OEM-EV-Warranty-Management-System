import { useEffect, useReducer } from "react";
import { Folder } from "lucide-react";
import axiosPrivate from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API endpoints
const API_ENDPOINTS = {
  CLAIM_PART_CHECK: "/api/claim-part-check/search/warranty/",
  PARTS_UNDER_WARRANTY: "/api/part-under-warranty-controller",
};

// initial state
const initialState = {
  parts: [],
  loading: false,
  open: false,
};

// reducer function
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

        const [checkRes, allPartsRes] = await Promise.all([
          axiosPrivate.get(`${API_ENDPOINTS.CLAIM_PART_CHECK}${warrantyId}`),
          axiosPrivate.get(API_ENDPOINTS.PARTS_UNDER_WARRANTY),
        ]);

        const checkedParts = checkRes.data || [];
        const allParts = allPartsRes.data || [];

        // Chỉ lấy các part có isRepair = true, map tên từ partId của under-warranty
        const repairParts = checkedParts
          .filter((p) => p.isRepair)
          .map((p) => {
            const matched = allParts.find((a) => a.partId === p.partNumber);
            return {
              partNumber: p.partNumber,
              namePart: matched?.partName || "—",
              quantity: p.quantity,
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

      <Dialog open={open} onOpenChange={(val) => dispatch({ type: "SET_OPEN", payload: val })}>
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

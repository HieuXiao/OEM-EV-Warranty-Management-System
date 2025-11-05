import React, { useState, useEffect, useReducer } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import axiosPrivate from "@/api/axios";

// Định nghĩa API URL riêng của component này
const REPORTS_URL = "/api/campaign-reports/create";

// --- [THÊM MỚI]: Reducer cho việc GỬI (submit) form ---
const submitInitialState = {
  status: "idle", // 'idle', 'submitting', 'error'
  error: null,
};

const submitReducer = (state, action) => {
  switch (action.type) {
    case "SUBMIT_START":
      return { status: "submitting", error: null };
    case "SUBMIT_ERROR":
      return { status: "error", error: action.payload };
    case "RESET":
      return { status: "idle", error: null };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
// --- KẾT THÚC THÊM MỚI ---

export function SubmitReportDialog({
  open,
  onOpenChange,
  campaign,
  account,
  onReportSubmitted,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [state, dispatch] = useReducer(submitReducer, submitInitialState);
  const { status, error } = state;
  const isLoading = status === "submitting";

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      dispatch({ type: "RESET" }); // Xóa lỗi nếu chọn file thành công
    } else {
      setSelectedFile(null);
      dispatch({
        type: "SUBMIT_ERROR",
        payload: "Please select a valid PDF file.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      dispatch({ type: "SUBMIT_ERROR", payload: "No file selected." });
      return;
    }

    dispatch({ type: "SUBMIT_START" });

    const requestDTO = {
      campaignId: campaign.campaignId,
      serviceCenterId: account.serviceCenter.centerId,
      submittedByIds: [account.accountId],
      originalFileName: selectedFile.name,
      submittedAt: new Date().toISOString(),
    };

    const formData = new FormData();
    formData.append("request", JSON.stringify(requestDTO));
    formData.append("files", selectedFile);

    try {
      await axiosPrivate.post(REPORTS_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onReportSubmitted();
    } catch (err) {
      dispatch({
        // [THAY ĐỔI]
        type: "SUBMIT_ERROR",
        payload: err.response?.data?.message || "Failed to submit report.",
      });
    }
  };

  // Reset form khi dialog đóng
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      dispatch({ type: "RESET" }); // [THAY ĐỔI]
    }
  }, [open]);

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit PDF Report: {campaign.campaignName}</DialogTitle>
          <DialogDescription>
            Upload the completed PDF report file for this campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pdfFile">PDF Report File</Label>
            <Input
              id="pdfFile"
              type="file"
              accept=".pdf" // Chỉ chấp nhận file PDF
              onChange={handleFileChange}
              className="file:text-primary file:font-semibold"
            />
          </div>

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              Selected file:{" "}
              <span className="font-medium text-card-foreground">
                {selectedFile.name}
              </span>
            </div>
          )}

          {/* [THAY ĐỔI]: Đọc lỗi từ state.error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* [THAY ĐỔI]: Dùng biến 'isLoading' từ state */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedFile}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Uploading..." : "Upload and Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

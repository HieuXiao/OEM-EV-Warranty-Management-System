// FE/src/components/evmstaff/EVMStaffDetailCampaign.jsx

import React, { useState, useEffect, useReducer, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Download } from "lucide-react"; // [CẬP NHẬT] icon
import axiosPrivate from "@/api/axios";

// [CẬP NHẬT] Endpoint API
const REPORTS_URL = "/api/campaign-reports/campaign";
const SERVICE_CENTER_URL = "/api/service-centers";

const initialState = {
  status: "idle", // 'idle', 'loading', 'success', 'error'
  reports: [],
  error: null,
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null, reports: [] }; // Reset reports khi fetch
    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "success",
        reports: action.payload.reports,
      };
    case "FETCH_ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default function EVMStaffDetailCampaign({
  open,
  onOpenChange,
  campaign,
}) {
  // State để quản lý việc tải và hiển thị báo cáo
  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  const { status, serviceCenter, reports, error } = state;

  // Logic tải báo cáo khi dialog mở
  const fetchReports = useCallback(async (campaignId) => {
    dispatch({ type: "FETCH_START" });
    try {
      const reportResponse = await axiosPrivate.get(
        `${REPORTS_URL}/${campaignId}`
      );
      const vehicleResponse = await axiosPrivate.get(`${SERVICE_CENTER_URL}`);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          reports: reportResponse.data,
          serviceCenter: vehicleResponse.data,
        },
      });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      dispatch({
        type: "FETCH_ERROR",
        payload: "Could not load reports from service centers.",
      });
    }
  }, []); // Chạy lại mỗi khi dialog mở hoặc 'campaign' thay đổi

  useEffect(() => {
    if (open && campaign) {
      fetchReports(campaign.campaignId);
    }
  }, [open, campaign, fetchReports]);

  if (!campaign) return null;

  // (Logic tính toán phần trăm giữ nguyên)
  let percent = 0;
  if (campaign.completedVehicles && campaign.affectedVehicles) {
    percent = Math.round(
      (campaign.completedVehicles / campaign.affectedVehicles) * 100
    );
  }

  const modelDisplay =
    Array.isArray(campaign.model) && campaign.model.length > 0
      ? campaign.model.join(", ")
      : campaign.model || "-";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Tăng chiều rộng để chứa bảng */}
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Campaign Detail
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {/* --- PHẦN 1: THÔNG TIN CHIẾN DỊCH (Giữ nguyên) --- */}
          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <div className="mt-1">{campaign.campaignName || "-"}</div>
            </div>
            <div>
              <Label>Vehicle Models</Label>
              <div className="mt-1">{modelDisplay}</div>
            </div>
            <div>
              <Label>Description</Label>
              <div className="mt-1 whitespace-pre-wrap">
                {campaign.serviceDescription}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <div className="mt-1">{campaign.startDate}</div>
              </div>
              <div>
                <Label>Due Date</Label>
                <div className="mt-1">{campaign.endDate}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Affected Model (Total)</Label>
                <div className="mt-1">{campaign.affectedVehicles || 0}</div>
              </div>
              <div>
                <Label>Completed Model (Total)</Label>
                <div className="mt-1">{campaign.completedVehicles || 0}</div>
              </div>
            </div>
            <div>
              <Label>Total Collected</Label>
              <div className="mt-2 w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-primary"
                  style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {percent}%
              </div>
            </div>
          </div>

          {/* --- [CẬP NHẬT] PHẦN 2: BÁO CÁO PDF TỪ TRUNG TÂM --- */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-semibold mb-4">
              Service Center Reports (PDF)
            </h4>

            {/* Trạng thái tải */}
            {status === "loading" && (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Trạng thái không có dữ liệu */}
            {status === "success" && reports.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No PDF reports submitted from service centers for this campaign
                yet.
              </p>
            )}

            {/* Bảng dữ liệu PDF */}
            {status === "success" && reports.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Center</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.reportId}>
                        <TableCell className="font-medium">
                          {/* Giả định API trả về 'serviceCenter.name' */}
                          {report.serviceCenterId.centerName ||
                            `Center ID: ${report.serviceCenterId}`}
                        </TableCell>
                        <TableCell>
                          {/* Giả định API trả về 'originalFileName' */}
                          {report.originalFileName || "Report.pdf"}
                        </TableCell>
                        <TableCell>
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center ">
                          <Button
                            asChild // Dùng asChild
                            variant="outline"
                            size="sm"
                          >
                            <a
                              href={report.reportFileUrls} // Link đến file
                              target="_blank" // Mở tab mới
                              rel="noopener noreferrer"
                              download={report.originalFileName} // Gợi ý tên file khi tải
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* --- Nút bấm (Giữ nguyên) --- */}
          <div className="flex justify-end mt-6 gap-3">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// FE/src/components/scstaff/ScsReportSection.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Dùng Input cho file
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Send, Loader2, Upload } from "lucide-react";
import axiosPrivate from "@/api/axios";

// --- API URLs ---
const CAMPAIGN_URL = "/api/campaigns/all";
const APPOINTMENT_URL = "/api/service-appointments";

// --- Helpers ---
const getCampaignDateStatus = (startDateStr, endDateStr) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);

  if (startDate && now < startDate) return "not yet";
  if (endDate && now > endDate) return "completed";
  return "on going";
};

function getStatusColor(status) {
  switch (status) {
    case "not yet":
      return "bg-yellow-500";
    case "on going":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

// --- COMPONENT CHÍNH ---
export default function ScsReportSection() {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [mySubmittedReports, setMySubmittedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [campaignRes, appointmentRes, reportRes] = await Promise.all([
        axiosPrivate.get(CAMPAIGN_URL),
        // Giả định: API này tự động lọc các cuộc hẹn cho SC của bạn
        axiosPrivate.get(APPOINTMENT_URL),
      ]);
      setAllCampaigns(campaignRes.data);
      setMyAppointments(appointmentRes.data);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setError("Failed to load data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý và hợp nhất dữ liệu
  const campaignReportData = useMemo(() => {
    // Map các báo cáo đã gửi để tra cứu nhanh
    const reportMap = new Map(
      mySubmittedReports.map((r) => [r.campaign.campaignId, r])
    );

    // Vẫn tính toán stats để SCStaff tham khảo trước khi tạo file PDF
    const apptStatsMap = new Map();
    for (const appt of myAppointments) {
      if (!appt.campaign) continue;
      const campaignId = appt.campaign.campaignId;
      if (!apptStatsMap.has(campaignId)) {
        apptStatsMap.set(campaignId, { affected: new Set(), completed: 0 });
      }
      const stats = apptStatsMap.get(campaignId);
      stats.affected.add(appt.vehicle.vin);
      if (appt.status === "Completed") {
        stats.completed++;
      }
    }

    // Hợp nhất mọi thứ
    return allCampaigns.map((campaign) => {
      const submittedReport = reportMap.get(campaign.campaignId);
      const stats = apptStatsMap.get(campaign.campaignId);
      const campaignStatus = getCampaignDateStatus(
        campaign.startDate,
        campaign.endDate
      );

      return {
        ...campaign,
        campaignStatus: campaignStatus,
        reportStatus: submittedReport ? "Submitted" : "Not Submitted",
        submittedReport: submittedReport || null,
        scStats: {
          affectedVehicles: stats ? stats.affected.size : 0,
          completedVehicles: stats ? stats.completed : 0,
        },
      };
    });
  }, [allCampaigns, myAppointments, mySubmittedReports]);

  // Handlers
  const handleSubmitClick = (campaign) => {
    setSelectedCampaign(campaign);
    setSubmitDialogOpen(true);
  };

  const onReportSubmitted = () => {
    fetchData(); // Tải lại toàn bộ dữ liệu sau khi gửi
    setSubmitDialogOpen(false);
    setSelectedCampaign(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Reports</CardTitle>
          <CardDescription>
            Submit your PDF summary report for each campaign to EVMStaff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Campaign Status</TableHead>
                    <TableHead>Your Stats (Comp/Aff)</TableHead>
                    <TableHead>Report Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignReportData.map((campaign) => (
                    <TableRow key={campaign.campaignId}>
                      <TableCell className="font-medium">
                        {campaign.campaignName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(campaign.campaignStatus)}
                        >
                          {campaign.campaignStatus.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {campaign.scStats.completedVehicles} /{" "}
                          {campaign.scStats.affectedVehicles}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            campaign.reportStatus === "Submitted"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {campaign.reportStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.reportStatus === "Submitted" ? (
                          <Button
                            asChild // Dùng asChild để Button hoạt động như Link
                            variant="outline"
                            size="sm"
                          >
                            <a
                              href={campaign.submittedReport.reportFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Submitted
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSubmitClick(campaign)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Report
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Gửi Báo Cáo */}
      <SubmitReportDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        campaign={selectedCampaign}
        onReportSubmitted={onReportSubmitted}
      />
    </>
  );
}

// --- COMPONENT DIALOG: GỬI BÁO CÁO (FILE PDF) ---
function SubmitReportDialog({
  open,
  onOpenChange,
  campaign,
  onReportSubmitted,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setApiError(null);
    } else {
      setSelectedFile(null);
      setApiError("Please select a valid PDF file.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setApiError("No file selected.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("campaignId", campaign.campaignId);

    try {
      await axiosPrivate.post(REPORTS_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onReportSubmitted();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form khi dialog đóng
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setApiError(null);
      setIsLoading(false);
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

          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
        </div>
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

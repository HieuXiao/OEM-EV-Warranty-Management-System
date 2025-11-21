import React, { useState, useMemo } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Send, Loader2 } from "lucide-react";
import { SubmitReportDialog } from "./ScsRepoSubmitDialog";

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

export default function ScsReportSection({
  currentAccount = {},
  allCampaigns = [],
  myAppointments = [],
  mySubmittedReports = [],
  allVehicles = [],
  onRefreshData,
  status,
  error,
}) {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const campaignReportData = useMemo(() => {
    const myCenterId = currentAccount.serviceCenter?.centerId;
    if (!myCenterId) return [];

    const reportMap = new Map(
      (mySubmittedReports || [])
        .filter((r) => r.serviceCenterId?.centerId === myCenterId)
        .map((r) => [r.campaignId?.campaignId, r])
    );

    const completedApptMap = new Map();
    for (const appt of myAppointments || []) {
      if (
        appt.vehicle.customer.serviceCenter?.centerId === myCenterId &&
        appt.status === "Completed" &&
        appt.campaign
      ) {
        const campaignId = appt.campaign.campaignId;
        completedApptMap.set(
          campaignId,
          (completedApptMap.get(campaignId) || 0) + 1
        );
      }
    }

    return (allCampaigns || [])
      .map((campaign) => {
        const campaignModelSet = new Set(campaign.model || []);

        const affectedVehiclesCount = (allVehicles || []).filter(
          (vehicle) =>
            campaignModelSet.has(vehicle.model) &&
            vehicle.customer.serviceCenter?.centerId === myCenterId
        ).length;

        if (affectedVehiclesCount === 0) {
          return null;
        }

        const completedVehiclesCount =
          completedApptMap.get(campaign.campaignId) || 0;

        const submittedReport = reportMap.get(campaign.campaignId);
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
            affectedVehicles: affectedVehiclesCount,
            completedVehicles: completedVehiclesCount,
          },
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const statusPriority = {
          "on going": 1,
          "not yet": 2,
          completed: 3,
        };
        const priorityA = statusPriority[a.campaignStatus] || 99;
        const priorityB = statusPriority[b.campaignStatus] || 99;
        return priorityA - priorityB;
      });
  }, [
    currentAccount,
    allCampaigns,
    allVehicles,
    myAppointments,
    mySubmittedReports,
  ]);

  const handleSubmitClick = (campaign) => {
    setSelectedCampaign(campaign);
    setSubmitDialogOpen(true);
  };

  const onReportSubmitted = () => {
    onRefreshData();
    setSubmitDialogOpen(false);
    setSelectedCampaign(null);
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    status === "success" && (
      <>
        <Card className="border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Campaign Reports</CardTitle>
            <CardDescription>
              Submit your PDF summary report for each campaign to EVMStaff.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="border rounded-lg overflow-hidden">
              {/* CHỈNH SỬA: overflow-x-auto để cuộn ngang trên mobile */}
              <div className="overflow-x-auto">
                {/* CHỈNH SỬA: min-w-[800px] để giữ layout bảng đẹp */}
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Campaign Status</TableHead>
                      <TableHead className="text-center">Comp/Aff</TableHead>
                      <TableHead className="text-center">
                        Report Status
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignReportData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center h-24 text-muted-foreground"
                        >
                          No campaigns assigned to this service center.
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaignReportData.map((campaign) => (
                        <TableRow key={campaign.campaignId}>
                          <TableCell className="font-medium">
                            {campaign.campaignName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(
                                campaign.campaignStatus
                              )}
                            >
                              {campaign.campaignStatus.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">
                              {campaign.scStats.completedVehicles} /{" "}
                              {campaign.scStats.affectedVehicles}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
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
                          <TableCell className="text-center">
                            {campaign.reportStatus === "Submitted" ? (
                              <Button asChild variant="outline" size="sm">
                                <a
                                  href={
                                    campaign.submittedReport
                                      ?.reportFileUrls?.[0]
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  View
                                </a>
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleSubmitClick(campaign)}
                                disabled={
                                  campaign.campaignStatus !== "completed"
                                }
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Submit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <SubmitReportDialog
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
          campaign={selectedCampaign}
          account={currentAccount}
          onReportSubmitted={onReportSubmitted}
        />
      </>
    )
  );
}

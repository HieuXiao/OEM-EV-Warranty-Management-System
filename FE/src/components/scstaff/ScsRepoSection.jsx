import React, {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from "react";
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
import axiosPrivate from "@/api/axios";

// Import component dialog đã tách
// (Giả sử file mới nằm trong /components/scstaff/ScsReportSubmitDialog.jsx)
import { SubmitReportDialog } from "./ScsRepoSubmitDialog";

// --- API URLs ---
const CAMPAIGN_URL = "/api/campaigns/all";
const APPOINTMENT_URL = "/api/service-appointments";
const ACCOUNT_URL = "/api/accounts/current";
const REPORTS_URL = "/api/campaign-reports/all";

// --- [THÊM MỚI]: Reducer cho việc tải dữ liệu ---
const initialState = {
  status: "idle", // 'idle', 'loading', 'success', 'error'
  currentAccount: {},
  allCampaigns: [],
  myAppointments: [],
  mySubmittedReports: [], // Giữ nguyên logic ban đầu là mảng rỗng
  error: null,
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "success",
        currentAccount: action.payload.currentAccount,
        allCampaigns: action.payload.allCampaigns,
        myAppointments: action.payload.myAppointments,
        mySubmittedReports: action.payload.mySubmittedReports,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
        currentAccount: {},
        allCampaigns: [],
        myAppointments: [],
        mySubmittedReports: [],
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
// --- KẾT THÚC THÊM MỚI ---

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
  // [THAY ĐỔI]: Dùng useReducer cho state tải dữ liệu
  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  const {
    status,
    currentAccount,
    allCampaigns,
    myAppointments,
    mySubmittedReports,
    error,
  } = state;

  // State của Dialog giữ nguyên
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // [THAY ĐỔI]: Bọc fetchData trong useCallback và dùng dispatch
  const fetchData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const [accountRes, campaignRes, appointmentRes, reportRes] =
        await Promise.all([
          axiosPrivate.get(ACCOUNT_URL),
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(APPOINTMENT_URL),
          axiosPrivate.get(REPORTS_URL),
        ]);
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          currentAccount: accountRes.data,
          allCampaigns: campaignRes.data,
          myAppointments: appointmentRes.data,
          mySubmittedReports: reportRes.data,
        },
      });
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to load data. Please refresh.",
      });
    }
  }, []); // Dependency rỗng

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Thêm fetchData vào dependency

  // Xử lý và hợp nhất dữ liệu (giữ nguyên, vì nó đọc từ state)
  const campaignReportData = useMemo(() => {
    // Map các báo cáo đã gửi để tra cứu nhanh
    const reportMap = new Map(
      mySubmittedReports.map((r) => [r.campaignId.campaignId, r])
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

  // Handlers (giữ nguyên)
  const handleSubmitClick = (campaign) => {
    setSelectedCampaign(campaign);
    setSubmitDialogOpen(true);
  };

  const onReportSubmitted = () => {
    fetchData(); // Tải lại toàn bộ dữ liệu sau khi gửi
    setSubmitDialogOpen(false);
    setSelectedCampaign(null);
  };

  // [THAY ĐỔI]: Dùng 'status' từ reducer
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

  // [THAY ĐỔI]: Chỉ render khi status === 'success'
  return (
    status === "success" && (
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
                                href={
                                  campaign.submittedReport.reportFileUrls[0]
                                }
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

        {/* Dialog Gửi Báo Cáo (đã được import) */}
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

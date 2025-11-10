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
const VEHICLE_URL = "/api/vehicles";

// --- [THÊM MỚI]: Reducer cho việc tải dữ liệu ---
const initialState = {
  status: "idle", // 'idle', 'loading', 'success', 'error'
  currentAccount: {},
  allCampaigns: [],
  myAppointments: [],
  mySubmittedReports: [], // Giữ nguyên logic ban đầu là mảng rỗng
  allVehicles: [],
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
        allVehicles: action.payload.allVehicles,
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
        allVehicles: [],
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
    allVehicles,
    error,
  } = state;

  // State của Dialog giữ nguyên
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // [THAY ĐỔI]: Bọc fetchData trong useCallback và dùng dispatch
  const fetchData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const [accountRes, campaignRes, appointmentRes, reportRes, vehicleRes] =
        await Promise.all([
          axiosPrivate.get(ACCOUNT_URL),
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(APPOINTMENT_URL),
          axiosPrivate.get(REPORTS_URL),
          axiosPrivate.get(VEHICLE_URL),
        ]);
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          currentAccount: accountRes.data,
          allCampaigns: campaignRes.data,
          myAppointments: appointmentRes.data,
          mySubmittedReports: reportRes.data,
          allVehicles: vehicleRes.data,
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

  // --- [THAY ĐỔI LOGIC TÍNH TOÁN] ---
  const campaignReportData = useMemo(() => {
    // 1. Lấy ID của trung tâm hiện tại
    const myCenterId = currentAccount.serviceCenter?.centerId;
    if (!myCenterId) return []; // Trả về rỗng nếu không có centerId

    // 2. Map các báo cáo đã gửi (để tra cứu nhanh)
    // [SỬA LỖI]: Sửa r.campaignId.campaignId thành r.campaign.campaignId
    const reportMap = new Map(
      mySubmittedReports
        .filter((r) => r.serviceCenterId?.centerId === myCenterId) // Lọc report của trung tâm mình
        .map((r) => [r.campaignId.campaignId, r])
    );

    // 3. Tính toán số xe ĐÃ HOÀN THÀNH (Completed) tại trung tâm này
    const completedApptMap = new Map();
    for (const appt of myAppointments) {
      // Lọc các cuộc hẹn của trung tâm mình VÀ đã hoàn thành
      if (
        appt.vehicle.customer.serviceCenter?.centerId === myCenterId &&
        appt.status === "Completed" &&
        appt.campaign
      ) {
        const campaignId = appt.campaign.campaignId;
        // Đếm số cuộc hẹn hoàn thành cho mỗi chiến dịch
        completedApptMap.set(
          campaignId,
          (completedApptMap.get(campaignId) || 0) + 1
        );
      }
    }

    // 4. Hợp nhất dữ liệu
    return allCampaigns
      .map((campaign) => {
        // 4a. Lấy danh sách model của chiến dịch
        const campaignModelSet = new Set(campaign.model || []);

        // 4b. [LOGIC MỚI] Tính tổng số xe BỊ ẢNH HƯỞNG (Affected)
        // Lọc từ TẤT CẢ xe (allVehicles)
        const affectedVehiclesCount = allVehicles.filter(
          (vehicle) =>
            // Xe này phải khớp model của chiến dịch
            campaignModelSet.has(vehicle.model) &&
            // Và xe này phải thuộc trung tâm của tôi
            vehicle.customer.serviceCenter?.centerId === myCenterId
        ).length;

        // 4c. Lấy số xe đã hoàn thành (từ bước 3)
        const completedVehiclesCount =
          completedApptMap.get(campaign.campaignId) || 0;

        // 4d. Lấy thông tin khác
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
            affectedVehicles: affectedVehiclesCount, // <-- Số xe BỊ ẢNH HƯỞNG (đúng)
            completedVehicles: completedVehiclesCount, // <-- Số xe ĐÃ HOÀN THÀNH (đúng)
          },
        };
      })
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
    // [THAY ĐỔI]: Thêm dependencies
  }, [
    currentAccount,
    allCampaigns,
    allVehicles,
    myAppointments,
    mySubmittedReports,
  ]);
  // --- [KẾT THÚC THAY ĐỔI LOGIC] ---

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
                      <TableHead className="text-center">Comp/Aff</TableHead>
                      <TableHead className="text-center">
                        Report Status
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
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
                              disabled={campaign.campaignStatus !== "completed"}
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

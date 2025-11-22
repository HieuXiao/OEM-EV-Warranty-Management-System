import React, { useEffect, useState, useReducer, useCallback } from "react";
import Header from "@/components/Header";
import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import SCStaffOverview from "@/components/scstaff/ScsCampOverview";
import SCStaffAppointments from "@/components/scstaff/ScsCampAppSection";
import ScsCampaignPraticipants from "@/components/scstaff/ScsCampParticipant";
import ScsReportSection from "@/components/scstaff/ScsRepoSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosPrivate from "@/api/axios";

// --- API URLs ---
const CAMPAIGN_URL = "/api/campaigns/all";
const VEHICLE_URL = "/api/vehicles";
const APPOINTMENT_URL = "/api/service-appointments";
const ACCOUNT_URL = "/api/accounts/current";
const REPORTS_URL = "/api/campaign-reports/all";

// --- Reducer quản lý state ---
const initialState = {
  status: "idle", // 'idle', 'loading', 'success', 'error'
  currentAccount: {},
  allCampaigns: [],
  allVehicles: [],
  myAppointments: [],
  mySubmittedReports: [],
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
        allVehicles: action.payload.allVehicles,
        myAppointments: action.payload.myAppointments,
        mySubmittedReports: action.payload.mySubmittedReports,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
        ...initialState,
        status: "error",
      };
    default:
      return state;
  }
};

export default function SCStaffCampaign() {
  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  // Tách status và error ra khỏi dataProps
  const { status, error, ...dataProps } = state;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  // --- Hàm tải TẤT CẢ dữ liệu ---
  const fetchAllData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const [accountRes, campaignRes, vehicleRes, appointmentRes, reportRes] =
        await Promise.all([
          axiosPrivate.get(ACCOUNT_URL),
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(VEHICLE_URL),
          axiosPrivate.get(APPOINTMENT_URL),
          axiosPrivate.get(REPORTS_URL),
        ]);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          currentAccount: accountRes.data,
          allCampaigns: campaignRes.data,
          allVehicles: vehicleRes.data,
          myAppointments: appointmentRes.data,
          mySubmittedReports: reportRes.data,
        },
      });
    } catch (err) {
      console.error("Failed to fetch campaign data:", err);
      dispatch({
        type: "FETCH_ERROR",
        payload:
          err.message || "Failed to load all campaign data. Please refresh.",
      });
    }
  }, []);

  // --- useEffect gọi API 1 lần ---
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefreshData = () => {
    fetchAllData();
  };

  // --- Giao diện Responsive ---
  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSibebar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
      <div className="lg:pl-64 transition-all duration-200">
        <Header onMenuClick={handleOpenMenu} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              {/* CHỈNH SỬA: Wrapper cuộn ngang cho Tabs trên mobile */}
              <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                <TabsList className="w-full sm:w-auto inline-flex justify-start sm:justify-center min-w-max">
                  <TabsTrigger value="overview" className="px-4">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="practipant" className="px-4">
                    Participants
                  </TabsTrigger>
                  <TabsTrigger value="appointment" className="px-4">
                    Appointments
                  </TabsTrigger>
                  <TabsTrigger value="report" className="px-4">
                    Reports
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Nội dung Tabs: Truyền props status và error xuống */}
              <TabsContent value="overview" className="space-y-4">
                <SCStaffOverview {...dataProps} status={status} error={error} />
              </TabsContent>

              <TabsContent value="practipant" className="space-y-4">
                <ScsCampaignPraticipants
                  {...dataProps}
                  status={status}
                  error={error}
                  onRefreshData={handleRefreshData}
                />
              </TabsContent>

              <TabsContent value="appointment" className="space-y-4">
                <SCStaffAppointments
                  campaigns={dataProps.allCampaigns}
                  appointments={dataProps.myAppointments}
                  currentAccount={dataProps.currentAccount}
                  status={status}
                  error={error}
                  onRefreshData={handleRefreshData}
                />
              </TabsContent>

              <TabsContent value="report" className="space-y-4">
                <ScsReportSection
                  {...dataProps}
                  status={status}
                  error={error}
                  onRefreshData={handleRefreshData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

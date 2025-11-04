"use client";

import { useEffect, useState, useReducer, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import Badge removed; using inline border-only pill for status consistency
import EVMStaffFormCampaign from "@/components/evmstaff/EVMStaffFormCampaign";
import EVMStaffDetailCampaign from "@/components/evmstaff/EVMStaffDetailCampaign";
import axiosPrivate from "@/api/axios";

const CAMPAIGN_URL = "/api/campaigns/all";
const VEHICLE_URL = "/api/vehicles";
const APPOINTMENT_URL = "/api/service-appointments";

const initialState = {
  status: "idle",
  campaigns: [],
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
        campaigns: action.payload.campaigns,
      };
    case "FETCH_ERROR":
      return { ...state, status: "error", error: action.payload };
    // Thêm action để cập nhật local (mock)
    case "UPDATE_CAMPAIGNS_LOCALLY":
      return {
        ...state,
        campaigns: action.payload,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default function EVMStaffCampaign() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  const { status, campaigns, error } = state;

  const fetchAllData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const [campaignResponse, vehicleResponse, appointmentResponse] =
        await Promise.all([
          axiosPrivate.get(CAMPAIGN_URL),
          axiosPrivate.get(VEHICLE_URL),
          axiosPrivate.get(APPOINTMENT_URL),
        ]);

      const rawCampaigns = campaignResponse.data;
      const allVehicles = vehicleResponse.data;
      const allAppointments = appointmentResponse.data;

      const transformedData = rawCampaigns.map((campaign) => {
        const status = getCampaignStatus(campaign.startDate, campaign.endDate);

        // Tính Affected Vehicles
        const campaignModelSet = new Set(campaign.model || []);
        const affectedVehiclesCount = allVehicles.filter((vehicle) =>
          campaignModelSet.has(vehicle.model)
        ).length;

        // Tính Completed Vehicles (Giả định appointment có campaignId và status)
        const completedVehiclesCount = allAppointments.filter(
          (app) =>
            app.campaign.campaignId === campaign.campaignId &&
            app.status === "Completed"
        ).length;

        return {
          ...campaign,
          status: status,
          affectedVehicles: affectedVehiclesCount,
          completedVehicles: completedVehiclesCount,
        };
      });

      dispatch({
        type: "FETCH_SUCCESS",
        payload: { campaigns: transformedData },
      });
    } catch (err) {
      console.error("API Error: " + err.message);
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getCampaignStatus = (startDate, endDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Chuẩn hóa về đầu ngày hôm nay

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Chuẩn hóa về đầu ngày bắt đầu

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0); // Chuẩn hóa về đầu ngày kết thúc

    if (now > end) {
      return "completed";
    } else if (now >= start && now <= end) {
      return "on going";
    } else {
      // now < start
      return "not yet";
    }
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      return campaign.campaignName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    })
    .filter((campaign) => {
      // 2. Filter theo status đã tính toán sẵn
      if (statusFilter === "all") {
        return true;
      }
      return campaign.status === statusFilter;
    });

  const totalPages =
    Math.ceil(filteredCampaigns.length / itemsPerPage) === 0
      ? 1
      : Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaveCampaign = (campaignData) => {
    let updatedCampaigns;
    if (editingCampaign) {
      updatedCampaigns = campaigns.map((c) =>
        c.id === editingCampaign.id ? { ...c, ...campaignData } : c
      );
    } else {
      updatedCampaigns = [
        ...campaigns,
        { id: String(campaigns.length + 1), ...campaignData },
      ];
    }

    // Giả sử đây là mock, chỉ cập nhật local
    // Nếu đây là API thật, bạn sẽ POST/PUT rồi gọi fetchAllData()
    dispatch({
      type: "UPDATE_CAMPAIGNS_LOCALLY",
      payload: updatedCampaigns,
    });

    setEditingCampaign(null);
  };

  // border-only pill; keep original casing (do not uppercase)
  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    const map = {
      completed: "text-white bg-green-400 border-green-400",
      "not yet": "text-white bg-blue-400 border-blue-400",
      "on going": "text-white bg-yellow-600 border-yellow-600",
    };
    const cls = map[s] || "text-gray-700 border-gray-300";
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border min-w-[100px] ${cls}`}
      >
        {String(status || "").replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Campaign Management</h1>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Thêm Filter Dropdown */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset trang khi filter
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not yet">Not Yet</SelectItem>
                  <SelectItem value="on going">On Going</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setEditingCampaign(null);
                  setShowCampaignDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            <div className="border rounded-lg">
              <div className="w-full overflow-x-auto">
                <Table className="table-auto w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28 text-left">No.</TableHead>
                      <TableHead className="w-48 text-left">
                        Campaign Name
                      </TableHead>
                      <TableHead className="max-w-[360px] text-left">
                        Description
                      </TableHead>
                      <TableHead className="w-40 text-left">
                        Start Date
                      </TableHead>
                      <TableHead className="w-32 text-left">Due Date</TableHead>
                      <TableHead className="w-32 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status === "loading" && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-40">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    )}
                    {status === "error" && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center h-40 text-destructive"
                        >
                          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                          <p>{error}</p>
                        </TableCell>
                      </TableRow>
                    )}
                    {status === "success" &&
                      paginatedCampaigns.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center h-40 text-muted-foreground"
                          >
                            No campaigns found.
                          </TableCell>
                        </TableRow>
                      )}
                    {status === "success" &&
                      paginatedCampaigns.map((campaign, i) => (
                        <TableRow
                          key={campaign.id}
                          onClick={() => setViewCampaign(campaign)}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium text-left">
                            {i + 1}
                          </TableCell>
                          <TableCell className="text-left">
                            {campaign.campaignName}
                          </TableCell>
                          <TableCell className="max-w-[360px] whitespace-normal break-words text-left">
                            {(campaign.serviceDescription || "").slice(0, 60)}
                          </TableCell>
                          <TableCell className="text-left">
                            {campaign.startDate}
                          </TableCell>
                          <TableCell className="text-left">
                            {campaign.endDate}
                          </TableCell>
                          <TableCell className="text-center align-middle">
                            {getStatusBadge(
                              getCampaignStatus(
                                campaign.startDate,
                                campaign.endDate
                              ).toUpperCase()
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      <EVMStaffFormCampaign
        open={showCampaignDialog}
        onOpenChange={setShowCampaignDialog}
        onSave={handleSaveCampaign}
        campaign={editingCampaign}
        allCampaigns={campaigns}
      />
      <EVMStaffDetailCampaign
        open={!!viewCampaign}
        onOpenChange={() => setViewCampaign(null)}
        campaign={viewCampaign}
      />
    </div>
  );
}

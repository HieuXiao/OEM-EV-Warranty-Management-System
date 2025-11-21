import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import ReportRepair from "@/components/sctechnician/ScTechnicianRepairForm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const API = {
  WARRANTY_CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
};

const initialState = {
  jobs: [],
  loading: true,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, jobs: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function SCTechnicianRepair() {
  const { auth } = useAuth();
  const techId = auth?.accountId;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { jobs, loading, error } = state;

  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const vehicleCache = useRef({});

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return isoString;
    }
  }, []);

  // --- fetch + caching ---
  const fetchClaimsAndEnrich = async (forceRefresh = false) => {
    if (!techId) return;
    const cacheKey = `repair_data_${techId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached && !forceRefresh) {
      try {
        dispatch({ type: "FETCH_SUCCESS", payload: JSON.parse(cached) });
        return;
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    dispatch({ type: "FETCH_START" });
    try {
      const [claimsRes, vehiclesRes, accountsRes] = await Promise.all([
        axiosPrivate.get(API.WARRANTY_CLAIMS),
        axiosPrivate.get(API.VEHICLES),
        axiosPrivate.get(API.ACCOUNTS),
      ]);

      const claims = Array.isArray(claimsRes?.data) ? claimsRes.data : [];
      const vehicles = Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
      const accounts = Array.isArray(accountsRes?.data) ? accountsRes.data : [];

      const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.vin, v]));

      const filteredClaims = claims.filter(
        (c) =>
          c.status === "REPAIR" &&
          c.serviceCenterTechnicianId?.toUpperCase() === techId?.toUpperCase()
      );

      const enriched = filteredClaims.map((claim) => {
        const vehicle = vehicleMap[claim.vin];
        const scStaff = accounts.find((a) => a.accountId === claim.serviceCenterStaffId);
        return {
          id: claim.claimId,
          claimId: claim.claimId,
          jobNumber: `CLM-${claim.claimId}`,
          plate: claim.plate || vehicle?.plate || "N/A",
          claimDate: claim.claimDate,
          createdAt: claim.claimDate,
          comment: claim.description || vehicle?.campaign?.serviceDescription || "",
          status: claim.status,
          scStaff,
          rawClaim: claim,
        };
      });

      sessionStorage.setItem(cacheKey, JSON.stringify(enriched));
      dispatch({ type: "FETCH_SUCCESS", payload: enriched });
    } catch (err) {
      console.error("[SCTechnicianRepair] fetchClaimsAndEnrich failed:", err);
      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to load repair jobs. Please try again later.",
      });
    }
  };

  useEffect(() => {
    fetchClaimsAndEnrich();
  }, [techId]);

  const handleOpenReport = (job) => setSelectedJob(job);
  const handleCloseReport = () => setSelectedJob(null);

  const handleCompleteRepair = () => {
    setSelectedJob(null);
    fetchClaimsAndEnrich(true);
  };

  // --- filtering / sorting / pagination ---
  const filteredJobs = jobs.filter((job) =>
        [job.jobNumber, job.plate].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.claimDate || a.createdAt);
    const dateB = new Date(b.claimDate || b.createdAt);
    if (sortOrder === "newest") {
      if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;
      return parseInt(b.claimId?.match(/(\d+)$/)?.[1] || 0) - parseInt(a.claimId?.match(/(\d+)$/)?.[1] || 0);
    } else {
      if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
      return parseInt(a.claimId?.match(/(\d+)$/)?.[1] || 0) - parseInt(b.claimId?.match(/(\d+)$/)?.[1] || 0);
    }
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Repair Jobs</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Active repair and maintenance tasks assigned to you
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchClaimsAndEnrich(true)}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-4">
            <Search className="text-muted-foreground" />
            <Input
              placeholder="Search by job number or plate..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={sortOrder === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOrder("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortOrder === "oldest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOrder("oldest")}
            >
              Oldest
            </Button>
          </div>

          {/* Content */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center text-muted-foreground animate-pulse py-8">
                  Loading repair jobs...
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-8">{error}</div>
              ) : currentJobs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                  No repair jobs assigned to your account
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-
                      {Math.min(startIndex + currentJobs.length, filteredJobs.length)} of {filteredJobs.length} job(s)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleOpenReport(job)}
                        className="p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-lg">{job.jobNumber}</p>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <p className="text-muted-foreground">
                              <span className="font-medium">Vehicle Plate:</span> {job.plate}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Date:</span> {formatDateTime(job.claimDate || job.createdAt)}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">SC Staff:</span> {job.scStaff?.fullName || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedJob && (
        <ReportRepair
          job={selectedJob}
          onClose={handleCloseReport}
          onComplete={handleCompleteRepair}
        />
      )}
    </div>
  );
}

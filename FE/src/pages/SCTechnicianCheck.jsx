import { useState, useEffect, useRef } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import ReportCheck from "@/components/sctechnician/ScTechnicianCheckForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosPrivate from "@/api/axios";

/**
 * NOTE:
 * - Uses new claim schema from GET /api/warranty_claims/
 * - For each claim: claimId, vin, claimDate, description, scStaffId, status
 * - Enrich each claim with vehicle info from /api/vehicle/{VIN} and staff from /api/accounts/{scStaffId}
 * - Keep original UI/logic: modal + report form, paging, search
 */

export default function SCTechnicianCheck() {
  const [selectedJob, setSelectedJob] = useState(null); // will hold enriched "job" shaped from claim
  const [jobs, setJobs] = useState([]); // list of enriched claims
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // cache for vehicle info by VIN to avoid repeated calls
  const vehicleCache = useRef({});

  useEffect(() => {
    fetchClaimsAndEnrich();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    // claimDate is expected like "2025-10-24" — show as dd/mm/yyyy
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const fetchVehicle = async (vin) => {
    if (!vin) return null;
    if (vehicleCache.current[vin]) return vehicleCache.current[vin];
    try {
      const res = await axiosPrivate.get(`/api/vehicle/${encodeURIComponent(vin)}`);
      const data = res?.data || null;
      vehicleCache.current[vin] = data;
      return data;
    } catch (e) {
      console.warn("[fetchVehicle] failed for VIN", vin, e);
      return null;
    }
  };

  const fetchStaff = async (accountId) => {
    if (!accountId) return null;
    try {
      const res = await axiosPrivate.get(`/api/accounts/${encodeURIComponent(accountId)}`);
      return res?.data || null;
    } catch (e) {
      console.warn("[fetchStaff] failed for accountId", accountId, e);
      return null;
    }
  };

  const fetchClaimsAndEnrich = async () => {
    try {
      const res = await axiosPrivate.get("/api/warranty-claims");
      const data = Array.isArray(res?.data) ? res.data : [];

      // filter CHECK status
      const checkClaims = data.filter((c) => c.status === "CHECK");

      // enrich in parallel
      const enriched = await Promise.all(
        checkClaims.map(async (claim) => {
          const vin = claim.vin;
          const vehicle = await fetchVehicle(vin);
          const staff = await fetchStaff(claim.scStaffId);
          // Map into the original "job" fields used in your UI while preserving claim fields
          const job = {
            // keep original-like fields for UI compatibility:
            id: claim.claimId,
            claimId: claim.claimId,
            jobNumber: `CLM-${claim.claimId}`, // original UI used jobNumber; create readable label
            vin: claim.vin,
            vehicleModel: vehicle?.model || (claim.campaigns && claim.campaigns[0]?.model) || "N/A",
            claimDate: claim.claimDate,
            createdAt: claim.claimDate, // used by formatDateTime sometimes
            comment: claim.description,
            status: claim.status,
            scStaff: staff,
            rawClaim: claim, // keep raw for advanced usage (attachments etc)
          };
          return job;
        })
      );

      setJobs(enriched);
    } catch (e) {
      console.error("[SCTechnicianCheck] fetchClaims failed:", e);
    }
  };

  const handleCardClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseReport = () => {
    setSelectedJob(null);
  };

  const handleCompleteCheck = () => {
    // keep existing UI flow: mark completed locally and refetch
    setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? { ...j, status: "completed" } : j)));
    setSelectedJob(null);
    fetchClaimsAndEnrich();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.jobNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.vin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.vehicleModel || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Check Jobs</h1>
              <p className="text-muted-foreground mt-2 text-lg">Diagnostic and inspection tasks</p>
            </div>

            <div className="flex gap-3 mb-4">
              <Search className="text-muted-foreground" />
              <Input
                placeholder="Search by job number, VIN or model..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-12 text-base"
              />
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} job(s)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages || 1}</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentJobs.length > 0 ? (
                      currentJobs.map((job) => (
                        <div key={job.id} onClick={() => handleCardClick(job)} className="p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-lg">{job.jobNumber}</p>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Vehicle:</span> {job.vehicleModel} - {job.vin}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">Date:</span> {formatDateTime(job.claimDate || job.createdAt)}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">SC Staff:</span> {job.scStaff?.fullName || job.scStaff?.username || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">No jobs found matching your criteria</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedJob && (
        <ReportCheck job={selectedJob} onClose={handleCloseReport} onComplete={handleCompleteCheck} />
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import ReportCheck from "@/components/sctechnician/ScTechnicianCheckForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const API_ENDPOINTS = {
  WARRANTY_CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
};

export default function SCTechnicianCheck() {
  const { auth } = useAuth();
  const techId = auth?.accountId;

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const vehicleCache = useRef({});

  useEffect(() => {
    if (techId) fetchClaimsAndEnrich();
  }, [techId]);

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
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

  const fetchClaimsAndEnrich = async () => {
    try {
      const [claimsRes, vehiclesRes, accountsRes] = await Promise.all([
        axiosPrivate.get(API_ENDPOINTS.WARRANTY_CLAIMS),
        axiosPrivate.get(API_ENDPOINTS.VEHICLES),
        axiosPrivate.get(API_ENDPOINTS.ACCOUNTS),
      ]);

      const claims = Array.isArray(claimsRes?.data) ? claimsRes.data : [];
      const vehicles = Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
      const accounts = Array.isArray(accountsRes?.data) ? accountsRes.data : [];

      const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.vin, v]));
      const accountMap = Object.fromEntries(accounts.map((a) => [a.accountId, a]));

      const filteredClaims = claims.filter(
        (c) =>
          c.status === "CHECK" &&
          c.serviceCenterTechnicianId?.toUpperCase() === techId?.toUpperCase()
      );

      const enriched = filteredClaims.map((claim) => {
        const vehicle = vehicleMap[claim.vin];
        const scStaff = accountMap[claim.serviceCenterStaffId];
        const scTechnician = accountMap[claim.serviceCenterTechnicianId];

        return {
          id: claim.claimId,
          claimId: claim.claimId,
          jobNumber: `CLM-${claim.claimId}`,
          vin: claim.vin || "N/A",
          vehicleModel: vehicle?.model || "N/A",
          claimDate: claim.claimDate,
          createdAt: claim.claimDate,
          comment:
            claim.description || vehicle?.campaign?.serviceDescription || "",
          status: claim.status,
          scStaff,
          scTechnician,
          rawClaim: claim,
        };
      });

      setJobs(enriched);
    } catch (e) {
      console.error("[SCTechnicianCheck] fetchClaimsAndEnrich failed:", e);
    }
  };

  const handleCardClick = (job) => setSelectedJob(job);
  const handleCloseReport = () => setSelectedJob(null);

  const handleCompleteCheck = () => {
    setJobs((prev) =>
      prev.map((j) => (j.id === selectedJob.id ? { ...j, status: "completed" } : j))
    );
    setSelectedJob(null);
    window.location.reload();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.jobNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.vin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.vehicleModel || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.claimDate || a.createdAt);
    const dateB = new Date(b.claimDate || b.createdAt);

    if (sortOrder === "newest") {
      if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;
      const numA = parseInt(a.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
      const numB = parseInt(b.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
      return numB - numA;
    } else {
      if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
      const numA = parseInt(a.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
      const numB = parseInt(b.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
      return numA - numB;
    }
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Check Jobs</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Diagnostic and inspection tasks assigned to you
              </p>
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

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of{" "}
                      {filteredJobs.length} job(s)
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
                    {currentJobs.length > 0 ? (
                      currentJobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => handleCardClick(job)}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                        >
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
                                <span className="font-medium">SC Staff:</span>{" "}
                                {job.scStaff?.fullName || job.scStaff?.username || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No jobs assigned to your account
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedJob && (
        <ReportCheck
          job={selectedJob}
          onClose={handleCloseReport}
          onComplete={handleCompleteCheck}
        />
      )}
    </div>
  );
}

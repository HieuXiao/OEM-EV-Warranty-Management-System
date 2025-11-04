import { useState, useEffect, useRef } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import ReportRepair from "@/components/sctechnician/ScTechnicianRepairForm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const API_ENDPOINTS = {
  WARRANTY_CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
  ACCOUNTS: "/api/accounts/",
};

export default function SCTechnicianRepair() {
  const { auth } = useAuth();
  const techId = auth?.accountId;
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 🔹 thêm sort
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const vehicleCache = useRef({});
  const accountCache = useRef({});

  useEffect(() => {
    if (techId) fetchClaimsAndEnrich();
  }, [techId]);

  const fetchClaimsAndEnrich = async () => {
    try {
      const [claimsRes, vehiclesRes, accountsRes] = await Promise.all([
        axiosPrivate.get(API_ENDPOINTS.WARRANTY_CLAIMS),
        axiosPrivate.get(API_ENDPOINTS.VEHICLES),
        axiosPrivate.get(API_ENDPOINTS.ACCOUNTS),
      ]);

      const allClaims = Array.isArray(claimsRes?.data) ? claimsRes.data : [];
      const allVehicles = Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
      const allAccounts = Array.isArray(accountsRes?.data) ? accountsRes.data : [];

      const repairClaims = allClaims.filter(
        (c) =>
          c.status === "REPAIR" &&
          c.serviceCenterTechnicianId?.toUpperCase() === techId?.toUpperCase()
      );

      const enriched = repairClaims.map((claim) => {
        const vehicle = allVehicles.find((v) => v.vin === claim.vin);
        const staffAcc = allAccounts.find(
          (acc) =>
            acc.accountId === claim.serviceCenterStaffId &&
            acc.roleName === "SC_STAFF"
        );

        return {
          id: claim.claimId,
          claimId: claim.claimId,
          jobNumber: `CLM-${claim.claimId}`,
          vin: claim.vin,
          vehicleModel: vehicle?.model || claim.model || "N/A",
          claimDate: claim.claimDate,
          comment: claim.description,
          status: claim.status,
          scStaff: staffAcc,
          rawClaim: claim,
        };
      });

      setJobs(enriched);
    } catch (err) {
      console.error("[SCTechnicianRepair] fetchClaims failed:", err);
    }
  };

  const handleOpenReport = (job) => setSelectedJob(job);
  const handleCloseReport = () => setSelectedJob(null);
  const handleCompleteRepair = () => {
    setSelectedJob(null);
    window.location.reload();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 🔹 Thêm phần sort
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.claimDate);
    const dateB = new Date(b.claimDate);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
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
              <h1 className="text-4xl font-bold tracking-tight">Repair Jobs</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Active repair and maintenance tasks assigned to you
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

            {/* 🔹 Thêm chọn sort */}
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
                          onClick={() => handleOpenReport(job)}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-lg">{job.jobNumber}</p>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Vehicle:</span> {job.vehicleModel} - {job.vin}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">Date:</span> {job.claimDate}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">SC Staff:</span> {job.scStaff?.fullName || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No repair jobs assigned to your account
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
        <ReportRepair
          job={selectedJob}
          onClose={handleCloseReport}
          onComplete={handleCompleteRepair}
        />
      )}
    </div>
  );
}

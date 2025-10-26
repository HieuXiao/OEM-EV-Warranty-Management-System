import { useState, useEffect, useRef } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import ReportRepair from "@/components/sctechnician/ScTechnicianRepairForm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosPrivate from "@/api/axios";

/**
 * - loads claims with status === "REPAIR"
 * - enrich each claim with vehicle info and scStaff
 * - preserves original UI flow, passing enriched "job" to ReportRepair
 */

export default function SCTechnicianRepair() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const vehicleCache = useRef({});

  useEffect(() => {
    fetchClaimsAndEnrich();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVehicle = async (vin) => {
    if (!vin) return null;
    if (vehicleCache.current[vin]) return vehicleCache.current[vin];
    try {
      const res = await axiosPrivate.get(`/api/vehicle/${encodeURIComponent(vin)}`);
      const data = res?.data || null;
      vehicleCache.current[vin] = data;
      return data;
    } catch (e) {
      console.warn("[SCTechnicianRepair] fetchVehicle failed for VIN", vin, e);
      return null;
    }
  };

  const fetchStaff = async (accountId) => {
    if (!accountId) return null;
    try {
      const res = await axiosPrivate.get(`/api/accounts/${encodeURIComponent(accountId)}`);
      return res?.data || null;
    } catch (e) {
      console.warn("[SCTechnicianRepair] fetchStaff failed for id", accountId, e);
      return null;
    }
  };

  const fetchClaimsAndEnrich = async () => {
    try {
      const res = await axiosPrivate.get("/api/warranty-claims");
      const data = Array.isArray(res?.data) ? res.data : [];
      const repairClaims = data.filter((c) => c.status === "REPAIR");

      const enriched = await Promise.all(
        repairClaims.map(async (claim) => {
          const vehicle = await fetchVehicle(claim.vin);
          const staff = await fetchStaff(claim.scStaffId);
          return {
            id: claim.claimId,
            claimId: claim.claimId,
            jobNumber: `CLM-${claim.claimId}`,
            vin: claim.vin,
            vehicleModel: vehicle?.model || (claim.campaigns && claim.campaigns[0]?.model) || "N/A",
            claimDate: claim.claimDate,
            comment: claim.description,
            status: claim.status,
            scStaff: staff,
            rawClaim: claim,
          };
        })
      );

      setJobs(enriched);
    } catch (e) {
      console.error("[SCTechnicianRepair] fetchClaims failed:", e);
    }
  };

  const handleOpenReport = (job) => setSelectedJob(job);
  const handleCloseReport = () => setSelectedJob(null);

  const handleCompleteRepair = () => {
    setJobs((prevJobs) => {
      const updated = prevJobs.map((j) => (j.id === selectedJob.id ? { ...j, status: "completed" } : j));
      const sorted = [...updated.filter((j) => j.status !== "completed"), ...updated.filter((j) => j.status === "completed")];
      return sorted;
    });
    setSelectedJob(null);
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
              <h1 className="text-4xl font-bold tracking-tight">Repair Jobs</h1>
              <p className="text-muted-foreground mt-2 text-lg">Active repair and maintenance tasks</p>
            </div>

            <div className="flex gap-3 mb-4">
              <Search className="text-muted-foreground" />
              <Input placeholder="Search by job number, VIN or model..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 h-12 text-base" />
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} job(s)</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
                      <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages || 1}</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentJobs.length > 0 ? currentJobs.map((job) => (
                      <div key={job.id} onClick={() => handleOpenReport(job)} className="p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-lg">{job.jobNumber}</p>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <p className="text-muted-foreground"><span className="font-medium">Vehicle:</span> {job.vehicleModel} - {job.vin}</p>
                            <p className="text-muted-foreground"><span className="font-medium">Date:</span> {job.claimDate}</p>
                            <p className="text-muted-foreground"><span className="font-medium">SC Staff:</span> {job.scStaff?.fullName || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">No jobs found matching your criteria</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedJob && <ReportRepair job={selectedJob} onClose={handleCloseReport} onComplete={handleCompleteRepair} />}
    </div>
  );
}

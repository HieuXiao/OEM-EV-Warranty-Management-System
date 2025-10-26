import { useEffect, useState } from "react";
import SCTechnicianSidebar from "@/components/sctechnician/SCTechnicianSidebar";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ClipboardCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

export default function SCTechnicianDashboard() {
  const { auth } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const techId = auth?.accountId;

  useEffect(() => {
    const fetchClaims = async () => {
      if (!techId) return;
      try {
        const res = await axiosPrivate.get(`/api/warranty-claims`);
        
        const allClaims = res.data || [];

        const technicianClaims = allClaims.filter(
          (claim) => claim.scTechnicianId.toUpperCase() === techId.toUpperCase()
        );
        
        setClaims(technicianClaims);
        
      } catch (err) {
        console.error("Error fetching claims:", err);
        setError("Failed to load technician claims.");
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [techId]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  // Giả sử description hoặc status có thể phân biệt loại job
  const checkJobs = claims.filter((claim) => claim.status?.toUpperCase() === "CHECK");
  const repairJobs = claims.filter((claim) => claim.status?.toUpperCase() === "REPAIR");

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-destructive">{error}</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar />
      <div className="lg:pl-64">
        <Header />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">My Jobs</h1>
              <p className="text-muted-foreground mt-1">
                High priority tasks requiring immediate attention
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Check Jobs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-cyan-500" />
                      <div>
                        <CardTitle>Check Jobs</CardTitle>
                        <CardDescription>
                          Diagnostic and inspection tasks
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/sctechnician/check">
                        View all
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checkJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.claimId}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">Claim #{job.claimId}</p>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            VIN: {job.vin}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Date: {formatDate(job.claimDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Repair Jobs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-500" />
                      <div>
                        <CardTitle>Repair Jobs</CardTitle>
                        <CardDescription>
                          Active repair and maintenance tasks
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/sctechnician/repair">
                        View all
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {repairJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.claimId}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">Claim #{job.claimId}</p>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            VIN: {job.vin}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Date: {formatDate(job.claimDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

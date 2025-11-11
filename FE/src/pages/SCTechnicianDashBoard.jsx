import { useEffect, useReducer } from "react";
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
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const initialState = {
  claims: [],
  loading: true,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, claims: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function SCTechnicianDashboard() {
  const { auth } = useAuth();
  const techId = auth?.accountId;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!techId) return;

    const cacheKey = `claims_${techId}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    // Nếu đã có cache thì load ngay
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        dispatch({ type: "FETCH_SUCCESS", payload: parsed });
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    const fetchClaims = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const res = await axiosPrivate.get(`/api/warranty-claims`);
        const allClaims = Array.isArray(res.data) ? res.data : [];

        const technicianClaims = allClaims.filter(
          (claim) =>
            claim.serviceCenterTechnicianId?.toUpperCase() ===
            techId.toUpperCase()
        );

        // Sắp xếp theo ngày mới nhất
        const sortedClaims = [...technicianClaims].sort((a, b) => {
          const dateA = new Date(a.claimDate);
          const dateB = new Date(b.claimDate);
          if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;
          const numA = parseInt(a.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
          const numB = parseInt(b.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
          return numB - numA;
        });

        // Lưu vào cache để lần sau load nhanh hơn
        sessionStorage.setItem(cacheKey, JSON.stringify(sortedClaims));
        dispatch({ type: "FETCH_SUCCESS", payload: sortedClaims });
      } catch (err) {
        console.error("Error fetching claims:", err);
        dispatch({
          type: "FETCH_ERROR",
          payload: "Failed to load technician claims.",
        });
      }
    };

    // Nếu chưa có cache, hoặc cache quá cũ, thì gọi API
    if (!cachedData) fetchClaims();
  }, [techId]);

  const { claims, loading, error } = state;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-GB");
  };

  const checkJobs = claims.filter(
    (claim) => claim.status?.toUpperCase() === "CHECK"
  );
  const repairJobs = claims.filter(
    (claim) => claim.status?.toUpperCase() === "REPAIR"
  );

  // --- UI ---
  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading technician dashboard...
      </div>
    );
  if (error)
    return <div className="p-8 text-center text-destructive">{error}</div>;

    return (
    <div className="min-h-screen bg-muted/30">
      <SCTechnicianSidebar />
      <div className="lg:pl-64">
        <Header />

        <div className="p-4 md:p-6 lg:p-8">
          {/* trạng thái load */}
          {loading ? (
            <div className="text-center text-muted-foreground animate-pulse py-10">
              Loading technician dashboard...
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-10">{error}</div>
          ) : claims.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border border-dashed rounded-lg">
              No jobs assigned to your account
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">My Jobs</h1>
                <p className="text-muted-foreground mt-1">
                  High priority tasks requiring immediate attention
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* CHECK JOBS */}
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
                    {checkJobs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        No check jobs assigned to your account
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {checkJobs.slice(0, 3).map((job) => (
                          <div
                            key={job.claimId}
                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">
                                  Claim #{job.claimId}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {job.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                VIN: {job.vin || "—"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Date: {formatDate(job.claimDate)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* REPAIR JOBS */}
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
                    {repairJobs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        No repair jobs assigned to your account
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {repairJobs.slice(0, 3).map((job) => (
                          <div
                            key={job.claimId}
                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">
                                  Claim #{job.claimId}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {job.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                VIN: {job.vin || "—"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Date: {formatDate(job.claimDate)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

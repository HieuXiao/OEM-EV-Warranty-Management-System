import { Link } from "react-router-dom";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScsDashTable({
  claims,
  activeCampaigns,
  todayAppointments,
  completedThisMonth,
}) {
  const totalClaims = claims.length;
  const needHandover = claims.filter(
    (c) => c.status?.toUpperCase() === "HANDOVER"
  ).length;

  return (
    <div className="space-y-6">
      {/* 4 main cards - Responsive Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 border rounded-lg bg-card shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Claims</p>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalClaims}</div>
          <p className="text-xs text-yellow-600 mt-1">
            {needHandover} Need Handover
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-card shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Claims Completed This Month</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{completedThisMonth}</div>
        </div>

        <div className="p-4 border rounded-lg bg-card shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Active Campaigns</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{activeCampaigns}</div>
        </div>

        <div className="p-4 border rounded-lg bg-card shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Today’s Appointments</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{todayAppointments}</div>
        </div>
      </div>

      {/* List Section */}
      <div>
        <CardHeader className="px-0 sm:px-6">
          {/* Header Responsive: Stack dọc trên mobile, ngang trên tablet+ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>List Warranty Claims</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full sm:w-auto border sm:border-none"
            >
              <Link to="/scstaff/warranty">
                Warranty Claim
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          {/* Grid Content: 1 cột mobile, 2 cột từ tablet trở lên */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {claims.filter((c) => c.status?.toUpperCase() === "HANDOVER")
              .length > 0 ? (
              claims
                .filter((c) => c.status?.toUpperCase() === "HANDOVER")
                .slice(0, 6)
                .map((claim) => (
                  <div
                    key={claim.claimId}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-medium text-sm">{claim.claimId}</p>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0.5 capitalize")}
                        >
                          {claim.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        <span className="font-medium text-foreground">
                          {claim.vehicleModel}
                        </span>{" "}
                        - {claim.vehiclePlate}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {claim.issueDescription}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-center text-muted-foreground col-span-1 md:col-span-2 py-8 border rounded-lg border-dashed">
                No claims need handover found
              </p>
            )}
          </div>
        </CardContent>
      </div>
    </div>
  );
}

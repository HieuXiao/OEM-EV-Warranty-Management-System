import { Link } from "react-router-dom";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScsDashTable({ claims }) {
  const totalClaims = claims.length;
  const needHandOver = claims.filter(
    (c) => c.status === "completed" || c.status === "rejected"
  ).length;

  return (
    <div className="space-y-6">
      {/* 4 main cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Active Claims</p>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalClaims}</div>
          <p className="text-xs text-yellow-600 mt-1">
            {needHandOver} Need Handover
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Completed This Month</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {claims.filter((c) => c.status === "completed").length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Monthly completed claims
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Active Campaigns</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">—</div>
          <p className="text-xs text-muted-foreground mt-1 text-yellow-600">
            Data from campaigns (not implemented)
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Today’s Appointments</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">—</div>
          <p className="text-xs text-muted-foreground mt-1">Placeholder</p>
        </div>
      </div>

      {/* Table */}
      <div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>List Warranty Claims</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/scstaff/warranty">
                Warranty Claim
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
                {claims
                .filter((c) => c.status?.toUpperCase() === "HANDOVER") // 👈 chỉ hiển thị claim HANDOVER
                .slice(0, 6)
                .map((claim) => (
                    <div
                    key={claim.claimId}
                    className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{claim.claimId}</p>
                        <Badge variant="outline" className={cn("text-xs capitalize")}>
                            {claim.status}
                        </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground truncate">
                        {claim.vehicleModel} - {claim.vehiclePlate}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {claim.issueDescription}
                        </p>
                    </div>
                    </div>
                ))}
            </div>
            </CardContent>
      </div>
    </div>
  );
}

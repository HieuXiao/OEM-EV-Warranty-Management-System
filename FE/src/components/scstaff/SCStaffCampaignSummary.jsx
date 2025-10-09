import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Package,
  Users,
  Clock,
  Check,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import {
  mockWarrantyClaims,
  mockParts,
  mockUsers,
  mockActivityLogs,
} from "@/lib/Mock-data";

export default function SCStaffCampaignSummary() {
  const totalClaims = mockWarrantyClaims.length;
  const pendingClaims = mockWarrantyClaims.filter(
    (c) => c.status === "pending"
  ).length;
  const inProgressClaims = mockWarrantyClaims.filter(
    (c) => c.status === "in_progress"
  ).length;
  const completedClaims = mockWarrantyClaims.filter(
    (c) => c.status === "completed"
  ).length;
  const totalParts = mockParts.reduce((sum, p) => sum + p.stock, 0);
  const lowStockParts = mockParts.filter(
    (p) => p.status === "low_stock"
  ).length;
  const activeUsers = mockUsers.filter((u) => u.status === "active").length;

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "low":
        return "bg-gray-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "urgent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  return (
    <>
      {/* ====== HEADER CARD ====== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaign
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
          </CardContent>
        </Card>
        {/* Card 2: Active Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaign
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressClaims}</div>
          </CardContent>
        </Card>
        {/* Card 3: Pending Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Campaign
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressClaims}</div>
          </CardContent>
        </Card>
        {/* Card 4: Complete Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Complete Campaign
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressClaims}</div>
          </CardContent>
        </Card>
      </div>

      {/*  */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Warranty Claims</CardTitle>
              <CardDescription>
                Latest claims requiring attention
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/scstaff/claims">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWarrantyClaims.slice(0, 3).map((claim) => (
              <div
                key={claim.id}
                className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{claim.claimNumber}</p>

                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        getStatusColor(claim.status)
                      )}
                    >
                      {claim.status.replace("_", " ")}
                    </Badge>

                    {/* Priority Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        getPriorityColor(claim.priority)
                      )}
                    >
                      {claim.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {claim.vehicleModel} – {claim.vehiclePlate}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {claim.issueDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

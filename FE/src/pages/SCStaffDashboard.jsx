import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
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
  mockRecallCampaigns,
  mockParts,
  mockUsers,
  mockActivityLogs,
} from "@/lib/Mock-data";
import { useEffect } from "react";

export default function SCStaffDashboard() {
  // Card information
  const totalClaims = mockWarrantyClaims.length;
  //
  const toDoClaims = mockWarrantyClaims.filter(
    (c) => c.status === "to_do"
  ).length;
  //
  const needHandOver = mockWarrantyClaims.filter(
    (c) => c.status === "completed" || c.status === "rejected"
  ).length;
  //

  //
  const startedCampaigns = mockRecallCampaigns.filter(
    (rc) => rc.status === "started"
  ).length;
  //
  const endedCampaigns = mockRecallCampaigns.filter(
    (rc) => rc.status === "ended"
  ).length;

  useEffect(() => {
    document.title = `Dashboard`;
  }, []);

  function getStatusColor(status) {
    switch (status) {
      case "on_going":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "rejected":
        return "bg-red-500";
      case "hand_overed":
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
    <div className="min-h-screen bg-muted/30">
      <SCStaffSibebar name={"Nam"} role={"SC Staff"} />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header name={"Pham Nhut Nam"} email={"nam.admin@gmail.com"} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* DB (CARD) - 4 Main Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* CARD-01 - Active Warranties */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Claims
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClaims}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-yellow-600">
                      {needHandOver} Need Handover
                    </span>
                  </p>
                </CardContent>
              </Card>
              {/* CARD-02 - Completed This Month */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed This Month
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{startedCampaigns}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {endedCampaigns} monthly target
                  </p>
                </CardContent>
              </Card>
              {/* CARD-03 - Active Campaigns */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Campaigns
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{endedCampaigns}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {endedCampaigns} need report
                  </p>
                </CardContent>
              </Card>
              {/* CARD-04 - Today’s Appointments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today’s Appointments
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{endedCampaigns}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {endedCampaigns} completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* DB (TABLE) - Table */}
            <Card>
              {/* DB (TABLE) - Table / Header */}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>List Warranty Claims</CardTitle>
                    {/* <CardDescription>
                      Latest claims requiring attention
                    </CardDescription> */}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/scstaff/warranty">
                      View all
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              {/* DB (TABLE) - Table / Lists Warranties */}
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[...mockWarrantyClaims]
                    .sort((a, b) => {
                      const order = {
                        completed: 1,
                        rejected: 2,
                        on_going: 3,
                        to_do: 4,
                        hand_overed: 5,
                      };
                      return order[a.status] - order[b.status];
                    })
                    .slice(0, 6)
                    .map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {claim.claimNumber}
                            </p>

                            {/* Status Badge */}
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs capitalize text-white",
                                getStatusColor(claim.status)
                              )}
                            >
                              {claim.status.replace("_", " ")}
                            </Badge>
                            {/* Priority Badge */}
                            {/* <Badge
                            variant="outline"
                            className={cn(
                              "text-xs capitalize",
                              getPriorityColor(claim.priority)
                            )}
                          >
                            {claim.priority}
                          </Badge> */}
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

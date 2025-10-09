// IMPORT FROM COMPONENT
import Header from "@/components/Header";
import SCStaffSibebar from "@/components/scstaff/SCStaffSidebar";
import SCStaffSummary from "@/components/scstaff/SCStaffCampaignSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SCStaffProfile() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <SCStaffSibebar name={"Nam"} role={"SC Staff"} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header name={"Pham Nhut Nam"} email={"nam.admin@gmail.com"} />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Profile Management
              </h1>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="list">Campaigns</TabsTrigger>
                <TabsTrigger value="appointment">Appointments</TabsTrigger>
                <TabsTrigger value="status">Statuses</TabsTrigger>
              </TabsList>

              {/* Customer Tab */}
              <TabsContent value="summary" className="space-y-4">
                <SCStaffSummary />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

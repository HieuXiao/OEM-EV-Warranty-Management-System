// FE/src/pages/SCStaffCampaign.jsx
// IMPORT FROM COMPONENT
import Header from "@/components/Header";
import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import SCStaffOverview from "@/components/scstaff/ScsCampOverview";
import SCStaffAppointments from "@/components/scstaff/ScsCampAppSection";
import ScsCampaignPraticipants from "@/components/scstaff/ScsCampParticipant";
import ScsReportSection from "@/components/scstaff/ScsRepoSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SCStaffProfile() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <SCStaffSibebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="practipant">Participants</TabsTrigger>
                <TabsTrigger value="appointment">Appointments</TabsTrigger>
                {/* <TabsTrigger value="report">Reports</TabsTrigger> */}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <SCStaffOverview />
              </TabsContent>
              {/* Praticipants Tab */}
              <TabsContent value="practipant" className="space-y-4">
                <ScsCampaignPraticipants />
              </TabsContent>
              {/* Appointments Tab */}
              <TabsContent value="appointment" className="space-y-4">
                <SCStaffAppointments />
              </TabsContent>
              {/* Reports Tab */}
              {/* <TabsContent value="report" className="space-y-4">
                <ScsReportSection />
              </TabsContent> */}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

import SCStaffSibebar from "@/components/scstaff/SCStaffSidebar";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomersTable from "@/components/scstaff/CustomersTable";

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
              <p className="text-muted-foreground mt-1">
                Configure system preferences and integrations
              </p>
            </div>

            <Tabs defaultValue="customers" className="space-y-6">
              <TabsList>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="register">Vehicles</TabsTrigger>
                <TabsTrigger value="attach">Attach Part</TabsTrigger>
              </TabsList>

              {/* Customer Tab */}
              <TabsContent value="customers" className="space-y-4">
                <CustomersTable />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

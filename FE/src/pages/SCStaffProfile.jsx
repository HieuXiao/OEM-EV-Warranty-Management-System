import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import CustomersTable from "@/components/scstaff/ScsProfCustTable";
import { useEffect } from "react";

export default function SCStaffProfile() {
  useEffect(() => {
    document.title = `Profiles`;
  }, []);

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

            {/* Customer Tab */}
            <CustomersTable />
          </div>
        </div>
      </div>
    </div>
  );
}

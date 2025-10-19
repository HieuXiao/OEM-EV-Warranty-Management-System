// 
import Header from "@/components/Header";
import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import warrantyTable from"@/components/scstaff/ScsWarrTable";
// 
import { useEffect } from "react";

export default function SCStaffProfile() {
  useEffect(() => {
    document.title = `Warranty`;
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
            {/* Warranty Tab */}
            <warrantyTable/>
          </div>
        </div>
      </div>
    </div>
  );
}

import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import Header from "@/components/Header";
import CustomersTable from "@/components/scstaff/ScsProfTable";
import { useState } from "react";

export default function SCStaffProfile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <SCStaffSibebar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header onMenuClick={handleOpenMenu} />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Customer Tab */}
            <CustomersTable />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SCStaffSibebar from "@/components/scstaff/ScsSidebar";
import WarrantiesTable from "@/components/scstaff/ScsWarrTable";
import WarrantyDetail from "@/components/scstaff/ScsWarrDetail";

export default function SCStaffProfile() {
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  useEffect(() => {
    document.title = "Warranty";
  }, []);

  const handleSelectWarranty = (warranty) => {
    setSelectedWarranty(warranty);
  };

  const handleBackFromDetail = () => {
    setSelectedWarranty(null);
  };

  const handleUpdateWarranty = (updatedWarranty) => {
    console.log("Updated warranty:", updatedWarranty);
    setSelectedWarranty(updatedWarranty);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <SCStaffSibebar name="Nam" role="SC Staff" />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header name="Pham Nhut Nam" email="nam.admin@gmail.com" />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {selectedWarranty ? (
              <WarrantyDetail
                warranty={selectedWarranty}
                onBack={handleBackFromDetail}
                onUpdate={handleUpdateWarranty}
              />
            ) : (
              <WarrantiesTable onSelectWarranty={handleSelectWarranty} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

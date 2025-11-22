// FE/src/pages/AdminWarehouseArea.jsx

// ===============IMPORT================
// Import React Hooks
import { useEffect, useState } from "react";

// Import Components & API
import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import AdWareCreate from "@/components/admin/AdWareCreate";
import AdWareTable from "@/components/admin/AdWareTable";
import axiosPrivate from "@/api/axios";

export default function AdminWarehouseArea() {
  // ===============State Management================
  const [warehouses, setWarehouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  // ===============Data Fetching================
  /**
   * Fetch the list of all warehouses from the API.
   */
  const fetchWarehouses = async () => {
    try {
      const res = await axiosPrivate.get("/api/warehouses");
      setWarehouses(res.data);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // ===============HANLDER================
  /**
   * Handles adding a new warehouse via API call and updates state.
   * @param {object} newWare - { name, location }
   */
  const handleAddWarehouse = async (newWare) => {
    try {
      const res = await axiosPrivate.post("/api/warehouses", {
        name: newWare.name,
        location: newWare.location,
      });
      setWarehouses((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Add warehouse failed:", err);
    }
  };

  /**
   * Handles editing an existing warehouse via API PUT call and updates state.
   * @param {object} updated - { whId, name, location }
   */
  const handleEditWarehouse = async (updated) => {
    try {
      const res = await axiosPrivate.put(`/api/warehouses/${updated.whId}`, {
        name: updated.name,
        location: updated.location,
      });
      setWarehouses((prev) =>
        prev.map((w) => (w.whId === updated.whId ? res.data : w))
      );
    } catch (err) {
      console.error("Edit warehouse failed:", err);
    }
  };

  /**
   * Handles toggling the status (enabled/disabled) of a warehouse.
   * @param {string} whId - Warehouse ID
   * @param {boolean} isEnabled - Current enabled status
   */
  const handleToggleStatus = async (whId, isEnabled) => {
    try {
      await axiosPrivate.patch(`/api/warehouses/${whId}/status`, {
        enabled: !isEnabled,
      });
      setWarehouses((prev) =>
        prev.map((w) => (w.whId === whId ? { ...w, enabled: !isEnabled } : w))
      );
    } catch (err) {
      console.error("Toggle status failed:", err);
    }
  };

  // ===============RENDER================
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar isMobileOpen={isMobileMenuOpen} onClose={handleCloseMenu} />
      <div className="lg:pl-64">
        <Header onMenuClick={handleOpenMenu} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Title and Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold text-foreground">
                Warehouse Area
              </h1>
              <AdWareCreate onAdd={handleAddWarehouse} />
            </div>
            {/* Warehouse Table or Loading State */}
            {loading ? (
              <p>Loading warehouses...</p>
            ) : (
              <AdWareTable
                warehouses={warehouses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onEdit={handleEditWarehouse}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
